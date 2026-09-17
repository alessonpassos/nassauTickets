# MedSync Squad — CRM Hospitalar

A equipe **MedSync Squad**, composta por 4 integrantes, desenvolverá um **CRM Hospitalar** para resolver a desorganização no fluxo de informações entre recepção, corpo clínico e pacientes.

O MedSync oferece telas para o totem, o painel de chamadas, a área do atendente e, quando prevista, a consulta de relatórios. Esta primeira parte descreve **somente o front-end**: interface, navegação, estados da tela e interação com o usuário.

**Status do projeto:** Em desenvolvimento  
**Licença:** MIT  
**Repositório:** `[URL DO REPOSITÓRIO]`

Não há, neste repositório, código-fonte de interface além de `LICENSE`, `.gitignore` e este README. O que ainda não existe no código está marcado como `[A DEFINIR]`, `[PREENCHER]` ou `[IMPLEMENTAR]`.

---

## Sobre o projeto

O **MedSync** é um CRM Hospitalar acadêmico. Na interface, o sistema organiza o fluxo **Recepção → Corpo clínico → Pacientes**.

**Problema.** Informações desorganizadas entre recepção, profissionais e pacientes: dificuldade para emitir senha, acompanhar chamadas no painel e registrar o atendimento na tela do guichê.

**Por que centralizar.** Uma única interface reduz retrabalho e deixa o fluxo visível para quem usa o totem, o painel e a área do atendente.

**Setores na interface.** Recepção (totem), corpo clínico (telas do guichê) e pacientes (senha e painel). Gestor, se existir na interface, acessa relatórios.

---

## Objetivo

Desenvolver uma aplicação Web em React capaz de organizar e centralizar, na interface, as informações do ambiente hospitalar, facilitando o uso por recepção, corpo clínico e pacientes.

---

## Público-alvo

| Público | Finalidade na interface |
| ------- | ----------------------- |
| Recepção | Apoiar o paciente no totem e na orientação ao painel |
| Corpo clínico / atendente | Login, chamada de senha e registro do atendimento na tela do guichê |
| Pacientes | Emitir senha no totem, acompanhar o painel e dirigir-se ao guichê |
| Gestor | Relatórios na interface, somente se essa tela existir. `[A DEFINIR]` |

---

## Membros e suas atribuições

| Nome | Matrícula | Atribuição |
| ---- | --------- | ---------- |
| Alesson Passos | 01837765 | Scrum Master & Desenvolvedor |
| Daniel do Nascimento | 01810958 | Documentador & Tester |
| Jefté Pedro | 01856102 | Desenvolvedor |
| Luiz Alexandre | 01540149 | Tester |

**Alesson Passos — Scrum Master & Desenvolvedor.** Organização da equipe, acompanhamento das atividades e desenvolvimento das funcionalidades.

**Daniel do Nascimento — Documentador & Tester.** Documentação, registros do projeto, testes e validação das funcionalidades.

**Jefté Pedro — Desenvolvedor.** Desenvolvimento e evolução das funcionalidades.

**Luiz Alexandre — Tester.** Execução de testes, identificação de problemas e validação do funcionamento.

---
---

# Front-end

Interface React do CRM Hospitalar: totem, painel, área do atendente e, quando existir, relatórios.

---

## Funcionalidades (front-end)

| Funcionalidade | Descrição | Status |
| -------------- | --------- | ------ |
| Totem de emissão | Cliente escolhe SP, SE ou SG e recebe a senha | Planejado |
| Painel de chamadas | Exibe as 5 últimas senhas; não antecipa a próxima | Planejado |
| Áudio da chamada | Tipo, número e guichê; “Última chamada” na segunda chamada | Planejado |
| Login do atendente | Tela de autenticação; cliente sem login | Planejado |
| Área do atendente | Chamar, chamar novamente, iniciar e finalizar | Planejado |
| Relatórios (gestor) | Diário, mensal e auditoria | Planejado |
| Cadastro de pacientes / prontuário / agenda | Não implementados neste repositório | Não documentado no código |

