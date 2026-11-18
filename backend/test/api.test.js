const { test, before, after, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Executa os roteadores e middlewares reais com respostas controladas do banco.
// Não substitui a validação das consultas em um MySQL real.
process.env.JWT_SECRET = "segredo-exclusivo-dos-testes";
const esperadas = [];
let transacoes = [];
function esperar(sql, resultado, params) {
  esperadas.push({ sql, resultado, params });
}
async function consultar(sql, params) {
  const proxima = esperadas.shift();
  assert.ok(proxima, `Consulta inesperada: ${sql}`);
  assert.match(sql, proxima.sql);
  if (proxima.params !== undefined) assert.deepEqual(params, proxima.params);
  return [proxima.resultado];
}
const conexao = {
  query: consultar,
  beginTransaction: async () => transacoes.push("begin"),
  commit: async () => transacoes.push("commit"),
  rollback: async () => transacoes.push("rollback"),
  release: () => transacoes.push("release"),
};
const poolPath = require.resolve("../config/database");
require.cache[poolPath] = {
  id: poolPath,
  filename: poolPath,
  loaded: true,
  exports: {
    query: consultar,
    getConnection: async () => conexao,
  },
};
const app = require("../app");
let servidor, base;
const token = (perfil = "ATENDENTE", id = 1) =>
  jwt.sign({ perfil, nome: "Ana" }, process.env.JWT_SECRET, {
    subject: String(id),
  });
async function chamar(
  caminho,
  { metodo = "GET", corpo, perfil = "ATENDENTE", id = 1 } = {},
) {
  const headers = { "Content-Type": "application/json" };
  if (perfil) headers.Authorization = `Bearer ${token(perfil, id)}`;
  const resposta = await fetch(`${base}${caminho}`, {
    method: metodo,
    headers,
    body: corpo && JSON.stringify(corpo),
  });
  return { status: resposta.status, dados: await resposta.json() };
}
before(async () => {
  servidor = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => servidor.once("listening", resolve));
  base = `http://127.0.0.1:${servidor.address().port}/api`;
});
after(() => new Promise((resolve) => servidor.close(resolve)));
afterEach(() => {
  assert.equal(
    esperadas.length,
    0,
    "Todas as consultas previstas devem ter sido executadas",
  );
  transacoes = [];
});

test("login usa bcrypt e devolve o perfil e o token da API", async () => {
  esperar(
    /FROM usuarios WHERE login = \?/,
    [
      {
        id: 1,
        nome: "Ana",
        perfil: "ATENDENTE",
        ativo: 1,
        senha_hash: bcrypt.hashSync("correta", 4),
      },
    ],
    ["ana"],
  );
  const r = await chamar("/auth/login", {
    metodo: "POST",
    perfil: null,
    corpo: { usuario: " ana ", senha: "correta" },
  });
  assert.equal(r.status, 200);
  assert.equal(r.dados.usuario, "Ana");
  assert.equal(r.dados.perfil, "atendente");
  assert.equal(jwt.verify(r.dados.token, process.env.JWT_SECRET).sub, "1");
});

test("login incorreto retorna 401 sem revelar se o usuário existe", async () => {
  esperar(/FROM usuarios/, []);
  const r = await chamar("/auth/login", {
    metodo: "POST",
    perfil: null,
    corpo: { usuario: "ausente", senha: "errada" },
  });
  assert.equal(r.status, 401);
  assert.equal(r.dados.erro, "Usuário ou senha incorretos.");
});

test("fila e senha atual exigem token e relatórios exigem gestor", async () => {
  assert.equal((await chamar("/senhas/fila", { perfil: null })).status, 401);
  assert.equal(
    (await chamar("/senhas/guiche/1", { perfil: null })).status,
    401,
  );
  assert.equal((await chamar("/relatorios/diario")).status, 403);
  assert.equal(
    (
      await chamar("/senhas/chamar", {
        metodo: "POST",
        perfil: "GESTOR",
        corpo: { guiche_id: 1 },
      })
    ).status,
    403,
  );
});

test("painel público inclui emitida_em e aceita nenhuma chamada", async () => {
  esperar(/s\.emitida_em,[\s\S]*CURDATE\(\)[\s\S]*LIMIT 5/, []);
  assert.deepEqual(await chamar("/senhas/atual", { perfil: null }), {
    status: 200,
    dados: { chamadaAtual: null, historico: [] },
  });
  const senha = { codigo: "261117-SP001", emitida_em: "2026-11-17T10:00:00Z" };
  esperar(/LIMIT 5/, [senha]);
  assert.deepEqual((await chamar("/senhas/atual", { perfil: null })).dados, {
    chamadaAtual: senha,
    historico: [],
  });
});

