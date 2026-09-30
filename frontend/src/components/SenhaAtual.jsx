import { ROTULO_TIPO } from "../data/totem";
import { sequencia } from "../utils/formatar";

const TEXTO_ESTADO = {
  CHAMADA: "Chamada — aguardando o cliente",
  CHAMADA_NOVAMENTE: "Última chamada feita",
  EM_ATENDIMENTO: "Em atendimento",
};

export default function SenhaAtual({ senha, acoes }) {
  const espera = senha
    ? Math.max(0, Math.round((Date.parse(senha.chamadas[0]) - Date.parse(senha.emitidaEm)) / 60000))
    : 0;
  const estado = senha?.estado;

  return (
    <section className="senha-atual" aria-labelledby="senha-atual-titulo">
      <h2 id="senha-atual-titulo" className="senha-atual_rotulo">Senha em atendimento</h2>

      {senha ? (
        <>
          <p className="senha-atual_codigo">{sequencia(senha.numero)}</p>
          <p className="senha-atual_detalhe">
            {ROTULO_TIPO[senha.tipo]}
            {senha.tipo === "SP" && <span className="selo selo--prioridade">Prioritário</span>}
          </p>
          <p className="senha-atual_espera">{TEXTO_ESTADO[estado]} · aguardou {espera} min</p>
        </>
      ) : (
        <p className="senha-atual_espera">Nenhuma senha em atendimento neste guichê.</p>
      )}

      <div className="senha-atual_acoes">
        <button type="button" className="botao botao--claro" onClick={acoes.chamarProxima} disabled={!!senha}>
          Chamar próxima senha
        </button>
        <button type="button" className="botao botao--contorno-claro" onClick={acoes.chamarNovamente} disabled={estado !== "CHAMADA"}>
          Chamar de novo
        </button>
        <button type="button" className="botao botao--contorno-claro" onClick={acoes.iniciar} disabled={!["CHAMADA", "CHAMADA_NOVAMENTE"].includes(estado)}>
          Iniciar atendimento
        </button>
        <button type="button" className="botao botao--contorno-claro" onClick={acoes.finalizar} disabled={estado !== "EM_ATENDIMENTO"}>
          Finalizar atendimento
        </button>
        <button type="button" className="botao botao--contorno-claro" onClick={acoes.naoCompareceu} disabled={estado !== "CHAMADA_NOVAMENTE"}>
          Não compareceu
        </button>
      </div>
    </section>
  );
}
