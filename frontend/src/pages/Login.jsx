import { useState, useEffect } from "react";
import { useNavigate, Navigate, Outlet } from "react-router-dom";
import FormularioLogin from "../components/FormularioLogin";
import Logo from "../components/Logo";
import { entrar, obterRotaInicial, obterSessao, sair} from "../services/sessao";
import "../styles/login.css";

const NOME_APP = "NassauTickets";
const ID_ERRO_LOGIN = "login-mensagem-erro";

const CHAVE_SESSAO = "nassautickets_sessao";
const API_URL = import.meta.env.VITE_API_URL;

const ROTA_POR_PERFIL = {
  gestor: "/gestor",
  atendente: "/atendente"
};

export function obterRotaInicial(perfil) {
  return ROTA_POR_PERFIL[perfil] || "/atendente";
}

export async function entrar(usuario, senha) {
  const resposta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha }),
  });

  if (!resposta.ok) {
    if (resposta.status === 401 || resposta.status === 403) {
      throw new Error("Usuário ou senha incorretos.");
    }
    throw new Error("Erro ao conectar com o servidor. Tente novamente.");
  }

  const dados = await resposta.json();

  const sessaoSegura = {
    token: dados.token,
    usuario: dados.usuario,
    perfil: dados.perfil,
  };

  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessaoSegura));
  return sessaoSegura;
}

export function obterSessao() {
  try {
    const salvo = localStorage.getItem(CHAVE_SESSAO);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export function sair() {
  localStorage.removeItem(CHAVE_SESSAO);
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export async function requisicaoAutenticada(endpoint, opcoes = {}) {
  const sessao = obterSessao();

  const headers = {
    "Content-Type": "application/json",
    ...opcoes.headers,
  };

  if (sessao?.token) {
    headers.Authorization = `Bearer ${sessao.token}`;
  }

  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...opcoes,
    headers,
  });

  if (resposta.status === 401 || resposta.status === 403) {
    sair();
    throw new Error("Sessão expirada ou sem permissão de acesso.");
  }

  return resposta;
}

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
    const sessaoExistente = obterSessao();
    if (sessaoExistente?.token) {
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
      navegar(obterRotaInicial(sessao.perfil), { replace: true });
    } catch (erro) {
      setMensagemErro(erro.message || "Falha ao realizar login.");
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