import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MarcaTotem from "../components/MarcaTotem";
import FormularioTotem from "../components/FormularioTotem";
import ComprovanteTotem from "../components/ComprovanteTotem";
import { TOTEM } from "../data/totem";
import { horarioTotem } from "../utils/horario";
import "../styles/totem.css";

export default function Totem() {
  const [parametros] = useSearchParams();
  const [aberto, setAberto] = useState(() => horarioTotem().aberto);
  const [comprovante, setComprovante] = useState(null);
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
    requestAnimationFrame(() => document.getElementById("escolha-atendimento")?.focus());
  }, []);

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
                    aoReiniciar={voltarSelecao}
                    aoEncerrar={voltarSelecao}
                  />
                ) : (
                  <FormularioTotem aberto={aberto} aoEmitir={aoEmitir} />
                )}
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
      </footer>
    </div>
  );
}
