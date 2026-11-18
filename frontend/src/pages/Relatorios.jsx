import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cabecalho from "../components/Cabecalho";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Rodape from "../components/Rodape";
import InfoUsuario from "../components/InfoUsuario";
import { ErroApi } from "../services/api";
import { lerSessao } from "../services/sessao";
import {
  TIPOS,
  buscarDiario,
  buscarMensal,
  buscarDetalhado,
  buscarAuditoria,
  normalizarDetalhado,
  normalizarAuditoria,
} from "../services/relatorioService";
import { dataHoraCompleta } from "../utils/formatar";
import "../styles/layout.css";
import "../styles/painelAtendente.css";
import "../styles/relatorios.css";

const abas = [
  { id: "diario", rotulo: "Diário" },
  { id: "mensal", rotulo: "Mensal" },
  { id: "detalhado", rotulo: "Detalhado" },
  { id: "auditoria", rotulo: "Auditoria" },
];

function hojeIso() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function mesAtualIso() {
  return hojeIso().slice(0, 7);
}

const ROTULO_PERFIL = { gestor: "Gestor", atendente: "Atendente" };

function rotuloPerfil(perfil) {
  return ROTULO_PERFIL[perfil] ?? "Usuário";
}

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
  const navigate = useNavigate();
  const [aba, setAba] = useState("diario");
  const [data, setData] = useState(hojeIso);
  const [mes, setMes] = useState(mesAtualIso);
  const [periodo, setPeriodo] = useState("dia");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resumo, setResumo] = useState(null);
  const [detalhe, setDetalhe] = useState([]);
  const [auditoria, setAuditoria] = useState([]);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        if (aba === "diario") {
          const dados = await buscarDiario(data);
          if (!cancelado) setResumo(dados);
        } else if (aba === "mensal") {
          const dados = await buscarMensal(mes);
          if (!cancelado) setResumo(dados);
        } else if (aba === "detalhado") {
          const linhas = await buscarDetalhado(data, filtroTipo, periodo === "mes" ? mes : undefined);
          if (!cancelado) setDetalhe(normalizarDetalhado(linhas));
        } else if (aba === "auditoria") {
          const linhas = await buscarAuditoria(data, periodo === "mes" ? mes : undefined);
          if (!cancelado) setAuditoria(normalizarAuditoria(linhas));
        }
      } catch (e) {
        if (cancelado) return;
        // 401 já é tratado pelo api.js (limpa a sessão e volta ao login)
        if (e instanceof ErroApi && e.status === 401) return;
        if (e instanceof ErroApi && e.status === 403) {
          navigate("/", { replace: true });
          return;
        }
        setErro(e.message || "Erro ao carregar relatório.");
        setResumo(null);
        setDetalhe([]);
        setAuditoria([]);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();
    return () => { cancelado = true; };
  }, [aba, data, mes, periodo, filtroTipo, navigate]);

  const semResumo = !resumo || resumo.emitidas === 0;

  return (
    <div className="pagina">
      <Cabecalho>
        <InfoUsuario nomeUsuario={sessao?.usuario ?? ""} funcao={`${rotuloPerfil(sessao?.perfil)}, relatórios`} />
      </Cabecalho>

      <main className="pagina_corpo">
        <CabecalhoPagina titulo="Relatórios" subtitulo="Indicadores e auditoria a partir da API." />

        <div className="relatorio_abas" role="tablist" aria-label="Tipo de relatório">
          {abas.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={aba === item.id}
              className={`botao ${aba === item.id ? "botao--primario" : "botao--secundario"}`}
              onClick={() => setAba(item.id)}>
              {item.rotulo}
            </button>
          ))}
        </div>

        {(aba === "detalhado" || aba === "auditoria") && (
          <div className="campo campo--guiche">
            <label className="campo_rotulo" htmlFor="periodo-relatorio">Período</label>
            <select id="periodo-relatorio" className="campo_entrada" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="dia">Dia</option><option value="mes">Mês</option>
            </select>
          </div>
        )}

        {(aba === "diario" || ((aba === "detalhado" || aba === "auditoria") && periodo === "dia")) && (
          <div className="campo campo--guiche">
            <label className="campo_rotulo" htmlFor="filtro-data">Data</label>
            <input id="filtro-data" type="date" className="campo_entrada" value={data}
              onChange={(e) => setData(e.target.value)} />
          </div>
        )}

        {(aba === "mensal" || ((aba === "detalhado" || aba === "auditoria") && periodo === "mes")) && (
          <div className="campo campo--guiche">
            <label className="campo_rotulo" htmlFor="filtro-mes">Mês</label>
            <input id="filtro-mes" type="month" className="campo_entrada" value={mes}
              onChange={(e) => setMes(e.target.value)} />
          </div>
        )}

        {carregando && <p role="status">Carregando…</p>}
        {erro && <p role="alert" className="vazio">{erro}</p>}

        {!carregando && !erro && (aba === "diario" || aba === "mensal") && (
          semResumo ? (
            <p className="vazio">Sem dados no período.</p>
          ) : (
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
                <Tabela colunas={["Tipo", "Descrição", "Emitidas", "Atendidas"]} vazio="Sem dados no período."
                  linhas={resumo.porTipo.map((l) => [l.tipo, l.tipo, l.rotulo, l.emitidas, l.atendidas])} />
              </section>
            </>
          )
        )}

        {!carregando && !erro && aba === "detalhado" && (
          <section className="ficha relatorio_tabela-caixa">
            <div className="ficha_cabecalho">
              <h2 className="ficha_titulo">Relatório detalhado das senhas</h2>
              <div className="campo campo--guiche">
                <label className="campo_rotulo" htmlFor="filtro-tipo">Tipo</label>
                <select id="filtro-tipo" className="campo_entrada" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                  <option value="">Todos</option>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <Tabela vazio="Sem dados no período."
              colunas={["Senha", "Tipo", "Emissão", "Atendimento", "Guichê", "Estado"]}
              linhas={detalhe.map((s) => [s.chave, s.senha, s.tipo, dataHoraCompleta(s.emissao), dataHoraCompleta(s.atendimento), s.guiche ?? "—", String(s.estado).replace("_", " ")])} />
          </section>
        )}

        {!carregando && !erro && aba === "auditoria" && (
          <section className="ficha relatorio_tabela-caixa">
            <div className="ficha_cabecalho">
              <h2 className="ficha_titulo">Auditoria de chamadas</h2>
            </div>
            <Tabela vazio="Sem dados no período."
              colunas={["Senha", "Atendente", "Guichê", "1ª chamada", "2ª chamada", "Início", "Fim"]}
              linhas={auditoria.map((s) => [s.chave, s.senha, s.atendente, s.guiche, dataHoraCompleta(s.primeiraChamada), dataHoraCompleta(s.segundaChamada), dataHoraCompleta(s.inicio), dataHoraCompleta(s.fim)])} />
          </section>
        )}
      </main>

      <Rodape />
    </div>
  );
}
