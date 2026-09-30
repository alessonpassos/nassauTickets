import { horarioTotem } from "../utils/horario.js";

// Fonte única de dados compartilhada por Totem, Atendente, Painel e Relatórios (AV1: localStorage).
// Na AV2 basta trocar este adaptador por chamadas fetch mantendo as mesmas funções.
const CHAVE = "nassautickets:fila:v1";
const EVENTO = "nassautickets:fila";
const VAZIO = JSON.stringify({ senhas: [], ultimoGrupo: null });

export const ATIVOS = ["CHAMADA", "CHAMADA_NOVAMENTE", "EM_ATENDIMENTO"];

export function lerBruto() {
  try {
    return localStorage.getItem(CHAVE) ?? VAZIO;
  } catch {
    return VAZIO;
  }
}

export function interpretar(bruto) {
  try {
    const estado = JSON.parse(bruto);
    if (Array.isArray(estado?.senhas)) return estado;
  } catch {
    /* dados corrompidos: recomeça vazio */
  }
  return JSON.parse(VAZIO);
}

export function assinar(aoMudar) {
  window.addEventListener("storage", aoMudar); // outras abas/janelas
  window.addEventListener(EVENTO, aoMudar); // mesma aba
  return () => {
    window.removeEventListener("storage", aoMudar);
    window.removeEventListener(EVENTO, aoMudar);
  };
}

// Leitura-modificação-escrita protegida por lock (dois guichês ao mesmo tempo não pegam a mesma senha).
async function transacao(alterar) {
  const executar = () => {
    const estado = interpretar(lerBruto());
    const resultado = alterar(estado);
    localStorage.setItem(CHAVE, JSON.stringify(estado));
    window.dispatchEvent(new Event(EVENTO));
    return resultado;
  };
  return globalThis.navigator?.locks
    ? navigator.locks.request(CHAVE, executar)
    : executar();
}

const agora = () => new Date().toISOString();

function achar(estado, numero) {
  const senha = estado.senhas.find((s) => s.numero === numero);
  if (!senha) throw new Error("Senha não encontrada.");
  return senha;
}

// Chamada pelo Totem logo após gerar a numeração.
export function registrarEmitida({ numero, tipo, emitidaEm }) {
  return transacao((estado) => {
    if (!estado.senhas.some((s) => s.numero === numero)) {
      estado.senhas.push({ numero, tipo, estado: "AGUARDANDO", emitidaEm, chamadas: [] });
    }
  });
}

// Regra SP -> [SE|SG] -> SP -> [SE|SG]; se um grupo estiver vazio, segue a prioridade restante.
export function escolherProxima(estado, dia) {
  const fila = estado.senhas.filter((s) => s.estado === "AGUARDANDO" && s.numero.startsWith(dia));
  const ordem = estado.ultimoGrupo === "SP" ? ["SE", "SG", "SP"] : ["SP", "SE", "SG"];
  for (const tipo of ordem) {
    const achada = fila.find((s) => s.tipo === tipo); // ordem de emissão dentro do tipo
    if (achada) return achada;
  }
  return null;
}

export function chamarProxima({ guiche, atendente }) {
  return transacao((estado) => {
    const { dia } = horarioTotem();
    if (estado.senhas.some((s) => s.guiche === guiche && ATIVOS.includes(s.estado) && s.numero.startsWith(dia)))
      throw new Error("Conclua a senha em andamento neste guichê antes de chamar outra.");
    const senha = escolherProxima(estado, dia);
    if (!senha) throw new Error("Não há senhas aguardando.");
    Object.assign(senha, { estado: "CHAMADA", guiche, atendente, chamadas: [agora()] });
    estado.ultimoGrupo = senha.tipo === "SP" ? "SP" : "OUTRO";
    return `Senha ${senha.numero} chamada.`;
  });
}

export function chamarNovamente(numero) {
  return transacao((estado) => {
    const senha = achar(estado, numero);
    if (senha.estado !== "CHAMADA")
      throw new Error("Só é possível chamar novamente uma vez; depois, marque não compareceu.");
    senha.estado = "CHAMADA_NOVAMENTE";
    senha.chamadas.push(agora());
    return `Última chamada para ${numero}.`;
  });
}

export function iniciarAtendimento(numero) {
  return transacao((estado) => {
    const senha = achar(estado, numero);
    if (!["CHAMADA", "CHAMADA_NOVAMENTE"].includes(senha.estado))
      throw new Error("A senha precisa estar chamada para iniciar.");
    Object.assign(senha, { estado: "EM_ATENDIMENTO", iniciadaEm: agora() });
    return "Atendimento iniciado.";
  });
}

export function finalizarAtendimento(numero) {
  return transacao((estado) => {
    const senha = achar(estado, numero);
    if (senha.estado !== "EM_ATENDIMENTO") throw new Error("Não há atendimento em andamento.");
    Object.assign(senha, { estado: "ATENDIDA", finalizadaEm: agora() });
    return "Atendimento finalizado.";
  });
}

export function marcarNaoCompareceu(numero) {
  return transacao((estado) => {
    const senha = achar(estado, numero);
    if (senha.estado !== "CHAMADA_NOVAMENTE")
      throw new Error("A senha só é abandonada após duas chamadas.");
    Object.assign(senha, { estado: "NÃO_COMPARECEU", finalizadaEm: agora() });
    return `Senha ${numero} marcada como não compareceu.`;
  });
}

export function salvarRegistro(numero, registro) {
  return transacao((estado) => {
    achar(estado, numero).registro = registro;
    return "Registro salvo.";
  });
}
