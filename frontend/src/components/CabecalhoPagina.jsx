const dataHoje = () =>
  new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

// Título + subtítulo + data, reutilizado por Atendimento e Relatórios.
export default function CabecalhoPagina({ titulo, subtitulo, children }) {
  return (
    <div className="atend_cabecalho">
      <div>
        <h1 className="atend_titulo">{titulo}</h1>
        <p className="atend_subtitulo">{subtitulo}</p>
      </div>
      {children}
      <p className="atend_data">{dataHoje()}</p>
    </div>
  );
}
