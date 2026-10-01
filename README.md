# nassauTickets — Sistema de Controle de Atendimento

Sistema de senhas para um **Laboratório de Análises Clínicas**: totem de emissão, painel de chamadas com áudio, área do atendente e relatórios para o gestor.

**Licença:** [MIT](LICENSE) · **Repositório:** https://github.com/alessonpassos/nassauTickets

## Objetivo

Controlar emissão, fila, chamada e atendimento de senhas **SP** (prioritária), **SE** (retirada de exames) e **SG** (geral), com priorização SP → SE|SG → SP → SE|SG, expediente das 7h às 17h, numeração `YYMMDD-PPSQ`, máquina de estados, relatórios e auditoria.

## Membros

| Nome                 | Matrícula | Papel                        | Área               | Responsabilidades                                                                               |
| :------------------- | :-------: | :--------------------------- | :----------------- | :---------------------------------------------------------------------------------------------- |
| Alesson Passos       | 01837765  | Desenvolvedor e Scrum Master | Frontend e Backend | Página do totem (`/totem`); painel de senhas (`/painel-de-senha`); Scrum Master de todo o projeto |
| Daniel do Nascimento | 01810958  | Desenvolvedor e Documentador | Frontend e Backend | Página de relatórios (`/relatorios`); documentação do frontend e do backend                     |
| Jefté Pedro          | 01856102  | Desenvolvedor                | Frontend e Backend | Funcionalidades de todas as páginas; banco de dados (MySQL)                                     |
| Luiz Alexandre       | 01540149  | Desenvolvedor e Testador     | Frontend e Backend | Tela de login (`/login`); área do atendente (`/atendente`); testes do backend                   |

## Tecnologias

| Camada     | Tecnologia                                 |
| :--------- | :----------------------------------------- |
| Frontend   | React 19, Vite, React Router, CSS          |
| Backend    | Node.js LTS 22, Express, `mysql2`          |
| Banco      | MySQL 8.0                                  |
| Integração | API REST JSON ([docs/api.md](docs/api.md)) |

**Por que Node.js + Express no backend?** Usa a mesma linguagem (JavaScript) do frontend React, facilitando o trabalho em grupo; Express é simples para uma API REST; `mysql2` oferece transações e `SELECT … FOR UPDATE`, necessários para tratar a concorrência entre guichês.

## Visão geral da arquitetura

```
Totem / Painel / Atendente / Gestor  →  React (Vite)  →  API REST (Express)  →  MySQL 8.0
```

Detalhes em [docs/arquitetura.md](docs/arquitetura.md).

## Estado atual do projeto

| Parte                                                            | Situação                                                          |
| :--------------------------------------------------------------- | :---------------------------------------------------------------- |
| Frontend (totem, painel com áudio, atendente, login, relatórios) | Funcional, usando `localStorage` como armazenamento               |
| Backend (chamar, repetir, fila, painel, guichês)                 | Parcial; ainda sem emissão, login, iniciar/finalizar e relatórios |
| Integração frontend ↔ backend                                    | Pendente                                                          |

Lista completa em [docs/pendencias.md](docs/pendencias.md) e rastreabilidade dos requisitos em [docs/requirements/requisitos.md](docs/requirements/requisitos.md).

## Estrutura do repositório

```
nassauTickets/
├── backend/    # API Express + MySQL
├── docs/       # branding, mer, mockups, models/uml, requirements e demais documentos
├── frontend/   # React + Vite
├── .gitignore
├── LICENSE
└── README.md
```

## Instalação e execução

Pré-requisitos: Node.js 22, Git e, para o backend, MySQL 8.0.

**Frontend** (funciona sozinho, com dados locais no navegador)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

**Backend**

1. Crie o banco e as tabelas.
2. Crie `backend/.env` com as variáveis da tabela abaixo.
3. Execute:

```bash
cd backend
npm install
npm run dev        # http://localhost:3000
```

## Configuração

| Variável                                                  | Descrição                  |
| :-------------------------------------------------------- | :------------------------- |
| `PORT`                                                    | Porta da API (padrão 3000) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexão com o MySQL        |

O CORS do backend aceita `http://localhost:5173`. Nunca versione o `.env`.

## Telas

| Rota               | Descrição                                                                               |
| :----------------- | :-------------------------------------------------------------------------------------- |
| `/totem`           | Emissão de senha (anônimo)                                                              |
| `/painel-de-senha` | Painel com as 5 últimas chamadas e áudio                                                |
| `/login`           | Login do atendente/gestor (usuários de demonstração em `frontend/src/data/usuarios.js`) |
| `/atendente`       | Chamar, chamar novamente, iniciar, finalizar e não compareceu                           |
| `/relatorios`      | Relatórios diário, mensal, detalhado e auditoria (somente gestor)                       |

## Branches

| Branch | Uso                                                  |
| :----- | :--------------------------------------------------- |
| `dev`  | Desenvolvimento; todo código é enviado primeiro aqui |
| `main` | Versão estável, atualizada por merge da `dev`        |

Padrão de commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.

## Documentação

[Índice](docs/INDICE.md) · [Requisitos](docs/requirements/requisitos.md) · [Regras de negócio](docs/regras-negocio.md) · [MER](docs/mer/mer.md) · [UML](docs/models/uml/) · [API](docs/api.md) · [Arquitetura](docs/arquitetura.md) · [Testes](docs/testes.md) · [Pendências](docs/pendencias.md)
