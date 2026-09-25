export default function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="rodape">
      <div className="rodape__interno">
        <p className="rodape__texto">
          {ano} NassauTickets. Projeto acadêmico de CRM hospitalar.
        </p>
        <p className="rodape__texto">Versão de demonstração</p>
      </div>
    </footer>
  );
}
