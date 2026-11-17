# Pendências conhecidas (código x especificação)

Levantamento feito comparando o código atual com a especificação. Atualizado em 17/11/2026.

## Em aberto

| # | Onde | Pendência | Spec |
| - | ---- | --------- | ---- |
| 1 | `frontend/src/pages/PainelAtendente.jsx` | **Página quebrada pela migração incompleta:** importa `services/filaService.js` (versão local da AV1) e chama `listarFila`, `listarGuiches` etc., que não existem; usa `GUICHES` e `sair` sem definição. Criar o serviço com `fetch` para `/guiches`, `/senhas/fila`, `chamar`, `repetir`, `iniciar`, `finalizar` e `nao-compareceu` | RNF03 |
| 2 | `backend/routes/senhas.js` | Expediente 7h–17h não é verificado na emissão nem na chamada (deve devolver 422 fora do horário) | RN08 |
| 3 | `frontend/src/data/totem.js` | `abertura: 0` e `encerramento: 24`; o expediente deve ser 7–17 | RN08 |
| 4 | `backend/` | Não há rotina que descarte, às 17h, as senhas que sobraram na fila; a coluna `descartada_em` nunca é preenchida (os relatórios só tratam como descartada a senha `AGUARDANDO` de dia anterior) | RN10, RF14 |
| 5 | `backend/` | Falta `helmet` e limite de tentativas no login | Segurança/LGPD |
| 6 | `backend/routes/relatorios.js` | Relatório detalhado não devolve início/fim do atendimento e a auditoria não devolve início/fim; o front mostra "—" nesses campos | Relatórios |
| 7 | `frontend/src/data/usuarios.js`, `services/sessao.js` (`entrar`) | Restos da AV1: usuários e senhas em texto puro no bundle; não são mais usados no login. Remover | RNF01 |
| 8 | `frontend/src/services/filaService.js`, `hooks/useFila.js` | Legado local da AV1; remover quando o item 1 for resolvido | — |
| 9 | Frontend (todas as telas) | Falta botão "Tentar novamente" e dados locais de contingência com a mesma estrutura da interface | RNF03 |
| 10 | `backend/routes/senhas.js` | `iniciar`, `finalizar` e `nao-compareceu` localizam a senha só pelo código; não conferem se ela pertence ao atendente/guichê nem se é do dia | Segurança |
| 11 | `frontend/src/components/FichaPaciente.jsx` | Registro do paciente não é persistido no servidor (a tela avisa) | — |
| 12 | Backend | Testes automatizados (hoje só `requests.http`) | Qualidade |
| 13 | Projeto | Proposta e métrica de acompanhamento de desempenho além do tempo médio | Desafio |
| 14 | Projeto | Regra dos ~5% de senhas não atendidas está ambígua; perguntar ao professor | RN |
| 15 | `docs/` | Não existe `requirements/requisitos.md` nem `mer/mer.md` (só `requisitos.pdf`, o diagrama PNG e `schema.sql`); `docs/branding/` está vazia; `docs/mer/mockups/` é uma pasta vazia sobrando | Documentação |
| 16 | `docs/equipe.md` | Detalhar, por integrante, em quais partes ChatGPT e Gemini foram usados | Documentação |
| 17 | Repositório | Criar as tags `entrega-av1` e `entrega-av2`; garantir commits próprios de cada integrante | Processo |

## Resolvido

| Onde | O que foi feito |
| ---- | --------------- |
| `backend/routes/senhas.js` | Prioridade corrigida para SP → (SE\|SG) → SP |
| `backend/` | Rotas de emissão, login, iniciar, finalizar e não compareceu implementadas; relatórios em `/api/relatorios` |
| `backend/` | `docs/mer/schema.sql` e `backend/.env.example` versionados |
| `backend/routes/senhas.js` | `/repetir` por guichê, valida estado e limita a uma repetição; `/atual` devolve 5 itens; `/fila`, `/atual`, `/chamar` e `/repetir` filtram por dia |
| `backend/routes/senhas.js` | `atendente_id` agora vem do token; guichê ocupado devolve 409 |
| `backend/` | Emissão com sequência diária segura contra concorrência; transições inválidas devolvem 409 |
| `backend/routes/index.js`, `app.js` | `/health` testa o banco (503); o handler de erro não devolve `err.message` em 5xx; CORS configurável por `CORS_ORIGIN` |
| `backend/` | Sobras do gerador (`views/`, `public/`, `routes/users.js`), dependências `mysql` e `ip` removidas; Express atualizado |
| `backend/` | Autenticação com bcrypt e JWT; middleware 401/403; relatórios restritos ao gestor |
| `frontend/src/services/api.js` | `fetch` centralizado com `VITE_API_URL`, token, tratamento de 401 e `frontend/.env.example` |
| Frontend | Totem, painel (5 chamadas, atualização periódica), login (sessão sem senha) e relatórios integrados à API |
| `docs/testes.md` | Feedbacks dos testadores movidos do código para a documentação |
| README e `docs/` | README com problema/público, contribuições, dados e persistência, evolução AV1→AV2, contrato da API, decisões e limitações; links corrigidos |
