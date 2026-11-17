import { useState, useEffect} from "react";
import { lerSessao, sair } from "../services/sessao";
import * as fila from "../services/filaService";
import useFila from "../hooks/useFila";
import { horarioTotem } from "../utils/horario";
import Cabecalho from "../components/Cabecalho";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Rodape from "../components/Rodape";
import SenhaAtual from "../components/SenhaAtual";
import FilaEspera from "../components/FilaEspera";
import FichaPaciente from "../components/FichaPaciente";
import InfoUsuario from "../components/InfoUsuario";
import "../styles/layout.css";
import "../styles/painelAtendente.css";

const CHAVE_GUICHE = "nassautickets_guiche_atual";

function obterGuicheInicial() {
  const salvo = Number(sessionStorage.getItem(CHAVE_GUICHE));
  return Number.isFinite(salvo) && salvo > 0 ? salvo : null;
}

export default function PainelAtendente() {
  const sessao = lerSessao();
  const { senhas = [], carregandoFila = false, erroFila = null, atualizarFila } = useFila();

  const [guiche, setGuiche] = useState(obterGuicheInicial());
  const [mensagem, setMensagem] = useState(null);
  const [processando, setProcessando] = useState(false);

  const nomeAtendente = sessao?.nome || sessao?.usuario || "Atendente";
  const funcaoAtendente = sessao?.funcao || "Atendimento";

  useEffect(() => {
    let ativo = true;

    async function carregarGuiches() {
      try {
        const lista = await fila.listarGuiches();
        if (!ativo || !Array.isArray(lista) || lista.length === 0) return;

        setGuiches(lista);

        setGuiche((atualId) => {
          const existe = lista.some((g) => g.id === atualId);
          const idValido = existe ? atualId : lista[0].id;
          sessionStorage.setItem(CHAVE_GUICHE, String(idValido));
          return idValido;
        });
      } catch (erro) {
        if (ativo) {
          setMensagem({
            tipo: "erro",
            texto: erro?.message || "Não foi possível carregar os guichês.",
          });
        }
      }
    }

    carregarGuiches();
    return () => {
      ativo = false;
    };
  }, []);

  function aoMudarGuiche(novoGuiche) {
    setGuiche(novoGuiche);
    sessionStorage.setItem(CHAVE_GUICHE, String(novoGuiche));
    setMensagem(null);
  }

  useEffect(() => {
    if (!mensagem || mensagem.tipo === "ok") return;
    const timer = setTimeout(() => setMensagem(null), 5000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  const atual =
    doDia.find((s) => (s.guiche_id ?? s.guiche) === guiche && fila.ATIVOS.includes(s.estado)) ?? null;
  const aguardando = doDia.filter((s) => s.estado === "aguardando");

  async function executar(acao) {
    if (processando) return;
    setProcessando(true);
    setMensagem(null);

    try {
      const textoSucesso = await acao();
      if (typeof atualizarFila === "function") await atualizarFila();
      setMensagem({ tipo: "ok", texto: textoSucesso });
    } catch (erro) {
      if (typeof atualizarFila === "function") await atualizarFila();
      setMensagem({
        tipo: "erro",
        texto: erro?.message || "Não foi possível concluir a operação.",
      });
    } finally {
      setProcessando(false);
    }
  }

  function exigirSenhaAtual(callback) {
    if (!atual.numero) {
      setMensagem({
        tipo: "erro",
        texto: "Não há senha atual para esta ação."
      });
      return;
    }
    const codigo =atual.codigo ?? atual.numero;
    executar(()=> callback(codigo));
  }

  const acoes = {
    chamarProxima: () => executar(() => fila.chamarProxima({ guiche, atendente: nomeAtendente })),
    chamarNovamente: () => exigirSenhaAtual((numero) => fila.chamarNovamente(numero)),
    iniciar: () => exigirSenhaAtual((numero) => fila.iniciarAtendimento(numero)),
    finalizar: () => exigirSenhaAtual((numero) => fila.finalizarAtendimento(numero)),
    naoCompareceu: () => exigirSenhaAtual((numero) => fila.marcarNaoCompareceu(numero)),
  };

  return (
    <div className="pagina">
      <Cabecalho>
        <InfoUsuario
          nomeUsuario={nomeAtendente}
          funcao={`${funcaoAtendente},
          guichê ${guiche}`}
          aoSair={sair}
        />
      </Cabecalho>

      <main className="pagina_corpo">
        <CabecalhoPagina
          titulo="Painel de atendimento"
          subtitulo="Chame as senhas e registre cada atendimento."
        >
          <div className="campo campo--guiche">
            <label className="campo_rotulo" htmlFor="guiche">Guichê</label>
            <select
              id="guiche"
              className="campo_entrada"
              value={guiche}
              disabled={processando}
              onChange={(e) => aoMudarGuiche(Number(e.target.value))}
            >
              {GUICHES.map((g) => <option key={g} value={g}>Guichê {g}</option>)}
            </select>
          </div>
        </CabecalhoPagina>

        {erroFila && (
          <p className="msg msg--erro" role="alert">
            Falha ao carregar a fila: {erroFila}
          </p>
        )}

        {mensagem && (
          <div
            className={`msg msg--${mensagem.tipo}`}
            role={mensagem.tipo === "erro" ? "alert" : "status"}
          >
            <span>{mensagem.texto}</span>
            <button
              type="button"
              className="msg_fechar"
              aria-label="Fechar aviso"
              onClick={() => setMensagem(null)}
            >
              ×
            </button>
          </div >
        )}

        <div className="atend_grade">
          <aside className="atend_lateral">
            <SenhaAtual senha={atual} acoes={acoes} carregando={processando} />
            <FilaEspera senhas={aguardando} carregando={false}/>
          </aside>

          <FichaPaciente
            key={atual?.numero ?? "sem-senha"}
            senha={atual}
            carregando={processando}
            aoSalvar={(r) =>
              exigirSenhaAtual((numero) => fila.salvarRegistro(numero, r))} />
        </div>
      </main>

      <Rodape />
    </div>
  );
}