import { useState } from 'react';
import { TOTEM, TIPOS_SENHA } from '../data/totem';
import IconeTotem from './IconeTotem';

export default function ComprovanteTotem({ senha, aoReiniciar, expirou }) {
  const [mensagem, setMensagem] = useState('');
  const tipo = TIPOS_SENHA.find((item) => item.codigo === senha.tipo);
  async function copiar() {
    try { await navigator.clipboard.writeText(senha.numero); setMensagem('Senha copiada.'); }
    catch { setMensagem('Não foi possível copiar. Anote sua senha ou tire uma captura de tela.'); }
  }
  return <section className="totem-comprovante" aria-labelledby="senha-gerada">
    <span className="totem-icone totem-icone--sucesso"><IconeTotem nome="check" tamanho={28} /></span>
    <h1 id="senha-gerada" tabIndex={-1}>{expirou ? 'Expediente encerrado' : 'Sua senha foi gerada!'}</h1>
    <p>{expirou ? 'Esta senha demonstrativa não é mais válida.' : 'Guarde este número para acompanhar o atendimento.'}</p>
    <div className="totem-bilhete">
      <div className="totem-bilhete__topo"><span>NassauTickets</span><span>Totem {TOTEM.codigo}</span></div>
      <span className="totem-bilhete__legenda">SUA SENHA</span>
      <strong className="totem-bilhete__numero">{senha.numero.split('-')[1]}</strong>
      <span className="totem-bilhete__completo">{senha.numero}</span>
      <span className={`totem-bilhete__tipo totem-bilhete__tipo--${senha.tipo}`}>{tipo.titulo}</span>
      <div className="totem-bilhete__detalhes"><span>Emitida em</span><time dateTime={senha.emitidaEm}>{new Date(senha.emitidaEm).toLocaleString('pt-BR', { timeZone: TOTEM.fusoHorario, dateStyle: 'short', timeStyle: 'short' })}</time><span>Local</span><strong>{TOTEM.nome}</strong></div>
      <p className="totem-bilhete__status">{expirou ? 'Expirada' : 'Aguardando · demonstração'}</p>
    </div>
    <p className="totem-alerta"><IconeTotem nome="info" /> Esta é uma senha de demonstração. Ela não entra na fila real do laboratório.</p>
    <button className="botao botao--primario totem-enviar" onClick={copiar}><IconeTotem nome="copiar" tamanho={18} /> Copiar número da senha</button>
    <p className="totem-feedback" role="status">{mensagem}</p>
    <button className="totem-link" onClick={aoReiniciar}>Emitir outra senha <IconeTotem nome="seta" tamanho={18} /></button>
  </section>;
}
