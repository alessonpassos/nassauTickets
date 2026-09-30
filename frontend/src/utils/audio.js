const NOME_TIPO = { SP: "prioritária", SE: "de exames", SG: "geral" };

export function tocarSinal() {
  try {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    const ctx = new Contexto();
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.connect(ganho);
    ganho.connect(ctx.destination);
    osc.frequency.value = 880;
    ganho.gain.setValueAtTime(0.2, ctx.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
    osc.onended = () => ctx.close();
  } catch {
    /* sem áudio disponível */
  }
}

// Requisito: informar prioridade, sequencial e guichê; na repetição, "Última chamada".
export function textoChamada({ senha, tipo, guiche, ultima }) {
  const numero = Number(senha.slice(2));
  return `${ultima ? "Última chamada. " : ""}Senha ${NOME_TIPO[tipo]}, número ${numero}, guichê ${guiche}.`;
}

export function narrarChamada(chamada) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(textoChamada(chamada));
  fala.lang = "pt-BR";
  window.speechSynthesis.speak(fala);
}
