# MedSync Squad — CRM Hospitalar

A equipe **MedSync Squad**, composta por 4 integrantes, desenvolverá um **CRM Hospitalar** para resolver a desorganização no fluxo de informações entre recepção, corpo clínico e pacientes.

O MedSync é uma solução integrada de gestão e controle de atendimento. A interface (front-end) concentra a interação dos usuários; o back-end (`nassauTickets`) aplica as regras de negócio, persiste os dados e disponibiliza a API. Front-end e back-end não são projetos independentes: formam **uma única aplicação**.

**Status do projeto:** Em desenvolvimento  
**Licença:** MIT

---

# nassauTickets — Backend

**Sistema de Controle de Atendimento para Laboratório de Análises Clínicas**

O back-end controla emissão, organização, chamada e atendimento de senhas, com três agentes:

| Agente | Sigla | Responsabilidade |
| ------ | ----- | ---------------- |
| Agente Sistema | AS | Operações do sistema, persistência, infraestrutura, emissão de senhas, atualização do painel e processamento das solicitações |
| Agente Atendente | AA | Chamar o próximo cliente e realizar o atendimento no guichê |
| Agente Cliente | AC | Utilizar o totem para emitir senha e aguardar a chamada no painel |

---

## Sobre o projeto

O **MedSync** é um CRM Hospitalar acadêmico voltado à organização do fluxo de informações no ambiente de atendimento. No recorte atual da atividade, o núcleo operacional documentado é o **controle de atendimento de um laboratório de análises clínicas**, integrado à visão de CRM entre recepção, corpo clínico e pacientes.

**Problema.** Sem um sistema único, a recepção, o corpo clínico e os pacientes convivem com informações dispersas: filas manuais, senhas sem rastreio, prioridade irregular, falta de histórico de chamadas e dificuldade para relatórios e auditoria.

**Por que centralizar.** Centralizar cadastros, senhas, chamadas, atendimentos e relatórios reduz retrabalho, evita atribuição duplicada de senhas e torna o fluxo previsível.

**Setores do fluxo.** Recepção (totem e orientação), corpo clínico/atendentes (guichês) e pacientes (emissão e espera no painel). Gestores, quando o perfil existir na implementação, consultam relatórios e auditoria.

**Finalidade.** Organizar o fluxo **Recepção → Corpo clínico → Pacientes**, com regras de prioridade, máquina de estados das senhas e persistência em MySQL.

Não há, neste repositório, implementação de código-fonte além de `LICENSE`, `.gitignore` e este README. Funcionalidades, endpoints e tecnologias abaixo seguem a **especificação da atividade**; o que ainda não existe no código está marcado como `[A DEFINIR]`, `[PREENCHER]`, `[IMPLEMENTAR]` ou `[CONFIRMAR ENDPOINT]`.

---

## Objetivo

Desenvolver uma aplicação Web que organize e centralize informações do ambiente hospitalar/laboratorial, facilitando a comunicação e o fluxo entre recepção, corpo clínico e pacientes.

O back-end deve:

- emitir senhas e gerar numeração;
- gerenciar filas e aplicar prioridade;
- chamar senhas (inclusive chamar novamente);
- iniciar e finalizar atendimento;
- controlar estados das senhas;
- autenticar atendentes e controlar acesso por perfil;
- persistir dados no MySQL;
- gerar dados de relatórios e auditoria;
- controlar guichês e concorrência;
- comunicar-se com o front-end React;
- tratar erros e falhas.

---

## Público-alvo

| Público | Finalidade na aplicação |
| ------- | ----------------------- |
| Recepção / totem (AC) | Emissão anônima de senha e acompanhamento no painel |
| Corpo clínico / atendente (AA) | Login, chamada, atendimento no guichê |
| Pacientes | Obter senha, aguardar chamada e ser direcionados ao guichê |
| Gestor | Previsto na especificação (atendente pode acumular perfil de gestor). Relatórios e funções administrativas: `[A DEFINIR]` no código |

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

## Funcionalidades

