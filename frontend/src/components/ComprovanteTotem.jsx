import { useEffect, useState } from "react";
import { AVISO_IMPRESSAO_MS, IMPRESSAO_MS, TOTEM, TIPOS_SENHA } from "../data/totem";
import { sequencia } from "../utils/formatar";
import IconeTotem from "./IconeTotem";

export default function ComprovanteTotem({ senha, decorrido, aoReiniciar, aoEncerrar }) {
  const duracao = Math.max(0, IMPRESSAO_MS - decorrido);
  const [restante, setRestante] = useState(duracao);
  const impressa = restante === 0;
  const segundos = Math.ceil(restante / 1000);
  const tipo = TIPOS_SENHA.find((item) => item.codigo === senha.tipo);

  useEffect(() => {
    if (duracao === 0) return;
    const fim = performance.now() + duracao;
    const atualizacao = setInterval(() => {
      setRestante(Math.max(0, fim - performance.now()));
    }, 100);
    const impressao = setTimeout(() => {
      clearInterval(atualizacao);
      setRestante(0);
    }, duracao);

    return () => {
      clearInterval(atualizacao);
      clearTimeout(impressao);
    };
  }, [duracao]);

  useEffect(() => {
    if (!impressa) return;
    const avisoDecorrido = Math.max(0, decorrido - IMPRESSAO_MS);
    const retorno = setTimeout(aoEncerrar, AVISO_IMPRESSAO_MS - avisoDecorrido);
    return () => clearTimeout(retorno);
  }, [impressa, decorrido, aoEncerrar]);

  return (
    <section className="totem-comprovante" aria-labelledby="senha-gerada">
      <h2 id="senha-gerada" tabIndex={-1}>Sua senha</h2>
      <strong className="totem-comprovante_numero">{sequencia(senha.numero)}</strong>
      <p className="totem-comprovante_codigo">{senha.numero}</p>
      <p className="totem-comprovante_tipo">{tipo.titulo}</p>
      <time dateTime={senha.emitidaEm}>
        {new Date(senha.emitidaEm).toLocaleString("pt-BR", {
          timeZone: TOTEM.fusoHorario,
          dateStyle: "short",
          timeStyle: "short",
        })}
      </time>

      <div className="totem-comprovante_acoes">
        <button type="button" className="botao botao--primario" onClick={aoReiniciar}>
          Nova senha
        </button>
      </div>

      <div className="totem-impressao">
        <div className="totem-impressao_status" role="status" aria-atomic="true">
          {impressa ? (
            <>
              <IconeTotem nome="check" tamanho={22} />
              <div>
                <strong>Impressão concluída</strong>
                <p>Retire sua senha e aguarde a chamada no painel.</p>
              </div>
            </>
          ) : (
            <strong id="totem-impressao-aviso">Aguarde, sua senha está sendo impressa.</strong>
          )}
        </div>
        {!impressa && (
          <div className="totem-impressao_progresso">
            <div
              className="totem-impressao_barra"
              role="progressbar"
              aria-labelledby="totem-impressao-aviso"
              aria-valuemin={0}
              aria-valuemax={IMPRESSAO_MS / 1000}
              aria-valuenow={segundos}
              aria-valuetext={`${segundos} s restantes`}
            >
              <div style={{ "--progresso": restante / IMPRESSAO_MS }} />
            </div>
            <span aria-hidden="true">{segundos} s</span>
          </div>
        )}
      </div>
    </section>
  );
}
