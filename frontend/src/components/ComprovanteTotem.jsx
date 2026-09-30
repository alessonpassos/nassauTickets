import { useState } from "react";
import { TOTEM, TIPOS_SENHA } from "../data/totem";
import IconeTotem from "./IconeTotem";

export default function ComprovanteTotem({ senha, aoReiniciar, expirou }) {
  const [mensagem, setMensagem] = useState("");
  const tipo = TIPOS_SENHA.find((item) => item.codigo === senha.tipo);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(senha.numero);
      setMensagem("Senha copiada.");
    } catch {
      setMensagem("Anote sua senha ou tire uma captura de tela.");
    }
  }
  return (
    <section className="totem-comprovante" aria-labelledby="senha-gerada">
      <h2 id="senha-gerada" tabIndex={-1}>
        {expirou ? "Senha expirada" : "Sua senha"}
      </h2>
      <strong className="totem-comprovante_numero">
        {senha.numero.split("-")[1]}
      </strong>
      <p className="totem-comprovante_codigo">{senha.numero}</p>
      <p className="totem-comprovante_tipo">{tipo.titulo}</p>
      <time dateTime={senha.emitidaEm}>
        {new Date(senha.emitidaEm).toLocaleString("pt-BR", {
          timeZone: TOTEM.fusoHorario,
          dateStyle: "short",
          timeStyle: "short",
        })}
      </time>
      <p className="totem-comprovante_instrucao">
        {expirou
          ? "O expediente desta senha foi encerrado."
          : "Anote o número ou tire uma foto da senha."}
      </p>
      <div className="totem-comprovante_acoes">
        <button className="botao botao--secundario" onClick={copiar}>
          <IconeTotem nome="copiar" tamanho={18} /> Copiar senha
        </button>
        <button className="botao botao--primario" onClick={aoReiniciar}>
          Nova senha
        </button>
      </div>
      <p className="totem-feedback" role="status">
        {mensagem}
      </p>
    </section>
  );
}
