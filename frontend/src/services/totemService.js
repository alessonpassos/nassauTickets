import { TOTEM, TIPOS_SENHA } from "../data/totem.js";
import { horarioTotem } from "../utils/horario.js";
import { registrarEmitida } from "./filaService.js";

export { horarioTotem };

const CHAVE = "nassautickets:totem:demo:v1";

export function validarSolicitacao({ tipo } = {}) {
  const erros = {};
  if (!TIPOS_SENHA.some((item) => item.codigo === tipo))
    erros.tipo = "Selecione o tipo de atendimento.";
  return erros;
}

function lerEstado(armazenamento, dia) {
  let estado;
  try {
    estado = JSON.parse(armazenamento.getItem(CHAVE) || "null");
  } catch (erro) {
    if (!(erro instanceof SyntaxError))
      throw new Error(
        "Não foi possível acessar o armazenamento deste navegador. Permita o armazenamento e tente novamente.",
        { cause: erro },
      );
  }
  if (!estado || estado.dia !== dia)
    return { dia, sequencias: { SG: 0, SP: 0, SE: 0 }, ultimaSenha: null };
  for (const { codigo } of TIPOS_SENHA) {
    if (
      !Number.isInteger(estado.sequencias?.[codigo]) ||
      estado.sequencias[codigo] < 0 ||
      estado.sequencias[codigo] > 999
    ) {
      throw new Error(
        "Os dados da demonstração estão inválidos. Use outro navegador para reiniciar a demonstração.",
      );
    }
  }
  return estado;
}

export function recuperarSenhaLocal(
  armazenamento = window.localStorage,
  agora = new Date(),
) {
  const horario = horarioTotem(agora);
  if (!horario.aberto) return null;
  const senha = lerEstado(armazenamento, horario.dia).ultimaSenha;
  return senha &&
    TIPOS_SENHA.some((item) => item.codigo === senha.tipo) &&
    new RegExp(`^${horario.dia}-(SP|SG|SE)\\d{3}$`).test(senha.numero)
    ? senha
    : null;
}

// Adaptador local da AV1. Na integração, o servidor deve gerar a numeração
// e garantir horário, concorrência, idempotência e fila entre dispositivos.
export async function emitirSenhaLocal(dados, opcoes = {}) {
  if (Object.keys(validarSolicitacao(dados)).length)
    throw new Error("Revise os campos antes de gerar sua senha.");
  const armazenamento = opcoes.armazenamento ?? window.localStorage;
  const executar = () => {
    const agora = opcoes.agora ?? new Date();
    const { dia, aberto } = horarioTotem(agora);
    if (!aberto)
      throw new Error(
        "A emissão de senhas funciona das 7h às 17h, no horário de Brasília.",
      );
    const estado = lerEstado(armazenamento, dia);
    const sequencia = estado.sequencias[dados.tipo] + 1;
    if (sequencia > 999)
      throw new Error(
        "O limite diário desta demonstração foi atingido para esse tipo de senha.",
      );
    const senha = {
      numero: `${dia}-${dados.tipo}${String(sequencia).padStart(3, "0")}`,
      tipo: dados.tipo,
      emitidaEm: agora.toISOString(),
      estado: "AGUARDANDO",
      totemId: TOTEM.id,
    };
    estado.sequencias[dados.tipo] = sequencia;
    estado.ultimaSenha = senha;
    // Não persistir nome, documentos nem informações de saúde.
    try {
      armazenamento.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      throw new Error(
        "Não foi possível salvar a senha. Libere espaço ou permita o armazenamento do navegador e tente novamente.",
      );
    }
    // Publica a senha na fila compartilhada (atendente, painel e relatórios).
    registrarEmitida(senha);
    return senha;
  };
  if (globalThis.navigator?.locks && !opcoes.armazenamento) {
    return navigator.locks.request(CHAVE, executar);
  }
  return executar();
}

export function iniciarNovaSolicitacao(armazenamento = window.localStorage) {
  const estado = lerEstado(armazenamento, horarioTotem().dia);
  estado.ultimaSenha = null;
  armazenamento.setItem(CHAVE, JSON.stringify(estado));
}
