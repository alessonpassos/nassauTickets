import { api } from "./api";

export const TIPOS = ["SP", "SE", "SG"];
export const ROTULO = { SP: "Prioritária", SE: "Retirada de exames", SG: "Geral" };

export function buscarDiario(data) {
  return api.get("/relatorios/diario", { data });
}

export function buscarMensal(mes) {
  return api.get("/relatorios/mensal", { mes });
}

export function buscarDetalhado(data, tipo, mes) {
  const params = mes ? { mes } : { data };
  if (tipo && TIPOS.includes(tipo)) params.tipo = tipo;
  return api.get("/relatorios/detalhado", params);
}

export function buscarAuditoria(data, mes) {
  return api.get("/relatorios/auditoria", mes ? { mes } : { data });
}

export function normalizarDetalhado(linhas) {
  return (linhas ?? []).map((l) => ({
    chave: l.codigo,
    senha: l.codigo,
    tipo: l.tipo,
    emissao: l.emitida_em ?? null,
    atendimento: l.inicio_atendimento_em ?? null,
    guiche: l.guiche ?? null,
    estado: l.status ?? "",
  }));
}

export function normalizarAuditoria(linhas) {
  return (linhas ?? []).map((l, i) => ({
    chave: `${l.codigo}-${l.primeira_chamada_em ?? i}`,
    senha: l.codigo,
    atendente: l.atendente ?? "—",
    guiche: l.guiche ?? "—",
    primeiraChamada: l.primeira_chamada_em ?? null,
    segundaChamada: l.segunda_chamada_em ?? null,
    inicio: l.inicio_atendimento_em ?? null,
    fim: l.fim_atendimento_em ?? null,
  }));
}
