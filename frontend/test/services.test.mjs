import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const armazenamento = new Map();
const originalFetch = globalThis.fetch;
let servidor, api, sessao, fila, relatorios, horario;
let requisicoes, redirecionamentos, resposta;
before(async () => {
  globalThis.localStorage = {
    getItem: (chave) => armazenamento.get(chave) ?? null,
    setItem: (chave, valor) => armazenamento.set(chave, valor),
    removeItem: (chave) => armazenamento.delete(chave),
  };
  globalThis.window = { location: { pathname: '/atendente', replace: (url) => redirecionamentos.push(url) } };
  servidor = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  api = await servidor.ssrLoadModule('/src/services/api.js');
  sessao = await servidor.ssrLoadModule('/src/services/sessao.js');
  fila = await servidor.ssrLoadModule('/src/services/filaService.js');
  relatorios = await servidor.ssrLoadModule('/src/services/relatorioService.js');
  horario = await servidor.ssrLoadModule('/src/utils/horario.js');
});
after(async () => {
  await servidor.close();
  globalThis.fetch = originalFetch;
  delete globalThis.localStorage;
  delete globalThis.window;
});
beforeEach(() => {
  armazenamento.clear(); requisicoes = []; redirecionamentos = [];
  resposta = { status: 200, dados: [] };
  globalThis.fetch = async (url, opcoes) => {
    requisicoes.push({ url: new URL(url), opcoes });
    return new Response(JSON.stringify(resposta.dados), { status: resposta.status });
  };
});

test('login guarda uma sessão única com token, usuario e perfil e escolhe a rota real', async () => {
  resposta.dados = { token: 'jwt', usuario: 'Ana', perfil: 'ATENDENTE' };
  const atual = await sessao.entrar(' ana ', 'senha');
  assert.deepEqual(atual, { token: 'jwt', usuario: 'Ana', perfil: 'atendente' });
  assert.deepEqual(sessao.lerSessao(), atual);
  assert.equal(armazenamento.size, 1);
  assert.deepEqual(JSON.parse(requisicoes[0].opcoes.body), { usuario: 'ana', senha: 'senha' });
  assert.equal(requisicoes[0].opcoes.headers.Authorization, undefined);
  assert.equal(sessao.obterRotaInicial('gestor'), '/relatorios');
  assert.equal(sessao.obterRotaInicial('atendente'), '/atendente');
  sessao.sair();
  assert.equal(sessao.lerSessao(), null);
});

test('sessões antigas, corrompidas e respostas inválidas não autorizam a rota protegida', async () => {
  for (const valor of ['{', JSON.stringify({ nome: 'Ana', perfil: 'atendente' }), 'null']) {
    armazenamento.set(api.CHAVE_SESSAO, valor);
    assert.equal(sessao.lerSessao(), null);
  }
  resposta.dados = { usuario: 'Ana', perfil: 'gestor' };
  await assert.rejects(sessao.entrar('ana', 'senha'), /Resposta de login inválida/);
});

test('rotas privadas enviam token; 401 limpa a sessão e leva ao login', async () => {
  armazenamento.set(api.CHAVE_SESSAO, JSON.stringify({ token: 'jwt' }));
  await api.api.get('/senhas/fila');
  assert.equal(requisicoes[0].opcoes.headers.Authorization, 'Bearer jwt');
  resposta = { status: 401, dados: { erro: 'Token expirado' } };
  await assert.rejects(api.api.get('/senhas/fila'), (e) => e instanceof api.ErroApi && e.status === 401);
  assert.equal(armazenamento.has(api.CHAVE_SESSAO), false);
  assert.deepEqual(redirecionamentos, ['/login']);
});

