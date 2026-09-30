import { duracao } from "../utils/formatar.js";

export const TIPOS = ["SP", "SE", "SG"];
export const ROTULO = { SP: "Prioritária", SE: "Retirada de exames", SG: "Geral" };

// prefixo: "YYMMDD" (diário) ou "YYMM" (mensal). Senhas em espera fora do expediente contam como descartadas.
export function resumir(senhas, prefixo, { hoje, aberto }) {
  const lista = senhas.filter((s) => s.numero.startsWith(prefixo));
  const atendidas = lista.filter((s) => s.estado === "ATENDIDA");
  const tempos = atendidas.map((s) => Date.parse(s.finalizadaEm) - Date.parse(s.iniciadaEm));
  const media = tempos.length ? tempos.reduce((a, b) => a + b, 0) / tempos.length : NaN;
  return {
    emitidas: lista.length,
    atendidas: atendidas.length,
    naoCompareceu: lista.filter((s) => s.estado === "NÃO_COMPARECEU").length,
    descartadas: lista.filter((s) => s.estado === "AGUARDANDO" && (!s.numero.startsWith(hoje) || !aberto)).length,
    tempoMedio: duracao(media),
    porTipo: TIPOS.map((tipo) => ({
      tipo,
      rotulo: ROTULO[tipo],
      emitidas: lista.filter((s) => s.tipo === tipo).length,
      atendidas: atendidas.filter((s) => s.tipo === tipo).length,
    })),
  };
}