test("senha do guichê retorna campos de atendimento e informa se pertence ao atendente", async () => {
  const atual = {
    codigo: "261117-SP001",
    status: "EM_ATENDIMENTO",
    atendente_id: 1,
    primeira_chamada_em: "2026-11-17T10:05:00Z",
    emitida_em: "2026-11-17T10:00:00Z",
  };
  for (const id of [1, 2]) {
    esperar(/FROM guiches WHERE id = \? AND ativo = 1/, [{ id: 1 }], [1]);
    esperar(
      /a\.inicio_atendimento_em, a\.fim_atendimento_em[\s\S]*s\.status IN \(\?\)/,
      [atual],
      [1, ["CHAMADA", "CHAMADA_NOVAMENTE", "EM_ATENDIMENTO"]],
    );
    const r = await chamar("/senhas/guiche/1", { id });
    assert.equal(r.status, 200);
    assert.equal(r.dados.pode_operar, id === 1);
    assert.equal(r.dados.emitida_em, atual.emitida_em);
  }
});

test("guichê sem senha retorna null e id inválido retorna 400", async () => {
  esperar(/FROM guiches/, [{ id: 3 }]);
  esperar(/FROM atendimentos/, []);
  assert.deepEqual(await chamar("/senhas/guiche/3"), {
    status: 200,
    dados: null,
  });
  assert.equal((await chamar("/senhas/guiche/invalido")).status, 400);
});

test("emissão pública gera o código no servidor dentro da transação", async () => {
  esperar(/GET_LOCK/, [{ ok: 1 }]);
  esperar(/MAX\(sequencial\)/, [{ n: 7, prefixo: "261117" }], ["SG"]);
  esperar(/INSERT INTO senhas/, { insertId: 7 }, ["261117-SG007", "SG", 7]);
  const senha = {
    id: 7,
    codigo: "261117-SG007",
    tipo: "SG",
    status: "AGUARDANDO",
    emitida_em: "2026-11-17T10:00:00Z",
  };
  esperar(/FROM senhas WHERE id = \?/, [senha], [7]);
  esperar(/RELEASE_LOCK/, []);
  const r = await chamar("/senhas", {
    metodo: "POST",
    perfil: null,
    corpo: { tipo: "SG" },
  });
  assert.equal(r.status, 201);
  assert.deepEqual(r.dados, senha);
  assert.deepEqual(transacoes, ["begin", "commit", "release"]);
});

test("chamar recusa guichê ocupado e desfaz a transação", async () => {
  esperar(/GET_LOCK/, [{ ok: 1 }]);
  esperar(/FROM guiches/, [{ id: 1 }]);
  esperar(/s\.status IN/, [{ 1: 1 }]);
  esperar(/RELEASE_LOCK/, []);
  const r = await chamar("/senhas/chamar", {
    metodo: "POST",
    corpo: { guiche_id: 1 },
  });
  assert.equal(r.status, 409);
  assert.deepEqual(transacoes, ["begin", "rollback", "release"]);
});

test("chamar usa guiche_id e o usuário autenticado, com prioridade SP", async () => {
  esperar(/GET_LOCK/, [{ ok: 1 }]);
  esperar(/FROM guiches/, [{ id: 1 }], [1]);
  esperar(/s\.status IN/, []);
  esperar(/SELECT s\.tipo FROM atendimentos/, []);
  esperar(
    /FOR UPDATE/,
    [{ id: 7, codigo: "261117-SP001", tipo: "SP" }],
    ["SP"],
  );
  esperar(/INSERT INTO atendimentos/, { insertId: 4 }, [7, 1, 1]);
  esperar(/UPDATE senhas SET status = 'CHAMADA'/, { affectedRows: 1 }, [7]);
  esperar(/RELEASE_LOCK/, []);
  assert.deepEqual(
    await chamar("/senhas/chamar", { metodo: "POST", corpo: { guiche_id: 1 } }),
    {
      status: 201,
      dados: {
        senha_id: 7,
        codigo: "261117-SP001",
        tipo: "SP",
        guiche_id: 1,
        status: "CHAMADA",
      },
    },
  );
});

test("repetir impede outro atendente e limita a duas chamadas", async () => {
  esperar(/a\.atendente_id/, [{ atendente_id: 2, status: "CHAMADA" }]);
  assert.equal(
    (
      await chamar("/senhas/repetir", {
        metodo: "POST",
        corpo: { guiche_id: 1 },
      })
    ).status,
    403,
  );
  esperar(/a\.atendente_id/, [
    { atendente_id: 1, status: "CHAMADA_NOVAMENTE" },
  ]);
  assert.equal(
    (
      await chamar("/senhas/repetir", {
        metodo: "POST",
        corpo: { guiche_id: 1 },
      })
    ).status,
    409,
  );
});

