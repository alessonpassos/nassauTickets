import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/FormularioLogin";
import Logo from "../components/Logo";
import { entrar } from "../services/sessao";
import "../styles/login.css";

const anoAtual = new Date().getFullYear();

export default function Login() {
  const navegar = useNavigate();
  const [erro, setErro] = useState(false);

  function aoEntrar(usuario, senha) {
    const sessao = entrar(usuario, senha);
    if (!sessao) return setErro(true);
    navegar(sessao.perfil === "gestor" ? "/relatorios" : "/atendente", { replace: true });
  }

  return (
    <div className="login">
      <aside className="login_marca">
        <div className="login_marca-topo">
          <Logo className="login_marca-icone" />
          <span className="login_marca-nome">NassauTickets</span>
        </div>

        <p className="login_marca-frase">
          Organize a fila de atendimento do posto em um só lugar.
        </p>

        <p className="login_marca-rodape">
          © {anoAtual} NassauTickets. Projeto acadêmico — controle de atendimento.
        </p>
      </aside>

      <main className="login_conteudo">
        <div className="login_cartao">
          <div className="login_marca-mobile">
            <Logo className="marca_icone" />
            <span className="marca_nome">NassauTickets</span>
          </div>

          <div className="login_cabecalho">
            <h1 className="login_titulo">Entrar</h1>
            <p className="login_subtitulo">
              Acesse com o usuário do seu setor para começar o atendimento.
            </p>
          </div>

          {erro && (
            <p className="login_erro" role="alert">
              Usuário ou senha incorretos.
            </p>
          )}

          <FormularioLogin aoEntrar={aoEntrar} />

          <p className="login_rodape">
            Demonstração — atendente / atendente123 · gestor / gestor123
          </p>
        </div>
      </main>
    </div>
  );
}
