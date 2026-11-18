import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import FakeTimers from '@sinonjs/fake-timers';
import { getByRole, getByLabelText, getByText } from '@testing-library/dom';

// DOM simulado: estes testes não validam layout nem áudio físico.
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost:5173' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { MemoryRouter, Routes, Route } = await import('react-router-dom');
let vite, Login, Atendente, Painel, Totem, Relatorios, root, clock;
let chamadas, atual, fila, publico, falas, falha, registros;
const originalFetch = globalThis.fetch;
const corpo = () => document.getElementById('root');
const registro = { codigo: '261117-SP042', tipo: 'SP', status: 'CHAMADA', emitida_em: '2026-11-17T12:00:00Z', primeira_chamada_em: '2026-11-17T12:05:00Z', segunda_chamada_em: null, guiche: 1, guiche_id: 10, pode_operar: true };
before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  [Login, Atendente, Painel, Totem, Relatorios] = await Promise.all(['Login', 'PainelAtendente', 'PainelSenhas', 'Totem', 'Relatorios'].map(async (n) => (await vite.ssrLoadModule(`/src/pages/${n}.jsx`)).default));
});
after(async () => { await vite.close(); dom.window.close(); globalThis.fetch = originalFetch; });
beforeEach(() => {
  localStorage.clear(); localStorage.setItem('nassautickets:sessao', JSON.stringify({ token: 'jwt', usuario: 'Ana', perfil: 'atendente' }));
  chamadas = []; atual = {}; registros = {}; fila = [{ ...registro, status: 'AGUARDANDO' }];
  publico = { chamadaAtual: { ...registro }, historico: [] }; falas = []; falha = '';
  window.speechSynthesis = { cancel: () => {}, speak: (fala) => falas.push(fala.text) };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.fetch = async (url, opcoes) => {
    const caminho = new URL(url).pathname.slice(4), dados = opcoes.body ? JSON.parse(opcoes.body) : null;
    chamadas.push({ caminho, dados, metodo: opcoes.method, url: new URL(url), headers: opcoes.headers });
    if (falha === caminho) return new Response(JSON.stringify({ erro: 'Falha temporária' }), { status: 500 });
    let resultado;
    switch (caminho) {
      case '/auth/login': resultado = { token: 'jwt-api', usuario: 'Ana', perfil: 'gestor' }; break;
      case '/guiches': resultado = [{ id: 10, numero: 1 }, { id: 20, numero: 2 }, { id: 30, numero: 3 }]; break;
      case '/senhas/fila': resultado = fila; break;
      case '/senhas/atual': resultado = publico; break;
      case '/senhas/chamar': resultado = { ...fila.shift(), status: 'CHAMADA', guiche_id: dados.guiche_id, pode_operar: true }; atual[dados.guiche_id] = resultado; break;
      case '/senhas/repetir': resultado = atual[dados.guiche_id]; resultado.status = 'CHAMADA_NOVAMENTE'; resultado.segunda_chamada_em = '2026-11-17T12:06:00Z'; break;
      case '/senhas/iniciar': resultado = Object.values(atual).find((s) => s?.codigo === dados.codigo); resultado.status = 'EM_ATENDIMENTO'; break;
      case '/senhas/finalizar': case '/senhas/nao-compareceu': {
        const entrada = Object.entries(atual).find(([, s]) => s?.codigo === dados.codigo);
        atual[entrada[0]] = null; resultado = { codigo: dados.codigo }; break;
      }
      case '/senhas': resultado = { codigo: '261117-SG093', tipo: dados.tipo, emitida_em: '2026-11-17T12:00:00Z', status: 'AGUARDANDO' }; break;
      case '/relatorios/diario': case '/relatorios/mensal': resultado = { emitidas: 1, porTipo: [] }; break;
      case '/relatorios/detalhado': case '/relatorios/auditoria': resultado = [{ ...registro, atendente: 'Jefté', inicio_atendimento_em: '2026-11-17T12:07:00Z', fim_atendimento_em: '2026-11-17T12:12:00Z' }]; break;
      default:
        if (/^\/senhas\/[^/]+\/registro$/.test(caminho)) {
          const codigo = caminho.split('/')[2];
          if (opcoes.method === 'POST') registros[codigo] = { ...dados, atualizadoEm: '2026-11-17T12:00:00Z' };
          resultado = registros[codigo] || null;
        } else if (caminho.startsWith('/senhas/guiche/')) resultado = atual[caminho.split('/').at(-1)] || null;
        else throw new Error('Rota inesperada: ' + caminho);
    }
    return new Response(JSON.stringify(resultado));
  };
});
afterEach(async () => { if (root) await act(async () => root.unmount()); root = null; clock?.uninstall(); clock = null; });
async function renderizar(Componente, props = {}, rota = '/atendente') {
  root = createRoot(corpo());
  await act(async () => root.render(h(MemoryRouter, { initialEntries: [rota] }, h(Componente, props))));
}
async function clicar(nome, role = 'button') {
  const elemento = getByRole(corpo(), role, { name: nome, exact: true });
  assert.ok(!elemento.disabled, `${nome} precisa estar habilitado`);
  await act(async () => elemento.click());
}
async function preencher(rotulo, valor) {
  const campo = getByLabelText(corpo(), rotulo, { exact: true });
  await act(async () => {
    const tipo = campo.tagName === 'SELECT' ? window.HTMLSelectElement : campo.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement : window.HTMLInputElement;
    Object.getOwnPropertyDescriptor(tipo.prototype, 'value').set.call(campo, valor);
    campo.dispatchEvent(new window.Event(campo.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}
async function avancar(ms) { await act(async () => clock.tickAsync(ms)); }

test('Login usa a sessão da API e direciona gestor para /relatorios', async () => {
  localStorage.clear(); root = createRoot(corpo());
  await act(async () => root.render(h(MemoryRouter, { initialEntries: ['/login'] }, h(Routes, null,
    h(Route, { path: '/login', element: h(Login) }), h(Route, { path: '/relatorios', element: h('p', null, 'Rota do gestor') }),
  ))));
  await preencher('Usuário', 'gestor'); await preencher('Senha', 'correta'); await clicar('Entrar');
  assert.ok(getByText(corpo(), 'Rota do gestor'));
  assert.deepEqual(JSON.parse(localStorage.getItem('nassautickets:sessao')), { token: 'jwt-api', usuario: 'Ana', perfil: 'gestor' });
});

test('Atendente chama, repete, inicia e finaliza com guichês da API', async () => {
  await renderizar(Atendente);
  assert.equal(corpo().querySelectorAll('#guiche option').length, 3);
  await clicar('Chamar próxima senha');
  assert.equal(corpo().querySelector('.senha-atual_codigo').textContent, 'SP042');
  assert.ok(getByText(corpo(), /aguardou 5 min/));
  assert.equal(getByRole(corpo(), 'button', { name: 'Chamar próxima senha' }).disabled, true);
  await clicar('Chamar de novo'); await clicar('Iniciar atendimento');
  assert.ok(getByText(corpo(), /Em atendimento ·/));
  assert.equal(getByRole(corpo(), 'button', { name: 'Salvar registro' }).disabled, false);
  await clicar('Finalizar atendimento');
  assert.ok(getByText(corpo(), 'Nenhuma senha em atendimento neste guichê.'));
  assert.deepEqual(chamadas.filter((r) => r.dados).map((r) => r.dados), [{ guiche_id: 10 }, { guiche_id: 10 }, { codigo: registro.codigo }, { codigo: registro.codigo }]);
});

test('recarga e troca de guichê recuperam a senha no servidor', async () => {
  atual[10] = { ...registro }; await renderizar(Atendente);
  assert.equal(corpo().querySelector('.senha-atual_codigo').textContent, 'SP042');
  await preencher('Guichê', '20'); assert.ok(getByText(corpo(), 'Nenhuma senha em atendimento neste guichê.'));
  await preencher('Guichê', '10'); assert.equal(corpo().querySelector('.senha-atual_codigo').textContent, 'SP042');
  assert.equal(localStorage.getItem('nassautickets_senha_atual'), null);
});

test('guichê de outro atendente e falhas bloqueiam ações; nova tentativa recupera', async () => {
  atual[10] = { ...registro, status: 'EM_ATENDIMENTO', pode_operar: false, atendente: 'Outro atendente', emitida_em: null };
  await renderizar(Atendente);
  assert.equal(getByRole(corpo(), 'button', { name: 'Finalizar atendimento' }).disabled, true);
  assert.ok(getByText(corpo(), /Este guichê está em uso por Outro atendente/));
  falha = '/senhas/fila'; await preencher('Guichê', '20'); assert.ok(getByRole(corpo(), 'alert'));
  assert.equal(getByRole(corpo(), 'button', { name: 'Chamar próxima senha' }).disabled, true);
  falha = ''; await clicar('Tentar novamente');
  assert.equal(getByRole(corpo(), 'button', { name: 'Chamar próxima senha' }).disabled, false);
});

test('não compareceu exige a segunda chamada', async () => {
  atual[10] = { ...registro }; await renderizar(Atendente);
  assert.equal(getByRole(corpo(), 'button', { name: 'Não compareceu' }).disabled, true);
  await clicar('Chamar de novo'); await clicar('Não compareceu');
  assert.ok(getByText(corpo(), 'Nenhuma senha em atendimento neste guichê.'));
});

test('Totem usa código do servidor e respeita impressão de 5 s e aviso de 10 s', async () => {
  clock = FakeTimers.install({ now: new Date('2026-11-17T12:00:00Z'), toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance'] });
  await renderizar(Totem, {}, '/totem'); falha = '/senhas';
  await clicar('Atendimento geral'); assert.ok(getByRole(corpo(), 'alert')); falha = '';
  await clicar('Tentar novamente'); assert.equal(corpo().querySelector('.totem-comprovante_numero').textContent, 'SG093');
  await avancar(2500); assert.equal(getByRole(corpo(), 'progressbar').getAttribute('aria-valuenow'), '3');
  await avancar(2500); assert.ok(getByText(corpo(), 'Impressão concluída'));
  await avancar(9999); assert.ok(getByText(corpo(), 'Impressão concluída'));
  await avancar(1); assert.ok(getByRole(corpo(), 'heading', { name: 'Escolha seu atendimento' }));
  assert.ok(chamadas.filter((r) => r.caminho === '/senhas').every((r) => !r.headers.Authorization));
});

test('Painel começa silencioso e narra a segunda chamada uma vez após recuperar conexão', async () => {
  clock = FakeTimers.install({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  await renderizar(Painel, { narrar: true }); await clicar('Ativar som das chamadas'); assert.deepEqual(falas, []);
  falha = '/senhas/atual'; await avancar(4000); assert.ok(getByRole(corpo(), 'alert')); falha = '';
  publico.chamadaAtual = { ...registro, status: 'CHAMADA_NOVAMENTE', segunda_chamada_em: '2026-11-17T12:06:00Z' };
  await avancar(4000); await avancar(1400); assert.equal(falas.length, 1);
  assert.match(falas[0], /Última chamada.*número 42, guichê 1/);
  await avancar(4000); assert.equal(falas.length, 1);
});

test('Painel aceita chamadaAtual null e limita a cinco itens', async () => {
  publico = { chamadaAtual: null, historico: [] }; await renderizar(Painel); assert.ok(getByText(corpo(), 'Aguarde ser chamado'));
  await act(async () => root.unmount()); root = null;
  publico = { chamadaAtual: { ...registro }, historico: Array.from({ length: 6 }, (_, i) => ({ ...registro, codigo: `261117-SG00${i}` })) };
  await renderizar(Painel); assert.equal(corpo().querySelectorAll('.painel_item').length, 5);
});

test('Relatórios mostram nome, data/hora e consultam detalhado/auditoria do mês', async () => {
  await renderizar(Relatorios, {}, '/relatorios'); await clicar('Detalhado', 'tab');
  assert.match(corpo().querySelector('tbody').textContent, /17\/11\/2026, 09:07:00/);
  await preencher('Período', 'mes'); await preencher('Mês', '2026-11');
  assert.ok(chamadas.some((r) => r.caminho === '/relatorios/detalhado' && r.url.searchParams.get('mes') === '2026-11'));
  await clicar('Auditoria', 'tab'); assert.match(corpo().querySelector('tbody').textContent, /Jefté/);
  assert.match(corpo().querySelector('tbody').textContent, /17\/11\/2026, 09:12:00/);
  assert.ok(chamadas.some((r) => r.caminho === '/relatorios/auditoria' && r.url.searchParams.get('mes') === '2026-11'));
});

const caminhoFicha = `/senhas/${registro.codigo}/registro`;
const botaoSalvar = () => getByRole(corpo(), 'button', { name: 'Salvar registro', exact: true });
const finalizacao = () => getByRole(corpo(), 'button', { name: 'Finalizar atendimento', exact: true });
const campoTipo = () => getByLabelText(corpo(), 'Tipo de atendimento', { exact: true });
const campoObservacao = () => getByLabelText(corpo(), 'Observação (opcional)', { exact: true });
async function preencherFicha() {
  await preencher('Tipo de atendimento', 'exameDeSangue');
  await preencher('Encaminhar para', 'laboratorio');
  await preencher('Observação (opcional)', 'Encaminhado ao setor.');
}

test('ficha é habilitada após iniciar e valida os campos obrigatórios', async () => {
  atual[10] = { ...registro }; await renderizar(Atendente);
  assert.equal(corpo().querySelector('.ficha_grupo').disabled, true);
  assert.equal(chamadas.filter((r) => r.caminho === caminhoFicha).length, 0);
  await clicar('Iniciar atendimento');
  assert.equal(corpo().querySelector('.ficha_grupo').disabled, false);
  await clicar('Salvar registro');
  assert.ok(getByText(corpo(), 'Selecione o tipo de atendimento.'));
  assert.ok(getByText(corpo(), 'Selecione o setor de encaminhamento.'));
  assert.equal(chamadas.filter((r) => r.caminho === caminhoFicha && r.metodo === 'POST').length, 0);
});

test('ficha salva, recupera na recarga e mantém rascunho durante atualização da fila', async () => {
  clock = FakeTimers.install({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  atual[10] = { ...registro, status: 'EM_ATENDIMENTO' }; await renderizar(Atendente);
  await preencherFicha();
  assert.equal(finalizacao().disabled, true);
  assert.equal(getByLabelText(corpo(), 'Guichê', { exact: true }).disabled, true);
  await avancar(4000);
  assert.equal(campoObservacao().value, 'Encaminhado ao setor.');
  assert.equal(chamadas.filter((r) => r.caminho === caminhoFicha && r.metodo === 'GET').length, 1);
  await clicar('Salvar registro');
  assert.ok(getByText(corpo(), 'Registro salvo com sucesso.'));
  assert.equal(finalizacao().disabled, false);
  assert.deepEqual(chamadas.find((r) => r.caminho === caminhoFicha && r.metodo === 'POST').dados, {
    tipoAtendimento: 'exameDeSangue', setor: 'laboratorio', observacao: 'Encaminhado ao setor.',
  });
  await act(async () => root.unmount()); root = null;
  await renderizar(Atendente);
  assert.equal(campoTipo().value, 'exameDeSangue');
  assert.equal(campoObservacao().value, 'Encaminhado ao setor.');
  await preencher('Observação (opcional)', 'Alteração não salva');
  await clicar('Descartar alterações');
  assert.equal(campoObservacao().value, 'Encaminhado ao setor.');
  assert.equal(finalizacao().disabled, false);
  await preencher('Guichê', '20');
  assert.equal(campoTipo().value, '');
  await preencher('Guichê', '10');
  assert.equal(campoTipo().value, 'exameDeSangue');
  await clicar('Finalizar atendimento');
  assert.equal(registros[registro.codigo].observacao, 'Encaminhado ao setor.');
  assert.equal(localStorage.length, 1);
});

test('erro ao salvar mantém o preenchimento e permite nova tentativa', async () => {
  atual[10] = { ...registro, status: 'EM_ATENDIMENTO' }; await renderizar(Atendente);
  await preencherFicha(); falha = caminhoFicha; await clicar('Salvar registro');
  assert.ok(getByRole(corpo(), 'alert'));
  assert.equal(campoObservacao().value, 'Encaminhado ao setor.');
  assert.equal(finalizacao().disabled, true);
  assert.equal(getByRole(corpo(), 'button', { name: 'Salvar registro' }).disabled, false);
  assert.equal(corpo().textContent.includes('Registro salvo com sucesso.'), false);
  falha = ''; await clicar('Salvar registro');
  assert.ok(getByText(corpo(), 'Registro salvo com sucesso.'));
});

test('falha ao carregar ficha bloqueia edição até uma nova tentativa bem sucedida', async () => {
  atual[10] = { ...registro, status: 'EM_ATENDIMENTO' }; falha = caminhoFicha;
  await renderizar(Atendente);
  assert.ok(getByRole(corpo(), 'alert'));
  assert.equal(botaoSalvar().disabled, true);
  falha = ''; await clicar('Tentar novamente');
  assert.equal(botaoSalvar().disabled, false);
});

test('ficha de outro atendente permanece bloqueada e não é consultada', async () => {
  atual[10] = { ...registro, status: 'EM_ATENDIMENTO', pode_operar: false, atendente: 'Outro' };
  await renderizar(Atendente);
  assert.equal(botaoSalvar().disabled, true);
  assert.equal(chamadas.filter((r) => r.caminho === caminhoFicha).length, 0);
});

test('salvamento em andamento bloqueia finalização, guichê e envio duplicado', async () => {
  atual[10] = { ...registro, status: 'EM_ATENDIMENTO' }; await renderizar(Atendente);
  await preencherFicha();
  const fetchAnterior = globalThis.fetch;
  let liberar;
  const espera = new Promise((resolve) => { liberar = resolve; });
  globalThis.fetch = async (url, opcoes) => {
    if (opcoes.method === 'POST' && new URL(url).pathname.endsWith('/registro')) await espera;
    return fetchAnterior(url, opcoes);
  };
  await clicar('Salvar registro');
  assert.equal(getByRole(corpo(), 'button', { name: 'Salvando…', exact: true }).disabled, true);
  assert.equal(finalizacao().disabled, true);
  assert.equal(getByLabelText(corpo(), 'Guichê', { exact: true }).disabled, true);
  await act(async () => corpo().querySelector('form.ficha').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })));
  await act(async () => liberar());
  assert.equal(chamadas.filter((r) => r.caminho === caminhoFicha && r.metodo === 'POST').length, 1);
  assert.equal(finalizacao().disabled, false);
});
