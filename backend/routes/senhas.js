const express = require("express");
const router = express.Router();
const pool = require("../config/database");

const CICLO_PRIORIDADE = ["SP", "SE", "SG"];

router.get("/atual", async (req, res) => {
  try {
    const [ultimas] = await pool.query(
      `SELECT 
         a.id AS atendimento_id,
         s.codigo, s.tipo,
         g.numero AS guiche,
         a.primeira_chamada_em, a.segunda_chamada_em
       FROM atendimentos a
       JOIN senhas s ON s.id = a.senha_id
       JOIN guiches g ON g.id = a.guiche_id
       ORDER BY a.primeira_chamada_em DESC
       LIMIT 6`,
    );

    const [chamadaAtual, ...historico] = ultimas;
    res.json({ chamadaAtual: chamadaAtual || null, historico });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar chamada atual." });
  }
});

router.get("/fila", async (req, res) => {
  try {
    const [fila] = await pool.query(
      `SELECT id, codigo, tipo, sequencial, emitida_em 
       FROM senhas 
       WHERE status = 'AGUARDANDO' 
       ORDER BY emitida_em ASC`,
    );
    res.json(fila);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar fila de senhas." });
  }
});

router.post("/chamar", async (req, res) => {
  const { atendente_id, guiche_id } = req.body;

  if (!atendente_id || !guiche_id) {
    return res
      .status(400)
      .json({ erro: "atendente_id e guiche_id são obrigatórios." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [ultimaChamada] = await connection.query(
      `SELECT s.tipo 
       FROM atendimentos a 
       JOIN senhas s ON s.id = a.senha_id 
       ORDER BY a.primeira_chamada_em DESC 
       LIMIT 1`,
    );

    const ultimoTipo = ultimaChamada[0]?.tipo;
    const posicaoAtual = ultimoTipo ? CICLO_PRIORIDADE.indexOf(ultimoTipo) : -1;

    let senhaEscolhida = null;

    for (let i = 1; i <= CICLO_PRIORIDADE.length; i++) {
      const tipoTentativa =
        CICLO_PRIORIDADE[(posicaoAtual + i) % CICLO_PRIORIDADE.length];

      const [candidatas] = await connection.query(
        `SELECT id, codigo, tipo 
         FROM senhas 
         WHERE status = 'AGUARDANDO' AND tipo = ? 
         ORDER BY emitida_em ASC 
         LIMIT 1 
         FOR UPDATE`,
        [tipoTentativa],
      );

      if (candidatas.length > 0) {
        senhaEscolhida = candidatas[0];
        break;
      }
    }

    if (!senhaEscolhida) {
      await connection.rollback();
      return res
        .status(404)
        .json({ erro: "Nenhuma senha aguardando na fila." });
    }

    await connection.query(
      `INSERT INTO atendimentos (senha_id, atendente_id, guiche_id) VALUES (?, ?, ?)`,
      [senhaEscolhida.id, atendente_id, guiche_id],
    );

    await connection.query(
      `UPDATE senhas SET status = 'CHAMADA' WHERE id = ?`,
      [senhaEscolhida.id],
    );

    await connection.commit();

    res.status(201).json({
      codigo: senhaEscolhida.codigo,
      tipo: senhaEscolhida.tipo,
      guiche_id,
    });
  } catch (erro) {
    await connection.rollback();
    console.error(erro);
    res.status(500).json({ erro: "Erro ao chamar próxima senha." });
  } finally {
    connection.release();
  }
});

router.post("/repetir", async (req, res) => {
  try {
    const [ultimo] = await pool.query(
      `SELECT a.id AS atendimento_id, a.senha_id
       FROM atendimentos a
       ORDER BY a.primeira_chamada_em DESC
       LIMIT 1`,
    );

    if (ultimo.length === 0) {
      return res
        .status(400)
        .json({ erro: "Nenhuma senha em atendimento para repetir." });
    }

    const { atendimento_id, senha_id } = ultimo[0];

    await pool.query(
      `UPDATE atendimentos SET segunda_chamada_em = NOW() WHERE id = ?`,
      [atendimento_id],
    );
    await pool.query(
      `UPDATE senhas SET status = 'CHAMADA_NOVAMENTE' WHERE id = ?`,
      [senha_id],
    );

    res.json({ ok: true, senha_id });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao repetir chamada." });
  }
});

module.exports = router;
