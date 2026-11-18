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

export const sequencia = (numero) => String(numero ?? "").split("-").at(-1);

export function dataHoraCompleta(iso) {
  if (!iso) return "—";
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? "—" : data.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "medium",
  });
}
