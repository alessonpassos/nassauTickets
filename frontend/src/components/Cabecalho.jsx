import { NavLink, useNavigate } from "react-router-dom";
import { abrirJanelaTotem } from "../services/janelaTotem";
import { lerSessao, sair } from "../services/sessao";
import Logo from "./Logo";

const classe = ({ isActive }) => `menu_link${isActive ? " menu_link--ativo" : ""}`;

export default function Cabecalho({ children, mostrarMenu = true }) {
  const navegar = useNavigate();
  const sessao = lerSessao();

  function aoSair() {
    sair();
    navegar("/login");
  }

  return (
    <header className="cabecalho">
      <div className="cabecalho_interno">
        <div className="cabecalho_esquerda">
          <div className="marca">
            <Logo className="marca_icone" />
            <span className="marca_nome">NassauTickets</span>
          </div>

          {mostrarMenu ? (
            <nav className="menu" aria-label="Principal">
              <NavLink to="/" end className={classe}>Início</NavLink>
              <a
                href="/totem"
                target="_blank"
                rel="noopener noreferrer"
                className="menu_link"
                onClick={abrirJanelaTotem}
                aria-label="Totem (abre em nova janela)"
              >
                Totem
              </a>
              <NavLink to="/painel-de-senha" className={classe}>Painel</NavLink>
              <NavLink to="/atendente" className={classe}>Atendimento</NavLink>
              <NavLink to="/relatorios" className={classe}>Relatórios</NavLink>
              {sessao ? (
                <button type="button" className="menu_link menu_sair" onClick={aoSair}>Sair</button>
              ) : (
                <NavLink to="/login" className={classe}>Entrar</NavLink>
              )}
            </nav>
          ) : null}
        </div>

        {children}
      </div>
    </header>
  );
}
