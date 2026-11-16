const express = require("express");
const router = express.Router();
const pool = require("../config/database");

const TIPOS = ["SP", "SE", "SG"];
const ROTULO = {
  SP: "Prioritária",
  SE: "Retirada de exames",
  SG: "Geral",
};

function prefixoDia(data) {
  if (data && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const [ano, mes, dia] = data.split("-");
    return `${ano.slice(2)}${mes}${dia}`;
  }
  const agora = new Date();
  const yy = String(agora.getFullYear()).slice(2);
  const mm = String(agora.getMonth() + 1).padStart(2, "0");
  const dd = String(agora.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

function prefixoMes(anoMes) {
  if (anoMes && /^\d{4}-\d{2}$/.test(anoMes)) {
    const [ano, mes] = anoMes.split("-");
    return `${ano.slice(2)}${mes}`;
  }
  const agora = new Date();
  return `${String(agora.getFullYear()).slice(2)}${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

function formatarDuracao(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const minutos = Math.round(ms / 60000);
  return `${minutos} min`;
}

async function resumir(prefixo) {
  const like = `${prefixo}%`;
  const [linhas] = await pool.query(
    `SELECT tipo, status, emitida_em FROM senhas WHERE codigo LIKE ?`,
    [like],
  );

  const atendidas = linhas.filter((s) => s.status === "ATENDIDA");
  const porTipo = TIPOS.map((tipo) => ({
    tipo,
    rotulo: ROTULO[tipo],
    emitidas: linhas.filter((s) => s.tipo === tipo).length,
    atendidas: atendidas.filter((s) => s.tipo === tipo).length,
  }));

  let tempoMedio = "—";
  try {
    const [tempos] = await pool.query(
      `SELECT TIMESTAMPDIFF(SECOND, a.primeira_chamada_em, COALESCE(a.segunda_chamada_em, a.primeira_chamada_em)) AS segundos
       FROM atendimentos a
       JOIN senhas s ON s.id = a.senha_id
       WHERE s.codigo LIKE ? AND s.status = 'ATENDIDA'`,
      [like],
    );
    const validos = tempos.map((t) => Number(t.segundos)).filter((n) => Number.isFinite(n) && n >= 0);
    if (validos.length) {
      const media = (validos.reduce((a, b) => a + b, 0) / validos.length) * 1000;
      tempoMedio = formatarDuracao(media);
    }
  } catch {
    /* colunas opcionais de duração podem não existir */
  }

  return {
    emitidas: linhas.length,
    atendidas: atendidas.length,
    naoCompareceu: linhas.filter((s) => s.status === "NÃO_COMPARECEU" || s.status === "NAO_COMPARECEU").length,
    descartadas: linhas.filter((s) => s.status === "AGUARDANDO").length,
    tempoMedio,
    porTipo,
  };
}

router.get("/diario", async (req, res) => {
  try {
    const resumo = await resumir(prefixoDia(req.query.data));
    res.json(resumo);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao gerar relatório diário." });
  }
});

router.get("/mensal", async (req, res) => {
  try {
    const resumo = await resumir(prefixoMes(req.query.mes));
    res.json(resumo);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao gerar relatório mensal." });
  }
});

router.get("/detalhado", async (req, res) => {
  try {
    const prefixo = prefixoDia(req.query.data);
    const tipo = req.query.tipo;
    const params = [`${prefixo}%`];
    let filtroTipo = "";
    if (tipo && TIPOS.includes(tipo)) {
      filtroTipo = " AND s.tipo = ?";
      params.push(tipo);
    }

    const [linhas] = await pool.query(
      `SELECT s.codigo, s.tipo, s.status, s.emitida_em, g.numero AS guiche
       FROM senhas s
       LEFT JOIN atendimentos a ON a.senha_id = s.id
       LEFT JOIN guiches g ON g.id = a.guiche_id
       WHERE s.codigo LIKE ?${filtroTipo}
       ORDER BY s.emitida_em ASC`,
      params,
    );
    res.json(linhas);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao gerar relatório detalhado." });
  }
});

router.get("/auditoria", async (req, res) => {
  try {
    const prefixo = prefixoDia(req.query.data);
    const [linhas] = await pool.query(
      `SELECT s.codigo, a.atendente_id, g.numero AS guiche,
              a.primeira_chamada_em, a.segunda_chamada_em
       FROM atendimentos a
       JOIN senhas s ON s.id = a.senha_id
       JOIN guiches g ON g.id = a.guiche_id
       WHERE s.codigo LIKE ?
       ORDER BY a.primeira_chamada_em DESC`,
      [`${prefixo}%`],
    );
    res.json(linhas);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao gerar auditoria." });
  }
});

module.exports = router;
