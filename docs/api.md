# API REST

URL base local: `http://localhost:3000/api` (no front, definida por `VITE_API_URL`).
Formato: JSON. Erros: `{ "erro": "mensagem" }`.

## Autenticação

O login devolve um token JWT. Nas rotas protegidas, envie:

```
Authorization: Bearer <token>
```

O token carrega `sub` (id do usuário), `nome` e `perfil`, e expira em `JWT_EXPIRES_IN` (padrão 8 h). O servidor lê o atendente **do token**; o corpo da requisição nunca informa quem está chamando.

| Perfil | Pode |
| ------ | ---- |
| (público) | `/health`, `/auth/login`, `/guiches`, `POST /senhas`, `GET /senhas/atual` |
| `ATENDENTE` | `GET /senhas/fila`, `GET /senhas/guiche/:guicheId`, `chamar`, `repetir`, `iniciar`, `finalizar`, `nao-compareceu` |
| `GESTOR` | `GET /senhas/fila`, `GET /senhas/guiche/:guicheId` e todos os `/relatorios/*` |

Sem token ou token inválido: **401**. Perfil sem permissão: **403**.

## Visão geral das rotas

| Método | Endpoint | Acesso | Descrição |
| ------ | -------- | ------ | --------- |
| GET | `/health` | Público | Testa o banco; 503 se indisponível |
| POST | `/auth/login` | Público | Login; devolve token |
| GET | `/guiches` | Público | Guichês ativos |
| POST | `/senhas` | Público | Emite senha (totem) |
| GET | `/senhas/atual` | Público | Chamada atual + histórico (5 no total) |
| GET | `/senhas/fila` | Atendente, gestor | Senhas `AGUARDANDO` do dia |
| GET | `/senhas/guiche/:guicheId` | Atendente, gestor | Senha ativa do guichê ou `null` |
| GET | `/senhas/:codigo/registro` | Atendente responsável | Registro salvo ou `null` |
| POST | `/senhas/:codigo/registro` | Atendente responsável | Cria ou atualiza o registro em andamento |
| POST | `/senhas/chamar` | Atendente | Chama a próxima senha |
| POST | `/senhas/repetir` | Atendente | Segunda (e última) chamada |
| POST | `/senhas/iniciar` | Atendente | Inicia o atendimento |
| POST | `/senhas/finalizar` | Atendente | Finaliza o atendimento |
| POST | `/senhas/nao-compareceu` | Atendente | Marca abandono após a 2ª chamada |
| GET | `/relatorios/diario` | Gestor | Resumo do dia |
| GET | `/relatorios/mensal` | Gestor | Resumo do mês |
| GET | `/relatorios/detalhado` | Gestor | Lista de senhas do dia ou mês |
| GET | `/relatorios/auditoria` | Gestor | Chamadas do dia ou mês |

## Detalhes

### `GET /health`

- `200` → `{ "status": "ok", "banco": "ok" }`
- `503` → `{ "status": "erro", "banco": "indisponivel" }`

### `POST /auth/login`

Corpo: `{ "usuario": "ana", "senha": "..." }`

- `200` → `{ "token": "<jwt>", "usuario": "Ana", "perfil": "atendente" }` (`perfil` em minúsculas: `atendente` ou `gestor`)
- `400` → usuário ou senha ausentes
- `401` → usuário/senha incorretos ou usuário inativo (mesma mensagem nos dois casos)

### `GET /guiches`

`200` → `[{ "id": 1, "numero": 1, "ativo": 1 }, ...]`

### `POST /senhas` (totem)

Corpo: `{ "tipo": "SP" }` (`SP`, `SE` ou `SG`). O número é gerado pelo servidor, no formato `YYMMDD-PPSQ`, com sequência diária por tipo.

- `201` → `{ "id": 12, "codigo": "261117-SP003", "tipo": "SP", "sequencial": 3, "status": "AGUARDANDO", "emitida_em": "2026-11-17T10:21:00.000Z" }`
- `400` → tipo inválido
- `409` → outro pedido está emitindo agora (trava); tente de novo
- `422` → limite diário de 999 senhas do tipo atingido

### `GET /senhas/atual` (painel)

