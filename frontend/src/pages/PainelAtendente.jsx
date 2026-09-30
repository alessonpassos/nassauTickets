import { useState } from "react";
import Cabecalho from "../components/Cabecalho";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Rodape from "../components/Rodape";
import SenhaAtual from "../components/SenhaAtual";
import FilaEspera from "../components/FilaEspera";
import FichaPaciente from "../components/FichaPaciente";
import InfoUsuario from "../components/InfoUsuario";
import useFila from "../hooks/useFila";
import { lerSessao } from "../services/sessao";
import * as fila from "../services/filaService";
import { horarioTotem } from "../utils/horario";
import "../styles/layout.css";
import "../styles/painelAtendente.css";

const GUICHES = [1, 2, 3, 4, 5];

export default function PainelAtendente() {
  const sessao = lerSessao();
  const { senhas } = useFila();
  const [guiche, setGuiche] = useState(3);
  const [mensagem, setMensagem] = useState(null);

  const { dia } = horarioTotem();
  const doDia = senhas.filter((s) => s.numero.startsWith(dia));
  const atual = doDia.find((s) => s.guiche === guiche && fila.ATIVOS.includes(s.estado)) ?? null;
  const aguardando = doDia.filter((s) => s.estado === "AGUARDANDO");

  // Toda ação passa por aqui: mostra sucesso ou o motivo do erro (regra de negócio violada).
  async function executar(acao) {
    try {
      setMensagem({ tipo: "ok", texto: await acao() });
    } catch (erro) {
      setMensagem({ tipo: "erro", texto: erro.message });
    }
  }

  const acoes = {
    chamarProxima: () => executar(() => fila.chamarProxima({ guiche, atendente: sessao.nome })),
    chamarNovamente: () => executar(() => fila.chamarNovamente(atual.numero)),
    iniciar: () => executar(() => fila.iniciarAtendimento(atual.numero)),
    finalizar: () => executar(() => fila.finalizarAtendimento(atual.numero)),
    naoCompareceu: () => executar(() => fila.marcarNaoCompareceu(atual.numero)),
  };

  return (
    <div className="pagina">
      <Cabecalho>
        <InfoUsuario nomeUsuario={sessao.nome} funcao={`${sessao.funcao}, guichê ${guiche}`} />
      </Cabecalho>

      <main className="pagina_corpo">
        <CabecalhoPagina titulo="Painel de atendimento" subtitulo="Chame as senhas e registre cada atendimento.">
          <div className="campo campo--guiche">
            <label className="campo_rotulo" htmlFor="guiche">Guichê</label>
            <select id="guiche" className="campo_entrada" value={guiche} onChange={(e) => { setGuiche(Number(e.target.value)); setMensagem(null); }}>
              {GUICHES.map((g) => <option key={g} value={g}>Guichê {g}</option>)}
            </select>
          </div>
        </CabecalhoPagina>

        {mensagem && (
          <p className={`msg msg--${mensagem.tipo}`} role={mensagem.tipo === "erro" ? "alert" : "status"}>{mensagem.texto}</p>
        )}

        <div className="atend_grade">
          <aside className="atend_lateral">
            <SenhaAtual senha={atual} acoes={acoes} />
            <FilaEspera senhas={aguardando} />
          </aside>

          <FichaPaciente key={atual?.numero ?? "sem-senha"} senha={atual} aoSalvar={(r) => executar(() => fila.salvarRegistro(atual.numero, r))} />
        </div>
      </main>

      <Rodape />
    </div>
  );
}
