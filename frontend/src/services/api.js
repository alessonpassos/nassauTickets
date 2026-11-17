// Cliente HTTP da API: envia o token JWT e trata 401 em um só lugar.
import { obterSessao, sair } from "./sessao";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
export { obterSessao };

export function traduzirSenha(senha) {
  return {
    ...senha,
    numero: senha.codigo,
    tipo: senha.tipo,
    estado: senha.status,
    emitidaEm: senha.emitida_em,
  };
}

export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

function encerrarSessao() {
  sair();
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

async function requisitar(metodo, caminho, {
  params,
  corpo,
  autenticado = true,
  signal,
} = {}) {
  const url = new URL(`${API_URL}${caminho}`);
  Object.entries(params ?? {}).forEach(([chave, valor]) => {
    if (valor != null && valor !== "") url.searchParams.set(chave, valor);
  });

  const headers = { "Content-Type": "application/json" };
  if (autenticado) {
    const sessao = obterSessao();
    if (sessao?.token) headers.Authorization = `Bearer ${sessao.token}`;
  }

  let resposta;
  try {
    resposta = await fetch(url.toString(), {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal,
    });
  } catch (erro) {
    if (erro.name === "AbortError") throw erro;
    throw new ErroApi(0, "Não foi possível conectar ao servidor.");
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    /* corpo vazio ou não JSON */
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && autenticado) encerrarSessao();
    throw new ErroApi(resposta.status, dados?.erro || "Erro ao comunicar com o servidor.");
  }
  return dados;
}

export const api = {
  get: (caminho, params, opcoes) => requisitar("GET", caminho, { ...opcoes, params }),
  post: (caminho, corpo, opcoes) => requisitar("POST", caminho, { ...opcoes, corpo }),
};
