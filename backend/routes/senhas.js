const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { verificarToken, exigirPerfil } = require("../middleware/auth");
const { ErroHttp, asyncHandler } = require("../utils/http");
const { comTransacao } = require("../utils/transacao");

const TIPOS = ["SP", "SE", "SG"];
const LIMITE_DIARIO = 999; //
const LIMITE_PAINEL = 5; // 
const LOCK_CHAMAR = "nassautickets:chamar";
const LOCK_EMITIR = "nassautickets:emitir";

const ESTADOS_OCUPAM_GUICHE = [
  "CHAMADA",
  "CHAMADA_NOVAMENTE",
  "EM_ATENDIMENTO",
];

// SP → (SE|SG) → SP → (SE|SG)...
// Se a última chamada foi SP, a vez é de SE/SG (SE antes de SG) e SP é o reserva.
// Caso contrário, a vez é de SP, depois SE, depois SG. A fila vazia é "pulada".
function ordemDeChamada(ultimoTipo) {
  return ultimoTipo === "SP" ? ["SE", "SG", "SP"] : ["SP", "SE", "SG"];
}

function lerGuicheId(body) {
  const id = Number(body?.guiche_id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroHttp(
      400,
      "guiche_id é obrigatório e deve ser um número inteiro.",
    );
  }
  return id;
}

// A emissão roda dentro de uma transação com a trava LOCK_EMITIR: só um pedido por vez calcula o próximo sequencial, então dois pedidos simultâneos nunca geram o mesmo código.

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const tipo = String(req.body?.tipo ?? "").toUpperCase();
    if (!TIPOS.includes(tipo))
      throw new ErroHttp(400, "tipo deve ser SP, SE ou SG.");

    const nova = await comTransacao(
      async (conn) => {
        const [[prox]] = await conn.query(
          `SELECT COALESCE(MAX(sequencial), 0) + 1 AS n,
                  DATE_FORMAT(CURDATE(), '%y%m%d') AS prefixo
             FROM senhas
            WHERE data_emissao = CURDATE() AND tipo = ?`,
          [tipo],
        );
        const n = Number(prox.n);
        if (n > LIMITE_DIARIO) {
          throw new ErroHttp(
            422,
            `Limite diário de ${LIMITE_DIARIO} senhas ${tipo} atingido.`,
          );
        }
        const codigo = `${prox.prefixo}-${tipo}${String(n).padStart(3, "0")}`;

        const [r] = await conn.query(
          `INSERT INTO senhas (codigo, tipo, sequencial, data_emissao, status)
           VALUES (?, ?, ?, CURDATE(), 'AGUARDANDO')`,
          [codigo, tipo, n],
        );
        const [[criada]] = await conn.query(
          "SELECT id, codigo, tipo, sequencial, status, emitida_em FROM senhas WHERE id = ?",
          [r.insertId],
        );
        return criada;
      },
      { lock: LOCK_EMITIR },
    );

    res.status(201).json(nova);
  }),
);

router.get(
  "/atual",
  asyncHandler(async (req, res) => {
    const [ultimas] = await pool.query(
      `SELECT a.id AS atendimento_id, s.codigo, s.tipo, s.status,
              g.numero AS guiche, a.primeira_chamada_em, a.segunda_chamada_em
         FROM atendimentos a
         JOIN senhas s ON s.id = a.senha_id
         JOIN guiches g ON g.id = a.guiche_id
        WHERE s.data_emissao = CURDATE()
        ORDER BY COALESCE(a.segunda_chamada_em, a.primeira_chamada_em) DESC, a.id DESC
        LIMIT ${LIMITE_PAINEL}`,
    );
    const [chamadaAtual, ...historico] = ultimas;
    res.json({ chamadaAtual: chamadaAtual || null, historico });
  }),
);

router.get(
  "/fila",
  verificarToken,
  exigirPerfil("ATENDENTE", "GESTOR"),
  asyncHandler(async (req, res) => {
    const [fila] = await pool.query(
      `SELECT id, codigo, tipo, sequencial, status, emitida_em
         FROM senhas
        WHERE status = 'AGUARDANDO' AND data_emissao = CURDATE()
        ORDER BY emitida_em ASC, id ASC`,
    );
    res.json(fila);
  }),
);