---

## Tecnologias utilizadas (front-end)

Previstas pela atividade. Versões no código: `[A DEFINIR]` (não há `package.json`).

| Tecnologia | Versão |
| ---------- | ------ |
| React | `[A DEFINIR]` |
| JavaScript | `[A DEFINIR]` |
| Vite | `[A DEFINIR]` |
| React Router | `[A DEFINIR]` |
| CSS | `[A DEFINIR]` |
| fetch | `[A DEFINIR]` |
| Git / GitHub | `[A DEFINIR]` |

---

## Arquitetura (front-end)

```
Usuário
   ↓
Frontend React
   ↓
React Router
   ↓
Páginas e componentes
   ↓
Services (fetch)
```

| Camada | Responsabilidade |
| ------ | ---------------- |
| Usuário | Totem, painel, guichê, gestor |
| Front-end React | Telas, estados da UI, áudio |
| React Router | Navegação e rotas protegidas `[IMPLEMENTAR]` |
| Páginas e componentes | Totem, painel, login, atendimento |
| Services | Comunicação assíncrona a partir da interface `[IMPLEMENTAR]` |

---

## Estrutura de pastas (front-end)

**Real no repositório:**

```
[PASTA_DO_PROJETO]/
├── .gitignore
├── LICENSE
└── README.md
```

**Esperada** (`[IMPLEMENTAR]`):

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── styles/
├── package.json
└── ...
```

---

## Frontend

O front-end será desenvolvido em **React** `[IMPLEMENTAR]`.

Conceitos previstos (não afirmar como implementados): JSX, componentes, props, estado, eventos, `useState`, `useEffect`, renderização condicional e de listas, formulários, comunicação assíncrona, React Router, `fetch`, reutilização de componentes.

Telas previstas: totem, painel, login, área do atendente, relatórios. `[IMPLEMENTAR]`

---

## Autenticação e autorização (interface)

```
Usuário
   ↓
Login
   ↓
Validação
   ↓
Autenticação
   ↓
Sessão
   ↓
Acesso autorizado
```

| Item | Situação |
| ---- | -------- |
| Tela de login | `[IMPLEMENTAR]` |
| Credenciais inválidas | `[IMPLEMENTAR]` |
| Sessão / token no cliente | `[DEFINIR]` |
| Proteção de rotas | `[IMPLEMENTAR]` |
| Logout | `[IMPLEMENTAR]` |
| Tratamento 401 / 403 | `[IMPLEMENTAR]` |

Cliente no totem: **sem login**. Não publicar senhas ou tokens neste README.

---

## Fluxo do sistema (interface)

```
Usuário acessa o sistema
        ↓
Realiza login, quando necessário
        ↓
Acessa a tela do seu perfil (totem, painel, guichê, gestor)
        ↓
Consulta ou registra informações na interface
        ↓