| Funcionalidade | Descrição | Status |
| -------------- | --------- | ------ |
| Emissão de senhas (totem) | Cliente escolhe tipo SP, SE ou SG; sistema gera número `YYMMDD-PPSQ` | Planejado |
| Fila e prioridade | Sequência SP → SE\|SG → SP → SE\|SG | Planejado |
| Chamada de senha | Atendente solicita próxima senha; painel e áudio | Planejado |
| Chamar novamente | Segunda chamada; indicação “Última chamada” | Planejado |
| Início / finalização de atendimento | Transições EM_ATENDIMENTO e ATENDIDA | Planejado |
| Abandono | Após duas chamadas sem comparecimento: NÃO_COMPARECEU | Planejado |
| Painel (5 últimas) | Exibe as 5 últimas senhas chamadas; não antecipa a próxima | Planejado |
| Autenticação do atendente | Login; cliente sem login | Planejado |
| Perfil gestor | Relatórios e funções administrativas | Planejado |
| Relatórios diário, mensal e auditoria | Totais, tempos médios e rastreio | Planejado |
| Controle de expediente 07:00–17:00 | Sem novas chamadas fora do horário; descartar senhas em espera ao encerrar | Planejado |
| Concorrência na fila | Uma senha não atribuída a dois atendentes | Planejado |
| Cadastro de pacientes / prontuário / agenda clínica | Não especificados como implementados neste repositório | Não documentado no código |

---

## Tecnologias utilizadas

Tecnologias **permitidas / previstas** pela atividade. Versões efetivas no código: `[A DEFINIR]` (não há `package.json` no repositório no momento desta documentação).

### Front-end (previsto)

| Tecnologia | Versão |
| ---------- | ------ |
| React | `[A DEFINIR]` |
| JavaScript | `[A DEFINIR]` |
| Vite | `[A DEFINIR]` |
| React Router | `[A DEFINIR]` |
| CSS | `[A DEFINIR]` |
| fetch / consumo de API REST | `[A DEFINIR]` |

### Back-end (previsto pela atividade)

| Tecnologia | Versão |
| ---------- | ------ |
| Node.js LTS | 22 (`[CONFIRMAR]` no ambiente) |
| Express | `[VERSÃO]` |
| MySQL | 8.0 |
| ORM / acesso a dados | `[ORM/BIBLIOTECA]` |
| Autenticação (JWT ou sessão) | `[A DEFINIR]` |
| Validação | `[A DEFINIR]` |
| Testes | `[FERRAMENTA DE TESTES]` |

### Desenvolvimento

| Tecnologia | Observação |
| ---------- | ---------- |
| Git / GitHub | Previstos; histórico de branches ainda não analisável neste clone sem `.git` completo |
| Postman / Swagger | `[A DEFINIR]` |

---

## Arquitetura

Arquitetura **conceitual** da solução integrada (código ainda não implementado):

```
Usuário (totem, painel, guichê, gestor)
        ↓
Frontend React
        ↓
React Router
        ↓
Services (fetch)
        ↓
API REST (Express / nassauTickets)
        ↓
Regras de negócio (fila, estados, concorrência)
        ↓
MySQL 8.0
```

| Camada | Responsabilidade |
| ------ | ---------------- |
| Usuário | Totem, painel, atendimento, relatórios |
| Front-end React | Interface, estados de UI, áudio do painel |
| React Router | Navegação e rotas protegidas `[IMPLEMENTAR]` |
| Services | Chamadas HTTP à API |
| API REST | Autenticação, regras, persistência |
| Banco de dados | Senhas, atendimentos, usuários, auditoria |

Agentes AS, AA e AC atuam sobre a mesma API e o mesmo banco.

---

## Estrutura de pastas

Estrutura **real** do repositório neste momento:

```
nassauTickets-main/
├── .gitignore
├── LICENSE
└── README.md
```

Estrutura **esperada** após implementação (ainda não existe no disco):

```
MedSync / nassauTickets/
├── frontend/          [IMPLEMENTAR]
├── backend/           [IMPLEMENTAR]
├── docs/              [A DEFINIR]
├── .gitignore
├── LICENSE
└── README.md
```

Exemplo de backend previsto (não inventar como existente):

