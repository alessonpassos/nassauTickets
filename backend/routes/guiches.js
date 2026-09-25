const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const [guiches] = await pool.query(
      "SELECT id, numero, ativo FROM guiches WHERE ativo = 1 ORDER BY numero",
    );
    res.json(guiches);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar guichês." });
  }
});

module.exports = router;