Devolve no máximo **5** chamadas do dia (a mais recente em `chamadaAtual`, as demais em `historico`).

```json
{
  "chamadaAtual": {
    "atendimento_id": 7, "codigo": "261117-SG002", "tipo": "SG",
    "status": "CHAMADA", "guiche": 2, "emitida_em": "2026-11-17T10:21:00.000Z",
    "primeira_chamada_em": "2026-11-17T10:30:00.000Z", "segunda_chamada_em": null
  },
  "historico": [ { "...": "mesmos campos" } ]
}
```

Sem chamadas hoje: `{ "chamadaAtual": null, "historico": [] }`. Aqui `guiche` é o **número** do guichê.

### `GET /senhas/fila`

`200` → `[{ "id", "codigo", "tipo", "sequencial", "status": "AGUARDANDO", "emitida_em" }, ...]`, só do dia, por ordem de emissão.

### `GET /senhas/guiche/:guicheId`

Requer token de atendente ou gestor. Retorna a senha do dia com estado `CHAMADA`, `CHAMADA_NOVAMENTE` ou `EM_ATENDIMENTO` naquele guichê, independentemente do histórico público. Sem senha ativa: `200` com `null`.

Campos: `id`, `codigo`, `tipo`, `status`, `emitida_em`, `guiche_id`, `guiche` (número), `atendente_id`, `atendente` (nome), `primeira_chamada_em`, `segunda_chamada_em`, `inicio_atendimento_em`, `fim_atendimento_em`, `pode_operar`.

`pode_operar` indica se o atendimento pertence ao usuário do token. Não concede permissão ao gestor para executar ações de atendente. ID inválido: 400; guichê inexistente/inativo: 404.

### `POST /senhas/chamar`

Corpo: `{ "guiche_id": 1 }`. Escolhe a próxima senha pela regra SP → (SE|SG) → SP e registra o atendimento com o atendente do token.

- `201` → `{ "senha_id", "codigo", "tipo", "guiche_id", "status": "CHAMADA" }`
- `400` → `guiche_id` ausente ou inválido
- `404` → guichê inexistente/inativo, ou nenhuma senha aguardando
- `409` → o guichê já tem senha em andamento; outro guichê está chamando agora; ou a senha mudou de estado

### `POST /senhas/repetir`

Corpo: `{ "guiche_id": 1 }`. Repete a última senha chamada **naquele guichê**, uma única vez.

- `200` → `{ "senha_id", "codigo", "guiche_id", "status": "CHAMADA_NOVAMENTE" }`
- `403` → senha pertence a outro atendente
- `404` → o guichê não chamou senha hoje
- `409` → a senha já foi chamada duas vezes, ou não está no estado `CHAMADA`

### `POST /senhas/iniciar`, `/senhas/finalizar`, `/senhas/nao-compareceu`

Corpo: `{ "codigo": "261117-SG002" }`

| Rota | Estados de origem | Novo estado | Horário gravado |
| ---- | ----------------- | ----------- | --------------- |
| `/iniciar` | `CHAMADA`, `CHAMADA_NOVAMENTE` | `EM_ATENDIMENTO` | `inicio_atendimento_em` |
| `/finalizar` | `EM_ATENDIMENTO` | `ATENDIDA` | `fim_atendimento_em` |
| `/nao-compareceu` | `CHAMADA_NOVAMENTE` | `NAO_COMPARECEU` | — |

- `200` → `{ "codigo": "261117-SG002", "status": "EM_ATENDIMENTO" }`
- `400` → `codigo` ausente
- `403` → senha pertence a outro atendente
- `404` → senha não encontrada no dia
- `409` → transição inválida (ex.: `Transição inválida: AGUARDANDO → ATENDIDA.`)

### Relatórios (somente gestor)

Datas no formato `YYYY-MM-DD`; mês em `YYYY-MM`. Sem parâmetro, usa hoje (data do banco). Formato inválido → `400`.

**`GET /relatorios/diario?data=`** e **`GET /relatorios/mensal?mes=`**

