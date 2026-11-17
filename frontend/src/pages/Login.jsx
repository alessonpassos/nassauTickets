import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/FormularioLogin";
import Logo from "../components/Logo";
import { entrar, lerSessao, obterRotaInicial} from "../services/sessao";
import "../styles/login.css";

const NOME_APP = "NassauTickets";
const ID_ERRO_LOGIN = "login-mensagem-erro";

function Marca({ classeContainer, classeIcone, classeNome }) {
  return (
    <div className={classeContainer}>
      <Logo className={classeIcone} />
      <span className={classeNome}>{NOME_APP}</span>
    </div>
  );
}

export default function Login() {
  const navegar = useNavigate();
  const [mensagemErro, setMensagemErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    const sessaoExistente = lerSessao();
    if (sessaoExistente) {
      navegar(obterRotaInicial(sessaoExistente.perfil), { replace: true });
    }
  }, [navegar]);

  function limparErro() {
    if (mensagemErro){
      setMensagemErro("");
    }
  }

  async function aoEntrar(usuario, senha) {
    limparErro();
    setCarregando(true);

    try {
      const sessao = await entrar(usuario, senha);
      if (!sessao?.token) {
        sair();
        setMensagemErro("Usuário ou senha inválidos.");
        return;
      }
      navegar(obterRotaInicial(sessao.perfil), { replace: true });
    } catch (erro) {
      if (erro?.status === 401 || erro?.status === 403) {
        sair();
    }
    setMensagemErro(erro?.mensagem || "Falha ao realizar login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login">
      <aside className="login_marca" aria-label="Apresentação do sistema">
        <Marca
          classeContainer="login_marca-topo"
          classeIcone="login_marca-icone"
          classeNome="login_marca-nome"
        />

        <p className="login_marca-frase">
          Organize a fila de atendimento do posto em um só lugar.
        </p>

        <footer className="login_marca-rodape">
          © {anoAtual} {NOME_APP}. Projeto acadêmico — controle de atendimento.
        </footer>
      </aside>

      <main className="login_conteudo">
        <div className="login_cartao">
          <Marca
            classeContainer="login_marca-mobile"
            classeIcone="marca_icone"
            classeNome="marca_nome"
          />

          <header className="login_cabecalho">
            <h1 className="login_titulo">Entrar</h1>
            <p className="login_subtitulo">
              Acesse com o usuário do seu setor para começar o atendimento.
            </p>
          </header>

          {mensagemErro && (
            <p id={ID_ERRO_LOGIN} className="login_erro" role="alert">
              {mensagemErro}
            </p>
          )}

          <FormularioLogin
            aoEntrar={aoEntrar}
            aoDigitar={limparErro}
            carregando={carregando}
            temErro={Boolean(mensagemErro)}
            idErro={mensagemErro ? ID_ERRO_LOGIN : undefined}
          />

          {import.meta.env.DEV && (
            <p className="login_rodape">
              Ambiente de desenvolvimento — utilize credenciais cadastradas na API.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}