O front-end atualiza a tela (sucesso, vazio, erro ou loading)
```

---

## Validações (front-end)

`[IMPLEMENTAR]`. Previstas: campos obrigatórios, formatos, credenciais, mensagens de erro, bloqueio de envio inválido.

---

## Estados da aplicação

`[IMPLEMENTAR]`

| Estado | Uso |
| ------ | --- |
| Carregamento | Enquanto dados são buscados |
| Sucesso | Operação concluída |
| Estado vazio | Sem informações para exibir |
| Erro | Falha na operação |
| Tentar novamente | Nova tentativa após falha |

---

## Acessibilidade (front-end)

Não implementada no repositório. Previsto: HTML semântico, labels, teclado, contraste, textos do painel, foco, erros claros, áudio. Só marcar como feito quando existir no código.

---

## Segurança (front-end)

Rotas protegidas na interface, não armazenar senhas no código-fonte, variáveis de ambiente para configuração e mensagens de erro sem expor dados internos. `[IMPLEMENTAR]`

---

## LGPD e privacidade (front-end)

Não versionar dados reais de pacientes. Totem anônimo. Exibir apenas o necessário ao perfil. `[IMPLEMENTAR]`

---

## Desempenho (front-end)

`[A DEFINIR]`. Previsto: fetch assíncrono, menos requisições, loading.

---

## Disponibilidade e falhas (front-end)

Falha ao carregar a tela, perda de conexão, sessão expirada ou operação não concluída: mensagem clara e botão para tentar novamente. `[IMPLEMENTAR]`

---

## Instalação (front-end)

```bash
git clone [URL_DO_REPOSITORIO]
cd [PASTA_DO_PROJETO]
cd frontend          # [CONFIRMAR PASTA]
npm install          # [CONFIRMAR]
```

---

## Configuração (front-end)

```
VITE_API_URL=[A DEFINIR]
```

`.env.example`: `[IMPLEMENTAR]`. Não versionar `.env`.

---

## Execução (front-end)

Não há `package.json` neste repositório.

```bash
npm run dev     # [CONFIRMAR SCRIPT]
```

---

## Testes (front-end)

`[TESTES A IMPLEMENTAR]`

Previstos: formulários, navegação, login, loading, erro e telas principais.

---

## Checklist do front-end

- [ ] React configurado
- [ ] Vite configurado
- [ ] React Router configurado
- [ ] Componentes organizados
- [ ] Páginas implementadas
- [ ] Funcionalidades principais implementadas
- [ ] fetch configurado
- [ ] Autenticação implementada
- [ ] Sessão implementada
- [ ] Rotas protegidas
- [ ] Logout implementado
- [ ] Loading implementado
- [ ] Estado vazio implementado
- [ ] Tratamento de erros implementado
- [ ] Botão "Tentar novamente"
- [ ] Validações implementadas
- [ ] Acessibilidade considerada
- [ ] Segurança considerada
- [ ] LGPD considerada
- [ ] Testes realizados
- [ ] Documentação atualizada
- [ ] Uso de IA documentado
- [ ] Git/GitHub organizado

---
---

# nassauTickets — Backend

**Sistema de Controle de Atendimento para Laboratório de Análises Clínicas**

O back-end controla emissão, organização, chamada e atendimento de senhas, com três agentes:

| Agente | Sigla | Responsabilidade |
| ------ | ----- | ---------------- |
| Agente Sistema | AS | Persistência, infraestrutura, emissão, painel e processamento |
| Agente Atendente | AA | Chamar o próximo cliente e atender no guichê |
| Agente Cliente | AC | Totem para emitir senha e espera no painel |

---

## Objetivo do back-end

- emitir senhas e gerar numeração;
- gerenciar filas e prioridade;
- chamar senhas e chamar novamente;
- iniciar e finalizar atendimento;
- controlar estados;
- autenticar atendentes e perfis;
- persistir no MySQL;
- relatórios e auditoria;
- guichês e concorrência;
- API para o React;
- erros e falhas.

**Stack prevista:** Node.js LTS 22, Express, MySQL 8.0.

---

## Tecnologias utilizadas (back-end)

| Tecnologia | Versão |
| ---------- | ------ |
| Node.js LTS | 22 (`[CONFIRMAR]`) |
| Express | `[VERSÃO]` |
| MySQL | 8.0 |
| ORM / acesso a dados | `[ORM/BIBLIOTECA]` |
| Autenticação | `[A DEFINIR]` |
| Validação | `[A DEFINIR]` |
| Testes | `[FERRAMENTA DE TESTES]` |

---

## Tipos de senha

| Código | Tipo | Prioridade | Tempo (especificação) |
| ------ | ---- | ---------- | --------------------- |
| SP | Prioritária | Maior | ~15 min ± ~5 min |
| SE | Retirada de exames | Especial; após SP se houver SP | &lt; 2 min; ~95% ~1 min; ~5% ~5 min |
| SG | Geral | Menor | ~5 min ± ~3 min |

Qualquer guichê atende qualquer tipo.

---

## Regra de priorização

**SP → SE|SG → SP → SE|SG**

1. Verificar SP; se houver, priorizar.  
2. Depois SE, se disponível.  
3. Se não houver SE, SG.  
4. Manter a alternância.  
5. Fila vazia de um tipo: próxima segundo as prioridades restantes.

Código: `[IMPLEMENTAR]` (transação/lock).

---

## Numeração das senhas

Padrão: **`YYMMDD-PPSQ`**

| Parte | Significado |
| ----- | ----------- |
| YY | Ano (2 dígitos) |
| MM | Mês |
| DD | Dia |
| PP | Tipo (SP, SE, SG) |
| SQ | Sequência com 3 dígitos |

Exemplos: `260917-SP001`, `260917-SG001`, `260917-SE001`.

Sequência **reinicia diariamente**. Unicidade: `[IMPLEMENTAR]`.

---

## Máquina de estados

```
EMITIDA
   ↓
