# Back-end

## Visão geral

O back-end está em `backend/` e expõe uma API REST em Express para emissão, fila, chamada e atendimento de senhas, autenticação de atendentes e gestores e relatórios. Os dados ficam no MySQL 8.0. Contrato completo em [api.md](api.md).

## Stack

| Tecnologia | Uso |
| ---------- | --- |
| Node.js 22 | Runtime (`engines: >=22`) |
| Express 4 | Framework web |
| mysql2 | Driver MySQL com pool e transações |
| bcryptjs | Hash e conferência de senha |
| jsonwebtoken | Emissão e validação do token JWT |
| cors | CORS configurável por `CORS_ORIGIN` |
| dotenv | Variáveis de ambiente |
| morgan, http-errors, debug | Log de requisições, erros HTTP, depuração |
| nodemon (dev) | Reinício automático em `npm run dev` |

## Como subir

```bash
mysql -u <usuario> -p < ../docs/mer/schema.sql   # cria o banco nassau_tickets, as tabelas e 3 guichês
cp .env.example .env                              # preencha DB_USER, DB_PASSWORD e JWT_SECRET
npm install
node scripts/criar_usuario.js atendente1 "Nome" <senha> ATENDENTE
node scripts/criar_usuario.js gestor1 "Nome" <senha> GESTOR
npm run dev                                       # http://localhost:3000
```

O servidor **não inicia** sem `JWT_SECRET`. `criar_usuario.js` grava o hash `bcrypt` (custo 10) e, se o login já existir, atualiza nome, senha e perfil.

## Rotas

| Método | Rota | Acesso | Observação |
| ------ | ---- | ------ | ---------- |
| GET | `/api/health` | Público | Executa `SELECT 1`; 503 se o banco cair |
| POST | `/api/auth/login` | Público | bcrypt + JWT |
| GET | `/api/guiches` | Público | Guichês ativos |
| POST | `/api/senhas` | Público | Emissão; sequência diária por tipo, com trava |
| GET | `/api/senhas/atual` | Público | 5 últimas chamadas do dia |
| GET | `/api/senhas/fila` | Atendente, gestor | Aguardando, só do dia |
| GET | `/api/senhas/guiche/:guicheId` | Atendente, gestor | Senha ativa e dados do atendimento ou `null` |
| GET, POST | `/api/senhas/:codigo/registro` | Atendente responsável | Consulta e gravação do registro operacional |
| POST | `/api/senhas/chamar` | Atendente | Atendente vem do token |
| POST | `/api/senhas/repetir` | Atendente | Por guichê, uma única vez |
| POST | `/api/senhas/iniciar` | Atendente | `CHAMADA`/`CHAMADA_NOVAMENTE` → `EM_ATENDIMENTO` |
| POST | `/api/senhas/finalizar` | Atendente | `EM_ATENDIMENTO` → `ATENDIDA` |
| POST | `/api/senhas/nao-compareceu` | Atendente | Só a partir de `CHAMADA_NOVAMENTE` |
| GET | `/api/relatorios/diario`, `mensal`, `detalhado`, `auditoria` | Gestor | Todas as rotas do grupo exigem perfil `GESTOR` |

## Banco de dados

Script versionado em [`docs/mer/schema.sql`](mer/schema.sql); diagrama em [`docs/mer/diagrama-entidade-relacionamento.png`](mer/diagrama-entidade-relacionamento.png).

| Tabela | Campos principais |
| ------ | ----------------- |
| `usuarios` | `id`, `nome`, `login` (único), `senha_hash`, `perfil` (`ATENDENTE`/`GESTOR`), `ativo` |
| `guiches` | `id`, `numero` (único), `ativo` |
| `senhas` | `id`, `codigo` (único), `tipo`, `sequencial`, `data_emissao`, `emitida_em`, `status`, `descartada_em`; chave única `(data_emissao, tipo, sequencial)` |
| `atendimentos` | `senha_id` (único), `atendente_id`, `guiche_id`, `primeira_chamada_em`, `segunda_chamada_em`, `inicio_atendimento_em`, `fim_atendimento_em` |

