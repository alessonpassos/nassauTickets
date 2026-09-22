# MedSync Squad — CRM Hospitalar (nassauTickets)

A equipe **MedSync Squad** (4 integrantes) desenvolve um **CRM Hospitalar** para organizar o fluxo de informações entre recepção, corpo clínico e pacientes.

O **MedSync** cobre totem de senhas, painel de chamadas, área do atendente e, quando previsto, relatórios. O back-end controla emissão, fila, prioridade e atendimento para laboratório de análises clínicas.

**Status:** em desenvolvimento  
**Licença:** [MIT](LICENSE)  
**Repositório:** [github.com/alessonpassos/nassauTickets](https://github.com/alessonpassos/nassauTickets)

Documentação completa: pasta **[docs/](docs/INDICE.md)**.

---

## Problema e objetivo

Informações desorganizadas entre recepção, profissionais e pacientes: dificuldade para emitir senha, acompanhar o painel e registrar o atendimento no guichê.

**Objetivo:** aplicação web (React + API Node.js) que centraliza esse fluxo na interface e na persistência.

| Público | Papel |
| ------- | ----- |
| Recepção | Totem e orientação ao painel |
| Atendente / corpo clínico | Login, chamada e atendimento no guichê |
| Pacientes | Senha no totem e acompanhamento no painel |
| Gestor | Relatórios (se a tela existir) |

---

## Equipe

### Front-end

No front-end, **todos desenvolvem**.

| Nome | Matrícula | Atribuição |
| ---- | --------- | ---------- |
| Alesson Passos | 01837765 | Desenvolvedor |
| Daniel do Nascimento | 01810958 | Desenvolvedor |
| Jefté Pedro | 01856102 | Desenvolvedor |
| Luiz Alexandre | 01540149 | Desenvolvedor |

### Back-end

| Nome | Matrícula | Atribuição |
| ---- | --------- | ---------- |
| Alesson Passos | 01837765 | Scrum Master & Desenvolvedor |
| Daniel do Nascimento | 01810958 | Documentador & Tester |
| Jefté Pedro | 01856102 | Desenvolvedor |
| Luiz Alexandre | 01540149 | Tester |

---

## O que o projeto vai usar

| Camada | Stack prevista |
| ------ | -------------- |
| Front-end | React, JavaScript, Vite, React Router, CSS, `fetch` |
| Back-end | Node.js LTS 22, Express, MySQL 8.0 |
| Integração | API REST JSON |
| Versionamento | Git / GitHub |

Detalhes: [docs/tecnologias.md](docs/tecnologias.md).

---

## Regras em resumo

- Senhas **SP** (prioritária), **SE** (exames), **SG** (geral).
- Prioridade: **SP → SE|SG → SP → SE|SG**.
- Numeração **`YYMMDD-PPSQ`**, sequência diária.
- Expediente **07:00–17:00**.
- Painel: **5 últimas** chamadas.
- Cliente no totem **sem login**.

Detalhes: [docs/regras-negocio.md](docs/regras-negocio.md).

---

## Estrutura do repositório

```
nassauTickets/
├── README.md
├── LICENSE
├── docs/                 # documentação (índice: INDICE.md)
├── front-end/            # interface React (esqueleto)
└── back-end/             # API Node.js (esqueleto + pastas de artefatos)
```

Ainda não há `package.json` nem código da aplicação versionado. Pastas `front-end/` e `back-end/` são o esqueleto.

---

## Como executar (quando o código existir)

**Front-end**

```bash
cd front-end
npm install
npm run dev
```

**Back-end**

```bash
cd back-end
npm install
npm run dev
```

Variáveis: ver [docs/tecnologias.md](docs/tecnologias.md). Não versionar `.env`.

---

## Documentação

| Documento | Conteúdo |
| --------- | -------- |
| [docs/INDICE.md](docs/INDICE.md) | Índice da documentação |
| [Tecnologias](docs/tecnologias.md) | Ferramentas e versões previstas |
| [Arquitetura](docs/arquitetura.md) | Camadas e pastas |
| [Regras de negócio](docs/regras-negocio.md) | Fila, estados, expediente |
| [API](docs/api.md) | Endpoints REST previstos |
| [Front-end](docs/frontend.md) | Equipe (todos desenvolvem), telas e checklist |
| [Back-end](docs/backend.md) | Equipe, banco, concorrência, relatórios |

---

## Licença

Este projeto está sob a licença **MIT**. Copyright (c) 2026 Alesson Passos.