AGUARDANDO
   ↓
CHAMADA
   ↓
CHAMADA_NOVAMENTE   (opcional)
   ↓
EM_ATENDIMENTO
   ↓
ATENDIDA
```

Estado adicional: **NÃO_COMPARECEU**.

| Estado | Descrição |
| ------ | --------- |
| EMITIDA | Senha recém-criada |
| AGUARDANDO | Na fila |
| CHAMADA | Chamada pelo atendente |
| CHAMADA_NOVAMENTE | Segunda chamada |
| EM_ATENDIMENTO | Atendimento iniciado |
| ATENDIDA | Atendimento finalizado |
| NÃO_COMPARECEU | Não compareceu após as chamadas |

---

## Chamada e abandono

- Chamar e **Chamar novamente**.  
- Segunda chamada registrada.  
- Sem comparecimento após duas chamadas: **NÃO_COMPARECEU**.  
- Cerca de **5%** das senhas podem não ser atendidas (especificação).  
- Não atendidas: sem horário nem guichê de atendimento.

---

## Horário de funcionamento

**07:00 às 17:00**

- Sem novas chamadas fora do expediente.  
- Atendimentos iniciados devem ser concluídos.  
- Após o encerramento, senhas em espera são **descartadas**.  
- `[IMPLEMENTAR]`

---

## Concorrência

Dois atendentes não podem receber a mesma senha. Previsto: transação MySQL e/ou `SELECT … FOR UPDATE`. `[IMPLEMENTAR]`

---

## Autenticação e perfis (back-end)

- Um atendente na especificação; pode ter perfil **gestor**.  
- Cliente **sem login**.  
- JWT ou sessão: `[DEFINIR]`.  
- Endpoints protegidos vs públicos: ver API.

---

## API REST

**Não há rotas no repositório.** Caminhos da atividade — confirmar no código.

| Método | Endpoint | Descrição | Autenticação | Situação |
| ------ | -------- | --------- | ------------ | -------- |
| POST | `/api/auth/login` | Login do atendente | Não | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/senhas` | Emissão (totem) | Não | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/senhas` | Listar | Sim | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/senhas/:id` | Detalhe | Sim | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/fila` | Fila | Sim | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/fila/proxima` | Próxima (reserva) | Sim | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/atendimentos/chamar` | Chamar | Sim | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/atendimentos/:id/iniciar` | Iniciar | Sim | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/atendimentos/:id/finalizar` | Finalizar | Sim | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/atendimentos/:id/chamar-novamente` | Segunda chamada | Sim | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/painel` | 5 últimas | `[DEFINIR]` | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/relatorios/diario` | Diário | Gestor | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/relatorios/mensal` | Mensal | Gestor | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/relatorios/auditoria` | Auditoria | Gestor | `[CONFIRMAR ENDPOINT]` |

URL base: `[URL DA API]`

### Erro previsto

