# API REST (planejada)

Ainda **não há rotas no repositório**. Caminhos da especificação — confirmar no código.

URL base: a definir.

## Endpoints

| Método | Endpoint | Descrição | Autenticação |
| ------ | -------- | --------- | ------------ |
| POST | `/api/auth/login` | Login do atendente | Não |
| POST | `/api/senhas` | Emissão (totem) | Não |
| GET | `/api/senhas` | Listar | Sim |
| GET | `/api/senhas/:id` | Detalhe | Sim |
| GET | `/api/fila` | Fila | Sim |
| GET | `/api/fila/proxima` | Próxima (reserva) | Sim |
| POST | `/api/atendimentos/chamar` | Chamar | Sim |
| POST | `/api/atendimentos/:id/iniciar` | Iniciar | Sim |
| POST | `/api/atendimentos/:id/finalizar` | Finalizar | Sim |
| POST | `/api/atendimentos/:id/chamar-novamente` | Segunda chamada | Sim |
| GET | `/api/painel` | 5 últimas | a definir |
| GET | `/api/relatorios/diario` | Diário | Gestor |
| GET | `/api/relatorios/mensal` | Mensal | Gestor |
| GET | `/api/relatorios/auditoria` | Auditoria | Gestor |

## Erro previsto

```json
{
  "error": true,
  "message": "Senha não encontrada"
}
```

## Exemplos ilustrativos

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

## Status HTTP previstos

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
