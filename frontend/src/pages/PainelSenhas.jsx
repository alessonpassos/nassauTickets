import { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import Relogio from "../components/Relogio";
import { api } from "../services/api";
import { formatarHora, sequencia } from "../utils/formatar";
import { narrarChamada, tocarSinal } from "../utils/audio";
import "../styles/PainelSenhas.css";

const INTERVALO_ATUALIZACAO = 4000;

function traduzirChamada(item) {
  return {
    id: `${item.codigo}#${item.segunda_chamada_em == null ? 1 : 2}`,
    numero: item.codigo,
    senha: sequencia(item.codigo),
    tipo: item.tipo,
    guiche: item.guiche,
    local: `Guichê ${item.guiche}`,
    prioritario: item.tipo === "SP",
    ultima: item.status === "CHAMADA_NOVAMENTE",
    horario: new Date(item.segunda_chamada_em ?? item.primeira_chamada_em),
  };
}

const tamanhoDaSenha = (s) =>
  s.length > 8 ? "muito-longo" : s.length > 6 ? "longo" : "normal";

export default function PainelSenhas({
  maxHistorico = 5,
  aviso = "Tenha um documento com foto em mãos ao ser chamado.",
  som = false,
  narrar = false,
  duracaoChamada = 10000,
}) {
  const [painel, setPainel] = useState({ chamadaAtual: null, chamadas: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [audioLigado, setAudioLigado] = useState(false);
  const [chamadaNova, setChamadaNova] = useState(null);

  const limite = Math.max(1, Math.min(5, maxHistorico));
  const chamadas = painel.chamadas.slice(0, limite);
  const chamadaAtual = painel.chamadaAtual;
  const idAtual = chamadaAtual?.id ?? null;
  const chamando = chamadaNova !== null && chamadaNova.id === idAtual;

  useEffect(() => {
    let cancelado = false;
    let iniciado = false;
    let idAnterior = null;
    let temporizador;
    let controle;

    async function atualizar() {
      controle = new AbortController();
      try {
        const dados = await api.get("/senhas/atual", undefined, {
          autenticado: false,
          signal: controle.signal,
        });
        if (cancelado) return;

        const atual = dados.chamadaAtual ? traduzirChamada(dados.chamadaAtual) : null;
        const historico = dados.historico.map(traduzirChamada);
        const id = atual?.id ?? null;

        // A primeira resposta apenas estabelece a chamada que já estava no painel.
        if (iniciado && id !== idAnterior) setChamadaNova(atual);
        idAnterior = id;
        iniciado = true;
        setPainel({
          chamadaAtual: atual,
          chamadas: [atual, ...historico].filter(Boolean).slice(0, 5),
        });
        setErro("");
      } catch (falha) {
        if (!cancelado) setErro(falha.message);
      } finally {
        if (!cancelado) {
          setCarregando(false);
          temporizador = setTimeout(atualizar, INTERVALO_ATUALIZACAO);
        }
      }
    }

    atualizar();
    return () => {
      cancelado = true;
      controle?.abort();
      clearTimeout(temporizador);
    };
  }, []);

  useEffect(() => {
    if (!chamadaNova) return;
    const fim = setTimeout(() => setChamadaNova(null), duracaoChamada);
    return () => clearTimeout(fim);
  }, [chamadaNova, duracaoChamada]);

  useEffect(() => {
    if (!chamadaNova || !audioLigado) return;
    if (som) tocarSinal();

    const fala = narrar
      ? setTimeout(() => narrarChamada(chamadaNova), 1400)
      : null;

    return () => {
      if (fala) clearTimeout(fala);
    };
  }, [chamadaNova, audioLigado, som, narrar]);

  return (
    <div className="painel" style={{ "--linhas": limite }}>
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
            {erro && (
              <p className="msg msg--erro" role="alert">
                {erro} A atualização será tentada novamente automaticamente.
              </p>
            )}
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
                  {carregando ? "Carregando chamadas…" : "Aguarde ser chamado"}
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
            Últimas {limite} chamadas
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