```json
{
  "error": true,
  "message": "Senha não encontrada"
}
```

### Exemplos ilustrativos (não são respostas de um servidor em execução)

**Emissão**

```json
{
  "numero": "260917-SP001",
  "tipo": "SP",
  "estado": "AGUARDANDO",
  "emitidaEm": "2026-09-17T10:15:00"
}
```

**Painel**

```json
{
  "ultimasChamadas": [
    {
      "numero": "260917-SP001",
      "tipo": "SP",
      "guiche": 1,
      "ultimaChamada": false
    }
  ]
}
```

---

## Painel de chamadas (dados da API)

- **5 últimas** senhas chamadas.  
- Não exibir a próxima antecipadamente.  
- Chamar novamente: **“Última chamada”**, prioridade, número, guichê.

---

## Áudio (dados para o front-end)

O back-end envia tipo, número e guichê para o front-end reproduzir o áudio. `[IMPLEMENTAR]`

---

## Relatórios

Totais emitidas/atendidas, por tipo, detalhado, tempo médio, auditoria. Detalhado: número, tipo, emissão, atendimento, guichê. Não atendidas: campos de atendimento vazios.

---

## Auditoria

Atendente, guichê, senha, 1ª chamada, 2ª chamada, início, finalização. `[IMPLEMENTAR]`

---

## Banco de dados

**MySQL 8.0.** Campos reais: `[A DEFINIR]`.

| Entidade | Papel |
| -------- | ----- |
| usuários / atendentes | Login e perfil |
| senhas | Numeração, tipo, estado |
| atendimentos | Guichê e horários |
| guichês | Ponto de atendimento |
| auditoria | Rastreio |

Migrations/seeds: `[A DEFINIR]`.

### Variáveis de ambiente (não versionar valores reais)

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nassauTickets
DB_USER=root
DB_PASSWORD=[SENHA]
JWT_SECRET=[CHAVE]
```

`.env.example`: `[IMPLEMENTAR]`. O `.gitignore` já ignora `.env`.

---

## Fluxo principal (back-end)

```
Cliente no totem escolhe o tipo
        ↓
Backend gera YYMMDD-PPSQ e coloca na fila
        ↓
Atendente autenticado solicita a próxima
        ↓
Regra SP → SE|SG e reserva atômica
        ↓
Painel/áudio
        ↓
Início e fim do atendimento (ou NÃO_COMPARECEU)
        ↓
