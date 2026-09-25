export default function FichaPaciente({ senha }) {
  function aoSalvar(evento) {
    evento.preventDefault();
  }

  return (
    <form className="ficha" onSubmit={aoSalvar}>
      <div className="ficha__cabecalho">
        <h2 className="ficha__titulo">Ficha do paciente</h2>
        <p className="ficha__senha">
          Senha <strong>{senha}</strong>
        </p>
      </div>

      {/* ---------- Dados pessoais ---------- */}
      <fieldset className="ficha__grupo">
        <legend className="ficha__legenda">Dados pessoais</legend>

        <div className="ficha__campos">
          <div className="campo campo--dois-tercos">
            <label className="campo__rotulo" htmlFor="nome">
              Nome completo
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              className="campo__entrada"
              autoComplete="off"
            />
          </div>

          <div className="campo">
            <label className="campo__rotulo" htmlFor="nascimento">
              Data de nascimento
            </label>
            <input
              id="nascimento"
              name="nascimento"
              type="date"
              className="campo__entrada"
            />
          </div>

          <div className="campo campo--metade">
            <label className="campo__rotulo" htmlFor="cpf">
              CPF
            </label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              className="campo__entrada"
              autoComplete="off"
            />
          </div>

          <div className="campo campo--metade">
            <label className="campo__rotulo" htmlFor="cartaoSus">
              Cartão SUS
            </label>
            <input
              id="cartaoSus"
              name="cartaoSus"
              type="text"
              inputMode="numeric"
              className="campo__entrada"
              autoComplete="off"
            />
          </div>

          <div className="campo">
            <label className="campo__rotulo" htmlFor="sexo">
              Sexo
            </label>
            <select id="sexo" name="sexo" className="campo__entrada" defaultValue="">
              <option value="" disabled>
                Selecione
              </option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className="campo campo--dois-tercos">
            <label className="campo__rotulo" htmlFor="telefone">
              Telefone
            </label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              className="campo__entrada"
              autoComplete="off"
            />
          </div>
        </div>
      </fieldset>

      {/* ---------- Atendimento ---------- */}
      <fieldset className="ficha__grupo">
        <legend className="ficha__legenda">Atendimento</legend>

        <div className="ficha__campos">
          <div className="campo campo--metade">
            <label className="campo__rotulo" htmlFor="tipoAtendimento">
              Tipo de atendimento
            </label>
            <select
              id="tipoAtendimento"
              name="tipoAtendimento"
              className="campo__entrada"
              defaultValue=""
            >
              <option value="" disabled>
                Selecione
              </option>
              <option value="consulta">Consulta</option>
              <option value="retorno">Retorno</option>
              <option value="exame">Exame</option>
              <option value="vacinacao">Vacinação</option>
            </select>
          </div>

          <div className="campo campo--metade">
            <label className="campo__rotulo" htmlFor="setor">
              Encaminhar para
            </label>
            <select id="setor" name="setor" className="campo__entrada" defaultValue="">
              <option value="" disabled>
                Selecione o setor
              </option>
              <option value="cardiologia">Cardiologia</option>
              <option value="clinica-geral">Clínica geral</option>
              <option value="dermatologia">Dermatologia</option>
              <option value="endocrinologia">Endocrinologia</option>
              <option value="ginecologia">Ginecologia</option>
              <option value="laboratorio">Laboratório</option>
              <option value="neurologia">Neurologia</option>
              <option value="oftalmologia">Oftalmologia</option>
              <option value="ortopedia">Ortopedia</option>
              <option value="pediatria">Pediatria</option>
              <option value="psiquiatria">Psiquiatria</option>
              <option value="urologia">Urologia</option>
            </select>
          </div>

          <div className="campo campo--inteiro">
            <span className="campo__rotulo" id="prioridade-rotulo">
              Prioridade
            </span>
            <div className="opcoes" role="radiogroup" aria-labelledby="prioridade-rotulo">
              <label className="opcao">
                <input type="radio" name="prioridade" value="normal" defaultChecked />
                Normal
              </label>
              <label className="opcao">
                <input type="radio" name="prioridade" value="prioritario" />
                Prioritário
              </label>
            </div>
            <p className="campo__ajuda">
              Use prioritário para idosos, gestantes e pessoas com deficiência.
            </p>
          </div>
        </div>
      </fieldset>
      
      <div className="ficha__rodape">
        <button type="reset" className="botao botao--secundario">
          Limpar ficha
        </button>
        <button type="submit" className="botao botao--primario">
          Salvar ficha
        </button>
      </div>
    </form>
  );
}
