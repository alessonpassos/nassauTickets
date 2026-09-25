const desenhos = {
  celular: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M10 5h4M11 19h2" /></>,
  seta: <><path d="M5 12h14m-5-5 5 5-5 5" /></>,
  voltar: <><path d="M19 12H5m5-5-5 5 5 5" /></>,
  pessoa: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  prioridade: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" /></>,
  documento: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  local: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  escudo: <><path d="M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7Z" /><path d="m8 12 3 3 5-6" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  copiar: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /></>,
  senha: <><path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4ZM15 6v2m0 3v2m0 3v2" /></>,
};

export default function IconeTotem({ nome, tamanho = 24, ...props }) {
  return <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{desenhos[nome] || desenhos.info}</svg>;
}
