import FormularioLogin from "../components/FormularioLogin";
import "../styles/login.css";

function LogoNassauTickets({ className }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#7fdbe8" />
      <path d="M17 10h6v7h7v6h-7v7h-6v-7h-7v-6h7z" fill="#063b46" />
    </svg>
  );
}

const anoAtual = new Date().getFullYear();

export default function Login() {
  return (
    <div className="login">
      <aside className="login__marca">
        <div className="login__marca-topo">
          <LogoNassauTickets className="login__marca-icone" />
          <span className="login__marca-nome">NassauTickets</span>
        </div>

        <p className="login__marca-frase">
          Organize a fila de atendimento do posto em um só lugar.
        </p>

        <p className="login__marca-rodape">
          © {anoAtual} NassauTickets. Projeto acadêmico de CRM hospitalar.
        </p>
      </aside>

      <main className="login__conteudo">
        <div className="login__cartao">
          <div className="login__marca-mobile">
            <LogoNassauTickets className="marca__icone" />
            <span className="marca__nome">NassauTickets</span>
          </div>

          <div className="login__cabecalho">
            <h1 className="login__titulo">Entrar</h1>
            <p className="login__subtitulo">
              Acesse com o usuário do seu setor para começar o atendimento.
            </p>
          </div>

          <p className="login__erro" role="alert">
            Usuário ou senha incorretos.
          </p>

          <FormularioLogin />

          <p className="login__rodape">
            Esqueceu como acessar? Fale com a coordenação do posto.
          </p>
        </div>
      </main>
    </div>
  );
}
