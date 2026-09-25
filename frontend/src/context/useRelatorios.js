import { useContext } from "react";
import { RelatoriosContext } from "./relatoriosContexto";

export function useRelatorios() {
  const contexto = useContext(RelatoriosContext);
  if (!contexto) {
    throw new Error("useRelatorios precisa do RelatoriosProvider");
  }
  return contexto;
}
