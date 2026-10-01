# Regras de negócio

## Visão geral

O projeto usa três tipos de senha: `SP`, `SE` e `SG`. A lógica de fila e chamada foi implementada no front-end local da AV1 e está prevista para sincronização real com a API e o banco na AV2.

## Tipos de senha

| Código | Tipo | Prioridade | Observação |
| ------ | ---- | ---------- | --------- |
| SP | Prioritária | Maior | Fila prioritária |
| SE | Retirada de exames | Intermediária | Processa a fila de exames |
| SG | Geral | Menor | Fila geral |

Qualquer guichê atende qualquer tipo.

## Priorização

A regra implementada no código é:

**SP → SE → SG → SP → SE → SG**

Com lógica de alternância e fallback de grupo vazio.

A regra de negócio foi codificada em `frontend/src/services/filaService.js` por meio de `escolherProxima` e `estado.ultimoGrupo`.

## Numeração

Padrão da numeração local:

**`YYMMDD-SP001`**, **`YYMMDD-SE001`**, **`YYMMDD-SG001`**

A geração está em `frontend/src/services/totemService.js`, com sequência diária por tipo e limite de 999 por dia.

## Máquina de estados

```text
AGUARDANDO → CHAMADA → CHAMADA_NOVAMENTE → EM_ATENDIMENTO → ATENDIDA
                    ↓
               NÃO_COMPARECEU
```

| Estado | Descrição |
| ------ | --------- |
| AGUARDANDO | Senha emitida e aguardando chamada |
| CHAMADA | Senha chamada pela primeira vez |
| CHAMADA_NOVAMENTE | Segunda chamada, com aviso “Última chamada” |
| EM_ATENDIMENTO | Atendimento iniciado |
| ATENDIDA | Atendimento concluído |
| NÃO_COMPARECEU | Não compareceu após duas chamadas |

## Chamada e abandono

- O atendente pode chamar a próxima senha ou repetir a última chamada.
- A segunda chamada altera o estado para `CHAMADA_NOVAMENTE` e exibe o texto `Última chamada` na UI.
- Após a segunda chamada, se o paciente não comparecer, o estado é marcado como `NÃO_COMPARECEU`.
- O painel exibe as 5 últimas chamadas no front-end, conforme `PainelSenhas.jsx`.

## Expediente

O expediente é controlado no front-end por `horarioTotem()`, com intervalo entre 07:00 e 17:00 (horário de Brasília).

- Fora do expediente, a emissão de senha não é permitida.
- Senhas em espera fora do expediente são tratadas como descartadas na lógica de relatórios.

## Lista de regras

| Código | Regra | Status |
| ------ | ----- | ------ |
| RN01 | SP possui maior prioridade | Implementado |
| RN02 | SG possui menor prioridade | Implementado |
| RN03 | SE possui prioridade operacional especial | Implementado |
| RN04 | Sequência de prioridade SP → SE → SG → SP → SE → SG | Implementado |
| RN05 | Qualquer guichê pode atender qualquer senha | Implementado |
| RN06 | Senha pode ser chamada novamente | Implementado |
| RN07 | Após duas chamadas sem comparecimento, a senha é abandonada | Implementado |
| RN08 | Expediente das 07h às 17h | Implementado |
| RN09 | Atendimentos iniciados devem ser finalizados | Implementado |
| RN10 | Senhas restantes ao final do expediente podem ser descartadas | Implementado |
| RN11 | Sequência numérica reinicia diariamente | Implementado |
| RN12 | Painel exibe as 5 últimas chamadas | Implementado |
| RN13 | Cliente utiliza o totem anonimamente | Implementado |
| RN14 | Operações de atendente exigem autenticação | Parcial |

## Status geral

As regras acima estão implementadas no protótipo front-end, mas ainda dependem de integração real à API e ao banco para cumprir o comportamento de produção da AV2.
