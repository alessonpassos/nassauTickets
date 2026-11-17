const jwt = require("jsonwebtoken");
const { ErroHttp } = require("../utils/http");

if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET não definido. Copie .env.example para .env e preencha.",
  );
}

function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) {
    return next(new ErroHttp(401, "Token ausente. Faça login."));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = {
      id: Number(payload.sub),
      nome: payload.nome,
      perfil: payload.perfil,
    };
    next();
  } catch {
    next(
      new ErroHttp(401, "Token inválido ou expirado. Faça login novamente."),
    );
  }
}

function exigirPerfil(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) return next(new ErroHttp(401, "Não autenticado."));
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return next(
        new ErroHttp(403, "Seu perfil não tem permissão para esta ação."),
      );
    }
    next();
  };
}

module.exports = { verificarToken, exigirPerfil };
