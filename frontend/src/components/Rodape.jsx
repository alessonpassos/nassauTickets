export default function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="rodape">
      <div className="rodape_interno">
        <p className="rodape_texto">
          {ano} NassauTickets. Projeto acadêmico — controle de atendimento.
        </p>
        <p className="rodape_texto">Versão de demonstração</p>
      </div>
    </footer>
  );
}
