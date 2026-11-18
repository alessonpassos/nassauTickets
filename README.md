# nassauTickets — Sistema de Controle de Atendimento

Sistema de senhas para um **Laboratório de Análises Clínicas**: totem de emissão, painel de chamadas com áudio, área do atendente e relatórios para o gestor.

**Licença:** [MIT](LICENSE) · **Repositório:** https://github.com/alessonpassos/nassauTickets

## Problema e público

**Problema.** Em um laboratório de análises clínicas, a fila de atendimento precisa ser organizada: pessoas com direito a prioridade não podem esperar atrás da fila geral, quem só vai retirar resultado de exame não deve ocupar o mesmo fluxo de quem vai coletar, e a gestão precisa saber quantas pessoas foram atendidas e em quanto tempo.

**Público.**

| Perfil | Como usa o sistema |
| :----- | :----------------- |
| Paciente / cliente | Retira a senha no totem (de forma anônima, sem informar dados pessoais) e acompanha a chamada no painel |
| Atendente | Faz login, escolhe o guichê, chama, repete a chamada, inicia e finaliza o atendimento ou marca "não compareceu" |
| Gestor | Faz login e consulta os relatórios diário, mensal, detalhado e de auditoria |

## Objetivo

Controlar emissão, fila, chamada e atendimento de senhas **SP** (prioritária), **SE** (retirada de exames) e **SG** (geral), com priorização SP → SE|SG → SP → SE|SG, expediente das 7h às 17h, numeração `YYMMDD-PPSQ`, máquina de estados, relatórios e auditoria. As regras estão em [docs/regras-negocio.md](docs/regras-negocio.md).

## Membros

| Nome                 | Matrícula | Papel                        | Área               | Responsabilidades                                                                               |
| :------------------- | :-------: | :--------------------------- | :----------------- | :---------------------------------------------------------------------------------------------- |
| Alesson Passos       | 01837765  | Desenvolvedor e Scrum Master | Frontend e Banco de dados | Scrum Master de todo o projeto; banco de dados (MySQL); página do totem (`/totem`); painel de senhas (`/painel-de-senha`) |
| Daniel do Nascimento | 01810958  | Desenvolvedor e Documentador | Frontend e Documentação | Página de relatórios (`/relatorios`, frontend); documentação do frontend e do backend |
| Jefté Pedro          | 01856102  | Desenvolvedor                | Backend e Frontend | Código do backend; funcionalidades das páginas |
| Luiz Alexandre       | 01540149  | Desenvolvedor e Testador     | Frontend e Testes | Tela de login (`/login`); área do atendente (`/atendente`); testes do backend |

## Contribuição de cada integrante

A divisão abaixo reproduz as responsabilidades declaradas pela equipe (tabela de membros e [docs/equipe.md](docs/equipe.md)). A evidência individual do trabalho é o histórico de commits de cada integrante na branch `dev`.

| Integrante | Contribuição declarada |
| :--------- | :--------------------- |
| Alesson Passos | Scrum Master de todo o projeto; banco de dados (MySQL); página do totem (`/totem`) e painel de senhas (`/painel-de-senha`) |
| Daniel do Nascimento | Página de relatórios (`/relatorios`, frontend); documentação do frontend e do backend |
| Jefté Pedro | Código do backend; funcionalidades das páginas |
| Luiz Alexandre | Tela de login (`/login`); área do atendente (`/atendente`); testes do backend |

## Tecnologias

| Camada     | Tecnologia                                         |
| :--------- | :------------------------------------------------- |
| Frontend   | React 19, Vite, React Router, CSS                  |
| Backend    | Node.js 22, Express 4, `mysql2`, `bcryptjs`, `jsonwebtoken` |
| Banco      | MySQL 8.0                                          |
| Integração | API REST JSON ([docs/api.md](docs/api.md))         |

**Por que Node.js + Express no backend?** Usa a mesma linguagem (JavaScript) do frontend React, facilitando o trabalho em grupo; Express é simples para uma API REST; `mysql2` oferece transações e `SELECT … FOR UPDATE`, necessários para tratar a concorrência entre guichês. Mais detalhes em [docs/tecnologias.md](docs/tecnologias.md).

## Visão geral da arquitetura

```
Totem / Painel / Atendente / Gestor  →  React (Vite)  →  API REST (Express + JWT)  →  MySQL 8.0
```

Detalhes em [docs/arquitetura.md](docs/arquitetura.md).

## Evolução da AV1 para a AV2

