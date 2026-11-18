import { useEffect, useRef, useState } from "react";
import { buscarRegistro, salvarRegistro } from "../services/registroService";
import { sequencia } from "../utils/formatar";

const TIPOS = [
  { valor: "exame", rotulo: "Exame" },
  { valor: "exameDeSangue", rotulo: "Exame de sangue" },
  { valor: "vacinacao", rotulo: "Vacinação" },
  { valor: "resultado", rotulo: "Retirada de resultado" },
];
const SETORES = [
  { valor: "salaDeExames", rotulo: "Sala de exames" },
  { valor: "salaDeVacinacao", rotulo: "Sala de vacinação" },
  { valor: "laboratorio", rotulo: "Laboratório" },
  { valor: "recepcao", rotulo: "Recepção" },
];
const INICIAL = { tipoAtendimento: "", setor: "", observacao: "" };
const camposDoRegistro = (registro) => ({
  tipoAtendimento: registro?.tipoAtendimento ?? "",
  setor: registro?.setor ?? "",
  observacao: registro?.observacao ?? "",
});

// A página usa a senha como key: trocar de atendimento reinicia os campos.
export default function FichaPaciente({ senha, bloqueado = false, aoProcessar, aoAlterar }) {
  const codigo = senha?.codigo;
  const habilitada = senha?.status === "EM_ATENDIMENTO" && senha?.pode_operar !== false;
  const [campos, setCampos] = useState(INICIAL);
  const [originais, setOriginais] = useState(INICIAL);
  const [erros, setErros] = useState({});
  const [erroCarga, setErroCarga] = useState("");
  const [erroSalvar, setErroSalvar] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [carregado, setCarregado] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const emCurso = useRef(false);
  const montado = useRef(false);
  const carregando = habilitada && carregado !== tentativa;
  const editavel = habilitada && !carregando && !erroCarga && !bloqueado && !salvando;
  const pendente = Object.keys(INICIAL).some((nome) => campos[nome] !== originais[nome]);

  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; aoAlterar?.(false); };
  }, [aoAlterar]);

  useEffect(() => {
    if (!habilitada || !codigo) return;
    const controle = new AbortController();
    buscarRegistro(codigo, { signal: controle.signal }).then((registro) => {
      if (controle.signal.aborted) return;
      const dados = camposDoRegistro(registro);
      setCampos(dados);
      setOriginais(dados);
      setErroCarga("");
      setCarregado(tentativa);
    }).catch((erro) => {
      if (controle.signal.aborted) return;
      setErroCarga(erro.message || "Não foi possível carregar o registro.");
      setCarregado(tentativa);
    });
    return () => controle.abort();
  }, [codigo, habilitada, tentativa]);

  function alterar(evento) {
    const { name, value } = evento.target;
    const novos = { ...campos, [name]: value };
    setCampos(novos);
    setSalvo(false);
    setErroSalvar("");
    setErros((anteriores) => ({ ...anteriores, [name]: "" }));
    aoAlterar?.(Object.keys(INICIAL).some((nome) => novos[nome] !== originais[nome]));
  }

  function descartar() {
    setCampos(originais);
    setErros({});
    setErroSalvar("");
    setSalvo(false);
    aoAlterar?.(false);
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (!editavel || emCurso.current) return;
    const novosErros = {};
    if (!campos.tipoAtendimento) novosErros.tipoAtendimento = "Selecione o tipo de atendimento.";
    if (!campos.setor) novosErros.setor = "Selecione o setor de encaminhamento.";
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;
    emCurso.current = true;
    setSalvando(true);
    setSalvo(false);
    setErroSalvar("");
    aoProcessar?.(true);
    try {
      const registro = await salvarRegistro(codigo, campos);
      if (!montado.current) return;
      const dados = camposDoRegistro(registro);
      setCampos(dados);
      setOriginais(dados);
      setSalvo(true);
      aoAlterar?.(false);
    } catch (erro) {
      if (montado.current) setErroSalvar(erro.message || "Não foi possível salvar o registro. Tente novamente.");
    } finally {
      emCurso.current = false;
      if (montado.current) setSalvando(false);
      aoProcessar?.(false);
    }
  }

  return (
    <form className="ficha" aria-labelledby="registro-titulo" onSubmit={enviar} noValidate>
      <div className="ficha_cabecalho">
        <h2 id="registro-titulo" className="ficha_titulo">Registro do atendimento</h2>
        <p className="ficha_senha">
          {senha ? <>Senha <strong>{sequencia(senha.numero)}</strong></> : "Sem senha em atendimento"}
        </p>
      </div>
      {!habilitada && <p className="msg msg--info">{senha?.pode_operar === false ? "O registro está disponível apenas ao atendente responsável por esta senha." : "Inicie o atendimento de uma senha para preencher o registro."}</p>}
      {carregando && <p role="status">Carregando registro…</p>}
      {habilitada && !carregando && erroCarga && (
        <div className="msg msg--erro" role="alert">
          {erroCarga} <button type="button" className="botao botao--secundario" onClick={() => setTentativa((v) => v + 1)}>Tentar novamente</button>
        </div>
      )}
      <fieldset className="ficha_grupo" disabled={!editavel}>
        <legend className="ficha_legenda">Atendimento</legend>
        <div className="ficha_campos">
          <div className="campo campo--metade">
            <label className="campo_rotulo" htmlFor="tipoAtendimento">Tipo de atendimento</label>
            <select id="tipoAtendimento" name="tipoAtendimento" className="campo_entrada" value={campos.tipoAtendimento} onChange={alterar} aria-invalid={!!erros.tipoAtendimento} aria-describedby={erros.tipoAtendimento ? "erro-tipo-atendimento" : undefined}>
              <option value="">Selecione</option>
              {TIPOS.map((tipo) => <option key={tipo.valor} value={tipo.valor}>{tipo.rotulo}</option>)}
            </select>
            {erros.tipoAtendimento && <p id="erro-tipo-atendimento" className="campo_erro" role="alert">{erros.tipoAtendimento}</p>}
          </div>
          <div className="campo campo--metade">
            <label className="campo_rotulo" htmlFor="setor">Encaminhar para</label>
            <select id="setor" name="setor" className="campo_entrada" value={campos.setor} onChange={alterar} aria-invalid={!!erros.setor} aria-describedby={erros.setor ? "erro-setor" : undefined}>
              <option value="">Selecione o setor</option>
              {SETORES.map((setor) => <option key={setor.valor} value={setor.valor}>{setor.rotulo}</option>)}
            </select>
            {erros.setor && <p id="erro-setor" className="campo_erro" role="alert">{erros.setor}</p>}
          </div>
          <div className="campo campo--inteiro">
            <label className="campo_rotulo" htmlFor="observacao">Observação (opcional)</label>
            <textarea id="observacao" name="observacao" rows={3} maxLength={200} className="campo_entrada" value={campos.observacao} onChange={alterar} aria-describedby="observacao-ajuda" />
            <p id="observacao-ajuda" className="campo_ajuda">Registro operacional do atendimento, com até 200 caracteres. Não informe nome, CPF ou dados de saúde.</p>
          </div>
        </div>
      </fieldset>
      {pendente && <p className="msg msg--info">Salve ou descarte as alterações do registro antes de finalizar ou trocar de guichê.</p>}
      {erroSalvar && <p className="msg msg--erro" role="alert">{erroSalvar} Seus campos foram mantidos; tente salvar novamente.</p>}
      {salvo && <p className="msg msg--ok" role="status">Registro salvo com sucesso.</p>}
      <div className="ficha_rodape">
        <button type="button" className="botao botao--secundario" disabled={!editavel || !pendente} onClick={descartar}>Descartar alterações</button>
        <button type="submit" className="botao botao--primario" disabled={!editavel}>{salvando ? "Salvando…" : "Salvar registro"}</button>
      </div>
    </form>
  );
}
