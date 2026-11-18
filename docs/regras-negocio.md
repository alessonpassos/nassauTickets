# Regras de negócio

## Visão geral

O sistema usa três tipos de senha: `SP`, `SE` e `SG`. Desde a AV2, as regras de numeração, prioridade, chamada e transição de estados são aplicadas **no backend** (`backend/routes/senhas.js`) e persistidas no MySQL. O front-end apenas exibe e dispara as ações.

## Tipos de senha

| Código | Tipo | Prioridade | Observação |
| ------ | ---- | ---------- | ---------- |
| SP | Prioritária | Maior | Fila prioritária |
| SE | Retirada de exames | Intermediária | Retirada de resultados |
| SG | Geral | Menor | Fila geral |

Qualquer guichê atende qualquer tipo.

## Priorização

Sequência: **SP → (SE | SG) → SP → (SE | SG) → …**

Implementação (`ordemDeChamada`):

- Se a última chamada do dia foi **SP**, a ordem de busca é SE, SG e, por último, SP.
- Caso contrário, a ordem é SP, SE, SG.
- Se o tipo da vez não tiver ninguém aguardando, o sistema segue para o próximo da ordem.
- Dentro de cada tipo, atende-se por ordem de emissão.

Observação: no grupo "SE | SG", SE é procurado antes de SG. Se houver sempre SE aguardando, SG só é chamada quando a fila de SE esvaziar; se a equipe preferir alternar entre SE e SG, é preciso mudar a regra.

## Numeração

Formato **`YYMMDD-PPSQ`**, por exemplo `261117-SP003`:

| Parte | Significado |
| ----- | ----------- |
| `YYMMDD` | Data de emissão |
| `PP` | Tipo (`SP`, `SE`, `SG`) |
| `SQ` | Sequencial do dia, por tipo, de 001 a 999 |

A sequência reinicia todo dia e é independente por tipo. É gerada pelo servidor, dentro de transação com trava, e protegida por chave única no banco `(data_emissao, tipo, sequencial)`. Acima de 999 no dia, a emissão devolve 422.

## Máquina de estados

```text
AGUARDANDO → CHAMADA → CHAMADA_NOVAMENTE → EM_ATENDIMENTO → ATENDIDA
                 │             │
                 │             └──────────→ NAO_COMPARECEU
                 └─ (iniciar direto a partir de CHAMADA) → EM_ATENDIMENTO
```

| Estado | Descrição |
| ------ | --------- |
| EMITIDA | Existe no enum do banco, mas não é usado: a emissão grava `AGUARDANDO` direto |
| AGUARDANDO | Senha emitida e na fila |
| CHAMADA | Chamada pela primeira vez |
| CHAMADA_NOVAMENTE | Segunda chamada (exibe "Última chamada") |
| EM_ATENDIMENTO | Atendimento iniciado |
| ATENDIDA | Atendimento concluído |
| NAO_COMPARECEU | Não compareceu após duas chamadas |

Transições aceitas pelo servidor: `iniciar` a partir de `CHAMADA` ou `CHAMADA_NOVAMENTE`; `finalizar` a partir de `EM_ATENDIMENTO`; `nao-compareceu` somente a partir de `CHAMADA_NOVAMENTE`. Qualquer outra devolve **409**.

## Chamada e abandono

- Cada guichê só chama outra senha depois de concluir a que está em andamento (`CHAMADA`, `CHAMADA_NOVAMENTE` ou `EM_ATENDIMENTO` bloqueiam o guichê; 409).
- A segunda chamada é feita no mesmo guichê, uma única vez.
- Depois da segunda chamada, se o paciente não aparecer, o atendente marca `NAO_COMPARECEU`.
- O painel exibe as **5** últimas chamadas do dia.

## Expediente

Previsto: 07:00 às 17:00 (horário de Brasília). Fora do horário, a emissão deve ser recusada (422) e as senhas que sobrarem às 17h devem ser descartadas.

**Situação atual:** o servidor ainda **não** verifica o expediente na emissão nem na chamada, e a configuração do totem no front (`data/totem.js`) está com `abertura: 0` e `encerramento: 24`. O descarte não é feito por rotina: os relatórios tratam como descartada a senha ainda `AGUARDANDO` de um dia anterior (ou com `descartada_em` preenchido). Ver [pendencias.md](pendencias.md).

## Lista de regras

| Código | Regra | Status |
| ------ | ----- | ------ |
| RN01 | SP possui maior prioridade | Implementado (backend) |
| RN02 | SG possui menor prioridade | Implementado (backend) |
| RN03 | SE tem prioridade operacional sobre SG | Implementado (backend) |
| RN04 | Sequência SP → (SE\|SG) → SP → (SE\|SG) | Implementado (backend) |
| RN05 | Qualquer guichê pode atender qualquer senha | Implementado |
| RN06 | Senha pode ser chamada novamente, uma única vez | Implementado (backend) |
| RN07 | Após duas chamadas sem comparecimento, a senha é abandonada | Implementado (backend: só após a 2ª chamada) |
| RN08 | Expediente das 07h às 17h | **Pendente** (não verificado no backend; front com 0–24) |
| RN09 | Atendimentos iniciados devem ser finalizados | Implementado (guichê fica bloqueado até finalizar) |
| RN10 | Senhas restantes ao final do expediente são descartadas | **Parcial** (só refletido nos relatórios; sem rotina às 17h) |
| RN11 | Sequência numérica reinicia diariamente | Implementado (backend) |
| RN12 | Painel exibe as 5 últimas chamadas | Implementado (backend e front) |
| RN13 | Cliente utiliza o totem anonimamente | Implementado (emissão pública, sem dados pessoais) |
| RN14 | Operações de atendente e gestor exigem autenticação | Implementado no servidor (401/403); tela do atendente em migração |

## Dúvida para o professor

A regra dos ~5% de senhas não atendidas está ambígua no enunciado (como medir e o que fazer quando passar do limite). Ainda não foi implementada; vale confirmar antes de decidir a métrica.