```json
{
  "emitidas": 40, "atendidas": 34, "naoCompareceu": 3, "descartadas": 3,
  "tempoMedio": "8 min",
  "porTipo": [
    { "tipo": "SP", "rotulo": "Prioritária", "emitidas": 10, "atendidas": 9 },
    { "tipo": "SE", "rotulo": "Retirada de exames", "emitidas": 12, "atendidas": 10 },
    { "tipo": "SG", "rotulo": "Geral", "emitidas": 18, "atendidas": 15 }
  ]
}
```

`tempoMedio` é a média entre início e fim do atendimento (`"—"` se não houver atendimentos concluídos).

**`GET /relatorios/detalhado?data=&tipo=`** (`tipo` opcional: `SP`, `SE` ou `SG`)

`200` → `[{ "codigo", "tipo", "status", "emitida_em", "guiche", "inicio_atendimento_em", "fim_atendimento_em" }, ...]` (`guiche` é `null` se a senha não foi chamada).

**`GET /relatorios/auditoria?data=`**

`200` → `[{ "codigo", "atendente_id", "atendente", "guiche", "emitida_em", "primeira_chamada_em", "segunda_chamada_em", "inicio_atendimento_em", "fim_atendimento_em" }, ...]`

As rotas `detalhado` e `auditoria` também aceitam `?mes=YYYY-MM`, com o mês inteiro, inclusive dias sem atendimento. `mes` tem precedência sobre `data`; o front envia somente um deles. Início e fim são `null` quando o atendimento ainda não chegou àquela etapa. O front mostra data e hora nas tabelas. Em `detalhado`, `tipo` continua opcional.

## Status HTTP

| Código | Uso |
| ------ | --- |
| 200/201 | Sucesso / criado |
| 400 | Requisição inválida (corpo, parâmetro ou JSON mal formado) |
| 401 | Não autenticado, token inválido/expirado ou login incorreto |
| 403 | Perfil sem permissão |
| 404 | Senha, guichê ou fila inexistente / rota inexistente |
| 409 | Conflito de estado ou de concorrência |
| 422 | Regra de negócio (limite diário de senhas) |
| 500 | Erro interno (mensagem genérica; detalhe só no log do servidor) |
| 503 | Banco indisponível (`/health`) |

## Nomes de campos: backend × frontend

O backend usa `codigo`, `status`, `emitida_em`. O frontend usa `numero`, `estado`, `emitidaEm`. A conversão é feita num único lugar, a função `traduzirSenha` em `frontend/src/services/api.js`.

## Ainda não implementado

- Verificação do expediente (7h–17h) na emissão e na chamada: hoje **não** devolve 422 fora do horário.
- Persistência da ficha do atendimento (formulário desativado no front).
- Rotina de descarte das senhas que sobram às 17h.
- Limite de tentativas no login e `helmet`.

Acompanhe em [pendencias.md](pendencias.md).

## Registro operacional do atendimento

Requer a tabela instalada por `docs/mer/migrations/001-registro-atendimento.sql` e token do atendente responsável. Estas rotas não são públicas e não recebem o ID do atendente pelo corpo.

### `GET /senhas/:codigo/registro`

`200` retorna `null` se ainda não foi preenchido, ou o registro abaixo. O responsável também pode consultar um registro depois de finalizar o atendimento.

### `POST /senhas/:codigo/registro`

Cria ou substitui os campos do único registro daquele atendimento, apenas quando a senha é do dia e está `EM_ATENDIMENTO`.

```json
{
  "tipoAtendimento": "exameDeSangue",
  "setor": "laboratorio",
  "observacao": "Encaminhado ao setor."
}
```

- Tipo obrigatório: `exame`, `exameDeSangue`, `vacinacao` ou `resultado`.
- Setor obrigatório: `salaDeExames`, `salaDeVacinacao`, `laboratorio` ou `recepcao`.
- Observação opcional: texto de até 200 caracteres, sem identificação pessoal ou dados de saúde, conforme o escopo anônimo do projeto.
- `200`: campos persistidos, com `atualizadoEm`.
- `400`: campos inválidos; `401`: sem sessão; `403`: perfil ou responsável incorreto; `404`: atendimento inexistente; `409`: atendimento não está em andamento hoje; `503`: tabela ainda não instalada.

A gravação usa transação e bloqueio da mesma linha de senha utilizada pela finalização. Repetir o salvamento atualiza o registro, sem duplicá-lo.
