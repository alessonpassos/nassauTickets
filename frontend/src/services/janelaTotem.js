const CHAVE = "nassautickets:janela:totem";
const NOME = "nassautickets-totem";

// Modo de navegação por janela; não representa autenticação de usuário.
export function prepararJanelaTotem(janela = window) {
  let somenteTotem =
    /^\/totem(?:\/|$)/i.test(janela.location.pathname) || janela.name === NOME;
  try {
    somenteTotem ||= janela.sessionStorage.getItem(CHAVE) === "1";
  } catch {
    // window.name mantém o modo se o armazenamento estiver bloqueado.
  }
  if (somenteTotem) {
    janela.name = NOME;
    janela.opener = null;
    try {
      janela.sessionStorage.setItem(CHAVE, "1");
    } catch {
      /* sem armazenamento */
    }
  }
  return somenteTotem;
}

export function abrirJanelaTotem(evento) {
  // Preserva abrir em nova aba pelo teclado, botão do meio e menu do navegador.
  if (
    evento.defaultPrevented ||
    evento.button !== 0 ||
    evento.ctrlKey ||
    evento.metaKey ||
    evento.shiftKey ||
    evento.altKey
  )
    return;

  let janela;
  try {
    janela = window.open(
      "about:blank",
      "_blank",
      "popup=yes,width=1100,height=800,resizable=yes,scrollbars=yes",
    );
    // Sem popup, o próprio link target=_blank continua como alternativa.
    if (!janela) return;
    // Desvincula a janela antes de carregar qualquer conteúdo da aplicação.
    janela.opener = null;
    janela.name = NOME;
    try {
      // Limpa somente a cópia da sessão da nova janela, nunca a do atendente.
      janela.sessionStorage.clear();
      janela.sessionStorage.setItem(CHAVE, "1");
    } catch {
      /* window.name também mantém o modo exclusivo */
    }
    janela.location.replace(evento.currentTarget.href);
    evento.preventDefault();
  } catch {
    // Em caso de falha, mantém o link nativo e evita deixar uma janela vazia.
    try {
      janela?.close();
    } catch {
      /* nenhuma alteração na janela principal */
    }
  }
}