| Item | AV1 (dados locais) | AV2 (API e autenticação) — estado atual |
| :--- | :----------------- | :-------------------------------------- |
| Emissão de senha (`/totem`) | Numeração gerada no navegador e gravada em `localStorage` | Front envia só `{tipo}` para `POST /api/senhas`; o **servidor** gera `YYMMDD-PPSQ` com sequência diária por tipo, dentro de transação com trava |
| Painel de senhas (`/painel-de-senha`) | Lia a fila do `localStorage` | Consulta `GET /api/senhas/atual` a cada 4 s; mostra as 5 últimas chamadas, com som e narração |
| Login (`/login`) | Usuários e senhas em `frontend/src/data/usuarios.js` | `POST /api/auth/login`: senha com hash `bcrypt`, resposta com token JWT; sessão guardada sem a senha |
| Autorização | Só no front (rota protegida) | Também no servidor: middleware devolve 401 (sem token/token inválido) e 403 (perfil sem permissão) |
| Relatórios (`/relatorios`) | Calculados sobre o `localStorage` | `GET /api/relatorios/diario`, `mensal`, `detalhado` e `auditoria`, só para o gestor |
| Área do atendente (`/atendente`) | Regras de chamada no `localStorage` | Guichês da API, senha ativa por guichê e ações reais (chamar, repetir, iniciar, finalizar, não compareceu) |
| Persistência | `localStorage` / `sessionStorage` | MySQL (`usuarios`, `guiches`, `senhas`, `atendimentos`) |
| Regra de prioridade | No front | No backend (`ordemDeChamada`), SP → (SE ou SG) → SP |
| Não comparecimento | Só no front | Validado no backend: só após a 2ª chamada (409 em outro caso) |

## Dados e persistência

**Dados iniciais (versionados).** O script [`docs/mer/schema.sql`](docs/mer/schema.sql) cria o banco `nassau_tickets`, as tabelas e insere os guichês 1, 2 e 3. Usuários **não** vêm no script: são criados com `node backend/scripts/criar_usuario.js`, que grava a senha com hash `bcrypt`.

**Dados persistidos no MySQL.**

| Tabela | Conteúdo |
| :----- | :------- |
| `usuarios` | Nome, login, hash da senha, perfil (`ATENDENTE` ou `GESTOR`), ativo |
| `guiches` | Número e ativo |
| `senhas` | Código `YYMMDD-PPSQ`, tipo, sequencial, data e hora de emissão, estado, descarte |
| `atendimentos` | Senha, atendente, guichê, 1ª e 2ª chamada, início e fim do atendimento (base da auditoria) |

**Dados persistidos no navegador.** Uma única sessão no `localStorage` (`nassautickets:sessao`: `token`, `usuario` e `perfil` — nunca a senha). O `sessionStorage` é usado somente para o modo "janela de totem". A fila e a senha em atendimento são consultadas no servidor, sem cópias no navegador.

**Revisão de integração AV2.** [Guia de aplicação e validação](docs/revisao-integracao-av2.md). O [registro do atendimento](docs/registro-atendimento.md) salva tipo, encaminhamento e observação no servidor; bancos existentes precisam da migração `001-registro-atendimento.sql`. Há testes automatizados com `npm test` nas pastas `backend` e `frontend`.

**Privacidade.** O totem é anônimo: a emissão não pede nem grava nome, CPF ou qualquer dado pessoal.

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

Pré-requisitos: Node.js 22, Git e MySQL 8.0.

**1. Banco de dados**

```bash
mysql -u <usuario> -p < docs/mer/schema.sql
```

**2. Backend**

```bash
cd backend
cp .env.example .env        # preencha DB_USER, DB_PASSWORD e JWT_SECRET
npm install
node scripts/criar_usuario.js atendente1 "Nome do Atendente" <senha> ATENDENTE
node scripts/criar_usuario.js gestor1 "Nome do Gestor" <senha> GESTOR
npm run dev                 # http://localhost:3000
```

**3. Frontend**

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev                 # http://localhost:5173
```

> O backend **não sobe** sem `JWT_SECRET` definido. As requisições de exemplo para testar a API estão em [`backend/requests.http`](backend/requests.http) (extensão REST Client do VS Code).

## Configuração

| Variável | Onde | Descrição |
| :------- | :--- | :-------- |
| `PORT` | backend | Porta da API (padrão 3000) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | backend | Conexão com o MySQL (`DB_NAME=nassau_tickets`) |
| `CORS_ORIGIN` | backend | Origens do front permitidas, **separadas por vírgula** (padrão `http://localhost:5173`). Ex.: `http://localhost:5173,http://192.168.0.10:5173` para o totem aberto por IP de rede |
| `JWT_SECRET` | backend | Segredo de assinatura do token (obrigatório) |
| `JWT_EXPIRES_IN` | backend | Validade do token (padrão `8h`) |
| `VITE_API_URL` | frontend | URL-base da API (padrão `http://localhost:3000/api`) |

Nunca versione o `.env` (já está no `.gitignore`); só os `.env.example` vão para o repositório.

## Telas

| Rota               | Acesso | Descrição |
| :----------------- | :----- | :-------- |
| `/`                | Público | Entrada com atalhos para as telas |
| `/totem`           | Público (anônimo) | Emissão de senha |
| `/painel-de-senha` | Público | Painel com as 5 últimas chamadas e áudio |
| `/login`           | Público | Login de atendente ou gestor (validado na API) |
| `/atendente`       | Atendente e gestor | Chamar, chamar novamente, iniciar, finalizar e não compareceu |
| `/relatorios`      | Somente gestor | Relatórios diário, mensal, detalhado e auditoria |

