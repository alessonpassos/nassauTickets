import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MarcaTotem from "../components/MarcaTotem";
import FormularioTotem from "../components/FormularioTotem";
import ComprovanteTotem from "../components/ComprovanteTotem";
import useFormatoTotem from "../hooks/useFormatoTotem";
import { AVISO_IMPRESSAO_MS, IMPRESSAO_MS, TOTEM } from "../data/totem";
import { iniciarNovaSolicitacao, recuperarSenhaLocal } from "../services/totemService";
import { horarioTotem } from "../utils/horario";
import "../styles/totem.css";

export default function Totem({ retirar = false }) {
  const computador = useFormatoTotem();
  const [parametros] = useSearchParams();
  const [aberto, setAberto] = useState(() => horarioTotem().aberto);
  const [erro, setErro] = useState("");
  const [comprovante, setComprovante] = useState(() => {
    // O terminal compartilhado inicia sempre na seleção.
    if (!retirar && computador) return null;
    try {
      const senha = recuperarSenhaLocal();
      if (!senha) return null;
      const decorrido = Date.now() - Date.parse(senha.emitidaEm);
      return decorrido >= 0 && decorrido < IMPRESSAO_MS + AVISO_IMPRESSAO_MS
        ? { senha, decorrido }
        : null;
    } catch {
      return null;
    }
  });
  const invalido = parametros.has("totem") && parametros.get("totem") !== TOTEM.id;

  useEffect(() => {
    document.title = "Totem | NassauTickets";
    const verificarHorario = () => setAberto(horarioTotem().aberto);
    const intervalo = setInterval(verificarHorario, 1000);
    window.addEventListener("focus", verificarHorario);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", verificarHorario);
    };
  }, []);

  function aoEmitir(senha) {
    setComprovante({ senha, decorrido: 0 });
    requestAnimationFrame(() => document.getElementById("senha-gerada")?.focus());
  }

  const voltarSelecao = useCallback(() => {
    setComprovante(null);
    setErro("");
    requestAnimationFrame(() => document.getElementById("escolha-atendimento")?.focus());
  }, []);

  function reiniciar() {
    try {
      if (recuperarSenhaLocal()?.numero === comprovante.senha.numero) {
        iniciarNovaSolicitacao();
      }
      voltarSelecao();
    } catch {
      setErro("Não foi possível iniciar uma nova solicitação. Tente novamente.");
    }
  }

  return (
    <div className="totem">
      <MarcaTotem />
      <main className="totem-principal">
        {invalido ? (
          <section className="totem-indisponivel">
            <h1>Totem não encontrado</h1>
            <p>Use o endereço do totem da recepção.</p>
            <Link to="/totem" className="botao botao--primario">
              Voltar ao Totem
            </Link>
          </section>
        ) : (
          <>
            <h1>Retire sua senha</h1>
            <div className="totem-superficie">
              <div className="totem-atendimento">
                {comprovante ? (
                  <ComprovanteTotem
                    senha={comprovante.senha}
                    decorrido={comprovante.decorrido}
                    aoReiniciar={reiniciar}
                    aoEncerrar={voltarSelecao}
                  />
                ) : (
                  <FormularioTotem aberto={aberto} aoEmitir={aoEmitir} />
                )}
                {erro && <p className="totem-erro" role="alert">{erro}</p>}
              </div>
            </div>
          </>
        )}
      </main>
      <footer className="totem-rodape">
        <p>
          Totem {TOTEM.codigo} · {TOTEM.nome} <span>•</span> {TOTEM.abertura}h às{" "}
          {TOTEM.encerramento}h · Horário de Brasília
        </p>
        <p className="totem-rodape_demo">
          Demonstração local. As senhas não entram em uma fila real.
        </p>
      </footer>
    </div>
  );
}
