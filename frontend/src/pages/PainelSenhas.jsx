import { useEffect, useRef, useState } from 'react';
import Cabecalho from '../components/Cabecalho';
import Relogio, { formatarHora } from '../components/Relogio';
import '../styles/PainelSenhas.css';

/* abreviarNome, tamanhoDaSenha, tocarSinal, narrarChamada continuam iguais */

export default function PainelSenhas({
  maxHistorico = 6,
  aviso = 'Tenha um documento com foto em mãos ao ser chamado.',
  abreviarNomes = true,
  som = false,
  narrar = false,
  duracaoChamada = 10000,
}) {
  const [chamadaAtual, setChamadaAtual] = useState(null);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    async function buscarEstado() {
      try {
        const resposta = await fetch('http://localhost:3000/api/senhas/atual');
        const dados = await resposta.json();
        setChamadaAtual(dados.chamadaAtual);
        setHistorico(dados.historico.map((item) => ({ ...item, horario: new Date(item.horario) })));
      } catch (erro) {
        console.error('Não foi possível atualizar o painel:', erro);
      }
    }
    buscarEstado();
    const intervalo = setInterval(buscarEstado, 3000);
    return () => clearInterval(intervalo);
  }, []);

  const idAtual = chamadaAtual ? (chamadaAtual.id ?? chamadaAtual.senha) : null;

  const [idVisto, setIdVisto] = useState(idAtual);
  const [chamando, setChamando] = useState(false);
  if (idAtual !== idVisto) {
    setIdVisto(idAtual);
    setChamando(idAtual !== null);
  }

  const chamadaRef = useRef(chamadaAtual);
  useEffect(() => {
    chamadaRef.current = chamadaAtual;
  });

  useEffect(() => {
    if (!chamando) return;
    const fim = setTimeout(() => setChamando(false), duracaoChamada);
    return () => clearTimeout(fim);
  }, [chamando, idAtual, duracaoChamada]);

  useEffect(() => {
    if (!chamando || !chamadaRef.current) return;
    if (som) tocarSinal();
    const fala = narrar ? setTimeout(() => narrarChamada(chamadaRef.current), 1400) : null;
    return () => clearTimeout(fala);
  }, [idAtual, chamando, som, narrar]);

  const ultimas = historico.slice(0, maxHistorico);
  const nomeExibido = chamadaAtual?.nome
    ? abreviarNomes
      ? abreviarNome(chamadaAtual.nome)
      : chamadaAtual.nome
    : null;

    return (
    <div className="painel" style={{ '--linhas': maxHistorico }}>
      <p className="painel__sr" role="status" aria-live="polite">
        {chamadaAtual ? `Senha ${chamadaAtual.senha}, ${chamadaAtual.local}` : ''}
      </p>

      <Cabecalho mostrarMenu={false}>
        <Relogio />
      </Cabecalho>

      <div className="painel__corpo">
        <main className="painel__principal" data-chamando={chamando}>
          {chamadaAtual ? (
            <section
              key={idAtual}
              className={`painel__chamada${chamando ? ' painel__chamada--nova' : ''}`}
            >
              <div className="painel__linha-topo">
                <p className="painel__rotulo">Senha</p>
                <p className={`painel__status${chamando ? ' painel__status--ativo' : ''}`}>
                  {chamando && <span className="painel__ponto" aria-hidden="true" />}
                  {chamando ? 'Chamando agora' : 'Última chamada'}
                </p>
              </div>

              <p className="painel__senha" data-tamanho={tamanhoDaSenha(chamadaAtual.senha)}>
                {chamadaAtual.senha}
              </p>

              <div className="painel__destino">
                <p className="painel__local">{chamadaAtual.local}</p>
                {nomeExibido && <p className="painel__nome">{nomeExibido}</p>}
                {(chamadaAtual.prioritario || chamadaAtual.setor) && (
                  <div className="painel__detalhes">
                    {chamadaAtual.prioritario && (
                      <span className="painel__etiqueta">Prioritário</span>
                    )}
                    {chamadaAtual.setor && <span className="painel__setor">{chamadaAtual.setor}</span>}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="painel__espera">
              <p className="painel__espera-titulo">Aguarde ser chamado</p>
              <p className="painel__espera-texto">
                Sua senha aparecerá aqui, junto com o local de atendimento.
              </p>
            </section>
          )}

          {aviso && <footer className="painel__aviso">{aviso}</footer>}
        </main>

        <aside className="painel__historico" aria-label="Chamadas anteriores">
          <h2 className="painel__historico-titulo">Chamadas anteriores</h2>

          {ultimas.length > 0 ? (
            <ol className="painel__lista">
              {ultimas.map((item, i) => (
                <li key={item.id ?? `${item.senha}-${i}`} className="painel__item">
                  <span className="painel__item-senha">{item.senha}</span>
                  <span className="painel__item-info">
                    <span className="painel__item-local">{item.local}</span>
                    {item.prioritario && (
                      <span className="painel__item-prioridade">Prioritário</span>
                    )}
                  </span>
                  <time className="painel__item-hora">{formatarHora(item.horario)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="painel__vazio">As últimas senhas chamadas aparecerão aqui.</p>
          )}
        </aside>
      </div>
    </div>
  );
}