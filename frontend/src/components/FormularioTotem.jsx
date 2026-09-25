import { useRef, useState } from 'react';
import { TIPOS_SENHA } from '../data/totem';
import { emitirSenhaLocal, validarSolicitacao } from '../services/totemService';
import IconeTotem from './IconeTotem';

export default function FormularioTotem({ aberto, aoEmitir }) {
  const [dados, setDados] = useState({ nome: '', tipo: '' });
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);
  const envioEmCurso = useRef(false);
  const formulario = useRef(null);

  async function enviar(evento) {
    evento.preventDefault();
    if (envioEmCurso.current) return;
    const validacao = validarSolicitacao(dados);
    setErros(validacao);
    setErroEnvio('');
    if (Object.keys(validacao).length) {
      formulario.current.querySelector(validacao.nome ? '#totem-nome' : 'input[name="tipoSenha"]')?.focus();
      return;
    }
    envioEmCurso.current = true;
    setEnviando(true);
    try { aoEmitir(await emitirSenhaLocal(dados)); }
    catch (erro) { setErroEnvio(erro.message); }
    finally { envioEmCurso.current = false; setEnviando(false); }
  }

  return <form ref={formulario} onSubmit={enviar} className="totem-formulario" noValidate aria-busy={enviando}>
    <div className="totem-formulario__intro"><span className="totem-icone"><IconeTotem nome="senha" /></span><h1>Retire sua senha</h1><p>Preencha seu nome e escolha o atendimento.</p></div>
    <div className="totem-campo">
      <label htmlFor="totem-nome">Como podemos chamar você?</label>
      <input id="totem-nome" name="nome" autoComplete="given-name" placeholder="Digite seu nome" value={dados.nome} maxLength={100} required disabled={enviando} aria-invalid={!!erros.nome} aria-describedby={erros.nome ? 'totem-erro-nome' : 'totem-ajuda-nome'} onChange={(evento) => { setDados({ ...dados, nome: evento.target.value }); setErros({ ...erros, nome: '' }); }} />
      {erros.nome ? <p className="totem-erro" id="totem-erro-nome">{erros.nome}</p> : <p className="totem-ajuda" id="totem-ajuda-nome">Pode informar apenas seu primeiro nome.</p>}
    </div>
    <fieldset className="totem-escolhas" aria-describedby={erros.tipo ? 'totem-erro-tipo' : undefined} disabled={enviando}>
      <legend>Qual atendimento você precisa?</legend>
      {TIPOS_SENHA.map((tipo) => <label key={tipo.codigo} className={`totem-opcao totem-opcao--${tipo.codigo}${dados.tipo === tipo.codigo ? ' totem-opcao--selecionada' : ''}`}>
        <input type="radio" name="tipoSenha" value={tipo.codigo} required checked={dados.tipo === tipo.codigo} aria-invalid={!!erros.tipo} onChange={() => { setDados({ ...dados, tipo: tipo.codigo }); setErros({ ...erros, tipo: '' }); }} />
        <span className="totem-tipo__icone"><IconeTotem nome={tipo.icone} /></span>
        <span className="totem-opcao__texto"><strong>{tipo.titulo} <span className="totem-sigla">{tipo.codigo}</span></strong><span>{tipo.descricao}</span></span>
      </label>)}
      {erros.tipo && <p className="totem-erro" id="totem-erro-tipo">{erros.tipo}</p>}
    </fieldset>
    {!aberto && <p className="totem-alerta" role="status"><IconeTotem nome="relogio" /> Emissão encerrada. Volte entre 7h e 17h, no horário de Brasília.</p>}
    {erroEnvio && <p role="alert" className="totem-alerta totem-alerta--erro">{erroEnvio} Você pode tentar novamente.</p>}
    <button className="botao botao--primario totem-enviar" disabled={!aberto || enviando} type="submit">{enviando ? 'Gerando sua senha…' : 'Gerar minha senha'}<IconeTotem nome="seta" tamanho={20} /></button>
    <p className="totem-privacidade"><IconeTotem nome="escudo" tamanho={17} /> Seu nome não será salvo nesta demonstração.</p>
  </form>;
}
