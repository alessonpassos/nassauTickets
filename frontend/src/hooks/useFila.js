import { useMemo, useSyncExternalStore } from "react";
import { assinar, interpretar, lerBruto } from "../services/filaService";

export default function useFila() {
  const bruto = useSyncExternalStore(assinar, lerBruto);
  return useMemo(() => interpretar(bruto), [bruto]);
}
