import Cabecalho from "../components/Cabecalho";
import Rodape from "../components/Rodape";
import SenhaAtual from "../components/SenhaAtual";
import FilaEspera from "../components/FilaEspera";
import FichaPaciente from "../components/FichaPaciente";
import InfoUsuario from "../components/InfoUsuario";
import "../styles/layout.css";
import "../styles/painelAtendente.css";

const usuario = {
  nome: "Luiz Alexandre",
  funcao: "Recepção, guichê 3",
};

const senhaAtual = {
  codigo: "SP024",
  tipo: "Exame de sangue",
  prioritaria: true,
  espera: "12 min",
};

const fila = [
  { codigo: "SP025", tipo: "Resultado", prioritaria: true, espera: "9 min" },
  { codigo: "SP026", tipo: "Resultado", prioritaria: true, espera: "3 min" },
  { codigo: "SE025", tipo: "Resultado", prioritaria: false, espera: "4 min" },
  { codigo: "SG041", tipo: "Exame", prioritaria: false, espera: "8 min" },
  { codigo: "SG042", tipo: "Exame", prioritaria: false, espera: "6 min" },
  { codigo: "SG043", tipo: "Exame", prioritaria: false, espera: "1 min" },
];

const dataHoje = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function PainelAtendente() {
  return (
    <div className="pagina">
      <Cabecalho>
        <InfoUsuario nomeUsuario={usuario.nome} funcao={usuario.funcao} />
      </Cabecalho>

      <main className="pagina__corpo">
        <div className="painel__cabecalho">
          <div>
            <h1 className="painel__titulo">Painel de atendimento</h1>
            <p className="painel__subtitulo">
              Chame as senhas e preencha a ficha de cada paciente.
            </p>
          </div>
          <p className="painel__data">{dataHoje}</p>
        </div>

        <div className="painel__grade">
          <aside className="painel__lateral">
            <SenhaAtual {...senhaAtual} />
            <FilaEspera senhas={fila} />
          </aside>

          <FichaPaciente
            senha={senhaAtual.codigo}
            usuario={usuario.nome}
            guiche="3"
          />
        </div>
      </main>

      <Rodape />
    </div>
  );
}
