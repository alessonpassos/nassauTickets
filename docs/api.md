# API REST

URL base local: `http://localhost:3000/api`. Erros: `{ "erro": "mensagem" }`.

## Implementada no `backend/`

| Método | Endpoint | Descrição | Observação |
| ------ | -------- | --------- | ---------- |
| GET | `/health` | Retorna `{status:"ok"}` | Ainda não testa o banco |
| GET | `/senhas/atual` | Chamada atual + histórico | Retorna 6 itens (1 atual + 5); a spec pede 5 no total |
| GET | `/senhas/fila` | Senhas `AGUARDANDO` | Sem filtro por dia |
| POST | `/senhas/chamar` | `{atendente_id, guiche_id}` — chama a próxima | Usa transação e `FOR UPDATE` |
| POST | `/senhas/repetir` | Segunda chamada da última senha | Não filtra por guichê nem limita a uma vez |
| GET | `/guiches` | Guichês ativos | — |

## Prevista (necessária para integrar o frontend)

| Método | Endpoint | Descrição | Acesso |
| ------ | -------- | --------- | ------ |
| POST | `/auth/login` | Login do atendente/gestor | Público |
| POST | `/senhas` | Emissão pelo totem `{tipo}` | Público |
| POST | `/senhas/iniciar` | Inicia atendimento | Autenticado |
| POST | `/senhas/finalizar` | Finaliza atendimento | Autenticado |
| POST | `/senhas/nao-compareceu` | Marca abandono após 2 chamadas | Autenticado |
| GET | `/relatorios/diario` | Resumo do dia | Gestor |
| GET | `/relatorios/mensal` | Resumo do mês | Gestor |
| GET | `/relatorios/detalhado` | Lista detalhada | Gestor |
| GET | `/relatorios/auditoria` | Auditoria de chamadas | Gestor |

## Status HTTP

| Código | Uso |
| ------ | --- |
| 200/201 | Sucesso / criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Sem senha na fila / rota inexistente |
| 409 | Conflito de estado ou concorrência |
| 422 | Regra de negócio (ex.: fora do expediente) |
| 503 | Banco ou serviço indisponível |