Bancos existentes devem executar `docs/mer/migrations/001-registro-atendimento.sql`, que cria a tabela `registros_atendimento` sem recriar dados. Ela usa `atendimento_id` como chave primária e estrangeira, com `tipo_atendimento`, `setor`, `observacao` (até 200 caracteres) e `atualizado_em`. O `schema.sql` já inclui a tabela para novas instalações.

Estados de `senhas.status`: `EMITIDA`, `AGUARDANDO`, `CHAMADA`, `CHAMADA_NOVAMENTE`, `EM_ATENDIMENTO`, `ATENDIDA`, `NAO_COMPARECEU`. A emissão grava direto `AGUARDANDO`; `EMITIDA` existe no enum mas não é usado.

A auditoria não tem tabela própria: sai de `atendimentos` (atendente, guichê, 1ª e 2ª chamada, início e fim).

## Regras implementadas

- **Prioridade** (`ordemDeChamada` em `routes/senhas.js`): se a última chamada do dia foi SP, a vez é de SE, depois SG, e SP como reserva; caso contrário, SP, depois SE, depois SG. Fila vazia é pulada.
- **Numeração:** `YYMMDD-PPSQ`, sequência por tipo e por dia, máximo 999 (acima disso, 422).
- **Guichê ocupado:** não chama outra senha enquanto houver `CHAMADA`, `CHAMADA_NOVAMENTE` ou `EM_ATENDIMENTO` naquele guichê (409).
- **Segunda chamada:** uma só, e só no guichê que chamou (409 depois).
- **Transições:** qualquer transição fora da tabela de [api.md](api.md) devolve 409.
- **Propriedade:** repetição e transições conferem o atendente do token; não alteram a senha de outro usuário (403).
- **Filtro por dia:** fila, senha ativa do guichê, painel, chamada, repetição e transições consideram só senhas emitidas hoje (`CURDATE()` do banco).

## Segurança

- Senhas com hash `bcrypt`; a conferência roda mesmo quando o usuário não existe (hash falso), para não revelar se o login existe. A mensagem de erro é a mesma para usuário inexistente, inativo ou senha errada.
- JWT assinado com `JWT_SECRET`; `exigirPerfil` confere o perfil em cada rota protegida (401/403).
- O handler de erro **não** devolve `err.message` em erros 5xx: responde "Erro interno do servidor." e registra o detalhe no log.
- JSON inválido no corpo → 400.
- CORS: `CORS_ORIGIN` aceita várias origens separadas por vírgula (útil para abrir o totem por IP de rede).
- Segredos só no `.env` (ignorado pelo Git).

## Configuração

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=nassau_tickets
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=
JWT_EXPIRES_IN=8h
```

## Testes manuais

O arquivo [`backend/requests.http`](../backend/requests.http) reúne requisições de todas as rotas, inclusive os casos 401 e 403. Veja [testes.md](testes.md).

## Checklist de status

- [x] API Express com health real (503 se o banco cair)
- [x] Script SQL versionado e `.env.example`
- [x] Login com bcrypt e JWT; perfis `ATENDENTE` e `GESTOR`; 401 e 403
- [x] Emissão com numeração `YYMMDD-PPSQ` e sequência diária segura contra concorrência
- [x] Chamar (prioridade correta), repetir (1 vez, por guichê), iniciar, finalizar e não compareceu
- [x] Painel com 5 itens e filtro por dia
- [x] Relatórios diário, mensal, detalhado e auditoria, restritos ao gestor
- [x] CORS configurável
- [ ] Expediente 7h–17h verificado no servidor (422 fora do horário)
- [ ] Descarte das senhas em espera às 17h
- [ ] `helmet` e limite de tentativas no login
- [x] Início/fim de atendimento nos relatórios detalhado e de auditoria
- [x] Testes automatizados das rotas com banco simulado
- [x] Persistência da ficha, vinculada ao atendimento e protegida por proprietário/estado
- [ ] Validação das consultas e concorrência com MySQL real
