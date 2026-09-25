import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Cabecalho from '../components/Cabecalho';
import Rodape from '../components/Rodape';
import IconeTotem from '../components/IconeTotem';
import QrCodeTotem from '../components/QrCodeTotem';
import FormularioTotem from '../components/FormularioTotem';
import ComprovanteTotem from '../components/ComprovanteTotem';
import useFormatoTotem from '../hooks/useFormatoTotem';
import { TOTEM, TIPOS_SENHA } from '../data/totem';
import { horarioTotem, iniciarNovaSolicitacao, recuperarSenhaLocal } from '../services/totemService';
import '../styles/layout.css';
import '../styles/totem.css';

export default function Totem({ retirar = false }) {
  const computador = useFormatoTotem();
  const [parametros] = useSearchParams();
  const [agora, setAgora] = useState(() => new Date());
  const [erro, setErro] = useState('');
  const [senha, setSenha] = useState(() => { try { return recuperarSenhaLocal(); } catch { return null; } });
  const formulario = retirar || !computador;
  const horario = horarioTotem(agora);
  const invalido = parametros.has('totem') && parametros.get('totem') !== TOTEM.id;
  const caminho = `/totem/retirar?totem=${TOTEM.id}`;

  useEffect(() => {
    document.title = 'Totem | NassauTickets';
    const intervalo = setInterval(() => setAgora(new Date()), 15000);
    const aoFocar = () => setAgora(new Date());
    window.addEventListener('focus', aoFocar);
    return () => { clearInterval(intervalo); window.removeEventListener('focus', aoFocar); };
  }, []);

  function aoEmitir(novaSenha) {
    setSenha(novaSenha);
    requestAnimationFrame(() => { document.getElementById('senha-gerada')?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  }
  function reiniciar() {
    try { iniciarNovaSolicitacao(); setSenha(null); setErro(''); }
    catch { setErro('Não foi possível iniciar uma nova solicitação. Permita o armazenamento do navegador e tente novamente.'); }
  }

  return <div className={`pagina pagina-totem${formulario ? ' pagina-totem--formulario' : ''}`}>
    <Cabecalho mostrarMenu={computador}><div className="totem-cabecalho-info"><IconeTotem nome="local" tamanho={17} /><span>Laboratório de Análises Clínicas</span></div></Cabecalho>
    <main className="pagina__corpo totem-corpo">
      <div className="totem-topo"><div><div className="totem-migalha">NassauTickets <span>/</span> Autoatendimento</div><h1 className="totem-titulo">Totem</h1></div><div className="totem-identificacao"><span className="totem-numero">01</span><span><strong>{TOTEM.nome}</strong><span>Totem de autoatendimento</span></span></div></div>
      {invalido ? <section className="totem-form-card"><h1>Totem não encontrado</h1><p>Este link não corresponde a um totem disponível.</p><Link to="/totem" className="botao botao--primario">Ir para o Totem da recepção</Link></section> : formulario ? <>
        {computador && <Link to="/totem" className="totem-link totem-voltar"><IconeTotem nome="voltar" tamanho={18} /> Voltar ao QR Code</Link>}
        <div className="totem-form-card">{senha ? <ComprovanteTotem senha={senha} aoReiniciar={reiniciar} expirou={!horario.aberto || !senha.numero.startsWith(horario.dia)} /> : <FormularioTotem aberto={horario.aberto} aoEmitir={aoEmitir} />}{erro && <p className="totem-alerta totem-alerta--erro" role="alert">{erro}</p>}</div>
      </> : <>
        <section className="totem-principal" aria-labelledby="totem-boas-vindas">
          <div className="totem-introducao">
            <div className="totem-disponibilidade"><IconeTotem nome="relogio" tamanho={17} />{horario.aberto ? 'Emissão disponível' : 'Fora do horário de emissão'}<span>7h às 17h</span></div>
            <h2 id="totem-boas-vindas">Seu atendimento<br />começa aqui.</h2>
            <p className="totem-descricao">Retire sua senha pelo celular.<br />É simples, rápido e sem precisar de cadastro.</p>
            <ol className="totem-passos">
              <li><span>1</span><div><strong>Escaneie o QR Code</strong><p>Use a câmera do seu celular para acessar.</p></div></li>
              <li><span>2</span><div><strong>Escolha seu atendimento</strong><p>Informe seu nome e o tipo de senha.</p></div></li>
              <li><span>3</span><div><strong>Receba sua senha</strong><p>Guarde o número e aguarde a chamada no painel.</p></div></li>
            </ol>
            <div className="totem-sem-celular"><IconeTotem nome="info" tamanho={19} /><p><strong>Está sem celular?</strong> Procure a recepção para retirar sua senha.</p></div>
          </div>
          <QrCodeTotem caminho={caminho} />
        </section>
        <section className="totem-tipos" aria-labelledby="tipos-disponiveis"><div className="totem-secao-titulo"><h2 id="tipos-disponiveis">Um atendimento para cada necessidade</h2><span>3 tipos de senha</span></div><div className="totem-tipos__grade">{TIPOS_SENHA.map((tipo) => <article className={`totem-tipo totem-tipo--${tipo.codigo}`} key={tipo.codigo}><span className="totem-tipo__icone"><IconeTotem nome={tipo.icone} tamanho={23} /></span><div><h3>{tipo.titulo} <span className="totem-sigla">{tipo.codigo}</span></h3><p>{tipo.descricao}</p></div></article>)}</div></section>
      </>}
      <div className="totem-notas"><p><IconeTotem nome="relogio" tamanho={17} /><span>Atendimento das <strong>7h às 17h</strong> · Horário de Brasília</span></p><p><IconeTotem nome="info" tamanho={17} /><span>Demonstração: senhas salvas apenas neste navegador.</span></p></div>
    </main>
    <Rodape />
  </div>;
}
