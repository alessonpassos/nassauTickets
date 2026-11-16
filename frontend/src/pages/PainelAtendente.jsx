import { useState, useEffect, useCallback } from "react";
import {requisicaoAutenticada} from "../services/sessao";
import Cabecalho from "../components/Cabecalho";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Rodape from "../components/Rodape";
import SenhaAtual from "../components/SenhaAtual";
import FilaEspera from "../components/FilaEspera";
import FichaPaciente from "../components/FichaPaciente";
import InfoUsuario from "../components/InfoUsuario";
import useFila from "../hooks/useFila";
import { ObterSessao, sair } from "../services/sessao";
import {listarFila} from "../services/filaService";
import * as fila from "../services/filaService";
import { horarioTotem } from "../utils/horario";
import "../styles/layout.css";
import "../styles/painelAtendente.css";

const GUICHES = [1, 2, 3, 4, 5];
const CHAVE_GUICHE = "nassautickets_guiche_atual";

export const ATIVOS = ["CHAMADA", "EM_ATENDIMENTO"];

async function tratarResposta(reposta, mensagemPadraoErro){
  let dados = null;
  try {
    dados = await reposta.json();
  } catch {
    throw new Error(mensagemPadraoErro);
  }

  if (!reposta.ok) {
    if (dados?.erro) {
      throw new Error(
        dados?.mensagem || dados?.erro ||
        "Conflido de estado: esta ação não pode ser realizada porque a senha ou a fila já foi alterada."
      );
    }
    throw new Error(dados?.mensagem || dados?.erro || mensagemPadraoErro);
  }
  return dados;
}

export async function listarFila(){
  const resposta = await requisicaoAutenticada("/fila", {method: "GET"});
  return tratarResposta(resposta, "Não foi possível listar a fila.");
}

export async function chamarProxima({guiche, atendente }) {
  const resposta = await requisicaoAutenticada("/fila/chamar", {
    method: "POST",
    body: JSON.stringify({guiche, atendente}),
  });
  const dados = await tratarResposta(resposta, "Erro ao chamar a próxima senha.");
  return dados?.mensagem || `Senha ${dados?.numero ?? ""} chamada no guichê ${guiche}.`;
}

export async function chamarNovamente(numero) {
  const resposta = await requisicaoAutenticada(`/Fila/${encodeURIComponent(numero)}/chamar-novamente`,
    {method: "POST"});
  const dados = await tratarResposta(resposta, "Erro ao rechamar a senha.");
  return dados?.mensagem || `Senha ${numero} chamada novamente.`;
}

export async function iniciarAtendimento(numero) {
  const resposta = await requisicaoAutenticada(`/fila/${encodeURIComponent(numero)}/iniciar`, {
    method: "PATCH",
  });
  const dados = await tratarResposta(resposta, "Erro ao iniciar o atendimento.");
  return dados?.mensagem || `Atendimento da senha ${numero} iniciado.`;
}

export async function finalizarAtendimento(numero) {
  const resposta = await requisicaoAutenticada(`/fila/${encodeURIComponent(numero)}/finalizar`, {
    method: "PATCH",
  });
  const dados = await tratarResposta(resposta, "Erro ao finalizar o atendimento.");
  return dados?.mensagem || `Atendimento da senha ${numero} finalizado.`;
}

export async function marcarNaoCompareceu(numero) {
  const resposta = await requisicaoAutenticada(`/fila/${encodeURIComponent(numero)}/nao-compareceu`, {
    method: "PATCH",
  });
  const dados = await tratarResposta(resposta, "Erro ao registrar não comparecimento.");
  return dados?.mensagem || `Senha ${numero} marcada como não compareceu.`;
}

export async function salvarRegistro(numero, registro) {
  const resposta = await requisicaoAutenticada(`/fila/${encodeURIComponent(numero)}/registro`, {
    method: "PUT",
    body: JSON.stringify(registro),
  });
  const dados = await tratarResposta(resposta, "Erro ao salvar a ficha do paciente.");
  return dados?.mensagem || "Ficha do paciente salva com sucesso.";
}

export default function useFila(intervaloMs = 5000) {
  const [senhas, setSenhas] = useState([]);
  const [carregandoFila, setCarregandoFila] = useState(true);
  const [erroFila, setErroFila] = useState(null);

  const atualizarFila = useCallback(async () => {
    try {
      const dados = await listarFila();
      setSenhas(Array.isArray(dados) ? dados : dados?.senhas ?? []);
      setErroFila(null);
    } catch (erro) {
      setErroFila(erro.message);
    } finally {
      setCarregandoFila(false);
    }
  }, []);

  useEffect(() => {
    atualizarFila();
    const timer = setInterval(atualizarFila, intervaloMs);
    return () => clearInterval(timer);
  }, [atualizarFila, intervaloMs]);

  return { senhas, carregandoFila, erroFila, atualizarFila };
}

function obterGuicheInicial() {
  const salvo = number(sessionStorage.getItem(CHAVE_GUICHE));
  return GUICHES.includes(salvo) ? salvo : 1;
}

export default function PainelAtendente() {
  const sessao = ObterSessao();
  const { senhas, carregandoFila, erroFila, atualizarFila } = useFila();

  const [guiche, setGuiche] = useState(obterGuicheInicial());
  const [mensagem, setMensagem] = useState(null);
  const [processando, setProcessando] = useState(false);

  const nomeAtendente = sessao?.nome || sessao?.usuario || "Atendente";
  const funcaoAtendente = sessao?.funcao || "Atendimento";

  function aoMudarGuiche(novoGuiche) {
    setGuiche(novoGuiche);
    sessionStorage.setItem(CHAVE_GUICHE, string(novoGuiche));
    setMensagem(null);
  }

  useEffect(() => {
    if (mensagem?.tipo === "ok") return;
    const timer = setTimeout(() => setMensagem(null), 5000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  const {dia} = horarioTotem();
  const doDia = senhas.filter((s) => s.dia || s.numero?.startwith(dia));
  const atual =
    doDia.find((s) => s.guiche === guiche && fila.ATIVOS.includes(s.estado)) ?? null;
  const aguardando = doDia.filter((s) => s.estado === "aguardando");

  async function executar(acao) {
    if (processando) return;
    setProcessando(true);
    setMensagem(null);

    try {
      const textoSucesso = await acao();
      await atualizarFila();
      setMensagem({ tipo: "ok", texto: textoSucesso });
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

  function exigirSenhaAtual(callback) {
    if (!atual.numero) {
      setMensagem({
        tipo: "erro",
        texto: "Não há senha atual para esta ação."
      });
      return;
    }
    executar(()=> callback(atual.numero));
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
            <FilaEspera senhas={aguardando} carregando={carregandoFila}/>
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