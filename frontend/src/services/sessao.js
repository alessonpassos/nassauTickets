import { api, CHAVE_SESSAO } from "./api";

export function lerSessao() {
  try {
    const sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO) || "null");
    if (!sessao || typeof sessao.token !== "string" || !sessao.token ||
        typeof sessao.usuario !== "string" ||
        !["atendente", "gestor"].includes(sessao.perfil)) return null;
    return sessao;
  } catch {
    return null;
  }
}

export async function entrar(usuario, senha) {
  const dados = await api.post("/auth/login", { usuario: usuario.trim(), senha }, { autenticado: false });
  const sessao = {
    token: dados.token,
    usuario: dados.usuario,
    perfil: String(dados.perfil).toLowerCase(),
  };
  if (!sessao.token || typeof sessao.usuario !== "string" ||
      !["atendente", "gestor"].includes(sessao.perfil)) {
    throw new Error("Resposta de login inválida.");
  }
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

export function sair() {
  localStorage.removeItem(CHAVE_SESSAO);
}

export function obterRotaInicial(perfil) {
  return perfil === "gestor" ? "/relatorios" : "/atendente";
}
