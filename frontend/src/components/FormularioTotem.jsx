import { useRef, useState } from "react";
import { TIPOS_SENHA } from "../data/totem";
import { api, traduzirSenha } from "../services/api";
import IconeTotem from "./IconeTotem";

export default function FormularioTotem({ aberto, aoEmitir }) {
  const [enviando, setEnviando] = useState("");
  const [erro, setErro] = useState("");
  const [ultimoTipo, setUltimoTipo] = useState("");
  const envioEmCurso = useRef(false);

  async function emitir(tipo) {
    if (envioEmCurso.current || !aberto) return;
    envioEmCurso.current = true;
    setEnviando(tipo);
    setUltimoTipo(tipo);
    setErro("");
    try {
      aoEmitir(traduzirSenha(await api.post("/senhas", { tipo }, { autenticado: false })));
    } catch (falha) {
      setErro(falha.message);
    } finally {
      envioEmCurso.current = false;
      setEnviando("");
    }
  }

  return (
    <section
      className="totem-emissao"
      aria-labelledby="escolha-atendimento"
      aria-busy={!!enviando}
    >
      <h2 id="escolha-atendimento" tabIndex={-1}>
        Escolha seu atendimento
      </h2>
      <p>Toque em uma opção para gerar a senha.</p>
      <div className="totem-opcoes">
        {TIPOS_SENHA.map((tipo) => (
          <button
            key={tipo.codigo}
            type="button"
            className="totem-botao-senha"
            onClick={() => emitir(tipo.codigo)}
            disabled={!aberto || !!enviando}
          >
            <IconeTotem nome={tipo.icone} tamanho={23} />
            <span>
              {enviando === tipo.codigo ? "Gerando senha…" : tipo.titulo}
            </span>
            <IconeTotem nome="seta" tamanho={20} />
          </button>
        ))}
      </div>
      {!aberto && (
        <p className="totem-aviso" role="status">
          Emissão disponível das 7h às 17h, no horário de Brasília.
        </p>
      )}
      {erro && (
        <div className="totem-erro" role="alert">
          <p>{erro}</p>
          <button type="button" className="botao botao--secundario" disabled={!aberto || !!enviando} onClick={() => emitir(ultimoTipo)}>Tentar novamente</button>
        </div>
      )}
    </section>
  );
}