```
backend/                 [IMPLEMENTAR]
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

## Frontend

O front-end será desenvolvido em **React** `[IMPLEMENTAR]`. Conceitos previstos pela atividade (JSX, componentes, props, estado, eventos, `useState`, `useEffect`, listas, formulários, Router, `fetch`): **não afirmar como implementados** até existirem no código.

Telas previstas pela especificação: totem de emissão, painel de chamadas, área do atendente, relatórios do gestor. `[IMPLEMENTAR]`

---

## Backend

O back-end (`nassauTickets`) deve fornecer dados, processar requisições, aplicar regras, autenticar, validar, persistir no MySQL, expor API JSON e tratar erros.

**Stack prevista:** Node.js LTS 22, Express, MySQL 8.0.

---

## Tipos de senha

| Código | Tipo | Prioridade | Tempo de atendimento (especificação) |
| ------ | ---- | ---------- | ------------------------------------ |
| SP | Senha Prioritária | Maior | Média ~15 min, variação aleatória de ~5 min |
| SE | Retirada de exames | Operacional especial; após SP quando houver SP | Normalmente &lt; 2 min; ~95% próximo de 1 min; ~5% próximo de 5 min |
| SG | Senha Geral | Menor | Média ~5 min, variação aleatória de ~3 min |

Qualquer guichê pode atender qualquer tipo.

---

## Regra de priorização

Sequência obrigatória:

**SP → SE|SG → SP → SE|SG**

1. Verificar SP; se houver, priorizar.  
2. Em seguida considerar SE, se disponível.  
3. Se não houver SE, considerar SG.  
4. Manter a alternância.  
5. Fila vazia de um tipo: escolher a próxima respeitando as prioridades restantes.

Implementação no código: `[IMPLEMENTAR]` (serviço de fila com transação/lock).

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

A sequência **reinicia diariamente**. Duplicidade: `[IMPLEMENTAR]` via unicidade no banco (data + tipo + sequência) em transação.

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

Transições concretas no código: `[IMPLEMENTAR]`.

---

## Chamada e abandono

- O atendente chama a senha e pode usar **Chamar novamente**.  
- A segunda chamada deve ser registrada.  
- Sem comparecimento após duas chamadas: **NÃO_COMPARECEU**.  
- A especificação estima que cerca de **5%** das senhas emitidas podem não ser atendidas.  
- Senhas não atendidas **não** devem ter horário de atendimento nem guichê de atendimento.

---

## Horário de funcionamento

Expediente: **07:00 às 17:00**.

- Novas chamadas respeitam o expediente.  
- Atendimentos já iniciados devem ser concluídos.  
- Após o encerramento, senhas ainda aguardando devem ser **descartadas**.  
- Controle de data/hora no back-end: `[IMPLEMENTAR]`.

---

## Concorrência

Dois ou mais atendentes podem solicitar a próxima senha ao mesmo tempo. Estratégia prevista:

- transação MySQL e/ou `SELECT … FOR UPDATE` (ou equivalente);  
- uma senha não atribuída a dois guichês;  
- atualização atômica de estado;  
- fila consistente.

Estratégia no código: `[IMPLEMENTAR]`.

---

## Autenticação e autorização

Fluxo previsto:

```
Usuário
   ↓
Login
   ↓
Validação
   ↓
Autenticação
   ↓
Sessão / token
   ↓
Acesso autorizado
```

Especificação:

- um único atendente na especificação da atividade;  
- o mesmo usuário pode ter perfil de **gestor**;  
- o **cliente não faz login** (totem anônimo).

| Item | Situação |
| ---- | -------- |
| Tela de login | `[IMPLEMENTAR]` |
| JWT ou sessão | `[DEFINIR]` |
| Proteção de rotas | `[IMPLEMENTAR]` |
| 401 / 403 | `[IMPLEMENTAR]` |
| Logout | `[IMPLEMENTAR]` |

Não incluir senhas, tokens ou chaves reais neste README.

---

## API REST

**Não há rotas implementadas no repositório.** Os caminhos abaixo são **propostos pela atividade** e devem ser confirmados no código.

| Método | Endpoint | Descrição | Autenticação | Situação |
| ------ | -------- | --------- | ------------ | -------- |
| POST | `/api/auth/login` | Login do atendente | Não | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/senhas` | Emissão de senha (totem) | Não (público) | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/senhas` | Listar senhas | Sim | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/senhas/:id` | Detalhe da senha | Sim | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/fila` | Estado da fila | Sim | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/fila/proxima` | Próxima senha (reserva) | Sim | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/atendimentos/chamar` | Chamar senha | Sim | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/atendimentos/:id/iniciar` | Iniciar atendimento | Sim | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/atendimentos/:id/finalizar` | Finalizar | Sim | `[CONFIRMAR ENDPOINT]` |
| POST | `/api/atendimentos/:id/chamar-novamente` | Segunda chamada | Sim | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/painel` | 5 últimas chamadas | Não / `[DEFINIR]` | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/relatorios/diario` | Relatório diário | Sim (gestor) | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/relatorios/mensal` | Relatório mensal | Sim (gestor) | `[CONFIRMAR ENDPOINT]` |
| GET | `/api/relatorios/auditoria` | Auditoria | Sim (gestor) | `[CONFIRMAR ENDPOINT]` |

