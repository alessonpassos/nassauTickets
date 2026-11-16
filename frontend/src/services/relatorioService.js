const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const TIPOS = ["SP", "SE", "SG"];
export const ROTULO = { SP: "Prioritária", SE: "Retirada de exames", SG: "Geral" };

export class ErroRelatorio extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

async function getJson(caminho, params) {
  const url = new URL(`${API_BASE.replace(/\/$/, "")}${caminho}`);
  Object.entries(params).forEach(([chave, valor]) => {
    if (valor != null && valor !== "") url.searchParams.set(chave, valor);
  });

  const resposta = await fetch(url.toString());
  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch {
    /* corpo vazio ou não JSON */
  }

  if (!resposta.ok) {
    throw new ErroRelatorio(resposta.status, corpo?.erro || "Erro ao carregar relatório.");
  }
  return corpo;
}

export function buscarDiario(data) {
  return getJson("/relatorios/diario", { data });
}

export function buscarMensal(mes) {
  return getJson("/relatorios/mensal", { mes });
}

export function buscarDetalhado(data, tipo) {
  const params = { data };
  if (tipo && TIPOS.includes(tipo)) params.tipo = tipo;
  return getJson("/relatorios/detalhado", params);
}

export function buscarAuditoria(data) {
  return getJson("/relatorios/auditoria", { data });
}

export function normalizarDetalhado(linhas) {
  return (linhas ?? []).map((l) => ({
    chave: l.codigo,
    senha: l.codigo,
    tipo: l.tipo,
    emissao: l.emitida_em ?? null,
    atendimento: null,
    guiche: l.guiche ?? null,
    estado: l.status ?? "",
  }));
}

export function normalizarAuditoria(linhas) {
  return (linhas ?? []).map((l, i) => ({
    chave: `${l.codigo}-${l.primeira_chamada_em ?? i}`,
    senha: l.codigo,
    atendente: l.atendente_id ?? "—",
    guiche: l.guiche ?? "—",
    primeiraChamada: l.primeira_chamada_em ?? null,
    segundaChamada: l.segunda_chamada_em ?? null,
    inicio: null,
    fim: null,
  }));
}
