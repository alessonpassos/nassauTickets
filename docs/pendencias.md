# Pendências conhecidas (código x especificação)

Levantamento feito na revisão do repositório. Itens para a equipe de desenvolvimento.

| # | Onde | Pendência | Spec |
| - | ---- | --------- | ---- |
| 1 | `backend/routes/senhas.js` | `CICLO_PRIORIDADE = ["SP","SE","SG"]` roda em ciclo de 3; deve alternar SP → (SE\|SG) → SP | RN04 |
| 2 | `frontend/src/data/totem.js` | `abertura: 0` e `encerramento: 24`; o expediente deve ser 7–17 | RN08 |
| 3 | `backend/` | Faltam rotas de emissão, login, iniciar, finalizar, não compareceu e relatórios | RF01–RF13 |
| 4 | `backend/` | Não há script SQL das tabelas nem `.env.example` (ver `docs/mer/schema-referencia.sql`) | README |
| 5 | `frontend/src` | Nenhuma chamada `fetch`: tudo usa `localStorage` (`filaService.js`) | RNF03 |
| 6 | `frontend/src/data/usuarios.js` | Usuários e senhas em texto puro no bundle | RNF01 |
| 7 | `backend/routes/senhas.js` | `/repetir` ignora o guichê e não limita a uma chamada | RN06/RN16 |
| 8 | `backend/routes/senhas.js` | `/atual` devolve 6 itens; o painel deve ter 5 | RN12 |
| 9 | `backend/` | `/senhas` não filtra por dia; sem controle de expediente | RN08 |
| 10 | `frontend/src/services/filaService.js` | Estado `EMITIDA` nunca é usado; fim do expediente não muda o estado das senhas em espera | RF14 |
| 11 | `frontend/src/context/` | `RelatoriosContext.jsx` tem números fictícios e não é importado em nenhum lugar | — |
| 12 | `backend/` | Dependência `mysql` duplicada com `mysql2`; sobras do gerador (`views/`, `routes/users.js`) | — |
| 13 | Projeto | Proposta de acompanhamento de desempenho além do tempo médio | Desafio |
