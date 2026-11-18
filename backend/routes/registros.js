const express = require("express");
const pool = require("../config/database");
const { verificarToken, exigirPerfil } = require("../middleware/auth");
const { ErroHttp, asyncHandler } = require("../utils/http");
const { comTransacao } = require("../utils/transacao");

const router = express.Router();
const TIPOS = new Set(["exame", "exameDeSangue", "vacinacao", "resultado"]);
const SETORES = new Set(["salaDeExames", "salaDeVacinacao", "laboratorio", "recepcao"]);

function validarCampos(corpo) {
  if (!TIPOS.has(corpo?.tipoAtendimento)) {
    throw new ErroHttp(400, "Selecione um tipo de atendimento válido.");
  }
  if (!SETORES.has(corpo?.setor)) {
    throw new ErroHttp(400, "Selecione um setor de encaminhamento válido.");
  }
  const observacao = corpo.observacao ?? "";
  if (typeof observacao !== "string" || observacao.length > 200) {
    throw new ErroHttp(400, "A observação deve ter no máximo 200 caracteres.");
  }
  return [corpo.tipoAtendimento, corpo.setor, observacao.trim()];
}

async function buscarAtendimento(db, codigo, atendenteId, bloquear = false) {
  const [linhas] = await db.query(
    `SELECT a.id AS atendimento_id, a.atendente_id, s.status,
            (s.data_emissao = CURDATE()) AS hoje
       FROM senhas s JOIN atendimentos a ON a.senha_id = s.id
      WHERE s.codigo = ?${bloquear ? " FOR UPDATE" : ""}`,
    [codigo],
  );
  const atendimento = linhas[0];
  if (!atendimento) throw new ErroHttp(404, "Atendimento não encontrado.");
  if (Number(atendimento.atendente_id) !== atendenteId) {
    throw new ErroHttp(403, "Este registro pertence a outro atendente.");
  }
  return atendimento;
}

async function lerRegistro(db, atendimentoId) {
  const [linhas] = await db.query(
    `SELECT tipo_atendimento AS tipoAtendimento, setor, observacao,
            atualizado_em AS atualizadoEm
       FROM registros_atendimento WHERE atendimento_id = ?`,
    [atendimentoId],
  );
  return linhas[0] || null;
}

router.get(
  "/:codigo/registro",
  verificarToken,
  exigirPerfil("ATENDENTE"),
  asyncHandler(async (req, res) => {
    const atendimento = await buscarAtendimento(pool, req.params.codigo, req.usuario.id);
    res.json(await lerRegistro(pool, atendimento.atendimento_id));
  }),
);

router.post(
  "/:codigo/registro",
  verificarToken,
  exigirPerfil("ATENDENTE"),
  asyncHandler(async (req, res) => {
    const campos = validarCampos(req.body);
    const registro = await comTransacao(async (conn) => {
      // A finalização bloqueia a mesma linha, impedindo gravações após o encerramento.
      const atendimento = await buscarAtendimento(conn, req.params.codigo, req.usuario.id, true);
      if (atendimento.status !== "EM_ATENDIMENTO" || !Number(atendimento.hoje)) {
        throw new ErroHttp(409, "O registro só pode ser salvo durante um atendimento do dia em andamento.");
      }
      await conn.query(
        `INSERT INTO registros_atendimento (atendimento_id, tipo_atendimento, setor, observacao)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE tipo_atendimento = ?, setor = ?, observacao = ?,
                                 atualizado_em = CURRENT_TIMESTAMP`,
        [atendimento.atendimento_id, ...campos, ...campos],
      );
      return lerRegistro(conn, atendimento.atendimento_id);
    });
    res.json(registro);
  }),
);

router.use((erro, req, res, next) => {
  if (erro.code === "ER_NO_SUCH_TABLE") {
    return res.status(503).json({ erro: "A estrutura do registro ainda não foi instalada. Aplique docs/mer/migrations/001-registro-atendimento.sql no banco." });
  }
  next(erro);
});

module.exports = router;