router.post(
  "/chamar",
  verificarToken,
  exigirPerfil("ATENDENTE"),
  asyncHandler(async (req, res) => {
    const guicheId = lerGuicheId(req.body);
    const atendenteId = req.usuario.id;

    const escolhida = await comTransacao(
      async (conn) => {
        const [guiche] = await conn.query(
          "SELECT id FROM guiches WHERE id = ? AND ativo = 1",
          [guicheId],
        );
        if (!guiche.length)
          throw new ErroHttp(404, "Guichê não encontrado ou inativo.");

        const [ocupado] = await conn.query(
          `SELECT 1 FROM atendimentos a
             JOIN senhas s ON s.id = a.senha_id
            WHERE a.guiche_id = ? AND s.data_emissao = CURDATE() AND s.status IN (?)
            LIMIT 1`,
          [guicheId, ESTADOS_OCUPAM_GUICHE],
        );
        if (ocupado.length) {
          throw new ErroHttp(
            409,
            "Este guichê já tem uma senha em andamento. Finalize antes de chamar outra.",
          );
        }

        const [ultima] = await conn.query(
          `SELECT s.tipo FROM atendimentos a
             JOIN senhas s ON s.id = a.senha_id
            WHERE s.data_emissao = CURDATE()
            ORDER BY a.primeira_chamada_em DESC, a.id DESC
            LIMIT 1`,
        );

        let senha = null;
        for (const tipo of ordemDeChamada(ultima[0]?.tipo)) {
          const [candidatas] = await conn.query(
            `SELECT id, codigo, tipo FROM senhas
              WHERE status = 'AGUARDANDO' AND data_emissao = CURDATE() AND tipo = ?
              ORDER BY emitida_em ASC, id ASC
              LIMIT 1
              FOR UPDATE`,
            [tipo],
          );
          if (candidatas.length) {
            senha = candidatas[0];
            break;
          }
        }
        if (!senha)
          throw new ErroHttp(404, "Nenhuma senha aguardando na fila.");

        await conn.query(
          "INSERT INTO atendimentos (senha_id, atendente_id, guiche_id) VALUES (?, ?, ?)",
          [senha.id, atendenteId, guicheId],
        );
        const [upd] = await conn.query(
          "UPDATE senhas SET status = 'CHAMADA' WHERE id = ? AND status = 'AGUARDANDO'",
          [senha.id],
        );
        if (upd.affectedRows !== 1) {
          throw new ErroHttp(
            409,
            "A senha mudou de estado. Tente chamar novamente.",
          );
        }
        return senha;
      },
      { lock: LOCK_CHAMAR },
    );

    res.status(201).json({
      senha_id: escolhida.id,
      codigo: escolhida.codigo,
      tipo: escolhida.tipo,
      guiche_id: guicheId,
      status: "CHAMADA",
    });
  }),
);

router.post(
  "/repetir",
  verificarToken,
  exigirPerfil("ATENDENTE"),
  asyncHandler(async (req, res) => {
    const guicheId = lerGuicheId(req.body);

    const resultado = await comTransacao(async (conn) => {
      const [linhas] = await conn.query(
        `SELECT a.id AS atendimento_id, s.id AS senha_id, s.codigo, s.status
           FROM atendimentos a
           JOIN senhas s ON s.id = a.senha_id
          WHERE a.guiche_id = ? AND s.data_emissao = CURDATE()
          ORDER BY a.primeira_chamada_em DESC, a.id DESC
          LIMIT 1
          FOR UPDATE`,
        [guicheId],
      );
      if (!linhas.length)
        throw new ErroHttp(404, "Este guichê não tem senha chamada hoje.");

      const at = linhas[0];
      if (at.status !== "CHAMADA") {
        throw new ErroHttp(
          409,
          at.status === "CHAMADA_NOVAMENTE"
            ? "A senha já foi chamada duas vezes."
            : `Não é possível repetir a chamada: a senha está ${at.status}.`,
        );
      }

      await conn.query(
        "UPDATE senhas SET status = 'CHAMADA_NOVAMENTE' WHERE id = ?",
        [at.senha_id],
      );
      await conn.query(
        "UPDATE atendimentos SET segunda_chamada_em = NOW() WHERE id = ?",
        [at.atendimento_id],
      );
      return {
        senha_id: at.senha_id,
        codigo: at.codigo,
        guiche_id: guicheId,
        status: "CHAMADA_NOVAMENTE",
      };
    });

    res.json(resultado);
  }),
);

async function mudarEstado(codigo, { de, para, colunaHorario }) {
  return comTransacao(async (conn) => {
    const [linhas] = await conn.query(
      "SELECT id, status FROM senhas WHERE codigo = ? FOR UPDATE",
      [codigo],
    );
    if (!linhas.length) throw new ErroHttp(404, "Senha não encontrada.");

    const { id, status } = linhas[0];
    if (!de.includes(status)) {
      throw new ErroHttp(409, `Transição inválida: ${status} → ${para}.`);
    }

    await conn.query("UPDATE senhas SET status = ? WHERE id = ?", [para, id]);
    if (colunaHorario) {
      await conn.query(
        `UPDATE atendimentos SET ${colunaHorario} = NOW() WHERE senha_id = ?`,
        [id],
      );
    }
    return { codigo, status: para };
  });
}

function rotaDeTransicao(caminho, config) {
  router.post(
    caminho,
    verificarToken,
    exigirPerfil("ATENDENTE"),
    asyncHandler(async (req, res) => {
      const codigo = String(req.body?.codigo ?? "").trim();
      if (!codigo) throw new ErroHttp(400, "codigo da senha é obrigatório.");
      res.json(await mudarEstado(codigo, config));
    }),
  );
}

rotaDeTransicao("/iniciar", {
  de: ["CHAMADA", "CHAMADA_NOVAMENTE"],
  para: "EM_ATENDIMENTO",
  colunaHorario: "inicio_atendimento_em",
});
rotaDeTransicao("/finalizar", {
  de: ["EM_ATENDIMENTO"],
  para: "ATENDIDA",
  colunaHorario: "fim_atendimento_em",
});
rotaDeTransicao("/nao-compareceu", {
  de: ["CHAMADA_NOVAMENTE"], 
  para: "NAO_COMPARECEU",
});

module.exports = router;
