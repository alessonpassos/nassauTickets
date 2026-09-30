import { USUARIOS } from "../data/usuarios.js";

const CHAVE = "nassautickets:sessao";

export function lerSessao() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE) || "null");
  } catch {
    return null;
  }
}

// Guarda apenas nome e perfil; a senha nunca é armazenada.
export function entrar(usuario, senha) {
  const achado = USUARIOS.find((u) => u.usuario === usuario.trim().toLowerCase() && u.senha === senha);
  if (!achado) return null;
  const { nome, funcao, perfil } = achado;
  const sessao = { nome, funcao, perfil };
  sessionStorage.setItem(CHAVE, JSON.stringify(sessao));
  return sessao;
}

export function sair() {
  sessionStorage.removeItem(CHAVE);
}
