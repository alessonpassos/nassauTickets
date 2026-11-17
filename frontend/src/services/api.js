// Cliente HTTP da API: envia o token JWT e trata 401 em um só lugar.
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
const CHAVE_SESSAO = "nassautickets_sessao";

export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

export function obterSessao() {
  try {
    const salvo = localStorage.getItem(CHAVE_SESSAO);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

function encerrarSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

async function requisitar(metodo, caminho, { params, corpo } = {}) {
  const url = new URL(`${API_URL}${caminho}`);
  Object.entries(params ?? {}).forEach(([chave, valor]) => {
    if (valor != null && valor !== "") url.searchParams.set(chave, valor);
  });

  const headers = { "Content-Type": "application/json" };
  const sessao = obterSessao();
  if (sessao?.token) headers.Authorization = `Bearer ${sessao.token}`;

  let resposta;
  try {
    resposta = await fetch(url.toString(), {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ErroApi(0, "Não foi possível conectar ao servidor.");
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    /* corpo vazio ou não JSON */
  }

  if (!resposta.ok) {
    if (resposta.status === 401) encerrarSessao();
    throw new ErroApi(resposta.status, dados?.erro || "Erro ao comunicar com o servidor.");
  }
  return dados;
}

export const api = {
  get: (caminho, params) => requisitar("GET", caminho, { params }),
  post: (caminho, corpo) => requisitar("POST", caminho, { corpo }),
};
