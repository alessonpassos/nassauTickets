const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { ErroHttp, asyncHandler } = require("../utils/http");

const router = express.Router();

const HASH_FALSO = bcrypt.hashSync("senha-inexistente", 10);

router.post( 
  "/login",
  asyncHandler(async (req, res) => {
    const login = String(req.body?.usuario ?? "").trim();
    const senha = String(req.body?.senha ?? "");
    if (!login || !senha) throw new ErroHttp(400, "Informe usuário e senha.");

    const [linhas] = await pool.query(
      "SELECT id, nome, senha_hash, perfil, ativo FROM usuarios WHERE login = ?",
      [login],
    );
    const u = linhas[0];

    const senhaConfere = await bcrypt.compare(
      senha,
      u ? u.senha_hash : HASH_FALSO,
    );
    if (!u || !u.ativo || !senhaConfere) {
     
      throw new ErroHttp(401, "Usuário ou senha incorretos.");
    }

    const token = jwt.sign(
      { nome: u.nome, perfil: u.perfil },
      process.env.JWT_SECRET,
      {
        subject: String(u.id),
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      },
    );

    res.json({ token, usuario: u.nome, perfil: u.perfil.toLowerCase() });
  }),
);

module.exports = router;
