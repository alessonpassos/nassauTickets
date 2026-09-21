# Regras de negócio

## Tipos de senha

| Código | Tipo | Prioridade | Tempo (especificação) |
| ------ | ---- | ---------- | --------------------- |
| SP | Prioritária | Maior | ~15 min ± ~5 min |
| SE | Retirada de exames | Especial; depois de SP | &lt; 2 min; ~95% ~1 min; ~5% ~5 min |
| SG | Geral | Menor | ~5 min ± ~3 min |

Qualquer guichê atende qualquer tipo.

## Priorização

**SP → SE|SG → SP → SE|SG**

1. Se houver SP, atender SP.
2. Senão, SE se houver.
3. Senão, SG.
4. Manter a alternância.
5. Fila vazia de um tipo: seguir as prioridades restantes.

Implementação com transação/lock (planejado).

## Numeração

Padrão: **`YYMMDD-PPSQ`**

| Parte | Significado |
| ----- | ----------- |
| YY | Ano (2 dígitos) |
| MM | Mês |
| DD | Dia |
| PP | Tipo (SP, SE, SG) |
| SQ | Sequência com 3 dígitos |

Exemplos: `260917-SP001`, `260917-SG001`. Sequência **reinicia diariamente**.

## Máquina de estados

```
EMITIDA → AGUARDANDO → CHAMADA → CHAMADA_NOVAMENTE (opcional)
                                → EM_ATENDIMENTO → ATENDIDA
```

Estado extra: **NÃO_COMPARECEU**.

| Estado | Descrição |
| ------ | --------- |
| EMITIDA | Senha recém-criada |
| AGUARDANDO | Na fila |
| CHAMADA | Chamada pelo atendente |
| CHAMADA_NOVAMENTE | Segunda chamada |
| EM_ATENDIMENTO | Atendimento iniciado |
| ATENDIDA | Atendimento finalizado |
| NÃO_COMPARECEU | Não compareceu após as chamadas |

## Chamada e abandono

- Ações: Chamar e Chamar novamente.
- Sem comparecimento após duas chamadas: **NÃO_COMPARECEU**.
- Cerca de 5% das senhas podem não ser atendidas (especificação).
- Não atendidas: sem horário nem guichê de atendimento.

## Expediente

**07:00 às 17:00**

- Sem novas chamadas fora do expediente.
- Atendimentos já iniciados devem ser concluídos.
- Após o encerramento, senhas em espera são **descartadas**.

## Lista de regras

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
