# nassauTickets

Sistema de controle de atendimento por senhas para um Laboratório de Análises Clínicas: totem de emissão, painel de chamadas, terminal do atendente e relatórios do gestor.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Licença](https://img.shields.io/badge/licença-MIT-green)

| Informação | Detalhe |
|------------|---------|
| Status | Em desenvolvimento: front-end (totem e telas) e back-end (API + MySQL) iniciados |
| Repositório | github.com/alessonpassos/nassauTickets |
| Licença | MIT (arquivo `LICENSE`) |
| Documentação | `docs/` |

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Objetivo](#objetivo)
- [Problema e público](#problema-e-público)
- [Membros](#membros)
- [Funcionalidades](#funcionalidades)
- [Rotas da aplicação](#rotas-da-aplicação)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Regras de negócio](#regras-de-negócio)
- [Requisitos](#requisitos)
- [Dados e persistência](#dados-e-persistência)
- [Instalação](#instalação)
- [Execução](#execução)
- [Configuração](#configuração)
- [Branches e fluxo de trabalho](#branches-e-fluxo-de-trabalho)
- [Limitações e contingência](#limitações-e-contingência)
- [Uso de inteligência artificial](#uso-de-inteligência-artificial)
- [Entregas e tags](#entregas-e-tags)
- [Documentação do projeto](#documentação-do-projeto)
- [Licença](#licença)

## Sobre o projeto

O **nassauTickets** organiza o atendimento ao usuário por meio de uma fila com priorização. O cliente retira uma senha no totem e aguarda ser chamado no painel. O atendente aciona a chamada, atende no guichê e encerra o atendimento.

O sistema trabalha com três agentes (AS, AA e AC), três tipos de senha (SP, SE e SG), numeração diária no padrão `YYMMDD-PPSQ`, expediente de 07h às 17h, relatórios diário e mensal, tempo médio de atendimento e trilha de auditoria.

| Agente | Sigla | Responsabilidade |
|--------|-------|------------------|
| Agente Sistema | AS | Executa as ações do sistema, comunica-se com o banco de dados, emite senhas, atualiza o painel e responde aos demais agentes |
| Agente Atendente | AA | Chama o próximo da fila e realiza o atendimento no guichê |
| Agente Cliente | AC | Emite a senha no totem, aguarda a chamada no painel e se dirige ao guichê indicado, de forma anônima |

## Objetivo

Centralizar o fluxo de atendimento do laboratório em uma aplicação web, eliminando o controle manual da fila:

- emitir e numerar senhas de forma única e automática;
- respeitar a priorização `SP → SE|SG → SP → SE|SG`, sem permitir que dois guichês recebam a mesma senha;
- controlar os estados de cada senha, da emissão até o atendimento ou o abandono;
- oferecer relatórios de volume, tempo médio e auditoria das chamadas;
- atender aos requisitos de segurança, disponibilidade, desempenho, concorrência, LGPD e acessibilidade.

## Problema e público

Laboratórios de análises clínicas sofrem com filas desorganizadas e controle manual de senhas. O nassauTickets automatiza a emissão, a priorização e a chamada, e gera relatórios para a gestão.

| Público | Necessidade |
|---------|-------------|
| Cliente (AC) | Emitir senha no totem sem se identificar e acompanhar a chamada no painel |
| Atendente (AA) | Autenticar-se, chamar, iniciar e finalizar atendimentos no guichê |
| Gestor | Consultar relatórios e manter os cadastros (mesmo usuário atendente, com perfil adicional) |
| Recepção | Apoiar o cliente no totem e no painel |

## Membros

Grupo: MedSync Squad

| Nome | Matrícula | Papel |
|------|-----------|-------|
| Alesson Passos | 01837765 | Scrum Master |
| Daniel do Nascimento | 01810958 | Documentador |
| Jefté Pedro | 01856102 | Desenvolvedor |
| Luiz Alexandre | 01540149 | Testador |

### Contribuição individual

| Integrante | Contribuição |
|------------|--------------|
| Alesson Passos | PREENCHER: o que fez de fato (ex.: repositório, branches, API Express, transação de chamada) |
| Daniel do Nascimento | PREENCHER: o que fez de fato (ex.: requisitos, MER, UML, README) |
| Jefté Pedro | PREENCHER: o que fez de fato (ex.: totem, painel, serviços de fila) |
| Luiz Alexandre | PREENCHER: o que fez de fato (ex.: testes da máquina de estados, validação das regras) |

## Funcionalidades

- Totem anônimo com emissão de senha SP, SE e SG, numeradas no padrão `YYMMDD-PPSQ` com sequência diária por tipo.
- Fila com prioridade `SP → SE|SG → SP → SE|SG`.
- Painel público com a chamada atual e as 5 últimas senhas chamadas, sem exibir a próxima, com áudio da chamada.
- Terminal do atendente: chamar, chamar novamente ("Última chamada"), iniciar, finalizar e marcar não comparecimento.
- Máquina de estados com os 7 estados da senha.
- Relatórios: quantitativos, detalhado, tempo médio de atendimento e auditoria.
- Login do atendente e do gestor, com rotas protegidas por perfil.

**Funcionalidade vertical adicional (equipe de 4 integrantes):** PREENCHER: escolher e descrever uma (ex.: relatórios com filtros por período, painel de indicadores ou operação degradada com recuperação após falha da API).

## Rotas da aplicação

| Rota | Tela | Acesso |
|------|------|--------|
| `/` | Início | Público |
| `/login` | Login do atendente | Público |
| `/atendente` | Terminal do atendente (chamar, iniciar, finalizar, chamar novamente) | Atendente e gestor |
| `/painel-de-senha` | Painel público de chamadas (5 últimas) | Público |
| `/relatorios` | Relatórios | Gestor |
| `/totem` e `/totem/retirar` | Totem de emissão (janela própria; no modo totem, `/` também abre o totem) | Público, anônimo |

## Tecnologias utilizadas

| Camada | Tecnologia | Versão | Uso |
|--------|------------|--------|-----|
| Front-end | React | 19 | Componentes, páginas, estado, `useState`/`useEffect` |
| Front-end | Vite | 8 | Servidor de desenvolvimento e build |
| Front-end | React Router | 7 | Rotas e navegação |
| Front-end | qrcode | 1.5 | QR Code do totem gerado localmente |
| Front-end | CSS e `fetch` | n/a | Estilos, layout responsivo e consumo da API |
| Back-end | Node.js LTS | 22 | Runtime da API |
| Back-end | Express | 4 | Rotas REST em JSON |
| Back-end | mysql2 (pool) | 3 | Acesso ao MySQL com transações |
| Back-end | dotenv, cors, morgan, cookie-parser | n/a | Configuração, CORS, logs e cookies |
| Banco de dados | MySQL | 8.0 | Senhas, atendimentos, guichês e auditoria |
| Versionamento | Git / GitHub | n/a | Branches `main` e `dev` |

### Por que Node.js + Express no back-end

| Critério | Justificativa |
|----------|---------------|
| Uma linguagem | JavaScript no front-end e no back-end, reduzindo troca de contexto e reaproveitando a formação da equipe |
| Express + JSON | API REST enxuta, integração direta com o `fetch` do React |
| MySQL sem ORM | O pool `mysql2` permite transações explícitas e `SELECT … FOR UPDATE`, necessários para que dois atendentes não recebam a mesma senha |
| Curva de entrega | Menor tempo de configuração e de execução local do que Spring Boot, mantendo a organização de camadas exigida |

## Arquitetura

```
Cliente no totem (AC)            Atendente (AA) / Gestor
        |                                  |
        |  QR Code / formulário            |  login + painel
        v                                  v
                 Front-end React 19 (Vite, React Router)
                              |
                     fetch (HTTP JSON, CORS)
                              v
              API REST Node.js 22 + Express (backend/)
                              |
                 pool mysql2 (transações, locks)
                              v
                        MySQL 8.0
```

| Camada | Responsabilidade |
|--------|------------------|
| Totem / painel | Emissão anônima de senha e exibição das 5 últimas chamadas |
| Área do atendente | Login, chamar, chamar novamente, iniciar e finalizar atendimento |
| Front-end React | Telas, estados de interface, áudio e validação de formulários |
| API REST | Regras de fila e prioridade, numeração, estados, relatórios e auditoria |
| MySQL 8.0 | Persistência e concorrência (uma senha por chamada) |

## Estrutura do repositório

```
nassauTickets/
├── backend/
│   ├── app.js              # aplicação Express (CORS, rotas, tratamento de erros)
│   ├── bin/www             # servidor HTTP (porta via PORT, padrão 3000)
│   ├── config/database.js  # pool MySQL com variáveis de ambiente
│   ├── routes/             # index (health), senhas, guiches, users
│   └── package.json
├── docs/
│   ├── branding/           # identidade visual
│   ├── mer/                # modelo entidade-relacionamento
│   ├── mockups/            # mockups e protótipos
│   ├── models/uml/         # diagramas UML
│   └── requirements/       # requisitos, regras de negócio e casos de uso
├── frontend/
│   ├── src/                # components, pages, services, hooks, data, styles, utils
│   ├── index.html, vite.config.js
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

Diretórios ainda vazios em `docs/` são mantidos no Git com um arquivo `.gitkeep`.

## Regras de negócio

### Tipos de senha

| Sigla | Tipo | Prioridade | Tempo médio de atendimento (TM) |
|-------|------|------------|---------------------------------|
| SP | Senha Prioritária | Maior | 15 min ± 5 min |
| SE | Retirada de Exames | Operacional especial: chamada sempre após uma SP | 1 min em 95% dos casos e 5 min em 5% |
| SG | Senha Geral | Menor | 5 min ± 3 min |

Não existem guichês especializados: qualquer guichê atende qualquer tipo de senha.

### Priorização

```
[SP] -> [SE|SG] -> [SP] -> [SE|SG] -> ...
```

```
proximaSenha(ultimoGrupo):
    ordem = ultimoGrupo == "SP" ? [SE, SG, SP] : [SP, SE, SG]
    para tipo em ordem:
        senha = primeira senha AGUARDANDO do tipo (ordem de emissão)
        se senha existir: retornar senha
    retornar nenhuma senha disponível
```

### Numeração

`YYMMDD-PPSQ`: ano, mês e dia da emissão (2 dígitos cada), `PP` = tipo (SP, SE, SG) e `SQ` = sequência por tipo, com 3 dígitos e reinício diário. Exemplos: `260917-SP001`, `260917-SE014`, `260917-SG001`.

### Expediente

- Início às 07:00 e encerramento às 17:00.
- Atendimentos já iniciados são concluídos e encerrados pelo atendente.
- Ao final do expediente, as senhas que sobraram na fila são descartadas.

### Máquina de estados da senha

```
EMITIDA -> AGUARDANDO -> CHAMADA -> CHAMADA_NOVAMENTE -> EM_ATENDIMENTO -> ATENDIDA
                              \--> NÃO_COMPARECEU (após duas chamadas sem comparecimento)
```

| Estado | Descrição |
|--------|-----------|
| EMITIDA | Senha recém-criada no totem |
| AGUARDANDO | Na fila, aguardando chamada |
| CHAMADA | Primeira chamada realizada |
| CHAMADA_NOVAMENTE | Segunda chamada (áudio precedido de "Última chamada") |
| EM_ATENDIMENTO | Atendimento iniciado no guichê |
| ATENDIDA | Atendimento finalizado |
| NÃO_COMPARECEU | Cliente não compareceu após as duas chamadas |

### Painel, áudio e login

- O painel exibe as 5 últimas senhas chamadas e nunca a próxima.
- O áudio informa tipo, número e guichê; "Chamar Novamente" repete o áudio precedido de "Última chamada".
- O login é usado apenas pelo atendente; um único atendente tem perfil adicional de gestor. O cliente interage anonimamente, somente pelo totem.

### Relatórios e auditoria

| Relatório | Conteúdo |
|-----------|----------|
| Diário e mensal | Senhas emitidas e atendidas, no total e por prioridade |
| Detalhado | Número, tipo, data/hora da emissão, data/hora do atendimento e guichê (campos de atendimento em branco para senhas não atendidas) |
| Tempo médio (TM) | Tempo médio por tipo de senha |
| Auditoria | Atendente, guichê, senha, 1ª chamada, 2ª chamada (se houver), início e finalização |

### Concorrência

Se dois atendentes pedirem a próxima senha ao mesmo tempo, o sistema decide para quem vai o atendimento sem entregar a mesma senha duas vezes. A chamada usa transação MySQL com `SELECT … FOR UPDATE` (`POST /api/senhas/chamar`).

## Requisitos

### Funcionais

| Código | Requisito |
|--------|-----------|
| RF01 | Emitir senha no totem de forma anônima, com escolha do tipo (SP, SE, SG) |
| RF02 | Numerar as senhas no padrão `YYMMDD-PPSQ` |
| RF03 | Manter filas independentes por tipo, respeitando o ciclo de priorização |
| RF04 | Permitir ao atendente chamar a próxima senha e indicar o guichê |
| RF05 | Permitir iniciar o atendimento da senha chamada |
| RF06 | Permitir finalizar o atendimento |
| RF07 | Permitir chamar novamente a senha, com "Última chamada" |
| RF08 | Marcar como NÃO_COMPARECEU a senha sem comparecimento após duas chamadas |
| RF09 | Descartar senhas não atendidas sem executar o atendimento |
| RF10 | Controlar o expediente (07:00 às 17:00) |
| RF11 | Publicar no painel as 5 últimas senhas chamadas, sem exibir a próxima |
| RF12 | Emitir áudio da chamada com prioridade, senha e guichê |
| RF13 | Autenticar atendente e gestor; manter o totem anônimo |
| RF14 | Gerar relatórios diário e mensal com os quatro quantitativos |
| RF15 | Gerar relatório detalhado das senhas |
| RF16 | Gerar relatório de tempo médio de atendimento |
| RF17 | Gerar relatório de auditoria |
| RF18 | Permitir ao gestor manter os cadastros (atendentes e guichês) |
| RF19 | Controlar os sete estados da senha |

### Não funcionais

| Código | Requisito | Aplicação |
|--------|-----------|-----------|
| RNF01 | Segurança | Autenticação, autorização por perfil, hash de senha, validação de entrada, consultas parametrizadas, CORS restrito, `.env` fora do versionamento |
| RNF02 | Disponibilidade | Tratamento de erro do MySQL, resposta 503 e comportamento definido para front-end e painel |
| RNF03 | Auditoria | Registro persistente de atendente, guichê, senha e horários |
| RNF04 | Desempenho | Índices por tipo/estado/data, consultas com `LIMIT`, pool de conexões |
| RNF05 | Concorrência | Transações e locks: uma senha por chamada |
| RNF06 | LGPD | Minimização de dados, totem anônimo, sem dados clínicos, acesso restrito por perfil |
| RNF07 | Acessibilidade | HTML semântico, contraste, foco visível, texto além do áudio, layout responsivo |
| RNF08 | Stack | Node.js 22, Express, MySQL 8.0, React 19 |
| RNF09 | Integração | API REST em JSON consumida via `fetch` |
| RNF10 | Usabilidade | Estados de carregamento, sucesso, vazio, erro e nova tentativa |

## Dados e persistência

Hoje a "base de dados" do front-end é o armazenamento do navegador. Dados iniciais são os arquivos em `src/data/`; os dados persistidos são os criados durante o uso.

| Chave / arquivo | Onde | Conteúdo |
|-----------------|------|----------|
| `src/data/totem.js`, `src/data/usuarios.js` | Código (dados iniciais) | Tipos de senha, identificação do totem e usuários de demonstração |
| `nassautickets:fila:v1` | `localStorage` | Fila compartilhada por todas as telas: `{ senhas: [], ultimoGrupo }` |
| `nassautickets:totem:demo:v1` | `localStorage` | Contadores diários do totem |
| `nassautickets:sessao` | `sessionStorage` | Sessão do atendente: nome, função e perfil (a senha nunca é gravada) |
| `nassautickets:janela:totem` | `sessionStorage` | Marca a janela como "modo totem" |

Objeto de senha gravado na fila:

```json
{
  "numero": "260930-SP001",
  "tipo": "SP",
  "estado": "AGUARDANDO",
  "emitidaEm": "2026-09-30T13:05:00.000Z",
  "totemId": "recepcao-01",
  "guiche": 2,
  "atendente": "Marina Duarte",
  "chamadas": ["2026-09-30T13:07:12.000Z"],
  "iniciadaEm": "2026-09-30T13:07:40.000Z",
  "finalizadaEm": "2026-09-30T13:20:05.000Z"
}
```

A numeração e o expediente são calculados no fuso `America/Sao_Paulo`. Os dados do `localStorage` ficam por navegador: duas máquinas não enxergam a mesma fila. Para ver as telas com conteúdo, emita uma senha no totem do mesmo navegador.

## Instalação

Pré-requisitos: Node.js 22 ou superior, npm e MySQL 8.0.

```bash
git clone https://github.com/alessonpassos/nassauTickets.git
cd nassauTickets
```

Front-end:

```bash
cd frontend
npm install
```

Back-end:

```bash
cd backend
npm install
```

## Execução

Execute a API e o front-end em dois terminais.

Back-end (API em `http://localhost:3000`, configurável por `PORT`):

```bash
cd backend
npm run dev      # nodemon
# ou
npm start
```

Front-end (Vite em `http://localhost:5173`):

```bash
cd frontend
npm run dev
```

Para expor na rede local (necessário para o QR Code do totem em outro dispositivo):

```bash
npm run dev -- --host 0.0.0.0
```

Outros comandos do front-end: `npm run build` (build de produção), `npm run preview` (pré-visualização) e `npm run lint` (ESLint).

## Configuração

Crie o arquivo `backend/.env` (não versionado: o `.gitignore` ignora `.env` e `.env.*`, exceto `.env.example`):

| Variável | Exemplo | Uso |
|----------|---------|-----|
| `PORT` | `3000` | Porta do servidor Express |
| `DB_HOST` | `localhost` | Host do MySQL |
| `DB_PORT` | `3306` | Porta do MySQL |
| `DB_USER` | `root` | Usuário do banco |
| `DB_PASSWORD` | (sua senha) | Senha do banco |
| `DB_NAME` | `nassauTickets` | Banco de dados da aplicação |

Crie o banco `nassauTickets` no MySQL 8.0 antes de iniciar a API. O CORS do Express está configurado para `http://localhost:5173`; ajuste em `backend/app.js` se usar outra porta.

No front-end, nenhuma variável de ambiente é necessária hoje.

## Branches e fluxo de trabalho

| Branch | Papel |
|--------|-------|
| `dev` | Desenvolvimento: recebe funcionalidades e correções |
| `main` | Versão principal: recebe a `dev` por merge, após verificação |

Fluxo: commits pequenos e objetivos na `dev`, depois merge na `main`.

Padrão de mensagens de commit:

```
feat: implementa emissão de senha no totem
feat: implementa fila com prioridade SP -> SE|SG
fix: corrige concorrência na chamada da próxima senha
docs: atualiza documentação da API
test: adiciona testes da máquina de estados
```

## Limitações e contingência

**Limitações conhecidas:**

- A fila, o totem e os relatórios usam o armazenamento local do navegador; a integração com a API Express/MySQL é a próxima etapa.
- A sessão de login é local e os usuários de demonstração estão em `frontend/src/data/usuarios.js`; não é autenticação real.
- O áudio da chamada depende da síntese de voz do navegador.
- PREENCHER: outras limitações reais do grupo (ex.: cadastros de atendentes e guichês, se ainda não existirem).

**Contingência:** quando a integração com a API existir, a interface deve exibir mensagem clara de indisponibilidade (nunca tela em branco), oferecer o botão "Tentar novamente" e manter no painel as últimas chamadas já carregadas, sinalizando que estão desatualizadas. Para demonstração, os dados locais seguem a mesma estrutura usada pela interface.

## Uso de inteligência artificial

| Ferramenta | Para que foi usada | O que foi aceito e revisado | Quem revisou |
|------------|--------------------|-----------------------------|--------------|
| PREENCHER (ex.: Claude) | PREENCHER (ex.: revisão do README) | PREENCHER | PREENCHER |

Todo código ou texto gerado ou sugerido por IA foi revisado, testado e pode ser explicado por qualquer integrante da equipe.

## Entregas e tags

| Entrega | Tag Git |
|---------|---------|
| AV1 | `entrega-av1` |
| AV2 | `entrega-av2` |

<!--
==================== SEÇÕES DA AV2 ====================
Remova os comentários e inclua estas seções somente quando a
integração com a API e o login real estiverem funcionando.

## Contrato da API

Opção de integração: B (API do projeto de back-end).
URL-base: definida por VITE_API_URL (ver .env.example).

| Operação | Método | Endpoint | Resposta de sucesso | Erros tratados |
|----------|--------|----------|---------------------|----------------|
| Autenticar atendente | POST | ENDPOINT REAL | Sessão/token e dados do usuário | 400, 401 |
| Emitir senha | POST | ENDPOINT REAL | Senha com tipo, número e estado | 400, 503 |
| Últimas chamadas | GET | ENDPOINT REAL | Até 5 registros | 503 |
| Chamar próxima | POST | /api/senhas/chamar | Senha escolhida pelo servidor | 401, 403, 404, 409, 503 |
| Iniciar atendimento | PATCH | ENDPOINT REAL | Novo estado e horário | 401, 404, 409 |
| Finalizar atendimento | PATCH | ENDPOINT REAL | Novo estado e horário | 401, 404, 409 |

## Evolução da AV1 para a AV2

| Aspecto | Situação na AV1 | Evolução na AV2 | Evidência |
|---------|-----------------|-----------------|-----------|
| Dados | localStorage e arquivos JS | Dados obtidos da API | src/services/ |
| Autenticação | Sessão local de demonstração | Login real, sessão após refresh, logout, tratamento de 401/403 | arquivos e commits reais |
| Estados da interface | Lista e vazio | Carregamento, sucesso, vazio, erro e tentar novamente | src/components/ |
| Organização | Estrutura inicial | Páginas, serviços, hooks e estilos; URL-base centralizada | src/ |
-->

## Documentação do projeto

Índice geral: `docs/Indice.md`.

| Documento | Conteúdo |
|-----------|----------|
| Tecnologias | Stack, versões e justificativas |
| Arquitetura | Camadas, pastas, fluxo e integração |
| Regras de negócio | RN01 a RN14, prioridade, estados, expediente |
| API | Contrato REST previsto |
| Back-end | Requisitos, banco, concorrência, relatórios e checklist |
| Front-end | Telas, rotas, interface e acessibilidade |

Artefatos: `docs/branding/`, `docs/mer/`, `docs/mockups/`, `docs/models/uml/` e `docs/requirements/`.

## Licença

Este projeto está sob a licença MIT. Copyright (c) 2026 Alesson Passos. Ver `LICENSE`.
