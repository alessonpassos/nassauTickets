export default function SenhaAtual({ codigo, tipo, prioritaria, espera }) {
  return (
    <section className="senha-atual" aria-labelledby="senha-atual-titulo">
      <h2 id="senha-atual-titulo" className="senha-atual__rotulo">
        Senha em atendimento
      </h2>

      <p className="senha-atual__codigo">{codigo}</p>

      <p className="senha-atual__detalhe">
        {tipo}
        {prioritaria && <span className="selo selo--prioridade">Prioritário</span>}
      </p>

      <p className="senha-atual__espera">Aguardou {espera}</p>

      <div className="senha-atual__acoes">
        <button type="button" className="botao botao--claro">
          Chamar próxima senha
        </button>
        <button type="button" className="botao botao--contorno-claro">
          Chamar de novo
        </button>
        <button type="button" className="botao botao--contorno-claro">
          Finalizar atendimento
        </button>
      </div>
    </section>
  );
}
