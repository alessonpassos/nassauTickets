import { useState, useEffect, useCallback } from "react";
import { lerSessao } from "../services/sessao";
import * as fila from "../services/filaService";
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
const CHAVE_ATUAL = "nassautickets_senha_atual";

function lerJson(chave) {
  try {
    return JSON.parse(sessionStorage.getItem(chave));
  } catch {
    return null;
  }
}

function obterGuicheInicial() {
  const salvo = Number(sessionStorage.getItem(CHAVE_GUICHE));
  return Number.isFinite(salvo) && salvo > 0 ? salvo : null;
}

export default function PainelAtendente() {
  const sessao = lerSessao();
  const [guiches, setGuiches] = useState([]);
  const [guiche, setGuiche] = useState(obterGuicheInicial());
  const [aguardando, setAguardando] = useState([]);
  const [atual, setAtualEstado] = useState(() => lerJson(CHAVE_ATUAL));
  const [erroFila, setErroFila] = useState("");
  const [mensagem, setMensagem] = useState(null);
  const [processando, setProcessando] = useState(false);

  const nomeAtendente = sessao?.nome || "Atendente";
  const funcaoAtendente = sessao?.funcao || "Atendimento";

  function setAtual(senha) {
    setAtualEstado(senha);
    if (senha) sessionStorage.setItem(CHAVE_ATUAL, JSON.stringify(senha));
    else sessionStorage.removeItem(CHAVE_ATUAL);
  }

  const atualizarFila = useCallback(async () => {
    try {
      setAguardando(await fila.listarFila());
      setErroFila("");
    } catch (e) {
      setErroFila(e.message);
    }
  }, []);

  useEffect(() => {
    atualizarFila();
    const t = setInterval(atualizarFila, 4000);
    return () => clearInterval(t);
  }, [atualizarFila]);

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

  async function executar(acao) {
    if (processando) return;
    setProcessando(true);
    setMensagem(null);

    try {
      const texto = await acao();
      await atualizarFila();
      setMensagem({ tipo: "ok", texto });
    } catch (erro) {
      await atualizarFila();
      setMensagem({
        tipo: "erro",
        texto: erro?.message || "Não foi possível concluir a operação.",
      });
    } finally {
      setProcessando(false);
    }
  }

  function aplicar(resposta, encerrada = false) {
    setAtual(encerrada ? null : { ...atual, ...resposta });
  }

  function comSenhaAtual(callback) {
    if (!atual?.codigo) {
      setMensagem({ tipo: "erro", texto: "Não há senha atual para esta ação." });
      return;
    }
    return executar(() => callback(atual.codigo));
  }

  const acoes = {
    chamarProxima: () => executar(async () => {
      if (!guiche) throw new Error("Selecione um guichê.");
      const s = await fila.chamarProxima(guiche);
      setAtual(s);
      return `Senha ${s.codigo} chamada.`;
    }),
    chamarNovamente: () => comSenhaAtual(async (codigo) => {
      aplicar(await fila.chamarNovamente(guiche));
      return `Última chamada para ${codigo}.`;
    }),
    iniciar: () => comSenhaAtual(async () => {
      aplicar(await fila.iniciarAtendimento(atual.codigo));
      return "Atendimento iniciado.";
    }),
    finalizar: () => comSenhaAtual(async () => {
      aplicar(await fila.finalizarAtendimento(atual.codigo), true);
      return "Atendimento finalizado.";
    }),
    naoCompareceu: () => comSenhaAtual(async (codigo) => {
      aplicar(await fila.marcarNaoCompareceu(codigo), true);
      return `Senha ${codigo} marcada como não compareceu.`;
    }),
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
              value={guiche ?? ""}
              disabled={processando}
              onChange={(e) => aoMudarGuiche(Number(e.target.value))}
            >
              {GUICHES.map((g) => <option key={g.id} value={g.id}>Guichê {g.numero}</option>)}
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
            aoSalvar={() =>
              setMensagem({
                tipo: "ok",
                texto: "Registro preenchido (ainda não persistido no servidor)."
              })} />
        </div>
      </main>

      <Rodape />
    </div>
  );
}