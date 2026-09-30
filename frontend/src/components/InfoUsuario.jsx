function obterIniciais(nome) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

export default function InfoUsuario({ nomeUsuario, funcao }) {
  return (
    <div className="usuario">
      <div className="usuario_textos">
        <span className="usuario_nome">{nomeUsuario}</span>
        <span className="usuario_funcao">{funcao}</span>
      </div>
      <span className="usuario_avatar" aria-hidden="true">
        {obterIniciais(nomeUsuario)}
      </span>
    </div>
  );
}
