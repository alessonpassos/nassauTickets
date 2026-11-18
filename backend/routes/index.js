const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Health check: testa o banco de verdade. Se cair, responde 503.
router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", banco: "ok" });
  } catch (erro) {
    console.error("Health: banco indisponível:", erro.code || erro.message);
    res.status(503).json({ status: "erro", banco: "indisponivel" });
  }
});

module.exports = router;
