import { useState, useEffect, useRef } from "react";
import { lerSessao } from "../services/sessao";
import useFila from "../hooks/useFila";
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

export default function PainelAtendente() {
  const sessao = lerSessao();
  const [guiches, setGuiches] = useState([]);
  const [guiche, setGuiche] = useState(null);
  const [erroGuiches, setErroGuiches] = useState("");
  const [tentativaGuiches, setTentativaGuiches] = useState(0);
  const [mensagem, setMensagem] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [salvandoRegistro, setSalvandoRegistro] = useState(false);
  const [registroPendente, setRegistroPendente] = useState(false);
  const emCurso = useRef(false);
  const { aguardando, atual, erro, carregando, atualizar } = useFila(guiche);
  const bloqueado = processando || salvandoRegistro || carregando || !!erro || !guiche || atual?.pode_operar === false;
  const numeroGuiche = guiches.find((g) => Number(g.id) === guiche)?.numero;

  useEffect(() => {
    const controle = new AbortController();
    fila.listarGuiches({ signal: controle.signal }).then((lista) => {
      if (controle.signal.aborted) return;
      setGuiches(lista);
      setGuiche((id) => lista.some((g) => Number(g.id) === id) ? id : Number(lista[0]?.id) || null);
      setErroGuiches(lista.length ? "" : "Não há guichês ativos cadastrados.");
    }).catch((falha) => {
      if (!controle.signal.aborted) setErroGuiches(falha.message);
    });
    return () => controle.abort();
  }, [tentativaGuiches]);

  async function executar(acao) {
    if (emCurso.current || bloqueado || registroPendente) return;
    emCurso.current = true;
    setProcessando(true);
    setMensagem(null);
    try {
      setMensagem({ tipo: "ok", texto: await acao() });
    } catch (falha) {
      setMensagem({ tipo: "erro", texto: falha.message || "Não foi possível concluir a operação." });
    } finally {
      atualizar();
      emCurso.current = false;
      setProcessando(false);
    }
  }

  const acoes = {
    chamarProxima: () => executar(async () => {
      const senha = await fila.chamarProxima(guiche);
      return `Senha ${senha.codigo} chamada.`;
    }),
    chamarNovamente: () => executar(async () => {
      await fila.chamarNovamente(guiche);
      return `Última chamada para ${atual.codigo}.`;
    }),
    iniciar: () => executar(async () => {
      await fila.iniciarAtendimento(atual.codigo);
      return "Atendimento iniciado.";
    }),
    finalizar: () => executar(async () => {
      await fila.finalizarAtendimento(atual.codigo);
      return "Atendimento finalizado.";
    }),
    naoCompareceu: () => executar(async () => {
      await fila.marcarNaoCompareceu(atual.codigo);
      return `Senha ${atual.codigo} marcada como não compareceu.`;
    }),
  };

  return (
    <div className="pagina">
      <Cabecalho>
        <InfoUsuario
          nomeUsuario={sessao?.usuario ?? "Atendente"}
          funcao={`Atendente · guichê ${numeroGuiche ?? "—"}`}
        />
      </Cabecalho>

      <main className="pagina_corpo">
        <CabecalhoPagina
          titulo="Painel de atendimento"
          subtitulo="Chame as senhas, inicie e finalize cada atendimento."
        >
          <div className="campo campo--guiche">
            <label className="campo_rotulo" htmlFor="guiche">Guichê</label>
            <select
              id="guiche"
              className="campo_entrada"
              value={guiche ?? ""}
              disabled={processando || salvandoRegistro || registroPendente || !guiches.length}
              onChange={(e) => { setGuiche(Number(e.target.value)); setMensagem(null); }}
            >
              {!guiches.length && <option value="">Sem guichês disponíveis</option>}
              {guiches.map((g) => <option key={g.id} value={g.id}>Guichê {g.numero}</option>)}
            </select>
          </div>
        </CabecalhoPagina>

        {erroGuiches && (
          <div className="msg msg--erro" role="alert">
            {erroGuiches}
            <button type="button" className="botao botao--secundario" onClick={() => setTentativaGuiches((v) => v + 1)}>Tentar novamente</button>
          </div>
        )}
        {atual?.pode_operar === false && (
          <p className="msg msg--info">Este guichê está em uso por {atual.atendente}. Selecione outro guichê.</p>
        )}
        {carregando && <p role="status">Carregando fila e senha do guichê…</p>}
        {erro && (
          <p className="msg msg--erro" role="alert">
            Falha ao atualizar atendimento: {erro} <button type="button" onClick={atualizar}>Tentar novamente</button>
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
            <SenhaAtual senha={atual} acoes={acoes} carregando={bloqueado || registroPendente} />
            <FilaEspera senhas={aguardando} carregando={carregando}/>
          </aside>

          <FichaPaciente
            key={atual?.codigo ?? "sem-senha"}
            senha={atual}
            bloqueado={bloqueado}
            aoProcessar={setSalvandoRegistro}
            aoAlterar={setRegistroPendente}
          />
        </div>
      </main>

      <Rodape />
    </div>
  );
}