Parâmetros, bodies e respostas reais: `[IMPLEMENTAR]`.

URL base da API: `[URL DA API]`

### Padrão de erro previsto

Se o projeto adotar outro formato, documentar o formato real.

```json
{
  "error": true,
  "message": "Senha não encontrada"
}
```

### Exemplos ilustrativos (especificação — não são respostas de um servidor em execução)

**Emissão de senha**

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

**Relatório detalhado (senha não atendida)**

Campos de atendimento e guichê vazios, conforme regra de negócio.

---

## Painel de chamadas

O back-end deve fornecer dados para o painel:

- as **5 últimas** senhas chamadas;  
- **não** exibir a próxima senha antecipadamente (evita que uma emissão nova altere a previsão).

**Chamar novamente:** indicar **“Última chamada”**, prioridade, número da senha e guichê.

---

## Áudio

Requisito: chamada por áudio informando tipo/prioridade, número da senha e guichê. Na segunda chamada, usar **“Última chamada”**. O back-end deve enviar os campos necessários para o front-end reproduzir o áudio. `[IMPLEMENTAR]`

---

## Relatórios

Dados previstos (diário e mensal):

- total emitidas / atendidas;  
- emitidas e atendidas por tipo;  
- relatório detalhado;  
- tempo médio de atendimento;  
- auditoria.

Detalhado: número, tipo, data/hora de emissão, data/hora de atendimento, guichê. Não atendidas: campos de atendimento vazios.

---

## Auditoria

Registrar: atendente, guichê, senha, horário da primeira chamada, da segunda (se houver), início e finalização. Finalidade: rastreabilidade. `[IMPLEMENTAR]`

---

## Banco de dados

**SGBD previsto:** MySQL 8.0.

Entidades **esperadas** (campos reais: `[A DEFINIR]`):

| Entidade | Papel |
| -------- | ----- |
| usuários / atendentes | Login e perfil (atendente / gestor) |
| senhas | Numeração, tipo, estado, timestamps de emissão |
| atendimentos | Guichê, horários, vínculo com senha |
| guichês | Identificação do ponto de atendimento |
| auditoria | Rastreio de chamadas e operações |

Relacionamentos, migrations e seeds: `[A DEFINIR]`.

### Variáveis de ambiente (exemplo — não versionar valores reais)

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nassauTickets
DB_USER=root
DB_PASSWORD=[SENHA]
JWT_SECRET=[CHAVE]
VITE_API_URL=[URL_DA_API]
```

`.env.example`: `[IMPLEMENTAR]`. O `.gitignore` já ignora `.env` e permite `.env.example`.

---

## Fluxo principal do sistema

```
Cliente chega ao laboratório
        ↓
Utiliza o totem (anônimo)
        ↓
Escolhe o tipo (SP, SE ou SG)
        ↓
Backend gera a senha YYMMDD-PPSQ
        ↓
Senha entra na fila (AGUARDANDO)
        ↓
Atendente autentica e solicita próxima senha
        ↓
Backend aplica SP → SE|SG e reserva o guichê (concorrência)
        ↓
Painel e áudio recebem a chamada
        ↓
Cliente dirige-se ao guichê (ou NÃO_COMPARECEU)
        ↓
Atendente inicia e finaliza
        ↓
Horários registrados; dados para relatórios e auditoria
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

## Validações

Validações no código: `[IMPLEMENTAR]`. Previstas: tipo de senha válido, autenticação, transições de estado permitidas, expediente, unicidade da numeração, mensagens de erro estruturadas.

---

## Estados da interface

Previstos para o React (`[IMPLEMENTAR]`): carregamento, sucesso, estado vazio, erro e tentar novamente.

---

## Acessibilidade

Não há implementação no repositório. Previsto: HTML semântico, labels, teclado, contraste, textos do painel (senha, prioridade, guichê), erros claros e dados para áudio. Afirmar como feito somente após existir no código.

---

## Segurança

Previsto / a implementar:

- autenticação e autorização;  
- rotas protegidas;  
- hash de senha `[DEFINIR]`;  
- variáveis de ambiente (`.env` não versionado — já no `.gitignore`);  
- validação de entrada;  
- prevenção de SQL Injection;  
- CORS `[DEFINIR]`;  
- não expor tokens no README.

---

## LGPD e privacidade

Por ser CRM hospitalar/laboratorial, coletar apenas o necessário. O totem é anônimo. Não versionar dados reais de pacientes. Acesso a relatórios conforme perfil. Medidas no código: `[IMPLEMENTAR]`.

