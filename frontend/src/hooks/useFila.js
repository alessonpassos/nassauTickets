import { useCallback, useEffect, useState } from "react";
import { buscarSenhaAtual, listarFila } from "../services/filaService";

// Só o servidor decide a fila e a senha ativa. A seleção invalida respostas do guichê anterior.
export default function useFila(guicheId) {
  const [versao, setVersao] = useState(0);
  const [dados, setDados] = useState({ aguardando: [], atual: null });
  const atualizar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    let cancelado = false;
    let timer;
    let controle;

    async function carregar() {
      controle = new AbortController();
      const opcoes = { signal: controle.signal };
      try {
        const [aguardando, atual] = await Promise.all([
          listarFila(opcoes),
          guicheId ? buscarSenhaAtual(guicheId, opcoes) : Promise.resolve(null),
        ]);
        if (!cancelado) setDados({ aguardando, atual, guicheId, versao, erro: "" });
      } catch (erro) {
        if (!cancelado) setDados((anterior) => ({
          ...anterior,
          atual: anterior.guicheId === guicheId ? anterior.atual : null,
          guicheId, versao, erro: erro.message,
        }));
      } finally {
        if (!cancelado) timer = setTimeout(carregar, 4000);
      }
    }

    carregar();
    return () => {
      cancelado = true;
      controle?.abort();
      clearTimeout(timer);
    };
  }, [guicheId, versao]);

  const valido = dados.guicheId === guicheId && dados.versao === versao;
  return {
    aguardando: valido ? dados.aguardando : [],
    atual: valido ? dados.atual : null,
    erro: valido ? dados.erro : "",
    carregando: !valido,
    atualizar,
  };
}
