require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const senhasRouter = require("./routes/senhas");
const registrosRouter = require("./routes/registros");
const guichesRouter = require("./routes/guiches");
const relatoriosRouter = require("./routes/relatorios");

const app = express();
  
const origensPermitidas = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: origensPermitidas }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/senhas", senhasRouter);
app.use("/api/senhas", registrosRouter);
app.use("/api/guiches", guichesRouter);
app.use("/api/relatorios", relatoriosRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ erro: "JSON inválido no corpo da requisição." });
  }
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(err);
    return res.status(status).json({ erro: "Erro interno do servidor." });
  }
  res.status(status).json({ erro: err.message });
});

module.exports = app;