---

## Desempenho

Estratégias no código: `[A DEFINIR]`. Previsto: carregamento assíncrono, evitar requisições desnecessárias, feedback de loading.

---

## Disponibilidade e tratamento de falhas

Comportamento esperado (a implementar): API ou banco indisponível, timeout, perda de conexão, sessão expirada — respostas HTTP adequadas e mensagem para nova tentativa.

---

## Status HTTP (previstos)

| Código | Uso típico |
| ------ | ---------- |
| 200 | Consulta ou operação concluída |
| 201 | Recurso criado (ex.: senha) |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão (ex.: relatório sem perfil gestor) |
| 404 | Recurso inexistente |
| 409 | Conflito (concorrência / senha já reservada) |
| 422 | Entidade não processável (regra de negócio) |
| 500 | Erro interno |
| 503 | Serviço indisponível |

Uso real no código: `[IMPLEMENTAR]`.

---

## Instalação

```bash
git clone [URL_DO_REPOSITORIO]
cd nassauTickets
```

**Front-end** (`[CONFIRMAR]` pasta e scripts):

```bash
cd frontend
npm install
```

**Back-end** (`[CONFIRMAR]` pasta e scripts):

```bash
cd backend
npm install
```

Depois: criar banco MySQL 8.0, configurar `.env`, migrations/seeds `[A DEFINIR]`, iniciar o servidor.

---

## Configuração

Ver variáveis de ambiente acima. Não commitar `.env`.

---

## Execução

Scripts reais: **não existem** `package.json` neste repositório.

```bash
npm run dev     # [CONFIRMAR SCRIPT]
npm start       # [CONFIRMAR SCRIPT]
```

Quando houver dois processos: Terminal 1 — back-end; Terminal 2 — front-end.

---

## Testes

`[IMPLEMENTAR TESTES]`

Previstos: unitários, integração, prioridade, máquina de estados, concorrência, autenticação.

```bash
npm test        # [CONFIRMAR SCRIPT]
```

Ferramenta: `[FERRAMENTA DE TESTES]`.

---

## Git e GitHub

Repositório: `[URL DO REPOSITÓRIO]`

Branches previstas pela atividade:

- `dev` — desenvolvimento  
- `main` — versão principal  

Não há histórico Git neste diretório para afirmar commits ou fluxo já executado.

Padrão sugerido:

```
feat: implementa emissão de senha
feat: implementa regra de prioridade
feat: implementa chamada de senha
feat: implementa máquina de estados
fix: corrige concorrência na fila
docs: atualiza documentação da API
test: adiciona testes da fila
```

---

## Documentação

Documentos da atividade (PDF) foram fornecidos à equipe; pasta `docs/` no repositório: `[A DEFINIR]`.

---

## Uso de Inteligência Artificial

| Ferramenta | Utilização | Etapa |
| ---------- | ---------- | ----- |
| `[FERRAMENTA]` | `[COMO FOI UTILIZADA]` | `[ETAPA]` |

Todo conteúdo sugerido por IA deve ser analisado, adaptado e validado pelos integrantes. Não foram inventadas ferramentas além do que a equipe registrar nesta tabela.

---

## Decisões técnicas

| Decisão | Motivo / situação |
| ------- | ----------------- |
| React + Vite | Previstos pela atividade de front-end `[A DEFINIR no código]` |
| Node.js 22 + Express + MySQL 8.0 | Exigência da atividade de back-end |
| API REST JSON | Integração front-end ↔ back-end |
| Totem anônimo | RN13 |
| Transações na fila | Concorrência |

---

## Integração com o front-end

O React consumirá a API REST. CORS, JSON, autenticação do atendente, painel e tratamento de erros: `[IMPLEMENTAR]`. URL: `[URL DA API]`.

---

## Checklist do projeto (front-end / CRM)

- [ ] React configurado
- [ ] Vite configurado
- [ ] React Router configurado
- [ ] Componentes organizados
- [ ] Páginas implementadas
- [ ] Funcionalidades principais implementadas
- [ ] API integrada
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

## Status do projeto

**Em desenvolvimento**

O repositório, nesta data, contém licença MIT, `.gitignore` e documentação. Código de aplicação ainda não versionado.

---

## Licença

Este projeto está licenciado sob a licença **MIT**. Ver o arquivo `LICENSE` (Copyright (c) 2026 Alesson Passos).

---

## Repositório

`[URL DO REPOSITÓRIO]`
https://github.com/alessonpassos/nassauTickets
