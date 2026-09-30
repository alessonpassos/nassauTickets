import { useState } from "react";
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

// Registro do atendimento (sem dados pessoais: o cliente é anônimo — LGPD).
export default function FichaPaciente({ senha, aoSalvar }) {
  const [campos, setCampos] = useState(senha?.registro ?? INICIAL);
  const [erros, setErros] = useState({});
  const [salvo, setSalvo] = useState(false);
  const habilitada = senha?.estado === "EM_ATENDIMENTO";

  const alterar = (e) => {
    setCampos((atual) => ({ ...atual, [e.target.name]: e.target.value }));
    setSalvo(false);
  };

  function enviar(evento) {
    evento.preventDefault();
    const novos = {};
    if (!campos.tipoAtendimento) novos.tipoAtendimento = "Selecione o tipo de atendimento.";
    if (!campos.setor) novos.setor = "Selecione o setor de encaminhamento.";
    setErros(novos);
    if (Object.keys(novos).length) return;
    aoSalvar(campos);
    setSalvo(true);
  }

  return (
    <form className="ficha" onSubmit={enviar} noValidate>
      <div className="ficha_cabecalho">
        <h2 className="ficha_titulo">Registro do atendimento</h2>
        <p className="ficha_senha">
          {senha ? <>Senha <strong>{sequencia(senha.numero)}</strong></> : "Sem senha em atendimento"}
        </p>
      </div>

      {!habilitada && (
        <p className="msg msg--info">Inicie o atendimento de uma senha para preencher o registro.</p>
      )}

      <fieldset className="ficha_grupo" disabled={!habilitada}>
        <legend className="ficha_legenda">Atendimento</legend>
        <div className="ficha_campos">
          <div className="campo campo--metade">
            <label className="campo_rotulo" htmlFor="tipoAtendimento">Tipo de atendimento</label>
            <select id="tipoAtendimento" name="tipoAtendimento" className="campo_entrada" value={campos.tipoAtendimento} onChange={alterar} aria-invalid={!!erros.tipoAtendimento}>
              <option value="">Selecione</option>
              {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
            </select>
            {erros.tipoAtendimento && <p className="campo_erro" role="alert">{erros.tipoAtendimento}</p>}
          </div>

          <div className="campo campo--metade">
            <label className="campo_rotulo" htmlFor="setor">Encaminhar para</label>
            <select id="setor" name="setor" className="campo_entrada" value={campos.setor} onChange={alterar} aria-invalid={!!erros.setor}>
              <option value="">Selecione o setor</option>
              {SETORES.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
            </select>
            {erros.setor && <p className="campo_erro" role="alert">{erros.setor}</p>}
          </div>

          <div className="campo campo--inteiro">
            <label className="campo_rotulo" htmlFor="observacao">Observação (opcional)</label>
            <textarea id="observacao" name="observacao" rows={3} maxLength={200} className="campo_entrada" value={campos.observacao} onChange={alterar} />
            <p className="campo_ajuda">Não informe nome, CPF ou dados de saúde.</p>
          </div>
        </div>
      </fieldset>

      {salvo && <p className="msg msg--ok" role="status">Registro salvo com sucesso.</p>}

      <div className="ficha_rodape">
        <button type="button" className="botao botao--secundario" disabled={!habilitada} onClick={() => { setCampos(INICIAL); setErros({}); setSalvo(false); }}>
          Limpar
        </button>
        <button type="submit" className="botao botao--primario" disabled={!habilitada}>Salvar registro</button>
      </div>
    </form>
  );
}
