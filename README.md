# nassauTickets — Sistema de Controle de Atendimento

**MedSync Squad** — sistema de controle de atendimento por senhas para um **Laboratório de Análises Clínicas**: totem de emissão, painel de chamadas, área do atendente e relatórios do gestor.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-LTS%2022-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)

| Informação | Detalhe |
| ---------- | ------- |
| **Status** | Em desenvolvimento — front-end (totem e telas) e back-end (API + MySQL) iniciados |
| **Repositório** | [github.com/alessonpassos/nassauTickets](https://github.com/alessonpassos/nassauTickets) |
| **Licença** | MIT — [LICENSE](LICENSE) |
| **Documentação** | [docs/](docs/Indice.md) |

---

## Sumário

- [Descrição](#descrição)
- [Objetivo](#objetivo)
- [Equipe](#equipe)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Documentação do back-end](#documentação-do-back-end)
- [Front-end em resumo](#front-end-em-resumo)
- [Instalação](#instalação)
- [Execução](#execução)
- [Configuração](#configuração)
- [Branches e fluxo de trabalho](#branches-e-fluxo-de-trabalho)
- [Documentação do projeto](#documentação-do-projeto)
- [Licença](#licença)

---

## Descrição

O **nassauTickets** é um sistema de *tickets* (senhas) que organiza a gestão do atendimento ao usuário por meio de uma fila com priorização. O cliente retira uma senha em um **totem** e aguarda ser chamado em um **painel**; o **atendente** aciona a chamada, atende no guichê e encerra o atendimento.

O sistema trabalha com três agentes (AS, AA e AC), três tipos de senha (SP, SE e SG), numeração diária no padrão `YYMMDD-PPSQ`, expediente de 07h às 17h, relatórios diário/mensal, tempo médio de atendimento e trilha de auditoria.

| Público | Finalidade |
| ------- | ---------- |
| Cliente (AC) | Emitir a senha no totem e acompanhar a chamada no painel |
| Atendente (AA) | Autenticar-se, chamar a próxima senha, iniciar/finalizar o atendimento e chamar novamente |
| Gestor | Cadastros e relatórios (mesmo usuário atendente, com perfil adicional) |
| Recepção | Apoiar o cliente no totem e no painel |

## Objetivo

Centralizar o fluxo de atendimento do laboratório em uma aplicação web, eliminando o controle manual da fila:

- emitir e numerar senhas de forma única e automática;
- respeitar a priorização `SP → SE|SG → SP → SE|SG` sem permitir que dois guichês recebam a mesma senha;
- controlar os estados de cada senha, do momento da emissão até o atendimento ou o abandono;
- oferecer relatórios de volume, tempo médio e auditoria das chamadas;
- atender aos requisitos de segurança, disponibilidade, desempenho, concorrência, LGPD e acessibilidade previstos na especificação.

---

## Equipe

### Front-end

No front-end, todos desenvolvem.

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

Papéis conforme a atividade: **Scrum Master** (um por grupo, responsável pela criação e organização do repositório), **Documentador**, **Desenvolvedor** e **Tester**. Mais detalhes em [docs/backend.md](docs/backend.md#equipe).

---

## Tecnologias utilizadas

| Camada | Tecnologia | Versão no projeto | Uso |
| ------ | ---------- | ----------------- | --- |
| Front-end | React | 19 | Componentes, páginas, estado, `useState`/`useEffect` |
| Front-end | Vite | 8 | Servidor de desenvolvimento e build |
| Front-end | React Router | 7 | Rotas do painel e navegação por janela |
| Front-end | `qrcode` | 1.5 | QR Code do totem gerado localmente |
| Front-end | CSS e `fetch` | — | Estilos, layout responsivo e consumo da API (integração planejada) |
| Back-end | Node.js LTS | 22 | Runtime da API |
| Back-end | Express | 4 | Rotas REST em JSON |
| Back-end | `mysql2` (pool) | 3 | Acesso ao MySQL com transações |
| Back-end | `dotenv`, `cors`, `morgan`, `cookie-parser` | — | Configuração, CORS para o Vite, logs e cookies |
| Banco de dados | MySQL | 8.0 | Persistência de senhas, atendimentos, guichês e auditoria |
| Versionamento | Git / GitHub | — | Branches `main` e `dev` |

Detalhes e justificativas: [docs/tecnologias.md](docs/tecnologias.md).

### Por que Node.js + Express no back-end

A especificação permite três back-ends; a escolha do grupo é **Node.js LTS 22 com Express**:

| Critério | Justificativa |
| -------- | ------------- |
| Uma linguagem | JavaScript no front-end (React) e no back-end, reduzindo troca de contexto e reaproveitando a formação da equipe. |
| Express + JSON | API REST enxuta, integração direta com o `fetch` do React e rotas de fila e chamada já disponíveis no servidor. |
| MySQL sem ORM | O pool `mysql2` permite transações explícitas e `SELECT … FOR UPDATE`, necessários para garantir que dois atendentes não recebam a mesma senha. |
| Curva de entrega | Menor tempo de configuração e de execução local quando comparado a Spring Boot, mantendo a organização de camadas exigida. |

> Outras infraestruturas podem ser analisadas pela disciplina, desde que justificadas — o laboratório oferece suporte a Java 21 (Spring Boot), Python 3.14 (Flask/FastAPI), React 19, Angular 22, Ionic 7 e React Native 0.87.

---

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
| ------ | ---------------- |
| Totem / painel | Emissão anônima de senha e exibição das 5 últimas chamadas |
| Área do atendente | Login, chamar, chamar novamente, iniciar e finalizar atendimento |
| Front-end React | Telas, estados de UI, áudio e validação de dados controlados |
| API REST | Regras de fila e prioridade, numeração, estados, relatórios e auditoria |
| MySQL 8.0 | Persistência e concorrência (garantia de senha única por chamada) |

Fluxo do sistema (visão geral): [docs/arquitetura.md](docs/arquitetura.md).

---

## Estrutura do repositório

```
nassauTickets/
├── backend/
│   ├── app.js              # aplicação Express (CORS, rotas, tratamento de erros)
│   ├── bin/www             # servidor HTTP (porta via PORT, padrão 3000)
│   ├── config/database.js  # pool MySQL com variáveis de ambiente
│   ├── routes/             # index (health), senhas, guiches, users
│   ├── public/, views/     # assets e views Jade herdadas
│   └── package.json
├── docs/
│   ├── branding/           # identidade visual
│   ├── mer/                # modelo entidade-relacionamento
│   ├── mockups/            # mockups e protótipos
│   ├── models/uml/         # diagramas UML
│   ├── requirements/       # requisitos, regras de negócio e casos de uso
│   └── *.md                # índice, arquitetura, tecnologias, API, front-end, back-end
├── frontend/
│   ├── src/                # components, pages, services, hooks, data, styles, utils
│   ├── index.html, vite.config.js
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

As pastas de artefatos em `docs/` são mantidas no Git com um arquivo `.gitkeep` quando ainda estão vazias.

---

## Documentação do back-end

Requisitos do sistema de atendimento que o back-end deve atender, conforme o documento *Sistema para controle de atendimento* e a atividade do projeto. Detalhamento completo, modelo de dados e checklist: **[docs/backend.md](docs/backend.md)**.

### Agentes do sistema

| Agente | Sigla | Responsabilidade |
| ------ | ----- | ---------------- |
| Agente Sistema | **AS** | Executa as ações do sistema: comunica-se com o banco de dados e demais infraestruturas, recebe comandos do totem e do terminal do atendente, emite senhas, atualiza o painel automaticamente e responde aos agentes AA e AC |
| Agente Atendente | **AA** | Ser humano que aciona o sistema para chamar o próximo da fila e realizar o atendimento no guichê |
| Agente Cliente | **AC** | Ser humano que emite a senha no totem, aguarda a chamada no painel e dirige-se ao guichê indicado; interage **anonimamente** |

### Tipos de senha e tempo médio de atendimento (TM)

| Sigla | Tipo | Prioridade | Comportamento na fila | TM (especificação) |
| ----- | ---- | ---------- | --------------------- | ------------------ |
| **SP** | Senha Prioritária | Maior | Chamada para o próximo guichê disponível | 15 min ± 5 min (variação aleatória, distribuição igual) |
| **SE** | Retirada de Exames | Operacional especial | Sem prioridade própria: chamada para o próximo guichê disponível **sempre após uma senha SP** | Inferior a 2 min — 1 min para 95% dos atendimentos e 5 min para 5% |
| **SG** | Senha Geral | Menor | Chamada quando houver guichê disponível após SP e SE | 5 min ± 3 min |

Não existem guichês especializados: **qualquer guichê atende qualquer tipo de senha**.

### Priorização e ciclo de chamadas

```
[SP] -> [SE|SG] -> [SP] -> [SE|SG] -> ...
```

1. Se houver senha **SP** na fila, ela é chamada primeiro.
2. Em seguida, uma senha **SE**, se existir.
3. Depois, uma senha **SG**.
4. A alternância é mantida a cada novo atendimento: nunca se repete o mesmo grupo de prioridade da chamada anterior.
5. Se a fila do grupo prioritário estiver vazia, o sistema decide o próximo atendimento mantendo as regras de prioridade restantes.

```
proximaSenha(ultimoGrupo):
    ordem = ultimoGrupo == "SP" ? [SE, SG, SP] : [SP, SE, SG]
    para tipo em ordem:
        senha = primeira senha AGUARDANDO do tipo (ordem de emissão)
        se senha existir: retornar senha
    retornar nenhuma senha disponível
```

### Numeração das senhas

| Parte | Significado |
| ----- | ----------- |
| `YY` | Ano da emissão (2 dígitos) |
| `MM` | Mês (2 dígitos) |
| `DD` | Dia (2 dígitos) |
| `PP` | Tipo da senha (`SP`, `SE`, `SG`) |
| `SQ` | Sequência por prioridade (3 dígitos), com **reinício diário** |

Exemplos: `260917-SP001`, `260917-SE014`, `260917-SG001`.

### Expediente

- Início às **07:00** e encerramento às **17:00**.
- Atendimentos já iniciados devem ser concluídos e encerrados pelo AA pela funcionalidade *encerrar atendimento*.
- Ao final do expediente, **senhas que sobraram na fila são descartadas**.

### Máquina de estados da senha

```
EMITIDA -> AGUARDANDO -> CHAMADA -> CHAMADA_NOVAMENTE -> EM_ATENDIMENTO -> ATENDIDA
                              \--> NÃO_COMPARECEU (após duas chamadas sem comparecimento)
```

| Estado | Descrição |
| ------ | --------- |
| `EMITIDA` | Senha recém-criada no totem |
| `AGUARDANDO` | Senha na fila, aguardando chamada |
| `CHAMADA` | Primeira chamada realizada pelo atendente |
| `CHAMADA_NOVAMENTE` | Segunda chamada (áudio precedido de “Última chamada”) |
| `EM_ATENDIMENTO` | Atendimento iniciado no guichê |
| `ATENDIDA` | Atendimento finalizado pelo atendente |
| `NÃO_COMPARECEU` | Cliente não compareceu após as duas chamadas — senha abandonada |

### Chamada, painel e áudio

- Ações do atendente: **chamar** a próxima senha, **chamar novamente**, **iniciar** e **finalizar** o atendimento.
- Após **duas chamadas** sem comparecimento, a senha é considerada **abandonada** (`NÃO_COMPARECEU`) e o AS passa para a próxima prioridade.
- Cerca de **5% das senhas emitidas não são atendidas** e devem ser descartadas sem que o atendimento seja executado.
- O **painel exibe as 5 últimas senhas chamadas** e **nunca** a próxima senha, pois uma nova senha pode ser emitida entre o fim de um atendimento e a chamada seguinte.
- O back-end fornece **tipo, número e guichê** para que o front-end reproduza o **áudio** da chamada; o botão *Chamar Novamente* repete o áudio precedido de **“Última chamada”**.

### Login e perfis

- O login é usado **apenas pelo atendente (AA)**; existe **um único AA com perfil adicional de gestor**, responsável por cadastros e relatórios.
- O cliente (AC) interage **anonimamente**, somente pelo totem.
- Operações de chamada, atendimento e relatório exigem usuário autenticado; o painel público não expõe dados pessoais.

### Relatórios e auditoria

| Relatório | Conteúdo |
| --------- | -------- |
| Diário e mensal (quantitativos) | Senhas emitidas; senhas atendidas; emitidas por prioridade; atendidas por prioridade |
| Detalhado das senhas | Número, tipo, data/hora da emissão, data/hora do atendimento e guichê responsável — campos de atendimento **em branco** para senhas não atendidas |
| Tempo médio de atendimento (TM) | Tempo médio por tipo, considerando a variação aleatória do atendimento |
| Auditoria | Atendente (AA), guichê, senha, horário da 1ª chamada, horário da 2ª chamada (se houver), horário de início e horário de finalização |

### Concorrência e recuperação de falhas

- **Concorrência:** se dois ou mais atendentes solicitarem a próxima senha praticamente ao mesmo tempo, o AS deve decidir para qual AA e guichê o atendimento será direcionado, **sem entregar a mesma senha duas vezes**. Previsto: transação MySQL com `SELECT … FOR UPDATE` (já aplicado em `POST /api/senhas/chamar`).
- **Desempenho:** o laboratório pede uma proposta para quantificar e acompanhar o desempenho dos atendimentos (TM por tipo, tempo de espera, volume por período).
- **Recuperação de desastres:** definir como o front-end e o painel se comportam e o que exibem quando o back-end ou o banco de dados falha (mensagem de indisponibilidade, nova tentativa, fila local e retomada consistente).

### Requisitos funcionais (RF)

| Código | Requisito |
| ------ | --------- |
| RF01 | Emitir senha no totem de forma anônima, com escolha do tipo (SP, SE, SG) |
| RF02 | Numerar as senhas no padrão `YYMMDD-PPSQ`, com sequência diária por prioridade |
| RF03 | Manter filas independentes por tipo de senha, respeitando o ciclo de priorização |
| RF04 | Permitir ao atendente chamar a próxima senha e indicar o guichê |
| RF05 | Permitir iniciar o atendimento da senha chamada |
| RF06 | Permitir finalizar o atendimento |
| RF07 | Permitir chamar novamente a senha (segunda chamada), com “Última chamada” |
| RF08 | Marcar como `NÃO_COMPARECEU` a senha sem comparecimento após duas chamadas |
| RF09 | Descartar senhas não atendidas sem executar o atendimento |
| RF10 | Controlar o expediente (07:00–17:00), concluir atendimentos iniciados e descartar senhas restantes |
| RF11 | Publicar no painel as 5 últimas senhas chamadas, sem exibir a próxima |
| RF12 | Emitir áudio da chamada com prioridade, senha e guichê |
| RF13 | Autenticar o atendente e o gestor; manter o totem anônimo |
| RF14 | Gerar relatórios diário e mensal com os quatro quantitativos |
| RF15 | Gerar relatório detalhado das senhas |
| RF16 | Gerar relatório de tempo médio de atendimento |
| RF17 | Gerar relatório de auditoria das chamadas e atendimentos |
| RF18 | Permitir ao gestor manter os cadastros (atendentes e guichês) |
| RF19 | Controlar os sete estados da senha (`EMITIDA` … `NÃO_COMPARECEU`) |

### Requisitos não funcionais (RNF)

| Código | Requisito | Aplicação no back-end |
| ------ | --------- | --------------------- |
| RNF01 | **Segurança** | Autenticação, autorização por perfil, hash de senha, validação de entrada, consultas parametrizadas (anti SQL Injection), CORS restrito e `.env` fora do versionamento |
| RNF02 | **Disponibilidade / recuperação de desastres** | Tratamento de erro do MySQL, resposta 503 e comportamento definido para front-end e painel em caso de falha |
| RNF03 | **Auditoria** | Registro persistente de AA, guichê, senha e horários de chamada, início e fim |
| RNF04 | **Desempenho** | Índices por tipo/estado/data na fila, consultas limitadas (`LIMIT`) e pool de conexões |
| RNF05 | **Concorrência** | Transações e locks garantindo uma senha por chamada, mesmo com dois guichês simultâneos |
| RNF06 | **LGPD** | Minimização de dados, totem anônimo, sem dados clínicos no sistema e acesso restrito por perfil |
| RNF07 | **Acessibilidade** | Painel e telas com HTML semântico, contraste, foco visível, texto além do áudio e conteúdo responsivo |
| RNF08 | **Portabilidade / stack** | Stack suportada pelo laboratório (Node.js 22, Express, MySQL 8.0, React 19) |
| RNF09 | **Integração** | API REST em JSON consumida pelo front-end via `fetch` |
| RNF10 | **Usabilidade** | Estados de carregamento, sucesso, vazio, erro e nova tentativa na interface |

---

## Front-end em resumo

| Rota | Tela | Acesso |
| ---- | ---- | ------ |
| `/` | Início | Público |
| `/login` | Login do atendente | Público |
| `/atendente` | Painel do atendente (chamar, iniciar, finalizar, chamar novamente) | Perfis `atendente` e `gestor` |
| `/painel-de-senha` | Painel público de chamadas (5 últimas) | Público |
| `/relatorios` | Relatórios | Perfil `gestor` |
| `/totem` e `/totem/retirar` | Totem de emissão de senhas (janela própria; no modo totem, `/` também abre o totem) | Público, anônimo |

Estado atual e limites conhecidos:

- a emissão do totem, a fila do atendente e os relatórios usam **armazenamento local do navegador** (chave `nassautickets:fila:v1`, AV1), com numeração e expediente calculados no fuso `America/Sao_Paulo`;
- **nenhuma tela consome a API ainda** — a integração com o back-end Express é a próxima etapa; o servidor já expõe CORS para `http://localhost:5173` e as rotas de fila/chamada;
- a sessão de login é local e os usuários de demonstração estão em `frontend/src/data/usuarios.js` — **não é autenticação real** e deve ser substituída pela API;
- detalhes das telas e do totem: [frontend/README.md](frontend/README.md) e [docs/frontend.md](docs/frontend.md).

### Dados do front-end (estado atual)

Toda a “base de dados” do front-end hoje é o armazenamento do próprio navegador:

| Chave | Onde | Conteúdo |
| ----- | ---- | -------- |
| `nassautickets:fila:v1` | `localStorage` | Fila compartilhada por todas as telas: `{ senhas: [], ultimoGrupo }` |
| `nassautickets:totem:demo:v1` | `localStorage` | Contadores diários do totem: `{ dia, sequencias: { SG, SP, SE }, ultimaSenha }` |
| `nassautickets:sessao` | `sessionStorage` | Sessão do atendente: `{ nome, funcao, perfil }` (a senha nunca é gravada) |
| `nassautickets:janela:totem` | `sessionStorage` | Marca a janela como “modo totem” (sem menus de funcionário) |

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
  "finalizadaEm": "2026-09-30T13:20:05.000Z",
  "registro": { "tipoAtendimento": "...", "setor": "...", "observacao": "..." }
}
```

| Fonte | Papel |
| ----- | ----- |
| `src/pages/Totem.jsx` + `src/services/totemService.js` | **Escreve**: gera o número e publica a senha em `fila:v1` |
| `src/pages/PainelAtendente.jsx` + `src/services/filaService.js` | **Lê e escreve**: chamar, chamar novamente, iniciar, finalizar, não compareceu |
| `src/pages/PainelSenhas.jsx` | **Lê**: chamada atual e as 5 últimas (via `useFila`) |
| `src/pages/Relatorios.jsx` + `src/services/relatorioService.js` | **Lê**: quantitativos, detalhado, TM e auditoria do período |
| `src/data/totem.js`, `src/data/usuarios.js` | Dados fixos: tipos de senha, identificação do totem e usuários de demonstração |

Limitações conhecidas desses dados (todas eliminadas quando a API assumir a fila):

- **não há dado inicial nem compartilhamento**: a fila começa vazia e vive por navegador, então duas máquinas não enxergam a mesma fila; para ver as telas com conteúdo, emita uma senha no totem do mesmo navegador;
- `src/data/totem.js` está com `abertura: 0` e `encerramento: 24`, ou seja, **o bloqueio da emissão fora de 07h–17h está desativado na prática** (RN08) — o valor correto é `abertura: 7`, `encerramento: 17`;
- nada é enviado ao back-end: `fetch` e `VITE_API_URL` ainda não aparecem no código.

---

## Instalação

Pré-requisitos: **Node.js 22 ou superior**, **npm** e **MySQL 8.0**.

```bash
git clone https://github.com/alessonpassos/nassauTickets.git
cd nassauTickets
```

**Front-end**

```bash
cd frontend
npm install
```

**Back-end**

```bash
cd backend
npm install
```

## Execução

Execute a API e o front-end em **dois terminais**.

**Back-end (API)**

```bash
cd backend
npm run dev      # nodemon
# ou
npm start
```

A API responde em `http://localhost:3000` (configurável por `PORT`).

**Front-end (React)**

```bash
cd frontend
npm run dev
```

O Vite abre em `http://localhost:5173`. Para expor na rede local (necessário para o QR Code do totem em outro dispositivo):

```bash
npm run dev -- --host 0.0.0.0
```

Outros comandos do front-end:

```bash
npm run build     # build de produção
npm run preview   # pré-visualização do build
npm run lint      # ESLint
```

> A integração completa (emissão de senha no totem → fila no MySQL → chamada → relatórios) ainda não existe: as telas trabalham com dados locais do navegador e dependem dos endpoints pendentes da API, descritos em [docs/api.md](docs/api.md).

## Configuração

Crie o arquivo **`backend/.env`** (não versionado — o `.gitignore` da raiz ignora `.env` e `.env.*`, exceto `.env.example`):

| Variável | Exemplo | Uso |
| -------- | ------- | --- |
| `PORT` | `3000` | Porta do servidor Express |
| `DB_HOST` | `localhost` | Host do MySQL |
| `DB_PORT` | `3306` | Porta do MySQL |
| `DB_USER` | `root` | Usuário do banco |
| `DB_PASSWORD` | — | Senha do banco |
| `DB_NAME` | `nassauTickets` | Banco de dados da aplicação |

Crie o banco `nassauTickets` no MySQL 8.0 antes de iniciar a API. O CORS do Express está configurado para a origem `http://localhost:5173` (porta padrão do Vite) — ajuste em `backend/app.js` se usar outra porta.

No front-end, nenhuma variável de ambiente é necessária hoje. Quando a integração for feita, a URL da API será lida de `VITE_API_URL` (planejado); o totem não exige configuração extra.

---

## Branches e fluxo de trabalho

| Branch | Papel |
| ------ | ----- |
| `dev` | Desenvolvimento: recebe as funcionalidades e correções |
| `main` | Versão principal: recebe a `dev` por *merge*, após verificação |

Fluxo: `dev` → commits pequenos e objetivos → `merge` em `main`. O histórico deve permitir identificar o desenvolvimento na `dev` e a integração na `main`.

Padrão de mensagens de commit:

```
feat: implementa emissão de senha no totem
feat: implementa fila com prioridade SP -> SE|SG
fix: corrige concorrência na chamada da próxima senha
docs: atualiza documentação da API
test: adiciona testes da máquina de estados
```

---

## Documentação do projeto

Índice geral: **[docs/Indice.md](docs/Indice.md)**.

| Documento | Conteúdo |
| --------- | -------- |
| [Índice](docs/Indice.md) | Central de documentação |
| [Tecnologias](docs/tecnologias.md) | Stack, versões e justificativas |
| [Arquitetura](docs/arquitetura.md) | Camadas, pastas, fluxo e integração |
| [Regras de negócio](docs/regras-negocio.md) | RN01–RN14, prioridade, estados, expediente |
| [API](docs/api.md) | Contrato REST previsto |
| [Back-end](docs/backend.md) | Requisitos, banco, concorrência, relatórios e checklist |
| [Front-end](docs/frontend.md) | Telas, rotas, UI e acessibilidade |
| [Equipe e processo](docs/equipe.md) | Git e licença |
| [Front-end/README](frontend/README.md) | Detalhes do totem e das telas React |

Artefatos: `docs/branding/`, `docs/mer/`, `docs/mockups/`, `docs/models/uml/` e `docs/requirements/`.

---

## Licença

Este projeto está sob a licença **MIT**. Copyright (c) 2026 Alesson Passos — ver [LICENSE](LICENSE).
