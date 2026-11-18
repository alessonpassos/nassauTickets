import { api } from "./api";

export function buscarRegistro(codigo, opcoes) {
  return api.get(`/senhas/${encodeURIComponent(codigo)}/registro`, undefined, opcoes);
}

export function salvarRegistro(codigo, campos) {
  return api.post(`/senhas/${encodeURIComponent(codigo)}/registro`, campos);
}
