const express = require("express");
const router = express.Router();

let chamadaAtual = null;
let historico = [];

router.get("/atual", (req, res) => {
  res.json({ chamadaAtual, historico });
});

router.post("/chamar", (req, res) => {
  const { senha, local, nome, prioritario, setor } = req.body;

  if (chamadaAtual) {
    historico = [chamadaAtual, ...historico].slice(0, 20);
  }

  chamadaAtual = {
    id: Date.now(),
    senha,
    local,
    nome,
    prioritario,
    setor,
    horario: new Date(),
  };

  res.status(201).json({ chamadaAtual, historico });
});

router.post("/repetir", (req, res) => {
  if (!chamadaAtual) {
    return res
      .status(400)
      .json({ erro: "Nenhuma senha em atendimento para repetir." });
  }
  chamadaAtual = { ...chamadaAtual, id: Date.now() };
  res.json({ chamadaAtual, historico });
});

module.exports = router;
