import { useEffect, useState } from 'react';

export function formatarHora(valor) {
  if (valor instanceof Date) {
    return valor.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return valor ?? '';
}

export default function Relogio() {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="painel__relogio">
      <time className="painel__hora" dateTime={agora.toISOString()}>
        {agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </time>
      <p className="painel__data">
        {agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </div>
  );
}