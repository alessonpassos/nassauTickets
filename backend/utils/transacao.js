const pool = require("../config/database");
const { ErroHttp } = require("./http");

async function comTransacao(fn, { lock } = {}) {
  const conn = await pool.getConnection();
  let travou = false;
  try {
    if (lock) {
      const [[linha]] = await conn.query("SELECT GET_LOCK(?, 5) AS ok", [lock]);
      if (Number(linha.ok) !== 1) {
        throw new ErroHttp(
          409,
          "Outro guichê está chamando agora. Tente novamente.",
        );
      }
      travou = true;
    }
    await conn.beginTransaction();
    const resultado = await fn(conn);
    await conn.commit();
    return resultado;
  } catch (erro) {
    try {
      await conn.rollback();
    } catch {
      
    }
    throw erro;
  } finally {
    if (travou) {
      await conn.query("SELECT RELEASE_LOCK(?)", [lock]).catch(() => {});
    }
    conn.release();
  }
}

module.exports = { comTransacao };
