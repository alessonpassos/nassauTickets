const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { verificarToken, exigirPerfil } = require("../middleware/auth");
const { ErroHttp, asyncHandler } = require("../utils/http");

// Tudo aqui é só para o GESTOR (401 sem token, 403 para atendente).
router.use(verificarToken, exigirPerfil("GESTOR"));

const TIPOS = ["SP", "SE", "SG"];
const ROTULO = { SP: "Prioritária", SE: "Retirada de exames", SG: "Geral" };

// Usamos a data do BANCO (CURDATE) para não divergir do fuso do Node.
async function hojeDoBanco() {
  const [[l]] = await pool.query(
    "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS hoje",
  );
  return l.hoje;
}

function lerData(valor, hoje) {
  if (valor === undefined || valor === "") return hoje;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor))) {
    throw new ErroHttp(400, "data inválida. Use o formato YYYY-MM-DD.");
  }
  return valor;
}

// devolve o 1º dia do mês pedido (YYYY-MM) ou do mês atual
function lerMes(valor, hoje) {
  if (valor === undefined || valor === "") return `${hoje.slice(0, 7)}-01`;
  if (!/^\d{4}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(`${valor}-01`))) {
    throw new ErroHttp(400, "mes inválido. Use o formato YYYY-MM.");
  }
  return `${valor}-01`;
}

const filtroDia = (data) => ({ sql: "s.data_emissao = ?", params: [data] });
const filtroMes = (inicio) => ({
  sql: "s.data_emissao >= ? AND s.data_emissao < DATE_ADD(?, INTERVAL 1 MONTH)",
  params: [inicio, inicio],
});

async function resumir({ sql, params }) {
  const [linhas] = await pool.query(
    `SELECT s.tipo, s.status,
            (s.status = 'AGUARDANDO' AND (s.data_emissao < CURDATE() OR s.descartada_em IS NOT NULL)) AS descartada
       FROM senhas s
      WHERE ${sql}`,
    params,
  );
  const atendidas = linhas.filter((s) => s.status === "ATENDIDA");

  // Tempo médio = do início ao fim do atendimento (colunas que existem no schema).
  const [[t]] = await pool.query(
    `SELECT AVG(TIMESTAMPDIFF(SECOND, a.inicio_atendimento_em, a.fim_atendimento_em)) AS media
       FROM atendimentos a
       JOIN senhas s ON s.id = a.senha_id
      WHERE ${sql} AND s.status = 'ATENDIDA'
        AND a.inicio_atendimento_em IS NOT NULL AND a.fim_atendimento_em IS NOT NULL`,
    params,
  );

  return {
    emitidas: linhas.length,
    atendidas: atendidas.length,
    naoCompareceu: linhas.filter((s) => s.status === "NAO_COMPARECEU").length,
    descartadas: linhas.filter((s) => Number(s.descartada) === 1).length,
    tempoMedio:
      t.media === null ? "—" : `${Math.round(Number(t.media) / 60)} min`,
    porTipo: TIPOS.map((tipo) => ({
      tipo,
      rotulo: ROTULO[tipo],
      emitidas: linhas.filter((s) => s.tipo === tipo).length,
      atendidas: atendidas.filter((s) => s.tipo === tipo).length,
    })),
  };
}

router.get(
  "/diario",
  asyncHandler(async (req, res) => {
    const data = lerData(req.query.data, await hojeDoBanco());
    res.json(await resumir(filtroDia(data)));
  }),
);

router.get(
  "/mensal",
  asyncHandler(async (req, res) => {
    const inicio = lerMes(req.query.mes, await hojeDoBanco());
    res.json(await resumir(filtroMes(inicio)));
  }),
);

router.get(
  "/detalhado",
  asyncHandler(async (req, res) => {
    const data = lerData(req.query.data, await hojeDoBanco());
    const params = [data];
    let filtroTipo = "";
    if (TIPOS.includes(req.query.tipo)) {
      filtroTipo = " AND s.tipo = ?";
      params.push(req.query.tipo);
    }
    const [linhas] = await pool.query(
      `SELECT s.codigo, s.tipo, s.status, s.emitida_em, g.numero AS guiche
         FROM senhas s
         LEFT JOIN atendimentos a ON a.senha_id = s.id
         LEFT JOIN guiches g ON g.id = a.guiche_id
        WHERE s.data_emissao = ?${filtroTipo}
        ORDER BY s.emitida_em ASC`,
      params,
    );
    res.json(linhas);
  }),
);

router.get(
  "/auditoria",
  asyncHandler(async (req, res) => {
    const data = lerData(req.query.data, await hojeDoBanco());
    const [linhas] = await pool.query(
      `SELECT s.codigo, a.atendente_id, u.nome AS atendente, g.numero AS guiche,
              a.primeira_chamada_em, a.segunda_chamada_em
         FROM atendimentos a
         JOIN senhas s ON s.id = a.senha_id
         JOIN guiches g ON g.id = a.guiche_id
         JOIN usuarios u ON u.id = a.atendente_id
        WHERE s.data_emissao = ?
        ORDER BY a.primeira_chamada_em DESC`,
      [data],
    );
    res.json(linhas);
  }),
);

module.exports = router;
