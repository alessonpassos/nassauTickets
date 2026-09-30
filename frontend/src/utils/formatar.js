export function formatarHora(valor) {
  if (valor instanceof Date) {
    return valor.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return valor ?? "";
}

export function horaCompleta(iso) {
  return iso
    ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";
}

export function duracao(ms) {
  if (!Number.isFinite(ms)) return "—";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)} min ${s % 60} s`;
}

export const sequencia = (numero) => numero.split("-")[1];
