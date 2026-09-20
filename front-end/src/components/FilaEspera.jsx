export default function FilaEspera({ senhas }) {
  return (
    <section className="fila" aria-labelledby="fila-titulo">
      <div className="fila__cabecalho">
        <h2 id="fila-titulo" className="fila__titulo">
          Fila de espera
        </h2>
        <span className="fila__contagem">{senhas.length} aguardando</span>
      </div>

      <ul className="fila__lista">
        {senhas.map((senha) => (
          <li
            key={senha.codigo}
            className={`fila__item ${senha.prioritaria ? "fila__item--prioridade" : ""}`}
          >
            <span className="fila__codigo">{senha.codigo}</span>

            <span className="fila__tipo">
              {senha.tipo}
              {senha.prioritaria && (
                <span className="selo selo--prioridade">Prioritário</span>
              )}
            </span>

            <span className="fila__espera">{senha.espera}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