test('requisição pública não envia token nem encerra a sessão em 401', async () => {
  armazenamento.set(api.CHAVE_SESSAO, JSON.stringify({ token: 'jwt' }));
  resposta = { status: 401, dados: { erro: 'Usuário ou senha incorretos' } };
  await assert.rejects(api.api.post('/auth/login', {}, { autenticado: false }), (e) => e.status === 401);
  assert.equal(requisicoes[0].opcoes.headers.Authorization, undefined);
  assert.equal(armazenamento.has(api.CHAVE_SESSAO), true);
  assert.deepEqual(redirecionamentos, []);
});

test('Totem preserva os campos do servidor ao traduzir o comprovante', () => {
  assert.deepEqual(api.traduzirSenha({ codigo: '261117-SP007', tipo: 'SP', status: 'AGUARDANDO', emitida_em: '2026-11-17T10:00:00Z' }), {
    codigo: '261117-SP007', numero: '261117-SP007', tipo: 'SP', status: 'AGUARDANDO', estado: 'AGUARDANDO', emitida_em: '2026-11-17T10:00:00Z', emitidaEm: '2026-11-17T10:00:00Z',
  });
});

test('fila e senha ativa usam a API e traduzem os dados para a tela', async () => {
  resposta.dados = [{ codigo: '261117-SP001', status: 'AGUARDANDO' }];
  assert.equal((await fila.listarFila())[0].numero, '261117-SP001');
  resposta.dados = null;
  assert.equal(await fila.buscarSenhaAtual(3), null);
  assert.equal(requisicoes[1].url.pathname, '/api/senhas/guiche/3');
  assert.equal(armazenamento.size, 0);
});

test('ações do atendente usam POST e corpos codigo ou guiche_id', async () => {
  for (const [acao, valor, caminho, corpo] of [
    ['chamarProxima', 3, 'chamar', { guiche_id: 3 }],
    ['chamarNovamente', 3, 'repetir', { guiche_id: 3 }],
    ['iniciarAtendimento', '261117-SP001', 'iniciar', { codigo: '261117-SP001' }],
    ['finalizarAtendimento', '261117-SP001', 'finalizar', { codigo: '261117-SP001' }],
    ['marcarNaoCompareceu', '261117-SP001', 'nao-compareceu', { codigo: '261117-SP001' }],
  ]) {
    await fila[acao](valor);
    const r = requisicoes.at(-1);
    assert.equal(r.opcoes.method, 'POST');
    assert.equal(r.url.pathname, `/api/senhas/${caminho}`);
    assert.deepEqual(JSON.parse(r.opcoes.body), corpo);
  }
});

test('relatórios usam nome e horários da API e permitem detalhado/auditoria mensais', async () => {
  const linha = { codigo: '261117-SP001', atendente_id: 1, atendente: 'Ana', inicio_atendimento_em: '2026-11-17T10:05:00Z', fim_atendimento_em: '2026-11-17T10:10:00Z' };
  assert.equal(relatorios.normalizarDetalhado([linha])[0].atendimento, linha.inicio_atendimento_em);
  assert.equal(relatorios.normalizarAuditoria([linha])[0].atendente, 'Ana');
  assert.equal(relatorios.normalizarAuditoria([linha])[0].fim, linha.fim_atendimento_em);
  await relatorios.buscarDetalhado('2026-11-17', 'SP', '2026-11');
  await relatorios.buscarAuditoria('2026-11-17', '2026-11');
  for (const r of requisicoes) {
    assert.equal(r.url.searchParams.get('mes'), '2026-11');
    assert.equal(r.url.searchParams.has('data'), false);
  }
});

test('expediente do Totem abre às 7h e fecha às 17h de Brasília', () => {
  assert.equal(horario.horarioTotem(new Date('2026-11-17T09:59:59Z')).aberto, false);
  assert.equal(horario.horarioTotem(new Date('2026-11-17T10:00:00Z')).aberto, true);
  assert.equal(horario.horarioTotem(new Date('2026-11-17T19:59:59Z')).aberto, true);
  assert.equal(horario.horarioTotem(new Date('2026-11-17T20:00:00Z')).aberto, false);
});