## Contrato da API (resumo)

Base: `http://localhost:3000/api`. Erros no formato `{ "erro": "mensagem" }`. Autenticação por `Authorization: Bearer <token>`. Contrato completo, com exemplos de corpo e resposta, em [docs/api.md](docs/api.md).

| Método | Endpoint | Acesso |
| :----- | :------- | :----- |
| GET | `/health` | Público (503 se o banco cair) |
| POST | `/auth/login` | Público |
| GET | `/guiches` | Público |
| POST | `/senhas` | Público (totem) |
| GET | `/senhas/atual` | Público (painel) |
| GET | `/senhas/fila` | Atendente e gestor |
| POST | `/senhas/chamar`, `/senhas/repetir` | Atendente |
| POST | `/senhas/iniciar`, `/senhas/finalizar`, `/senhas/nao-compareceu` | Atendente |
| GET | `/relatorios/diario`, `/mensal`, `/detalhado`, `/auditoria` | Gestor |

## Decisões

| Decisão | Motivo |
| :------ | :----- |
| Numeração e prioridade no **servidor** | O front não pode ser fonte de verdade: dois guichês ou dois totens gerariam números repetidos |
| Transação + `GET_LOCK` + `SELECT … FOR UPDATE` na emissão e na chamada | Evita duas chamadas devolverem a mesma senha e dois pedidos gerarem o mesmo código |
| JWT com `bcrypt` e perfis `ATENDENTE`/`GESTOR` | Autenticação simples, sem estado no servidor; a autorização é conferida em cada rota |
| `atendente_id` vem do **token**, não do corpo da requisição | O cliente não consegue chamar senha em nome de outro atendente |
| Auditoria derivada da tabela `atendimentos` | Já guarda atendente, guichê, 1ª/2ª chamada, início e fim; evita tabela duplicada |
| Adaptador `traduzirSenha` no front | O back usa `codigo`, `status`, `emitida_em`; o front usa `numero`, `estado`, `emitidaEm` |
| Segredos só em `.env` | `.env.example` versionado, `.env` ignorado |

## Limitações e contingência

**Limitações conhecidas** (lista completa e atualizada em [docs/pendencias.md](docs/pendencias.md)):

- O expediente (7h–17h) **ainda não é verificado no backend**; o front do Totem bloqueia fora de 7h–17h.
- O descarte das senhas que sobram às 17h ainda não é feito por rotina; os relatórios apenas tratam como descartadas as senhas em espera de dias anteriores.
- Ainda não há `helmet` nem limite de tentativas de login.
- O registro do atendimento depende da migração `docs/mer/migrations/001-registro-atendimento.sql`; a validação com MySQL/MariaDB real continua necessária.

**Contingência quando o backend ou o banco caem.**

| Situação | Comportamento atual |
| :------- | :------------------ |
| Banco indisponível | `GET /api/health` responde 503; rotas respondem erro genérico, sem expor detalhes internos |
| API fora do ar (totem) | O totem exibe a mensagem de erro e não emite senha |
| API fora do ar (painel) | O painel mantém o último estado exibido e mostra a mensagem de erro, tentando de novo a cada 4 s |
| Token expirado ou inválido (401) | A sessão é limpa e o usuário volta para `/login` |
| Sem permissão (403) | A tela de relatórios redireciona para a página inicial |

Ainda **não há** dados locais de contingência nem botão "Tentar novamente" nas telas; está registrado como pendência.

## Uso de IA

O registro de uso de inteligência artificial pela equipe está em [docs/equipe.md](docs/equipe.md#uso-de-inteligência-artificial).

## Branches e entregas

| Branch | Uso                                                  |
| :----- | :--------------------------------------------------- |
| `dev`  | Desenvolvimento; todo código é enviado primeiro aqui |
| `main` | Versão estável, atualizada por merge da `dev`        |

As entregas são marcadas com as tags `entrega-av1` e `entrega-av2`, criadas no commit final de cada fase. Padrão de commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.

## Documentação

[Índice](docs/Indice.md) · [Requisitos (PDF)](docs/requirements/requisitos.pdf) · [Regras de negócio](docs/regras-negocio.md) · [MER (diagrama)](docs/mer/diagrama-entidade-relacionamento.png) · [Script SQL](docs/mer/schema.sql) · [UML (PDF)](docs/models/uml/diagramas.pdf) · [Mockups (PDF)](docs/mockups/mockups.pdf) · [API](docs/api.md) · [Arquitetura](docs/arquitetura.md) · [Backend](docs/backend.md) · [Frontend](docs/frontend.md) · [Testes](docs/testes.md) · [Pendências](docs/pendencias.md)