test("repetir grava segunda chamada com POST e guiche_id", async () => {
  esperar(
    /FOR UPDATE/,
    [
      {
        atendimento_id: 8,
        senha_id: 7,
        codigo: "261117-SP001",
        status: "CHAMADA",
        atendente_id: 1,
      },
    ],
    [1],
  );
  esperar(/status = 'CHAMADA_NOVAMENTE'/, { affectedRows: 1 }, [7]);
  esperar(/segunda_chamada_em = NOW\(\)/, { affectedRows: 1 }, [8]);
  const r = await chamar("/senhas/repetir", {
    metodo: "POST",
    corpo: { guiche_id: 1 },
  });
  assert.equal(r.status, 200);
  assert.equal(r.dados.status, "CHAMADA_NOVAMENTE");
});

test("transições verificam proprietário, dia e estado antes de gravar", async () => {
  esperar(/s\.data_emissao = CURDATE\(\) FOR UPDATE/, [
    { id: 7, status: "CHAMADA", atendente_id: 2 },
  ]);
  assert.equal(
    (
      await chamar("/senhas/iniciar", {
        metodo: "POST",
        corpo: { codigo: "261117-SP001" },
      })
    ).status,
    403,
  );
  esperar(/FOR UPDATE/, [{ id: 7, status: "CHAMADA", atendente_id: 1 }]);
  assert.equal(
    (
      await chamar("/senhas/finalizar", {
        metodo: "POST",
        corpo: { codigo: "261117-SP001" },
      })
    ).status,
    409,
  );
  esperar(/FOR UPDATE/, []);
  assert.equal(
    (
      await chamar("/senhas/iniciar", {
        metodo: "POST",
        corpo: { codigo: "261116-SP001" },
      })
    ).status,
    404,
  );
});

test("iniciar, finalizar e não compareceu usam codigo e gravam os horários aplicáveis", async () => {
  for (const [rota, de, para, coluna] of [
    ["iniciar", "CHAMADA", "EM_ATENDIMENTO", "inicio_atendimento_em"],
    ["finalizar", "EM_ATENDIMENTO", "ATENDIDA", "fim_atendimento_em"],
    ["nao-compareceu", "CHAMADA_NOVAMENTE", "NAO_COMPARECEU", null],
  ]) {
    esperar(
      /FOR UPDATE/,
      [{ id: 7, status: de, atendente_id: 1 }],
      ["261117-SP001"],
    );
    esperar(/UPDATE senhas/, { affectedRows: 1 }, [para, 7]);
    if (coluna)
      esperar(new RegExp(`${coluna} = NOW\\(\\)`), { affectedRows: 1 }, [7]);
    assert.deepEqual(
      await chamar(`/senhas/${rota}`, {
        metodo: "POST",
        corpo: { codigo: "261117-SP001" },
      }),
      { status: 200, dados: { codigo: "261117-SP001", status: para } },
    );
  }
});

test("detalhado e auditoria aceitam mês e incluem início/fim e nome do atendente", async () => {
  for (const rota of ["detalhado", "auditoria"]) {
    esperar(/DATE_FORMAT\(CURDATE/, [{ hoje: "2026-11-17" }]);
    const resultado = [
      {
        codigo: "261117-SP001",
        atendente: "Ana",
        inicio_atendimento_em: "2026-11-17T10:05:00Z",
        fim_atendimento_em: "2026-11-17T10:10:00Z",
      },
    ];
    esperar(
      /a\.inicio_atendimento_em, a\.fim_atendimento_em[\s\S]*DATE_ADD\(\?, INTERVAL 1 MONTH\)/,
      resultado,
      ["2026-11-01", "2026-11-01"],
    );
    assert.deepEqual(
      await chamar(`/relatorios/${rota}?mes=2026-11`, { perfil: "GESTOR" }),
      { status: 200, dados: resultado },
    );
  }
});

test("relatórios recusam data impossível, mês inválido e tipo inválido", async () => {
  for (const query of [
    "data=2026-02-30",
    "mes=2026-13",
    "data=2026-11-17&tipo=XX",
  ]) {
    esperar(/DATE_FORMAT\(CURDATE/, [{ hoje: "2026-11-17" }]);
    assert.equal(
      (await chamar(`/relatorios/detalhado?${query}`, { perfil: "GESTOR" }))
        .status,
      400,
    );
  }
});
