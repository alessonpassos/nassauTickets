import { useMemo, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Rodape from "../components/Rodape";
import InfoUsuario from "../components/InfoUsuario";
import useFila from "../hooks/useFila";
import { lerSessao } from "../services/sessao";
import { resumir, TIPOS } from "../services/relatorioService";
import { horarioTotem } from "../utils/horario";
import { horaCompleta } from "../utils/formatar";
import "../styles/layout.css";
import "../styles/painelAtendente.css";
import "../styles/relatorios.css";

const abas = [
  { id: "diario", rotulo: "Diário" },
  { id: "mensal", rotulo: "Mensal" },
  { id: "detalhado", rotulo: "Detalhado" },
  { id: "auditoria", rotulo: "Auditoria" },
];

function CartaoIndicador({ rotulo, valor }) {
  return (
    <article className="relatorio_indicador">
      <p className="relatorio_indicador-rotulo">{rotulo}</p>
      <p className="relatorio_indicador-valor">{valor}</p>
    </article>
  );
}

function Tabela({ colunas, linhas, vazio }) {
  if (linhas.length === 0) return <p className="vazio">{vazio}</p>;
  return (
    <div className="relatorio_tabela-envolve">
      <table className="relatorio_tabela">
        <thead><tr>{colunas.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{linhas.map(([chave, ...celulas]) => (
          <tr key={chave}>{celulas.map((c, i) => <td key={i}>{i === 0 ? <strong>{c}</strong> : c}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export default function Relatorios() {
  const sessao = lerSessao();
  const { senhas } = useFila();
  const [aba, setAba] = useState("diario");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  const contexto = horarioTotem();
  const { dia, aberto } = contexto;
  const resumo = useMemo(
    () => resumir(senhas, aba === "mensal" ? dia.slice(0, 4) : dia, { hoje: dia, aberto }),
    [senhas, aba, dia, aberto],
  );
  const doDia = senhas.filter((s) => s.numero.startsWith(dia));
  const detalhe = doDia.filter((s) => filtroTipo === "TODOS" || s.tipo === filtroTipo);
  const auditoria = doDia.filter((s) => s.chamadas.length > 0);

  return (
    <div className="pagina">
      <Cabecalho>
        <InfoUsuario nomeUsuario={sessao.nome} funcao={`${sessao.funcao}, relatórios`} />
      </Cabecalho>

      <main className="pagina_corpo">
        <CabecalhoPagina titulo="Relatórios" subtitulo="Dados reais gerados pelo Totem e pelo Atendimento neste navegador." />

        <div className="relatorio_abas" role="tablist" aria-label="Tipo de relatório">
          {abas.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={aba === item.id}
              className={`botao ${aba === item.id ? "botao--primario" : "botao--secundario"}`}
              onClick={() => setAba(item.id)}>
              {item.rotulo}
            </button>
          ))}
        </div>

        {(aba === "diario" || aba === "mensal") && (
          <>
            <section className="relatorio_indicadores" aria-label="Indicadores">
              <CartaoIndicador rotulo="Senhas emitidas" valor={resumo.emitidas} />
              <CartaoIndicador rotulo="Atendidas" valor={resumo.atendidas} />
              <CartaoIndicador rotulo="Não compareceu" valor={resumo.naoCompareceu} />
              <CartaoIndicador rotulo="Descartadas" valor={resumo.descartadas} />
              <CartaoIndicador rotulo="Tempo médio" valor={resumo.tempoMedio} />
            </section>
            <section className="ficha relatorio_tabela-caixa">
              <div className="ficha_cabecalho">
                <h2 className="ficha_titulo">Por tipo de senha</h2>
                <p className="ficha_senha">{aba === "diario" ? "Movimento do dia" : "Acumulado do mês"}</p>
              </div>
              <Tabela colunas={["Tipo", "Descrição", "Emitidas", "Atendidas"]} vazio="Sem dados."
                linhas={resumo.porTipo.map((l) => [l.tipo, l.tipo, l.rotulo, l.emitidas, l.atendidas])} />
            </section>
          </>
        )}

        {aba === "detalhado" && (
          <section className="ficha relatorio_tabela-caixa">
            <div className="ficha_cabecalho">
              <h2 className="ficha_titulo">Relatório detalhado das senhas</h2>
              <div className="campo campo--guiche">
                <label className="campo_rotulo" htmlFor="filtro-tipo">Tipo</label>
                <select id="filtro-tipo" className="campo_entrada" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                  <option value="TODOS">Todos</option>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <Tabela vazio="Nenhuma senha emitida hoje. Emita uma senha no Totem."
              colunas={["Senha", "Tipo", "Emissão", "Atendimento", "Guichê", "Estado"]}
              linhas={detalhe.map((s) => [s.numero, s.numero, s.tipo, horaCompleta(s.emitidaEm), horaCompleta(s.iniciadaEm), s.iniciadaEm ? s.guiche : "—", s.estado.replace("_", " ")])} />
          </section>
        )}

        {aba === "auditoria" && (
          <section className="ficha relatorio_tabela-caixa">
            <div className="ficha_cabecalho">
              <h2 className="ficha_titulo">Auditoria de chamadas</h2>
              <p className="ficha_senha">Hoje</p>
            </div>
            <Tabela vazio="Nenhuma chamada registrada hoje."
              colunas={["Senha", "Atendente", "Guichê", "1ª chamada", "2ª chamada", "Início", "Fim"]}
              linhas={auditoria.map((s) => [s.numero, s.numero, s.atendente, s.guiche, horaCompleta(s.chamadas[0]), horaCompleta(s.chamadas[1]), horaCompleta(s.iniciadaEm), horaCompleta(s.finalizadaEm)])} />
          </section>
        )}
      </main>

      <Rodape />
    </div>
  );
}
