# Tecnologias utilizadas

Versões no código: **a definir** até existir `package.json`. Abaixo está o que o projeto **vai usar**.

## Front-end

| Tecnologia | Versão prevista | Uso |
| ---------- | --------------- | --- |
| React | a definir | Interface (totem, painel, guichê, relatórios) |
| JavaScript | ES modules | Linguagem da UI |
| Vite | a definir | Build e servidor de desenvolvimento |
| React Router | a definir | Navegação e rotas protegidas |
| CSS | a definir | Estilo das telas |
| fetch | nativo | Chamadas HTTP à API |
| Git / GitHub | — | Versionamento e colaboração |

Conceitos previstos na UI: JSX, componentes, props, estado, `useState`, `useEffect`, listas, formulários, loading/erro/vazio.

## Back-end

| Tecnologia | Versão prevista | Uso |
| ---------- | --------------- | --- |
| Node.js LTS | 22 | Runtime da API |
| Express | a definir | Servidor HTTP / REST |
| MySQL | 8.0 | Persistência |
| ORM / driver | a definir | Acesso a dados |
| Autenticação | JWT ou sessão (a definir) | Login de atendente/gestor |
| Validação | a definir | Corpo das requisições |
| Testes | a definir | Fila, estados, concorrência |

## Infraestrutura e configuração

| Item | Uso |
| ---- | --- |
| Variáveis de ambiente (`.env`) | Porta, banco, segredos — **não versionar** |
| `.env.example` | Modelo de configuração (planejado) |
| CORS | Permitir o front-end consumir a API |
| MySQL 8.0 local | Desenvolvimento |

## Variáveis previstas

**Front-end**

```
VITE_API_URL=
```

**Back-end**

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nassauTickets
DB_USER=root
DB_PASSWORD=
JWT_SECRET=
```

## Decisões técnicas

| Decisão | Motivo |
| ------- | ------ |
| React + Vite | SPA acadêmica, hot reload, ecossistema da disciplina |
| Node.js 22 + Express + MySQL 8.0 | Stack pedida para o back-end |
| API REST JSON | Integração simples entre as duas camadas |
| Totem sem login | Cliente anônimo (RN13) |
| Transação / lock na fila | Dois guichês não pegam a mesma senha |
