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
      <div className="usuario__textos">
        <span className="usuario__nome">{nomeUsuario}</span>
        <span className="usuario__funcao">{funcao}</span>
      </div>
      <span className="usuario__avatar" aria-hidden="true">
        {obterIniciais(nomeUsuario)}
      </span>
    </div>
  );
}