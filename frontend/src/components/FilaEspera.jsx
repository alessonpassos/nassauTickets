import { useState } from "react";
import { ROTULO_TIPO } from "../data/totem";
import { horaCompleta, sequencia } from "../utils/formatar";

const FILTROS = ["TODAS", "SP", "SE", "SG"];

export default function FilaEspera({ senhas }) {
  const [filtro, setFiltro] = useState("TODAS");
  const visiveis = senhas.filter((s) => filtro === "TODAS" || s.tipo === filtro);

  return (
    <section className="fila" aria-labelledby="fila-titulo">
      <div className="fila_cabecalho">
        <h2 id="fila-titulo" className="fila_titulo">Fila de espera</h2>
        <span className="fila_contagem">{senhas.length} aguardando</span>
      </div>

      <div className="filtro" role="group" aria-label="Filtrar fila por tipo">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filtro === f}
            className={`filtro_botao${filtro === f ? " filtro_botao--ativo" : ""}`}
            onClick={() => setFiltro(f)}
          >
            {f === "TODAS" ? "Todas" : f}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <p className="vazio">
          {senhas.length === 0 ? "Nenhuma senha aguardando. Emita uma senha no Totem." : "Nenhuma senha deste tipo."}
        </p>
      ) : (
        <ul className="fila_lista">
          {visiveis.map((senha) => (
            <li key={senha.numero} className={`fila_item ${senha.tipo === "SP" ? "fila_item--prioridade" : ""}`}>
              <span className="fila_codigo">{sequencia(senha.numero)}</span>
              <span className="fila_tipo">
                {ROTULO_TIPO[senha.tipo]}
                {senha.tipo === "SP" && <span className="selo selo--prioridade">Prioritário</span>}
              </span>
              <span className="fila_espera">{horaCompleta(senha.emitidaEm)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
