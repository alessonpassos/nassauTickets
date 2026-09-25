import { useMemo, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import Rodape from "../components/Rodape";
import InfoUsuario from "../components/InfoUsuario";
import { useRelatorios } from "../context/useRelatorios";
import "../styles/layout.css";
import "../styles/painelAtendente.css";
import "../styles/relatorios.css";

const gestor = {
  nome: "Camila Borges",
  funcao: "Gestão, relatórios",
};

const abas = [
  { id: "diario", rotulo: "Diário" },
  { id: "mensal", rotulo: "Mensal" },
  { id: "auditoria", rotulo: "Auditoria" },
];

const dataHoje = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function CartaoIndicador({ rotulo, valor }) {
  return (
    <article className="relatorio__indicador">
      <p className="relatorio__indicador-rotulo">{rotulo}</p>
      <p className="relatorio__indicador-valor">{valor}</p>
    </article>
  );
}

export default function Relatorios() {
  const [aba, setAba] = useState("diario");
  const { diario, mensal, auditoria } = useRelatorios();

  const resumo = useMemo(
    () => (aba === "mensal" ? mensal : diario),
    [aba, diario, mensal]
  );

  return (
    <div className="pagina">
      <Cabecalho>
        <InfoUsuario nomeUsuario={gestor.nome} funcao={gestor.funcao} />
      </Cabecalho>

      <main className="pagina__corpo">
        <div className="painel__cabecalho">
          <div>
            <h1 className="painel__titulo">Relatórios</h1>
            <p className="painel__subtitulo">
              Acompanhe o volume de senhas, atendimentos e a auditoria do
              expediente.
            </p>
          </div>
          <p className="painel__data">{dataHoje}</p>
        </div>

        <div className="relatorio__abas" role="tablist" aria-label="Tipo de relatório">
          {abas.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={aba === item.id}
              className={`botao ${
                aba === item.id ? "botao--primario" : "botao--secundario"
              }`}
              onClick={() => setAba(item.id)}
            >
              {item.rotulo}
            </button>
          ))}
        </div>

        {aba !== "auditoria" ? (
          <>
            <section className="relatorio__indicadores" aria-label="Indicadores">
              <CartaoIndicador rotulo="Senhas emitidas" valor={resumo.emitidas} />
              <CartaoIndicador rotulo="Atendidas" valor={resumo.atendidas} />
              <CartaoIndicador
                rotulo="Não compareceu"
                valor={resumo.naoCompareceu}
              />
              <CartaoIndicador rotulo="Descartadas" valor={resumo.descartadas} />
              <CartaoIndicador rotulo="Tempo médio" valor={resumo.tempoMedio} />
            </section>

            <section className="ficha relatorio__tabela-caixa">
              <div className="ficha__cabecalho">
                <h2 className="ficha__titulo">Por tipo de senha</h2>
                <p className="ficha__senha">
                  {aba === "diario" ? "Movimento do dia" : "Acumulado do mês"}
                </p>
              </div>

              <div className="relatorio__tabela-envolve">
                <table className="relatorio__tabela">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Descrição</th>
                      <th>Emitidas</th>
                      <th>Atendidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.porTipo.map((linha) => (
                      <tr key={linha.tipo}>
                        <td>
                          <strong>{linha.tipo}</strong>
                        </td>
                        <td>{linha.rotulo}</td>
                        <td>{linha.emitidas}</td>
                        <td>{linha.atendidas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="ficha relatorio__tabela-caixa">
            <div className="ficha__cabecalho">
              <h2 className="ficha__titulo">Auditoria de chamadas</h2>
              <p className="ficha__senha">Últimas ações registradas</p>
            </div>

            <div className="relatorio__tabela-envolve">
              <table className="relatorio__tabela">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Senha</th>
                    <th>Ação</th>
                    <th>Guichê</th>
                    <th>Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.map((evento) => (
                    <tr key={`${evento.hora}-${evento.senha}`}>
                      <td>{evento.hora}</td>
                      <td>
                        <strong>{evento.senha}</strong>
                      </td>
                      <td>{evento.acao}</td>
                      <td>{evento.guiche}</td>
                      <td>{evento.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <Rodape />
    </div>
  );
}
