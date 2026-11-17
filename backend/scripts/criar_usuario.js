// Cria (ou atualiza a senha de) um usuário com hash bcrypt.
// Uso (dentro de backend/):
//   node scripts/criar_usuario.js atendente1 "Marina Duarte" minhaSenha ATENDENTE
//   node scripts/criar_usuario.js gestor1 "Camila Borges" outraSenha GESTOR
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../config/database");

(async () => {
  const [login, nome, senha, perfil] = process.argv.slice(2);
  if (!login || !nome || !senha || !["ATENDENTE", "GESTOR"].includes(perfil)) {
    console.error(
      'Uso: node scripts/criar_usuario.js <login> "<Nome>" <senha> <ATENDENTE|GESTOR>',
    );
    process.exit(1);
  }
  const hash = await bcrypt.hash(senha, 10);
  await pool.query(
    `INSERT INTO usuarios (login, nome, senha_hash, perfil) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nome = VALUES(nome), senha_hash = VALUES(senha_hash), perfil = VALUES(perfil), ativo = 1`,
    [login, nome, hash, perfil],
  );
  console.log(`Usuário "${login}" (${perfil}) salvo com sucesso.`);
  process.exit(0);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
