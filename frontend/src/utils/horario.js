import { TOTEM } from "../data/totem.js";

// Dia (YYMMDD) e expediente no fuso de Brasília. Usado por totem, atendente e relatórios.
export function horarioTotem(agora = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TOTEM.fusoHorario,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(agora)
      .map(({ type, value }) => [type, value]),
  );
  return {
    dia: `${partes.year.slice(-2)}${partes.month}${partes.day}`,
    aberto:
      Number(partes.hour) >= TOTEM.abertura &&
      Number(partes.hour) < TOTEM.encerramento,
  };
}
