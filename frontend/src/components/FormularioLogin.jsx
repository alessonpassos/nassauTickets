import { useState } from "react";

export default function FormularioLogin() {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function aoEntrar(evento) {
    evento.preventDefault();
  }

  return (
    <form className="login__form" onSubmit={aoEntrar}>
      <div className="campo">
        <label className="campo__rotulo" htmlFor="usuario">
          Usuário ou e-mail
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          className="campo__entrada"
          placeholder="nome.sobrenome"
          autoComplete="username"
        />
      </div>

      <div className="campo">
        <label className="campo__rotulo" htmlFor="senha">
          Senha
        </label>
        <div className="campo__grupo-senha">
          <input
            id="senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            className="campo__entrada"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="campo__alternar-senha"
            onClick={() => setMostrarSenha((atual) => !atual)}
            aria-pressed={mostrarSenha}
          >
            {mostrarSenha ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <div className="login__linha-opcoes">
        <label className="login__lembrar">
          <input type="checkbox" name="lembrar" />
          Lembrar de mim
        </label>

        <a className="login__link" href="/recuperar-senha">
          Esqueci minha senha
        </a>
      </div>

      <button type="submit" className="botao botao--primario login__botao">
        Entrar
      </button>
    </form>
  );
}
