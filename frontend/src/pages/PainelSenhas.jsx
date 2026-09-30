import { useEffect, useMemo, useRef, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import Relogio from "../components/Relogio";
import useFila from "../hooks/useFila";
import { formatarHora, sequencia } from "../utils/formatar";
import { narrarChamada, tocarSinal } from "../utils/audio";
import "../styles/PainelSenhas.css";

const tamanhoDaSenha = (s) =>
  s.length > 8 ? "muito-longo" : s.length > 6 ? "longo" : "normal";

export default function PainelSenhas({
  maxHistorico = 5,
  aviso = "Tenha um documento com foto em mãos ao ser chamado.",
  som = false,
  narrar = false,
  duracaoChamada = 10000,
}) {
  const { senhas } = useFila();
  const [audioLigado, setAudioLigado] = useState(false);

  const chamadas = useMemo(
    () =>
      senhas
        .filter((s) => s.chamadas?.length)
        .map((s) => ({
          id: `${s.numero}#${s.chamadas.length}`,
          numero: s.numero,
          senha: sequencia(s.numero),
          tipo: s.tipo,
          guiche: s.guiche,
          local: `Guichê ${s.guiche}`,
          prioritario: s.tipo === "SP",
          ultima: s.estado === "CHAMADA_NOVAMENTE",
          horario: new Date(s.chamadas.at(-1)),
        }))
        .sort((a, b) => b.horario - a.horario)
        .slice(0, maxHistorico),
    [senhas, maxHistorico]
  );

  const chamadaAtual = chamadas[0] ?? null;
  const idAtual = chamadaAtual?.id ?? null;

  const [idVisto, setIdVisto] = useState(idAtual);
  const [chamando, setChamando] = useState(false);

  useEffect(() => {
    if (idAtual !== idVisto) {
      setIdVisto(idAtual);
      setChamando(idAtual !== null);
    }
  }, [idAtual, idVisto]);

  const chamadaRef = useRef(chamadaAtual);

  useEffect(() => {
    chamadaRef.current = chamadaAtual;
  }, [chamadaAtual]);

  useEffect(() => {
    if (!chamando) return;

    const fim = setTimeout(() => setChamando(false), duracaoChamada);

    return () => clearTimeout(fim);
  }, [chamando, idAtual, duracaoChamada]);

  useEffect(() => {
    if (!chamando || !audioLigado || !chamadaRef.current) return;

    if (som) tocarSinal();

    const fala = narrar
      ? setTimeout(() => narrarChamada(chamadaRef.current), 1400)
      : null;

    return () => {
      if (fala) clearTimeout(fala);
    };
  }, [idAtual, chamando, audioLigado, som, narrar]);

  return (
    <div className="painel" style={{ "--linhas": maxHistorico }}>
      <p className="painel_sr" role="status" aria-live="polite">
        {chamadaAtual
          ? `Senha ${chamadaAtual.senha}, ${chamadaAtual.local}`
          : ""}
      </p>

      <div className="painel_conteudo">
        <div className="painel_coluna-principal">
          <Cabecalho mostrarMenu={false}>
            <Relogio />
          </Cabecalho>

          <main className="painel_principal" data-chamando={chamando}>
            {chamadaAtual ? (
              <section
                key={idAtual}
                className={`painel_chamada${
                  chamando ? " painel_chamada--nova" : ""
                }`}
              >
                <div className="painel_linha-topo">
                  <p className="painel_rotulo">Senha</p>

                  <p
                    className={`painel_status${
                      chamando ? " painel_status--ativo" : ""
                    }`}
                  >
                    {chamando && (
                      <span
                        className="painel_ponto"
                        aria-hidden="true"
                      />
                    )}

                    {chamadaAtual.ultima
                      ? "Última chamada"
                      : chamando
                      ? "Chamando agora"
                      : "Chamada recente"}
                  </p>
                </div>

                <p
                  className="painel_senha"
                  data-tamanho={tamanhoDaSenha(chamadaAtual.senha)}
                >
                  {chamadaAtual.senha}
                </p>

                <div className="painel_destino">
                  <p className="painel_local">{chamadaAtual.local}</p>

                  {chamadaAtual.prioritario && (
                    <div className="painel_detalhes">
                      <span className="painel_etiqueta">
                        Prioritário
                      </span>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className="painel_espera">
                <p className="painel_espera-titulo">
                  Aguarde ser chamado
                </p>

                <p className="painel_espera-texto">
                  Sua senha aparecerá aqui, junto com o guichê de
                  atendimento.
                </p>
              </section>
            )}

            {aviso && <footer className="painel_aviso">{aviso}</footer>}

            {!audioLigado && (
              <button
                type="button"
                className="botao botao--secundario painel_audio"
                onClick={() => setAudioLigado(true)}
              >
                Ativar som das chamadas
              </button>
            )}
          </main>
        </div>

        <aside
          className="painel_historico"
          aria-label="Últimas chamadas"
        >
          <h2 className="painel_historico-titulo">
            Últimas 5 chamadas
          </h2>

          {chamadas.length > 0 ? (
            <ol className="painel_lista">
              {chamadas.map((item) => (
                <li key={item.id} className="painel_item">
                  <span className="painel_item-senha">
                    {item.senha}
                  </span>

                  <span className="painel_item-info">
                    <span className="painel_item-local">
                      {item.local}
                    </span>

                    {item.prioritario && (
                      <span className="painel_item-prioridade">
                        Prioritário
                      </span>
                    )}
                  </span>

                  <time className="painel_item-hora">
                    {formatarHora(item.horario)}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="painel_vazio">
              As últimas senhas chamadas aparecerão aqui.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}