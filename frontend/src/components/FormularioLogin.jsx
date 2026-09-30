import { useState } from "react";

export default function FormularioLogin({ aoEntrar }) {
  const [campos, setCampos] = useState({ usuario: "", senha: "" });
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const alterar = (e) => setCampos((c) => ({ ...c, [e.target.name]: e.target.value }));

  function enviar(evento) {
    evento.preventDefault();
    const novos = {};
    if (!campos.usuario.trim()) novos.usuario = "Informe o usuário.";
    if (!campos.senha) novos.senha = "Informe a senha.";
    setErros(novos);
    if (!Object.keys(novos).length) aoEntrar(campos.usuario, campos.senha);
  }

  return (
    <form className="login_form" onSubmit={enviar} noValidate>
      <div className="campo">
        <label className="campo_rotulo" htmlFor="usuario">Usuário</label>
        <input id="usuario" name="usuario" type="text" className="campo_entrada" placeholder="atendente ou gestor"
          autoComplete="username" value={campos.usuario} onChange={alterar} aria-invalid={!!erros.usuario} />
        {erros.usuario && <p className="campo_erro" role="alert">{erros.usuario}</p>}
      </div>

      <div className="campo">
        <label className="campo_rotulo" htmlFor="senha">Senha</label>
        <div className="campo_grupo-senha">
          <input id="senha" name="senha" type={mostrarSenha ? "text" : "password"} className="campo_entrada"
            autoComplete="current-password" value={campos.senha} onChange={alterar} aria-invalid={!!erros.senha} />
          <button type="button" className="campo_alternar-senha" onClick={() => setMostrarSenha((a) => !a)} aria-pressed={mostrarSenha}>
            {mostrarSenha ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {erros.senha && <p className="campo_erro" role="alert">{erros.senha}</p>}
      </div>

      <button type="submit" className="botao botao--primario login_botao">Entrar</button>
    </form>
  );
}
