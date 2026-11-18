import { api, traduzirSenha } from "./api";

export async function listarFila(opcoes) {
  const senhas = await api.get("/senhas/fila", undefined, opcoes);
  return senhas.map(traduzirSenha);
}

export function listarGuiches(opcoes) {
  return api.get("/guiches", undefined, opcoes);
}

export async function buscarSenhaAtual(guicheId, opcoes) {
  const senha = await api.get(`/senhas/guiche/${guicheId}`, undefined, opcoes);
  return senha ? traduzirSenha(senha) : null;
}

export function chamarProxima(guicheId) {
  return api.post("/senhas/chamar", { guiche_id: guicheId });
}

export function chamarNovamente(guicheId) {
  return api.post("/senhas/repetir", { guiche_id: guicheId });
}

export function iniciarAtendimento(codigo) {
  return api.post("/senhas/iniciar", { codigo });
}

export function finalizarAtendimento(codigo) {
  return api.post("/senhas/finalizar", { codigo });
}

export function marcarNaoCompareceu(codigo) {
  return api.post("/senhas/nao-compareceu", { codigo });
}
