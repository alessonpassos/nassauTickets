import { Link } from "react-router-dom";
import Cabecalho from "../components/Cabecalho";
import Rodape from "../components/Rodape";
import { abrirJanelaTotem } from "../services/janelaTotem";
import "../styles/layout.css";

export default function Inicio() {
  return (
    <div className="pagina">
      <Cabecalho />
      <main className="pagina_corpo">
        <section className="inicio_hero">
          <h1>Bem vindo ao Controle de atendimento do laboratório NassauTickets</h1>
          <p>
            O NassauTickets organiza a fila de um Laboratório de Análises Clínicas: o cliente retira a senha no
            totem, acompanha a chamada no painel e o atendente chama, inicia e finaliza cada atendimento. O gestor
            acompanha relatórios e auditoria.
          </p>
        </section>

        <div className="inicio_grade">
          <a className="inicio_cartao" href="/totem" target="_blank" rel="noopener noreferrer" onClick={abrirJanelaTotem}>
            <h2>Totem</h2>
            <p> O Cliente escolhe se é SP, SG ou SE e retira a senha.</p>
          </a>
          <Link className="inicio_cartao" to="/painel-de-senha">
            <h2>Painel de chamadas</h2>
            <p>Mostra as 5 últimas senhas chamadas, com o guichê e áudio.</p>
          </Link>
          <Link className="inicio_cartao" to="/atendente">
            <h2>Atendimento</h2>
            <p>Atendente (login): fila, chamar, chamar de novo, iniciar e finalizar.</p>
          </Link>
          <Link className="inicio_cartao" to="/relatorios">
            <h2>Relatórios</h2>
            <p>Gestor (login): diário, mensal, detalhado e auditoria.</p>
          </Link>
        </div>
      </main>
      <Rodape />
    </div>
  );
}
