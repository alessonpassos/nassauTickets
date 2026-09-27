import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MarcaTotem from "../components/MarcaTotem";
import QrCodeTotem from "../components/QrCodeTotem";
import FormularioTotem from "../components/FormularioTotem";
import ComprovanteTotem from "../components/ComprovanteTotem";
import useFormatoTotem from "../hooks/useFormatoTotem";
import { TOTEM } from "../data/totem";
import {
  horarioTotem,
  iniciarNovaSolicitacao,
  recuperarSenhaLocal,
} from "../services/totemService";
import "../styles/totem.css";

export default function Totem({ retirar = false }) {
  const computador = useFormatoTotem();
  const [parametros] = useSearchParams();
  const [agora, setAgora] = useState(() => new Date());
  const [erro, setErro] = useState("");
  const [senha, setSenha] = useState(() => {
    // No terminal compartilhado, sempre iniciar na escolha do atendimento.
    if (!retirar && computador) return null;
    try {
      return recuperarSenhaLocal();
    } catch {
      return null;
    }
  });
  const mostrarQr = computador && !retirar;
  const horario = horarioTotem(agora);
  const invalido =
    parametros.has("totem") && parametros.get("totem") !== TOTEM.id;

  useEffect(() => {
    document.title = "Totem | NassauTickets";
    const intervalo = setInterval(() => setAgora(new Date()), 15000);
    const aoFocar = () => setAgora(new Date());
    window.addEventListener("focus", aoFocar);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", aoFocar);
    };
  }, []);

  function aoEmitir(novaSenha) {
    setSenha(novaSenha);
    requestAnimationFrame(() =>
      document.getElementById("senha-gerada")?.focus(),
    );
  }
  function reiniciar() {
    try {
      iniciarNovaSolicitacao();
      setSenha(null);
      setErro("");
      requestAnimationFrame(() =>
        document.getElementById("escolha-atendimento")?.focus(),
      );
    } catch {
      setErro(
        "Não foi possível iniciar uma nova solicitação. Tente novamente.",
      );
    }
  }

  return (
    <div className="totem">
      <MarcaTotem />
      <main className="totem-principal">
        {invalido ? (
          <section className="totem-indisponivel">
            <h1>Totem não encontrado</h1>
            <p>Verifique o QR Code na recepção.</p>
            <Link to="/totem" className="botao botao--primario">
              Voltar ao Totem
            </Link>
          </section>
        ) : (
          <>
            <h1>Retire sua senha</h1>
            <div
              className={`totem-superficie${mostrarQr ? " totem-superficie--dupla" : ""}`}
            >
              {mostrarQr && (
                <QrCodeTotem caminho={`/totem/retirar?totem=${TOTEM.id}`} />
              )}
              <div className="totem-atendimento">
                {senha ? (
                  <ComprovanteTotem
                    senha={senha}
                    aoReiniciar={reiniciar}
                    expirou={
                      !horario.aberto || !senha.numero.startsWith(horario.dia)
                    }
                  />
                ) : (
                  <FormularioTotem
                    aberto={horario.aberto}
                    aoEmitir={aoEmitir}
                  />
                )}
                {erro && (
                  <p className="totem-erro" role="alert">
                    {erro}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <footer className="totem-rodape">
        <p>
          Totem {TOTEM.codigo} · {TOTEM.nome} <span>•</span> 7h às 17h · Horário
          de Brasília
        </p>
        <p className="totem-rodape__demo">
          Demonstração local. As senhas não entram em uma fila real.
        </p>
      </footer>
    </div>
  );
}
