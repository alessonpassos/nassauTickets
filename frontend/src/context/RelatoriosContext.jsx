import { useCallback, useEffect, useState } from "react";
import { RelatoriosContext } from "./relatoriosContexto";

const CHAVE = "nassau-relatorios";

const diarioInicial = {
  emitidas: 148,
  atendidas: 132,
  naoCompareceu: 9,
  descartadas: 7,
  tempoMedio: "6 min",
  porTipo: [
    { tipo: "SP", rotulo: "Prioritária", emitidas: 42, atendidas: 38 },
    { tipo: "SE", rotulo: "Exames", emitidas: 31, atendidas: 29 },
    { tipo: "SG", rotulo: "Geral", emitidas: 75, atendidas: 65 },
  ],
};

const mensalInicial = {
  emitidas: 3120,
  atendidas: 2894,
  naoCompareceu: 148,
  descartadas: 78,
  tempoMedio: "7 min",
  porTipo: [
    { tipo: "SP", rotulo: "Prioritária", emitidas: 890, atendidas: 812 },
    { tipo: "SE", rotulo: "Exames", emitidas: 640, atendidas: 611 },
    { tipo: "SG", rotulo: "Geral", emitidas: 1590, atendidas: 1471 },
  ],
};

const auditoriaInicial = [
  {
    hora: "16:42",
    senha: "260925-SP018",
    acao: "Atendimento finalizado",
    guiche: "3",
    usuario: "Marina Duarte",
  },
  {
    hora: "16:38",
    senha: "260925-SG041",
    acao: "Não compareceu",
    guiche: "1",
    usuario: "João Mendes",
  },
  {
    hora: "16:31",
    senha: "260925-SE012",
    acao: "Chamada novamente",
    guiche: "2",
    usuario: "Ana Ribeiro",
  },
  {
    hora: "16:22",
    senha: "260925-SP017",
    acao: "Atendimento iniciado",
    guiche: "3",
    usuario: "Marina Duarte",
  },
  {
    hora: "16:18",
    senha: "260925-SG040",
    acao: "Senha chamada",
    guiche: "1",
    usuario: "João Mendes",
  },
];

function estadoInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo);
  } catch {
    /* ignora */
  }
  return {
    diario: diarioInicial,
    mensal: mensalInicial,
    auditoria: auditoriaInicial,
  };
}

function somarTipo(resumo, codigoTipo) {
  return {
    ...resumo,
    emitidas: resumo.emitidas + 1,
    atendidas: resumo.atendidas + 1,
    porTipo: resumo.porTipo.map((linha) =>
      linha.tipo === codigoTipo
        ? { ...linha, emitidas: linha.emitidas + 1, atendidas: linha.atendidas + 1 }
        : linha
    ),
  };
}

function tipoSenhaRelatorio({ senha, codigo, prioridade, tipoAtendimento }) {
  const numero = String(senha || codigo || "");
  if (prioridade === "prioritario" || numero.startsWith("P")) {
    return "SP";
  }
  if (tipoAtendimento === "exame") return "SE";
  return "SG";
}

export function RelatoriosProvider({ children }) {
  const [dados, setDados] = useState(estadoInicial);

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  }, [dados]);

  useEffect(() => {
    function aoStorage(evento) {
      if (evento.key === CHAVE && evento.newValue) {
        setDados(JSON.parse(evento.newValue));
      }
    }
    window.addEventListener("storage", aoStorage);
    return () => window.removeEventListener("storage", aoStorage);
  }, []);

  const registrarCadastro = useCallback((entrada) => {
    const tipo = tipoSenhaRelatorio(entrada);
    const hora = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const id = `${Date.now()}-${entrada.senha}`;

    setDados((atual) => {
      const repetido = atual.auditoria.some(
        (evento) =>
          evento.acao === "Ficha salva" &&
          evento.senha === entrada.senha &&
          evento.hora === hora
      );
      if (repetido) return atual;

      return {
        diario: somarTipo(atual.diario, tipo),
        mensal: somarTipo(atual.mensal, tipo),
        auditoria: [
          {
            id,
            hora,
            senha: entrada.senha,
            acao: "Ficha salva",
            guiche: entrada.guiche || "3",
            usuario: entrada.usuario || "Marina Duarte",
          },
          ...atual.auditoria,
        ],
      };
    });
  }, []);

  return (
    <RelatoriosContext.Provider value={{ ...dados, registrarCadastro }}>
      {children}
    </RelatoriosContext.Provider>
  );
}
