# Arquitetura

## Visão geral

```text
Usuário (totem / painel / guichê / gestor)
          │
          ▼
   Front-end React (frontend/)
          │   fetch + JSON  (Authorization: Bearer <JWT> nas rotas protegidas)
          ▼
  API REST Express (backend/)
          │   mysql2 (pool, transações)
          ▼
      MySQL 8.0
```

O front-end não guarda regra de negócio nem fila: ele consome a API. A numeração, a prioridade, as transições de estado e a autorização ficam no servidor.

## Estrutura do projeto

```text
nassauTickets/
├── frontend/
│   ├── src/
│   │   ├── components/   # blocos reutilizáveis e RotaProtegida
│   │   ├── data/         # configuração do totem e tipos de senha
│   │   ├── hooks/
│   │   ├── pages/        # Inicio, Login, Totem, PainelSenhas, PainelAtendente, Relatorios
│   │   ├── services/     # api.js (fetch), sessao.js, relatorioService.js, janelaTotem.js
│   │   ├── styles/
│   │   └── utils/        # horário, formatação, áudio
│   ├── .env.example      # VITE_API_URL
│   └── package.json
├── backend/
│   ├── bin/www           # sobe o servidor
│   ├── config/           # database.js (pool MySQL)
│   ├── middleware/       # auth.js (verificarToken, exigirPerfil)
│   ├── routes/           # index (health), auth, guiches, senhas, relatorios
│   ├── scripts/          # criar_usuario.js
│   ├── utils/            # http.js (ErroHttp), transacao.js
│   ├── app.js
│   ├── requests.http     # requisições de teste manual
│   └── .env.example
├── docs/
│   ├── branding/  mer/  mockups/  models/uml/  requirements/
│   └── *.md
└── README.md
```

## Camadas do front-end

| Camada | Responsabilidade |
| ------ | ---------------- |
| `pages/` | Telas: início, login, totem, painel de senhas, atendente, relatórios |
| `components/` | Blocos reutilizáveis e `RotaProtegida` (bloqueia por perfil) |
| `services/api.js` | Único ponto de `fetch`: URL-base, token, tratamento de 401, `ErroApi`, `traduzirSenha` |
| `services/sessao.js` | Sessão no `sessionStorage` (token, nome, perfil — nunca a senha) |
| `services/relatorioService.js` | Chamadas e normalização dos relatórios |
| `utils/` | Horário de Brasília, formatação, áudio do painel |

## Camadas do back-end

| Camada | Responsabilidade |
| ------ | ---------------- |
| `routes/` | `index` (health), `auth`, `guiches`, `senhas`, `relatorios` |
| `middleware/auth.js` | Valida o JWT (401) e confere o perfil (403) |
| `utils/transacao.js` | Transação MySQL com trava opcional (`GET_LOCK`) |
| `utils/http.js` | `ErroHttp` e `asyncHandler` |
| `config/database.js` | Pool de conexões MySQL |
| `app.js` | Express, CORS por variável de ambiente, rotas e tratamento de erros |

## Fluxos principais

**Atendimento**

```text
Cliente no Totem → POST /senhas {tipo} → servidor gera YYMMDD-PPSQ (AGUARDANDO)
Atendente (login) → POST /senhas/chamar {guiche_id} → CHAMADA
Painel (GET /senhas/atual a cada 4 s) mostra a chamada, com som e narração
Atendente → repetir (CHAMADA_NOVAMENTE) → iniciar (EM_ATENDIMENTO) → finalizar (ATENDIDA)
                                          └→ nao-compareceu (após a 2ª chamada)
Gestor (login) → /relatorios/* → diário, mensal, detalhado e auditoria
```

**Login e autorização**

```text
POST /auth/login → bcrypt.compare → JWT (sub, nome, perfil)
Front guarda o token no sessionStorage → api.js envia Authorization: Bearer
Rota protegida → verificarToken (401) → exigirPerfil (403)
401 no front → sessão limpa e redirecionamento para /login
```

## Concorrência

Emissão e chamada rodam em transação, com `GET_LOCK` por operação (`nassautickets:emitir` e `nassautickets:chamar`). A escolha da senha usa `SELECT … FOR UPDATE`, e a atualização do estado confere o estado anterior. Assim, dois guichês não pegam a mesma senha e dois pedidos não geram o mesmo código (há ainda uma chave única `data_emissao + tipo + sequencial` no banco).

## Status da arquitetura

- Implementado: API com autenticação JWT, perfis, emissão, chamada, repetição, transições de estado, painel e relatórios; script SQL; front consumindo a API no totem, painel, login e relatórios.
- Em andamento: migração da tela `/atendente` para a API.
- Pendente: verificação de expediente no servidor, descarte às 17h, `helmet` e limite de tentativas de login, testes automatizados. Ver [pendencias.md](pendencias.md).