Relatórios e auditoria
```

---

## Regras de negócio

| Código | Regra |
| ------ | ----- |
| RN01 | SP possui maior prioridade |
| RN02 | SG possui menor prioridade |
| RN03 | SE possui prioridade operacional especial |
| RN04 | Sequência SP → SE/SG → SP → SE/SG |
| RN05 | Qualquer guichê pode atender qualquer senha |
| RN06 | Senha pode ser chamada novamente |
| RN07 | Após duas chamadas sem comparecimento, senha é abandonada |
| RN08 | Expediente das 07h às 17h |
| RN09 | Atendimentos iniciados devem ser finalizados |
| RN10 | Senhas restantes ao final do expediente são descartadas |
| RN11 | Sequência numérica reinicia diariamente |
| RN12 | Painel exibe as 5 últimas chamadas |
| RN13 | Cliente utiliza o totem anonimamente |
| RN14 | Operações de atendente exigem autenticação |

---

## Status HTTP (previstos)

| Código | Uso típico |
| ------ | ---------- |
| 200 | OK |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito / concorrência |
| 422 | Regra de negócio |
| 500 | Erro interno |
| 503 | Indisponível |

---

## Segurança (back-end)

Autenticação, autorização, hash de senha `[DEFINIR]`, validação, SQL Injection, CORS `[DEFINIR]`, não versionar `.env`.

---

## LGPD (back-end)

Minimizar dados pessoais; totem anônimo; acesso por perfil. `[IMPLEMENTAR]`

---

## Acessibilidade (back-end)

Fornecer senha, prioridade, guichê e erros de forma clara para painel e áudio.

---

## Disponibilidade e falhas (back-end)

Banco ou API indisponível, timeout, falha no atendimento: HTTP adequado e JSON de erro. `[IMPLEMENTAR]`

---

## Estrutura do back-end

**Esperada** (`[IMPLEMENTAR]`):

```
backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── database/
│   ├── utils/
│   └── app.js
├── tests/
├── .env.example
└── package.json
```

---

## Instalação (back-end)

```bash
git clone [URL_DO_REPOSITORIO]
cd nassauTickets/backend    # [CONFIRMAR PASTA]
npm install                 # [CONFIRMAR]
```

Criar MySQL 8.0, `.env`, migrations/seeds `[A DEFINIR]`.

---

## Execução (back-end)

```bash
npm run dev     # [CONFIRMAR SCRIPT]
npm start       # [CONFIRMAR SCRIPT]
```

Com o front-end: Terminal 1 — back-end; Terminal 2 — front-end.

---

## Testes (back-end)

`[IMPLEMENTAR TESTES]`

Prioridade, estados, concorrência, autenticação.

```bash
npm test        # [CONFIRMAR SCRIPT]
```

Ferramenta: `[FERRAMENTA DE TESTES]`.

---

## Integração com o front-end

React consome a API REST. CORS, JSON, autenticação, painel: `[IMPLEMENTAR]`. URL: `[URL DA API]`.

---

## Checklist do back-end

- [ ] API REST implementada
- [ ] MySQL configurado
- [ ] Emissão de senhas
- [ ] Numeração YYMMDD-PPSQ
- [ ] Fila implementada
- [ ] Regra SP → SE/SG implementada
- [ ] Chamada de senha
- [ ] Chamar Novamente
- [ ] Máquina de estados
- [ ] Início do atendimento
- [ ] Finalização
- [ ] Controle de abandono
- [ ] Controle de horário
- [ ] Controle de guichê
- [ ] Autenticação
- [ ] Perfil de gestor
- [ ] Relatório diário
- [ ] Relatório mensal
- [ ] Relatório de auditoria
- [ ] Controle de concorrência
- [ ] Tratamento de erros
- [ ] Segurança
- [ ] LGPD
- [ ] Acessibilidade
- [ ] Testes
- [ ] .env.example
- [ ] Documentação da API
- [ ] Integração com React

---
---

# Complementos do projeto

## Git e GitHub

Repositório: `[https://github.com/alessonpassos/nassauTickets/edit/main/README.md]`

- `dev` — desenvolvimento  
- `main` — versão principal  

Não há histórico Git neste diretório para afirmar commits já feitos.

```
feat: implementa emissão de senha
feat: implementa regra de prioridade
fix: corrige concorrência na fila
docs: atualiza documentação da API
test: adiciona testes da fila
```

---

## Documentação

Pasta `docs/`: `[A DEFINIR]`.

---

## Uso de Inteligência Artificial

| Ferramenta | Utilização | Etapa |
| ---------- | ---------- | ----- |
| `[FERRAMENTA]` | `[COMO FOI UTILIZADA]` | `[ETAPA]` |

Conteúdo sugerido por IA deve ser validado pela equipe.

---

## Decisões técnicas

| Decisão | Situação |
| ------- | -------- |
| React + Vite | Front-end previsto `[A DEFINIR no código]` |
| Node.js 22 + Express + MySQL 8.0 | Back-end da atividade |
| API REST JSON | Integração das duas camadas |
| Totem anônimo | RN13 |
| Transações na fila | Concorrência |

---

## Status do projeto

**Em desenvolvimento**

O repositório contém licença MIT, `.gitignore` e este README. Código da aplicação ainda não versionado.

---

## Licença

Este projeto está licenciado sob a licença **MIT**. Ver o arquivo `LICENSE` (Copyright (c) 2026 Alesson Passos).
