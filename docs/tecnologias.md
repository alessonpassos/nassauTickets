# Tecnologias

## Stack do projeto

Versões conforme `package.json` (o `package-lock.json` fixa as versões exatas instaladas).

### Front-end

| Tecnologia | Versão | Uso |
| ---------- | ------ | --- |
| React / React DOM | ^19.2.8 | Interface |
| React Router | ^7.18.4 | Navegação e rotas protegidas |
| Vite | ^8.3.0 | Build e servidor de desenvolvimento |
| ESLint | ^10.10.0 | Análise estática |
| JavaScript (ES modules) + CSS | — | Código e estilos (sem framework de CSS) |

Não há biblioteca de requisições: o front usa `fetch` nativo, centralizado em `src/services/api.js`.

### Back-end

| Tecnologia | Versão | Uso |
| ---------- | ------ | --- |
| Node.js | >= 22 | Runtime |
| Express | ^4.21.2 | API e rotas HTTP |
| mysql2 | ^3.24.4 | Driver MySQL (pool e transações) |
| bcryptjs | ^2.4.3 | Hash de senha |
| jsonwebtoken | ^9.0.2 | Token JWT |
| cors | ^2.8.6 | CORS configurável |
| dotenv | ^18.0.3 | Variáveis de ambiente |
| morgan | ~1.9.1 | Log de requisições |
| http-errors | ~1.6.3 | Erros HTTP |
| debug | ~2.6.9 | Depuração |
| nodemon | ^3.1.14 (dev) | Reinício automático |

### Banco de dados

MySQL 8.0, banco `nassau_tickets`, criado por [`mer/schema.sql`](mer/schema.sql).

## Ainda não utilizados

`helmet` (cabeçalhos de segurança), limitador de tentativas de login e framework de testes automatizados. Estão listados em [pendencias.md](pendencias.md).

## Configuração do ambiente

Back-end (`backend/.env`, a partir de `backend/.env.example`):

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

Front-end (`frontend/.env`, a partir de `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:3000/api
```

## Decisão técnica

Node.js + Express + MySQL foi escolhido porque usa JavaScript nas duas pontas (React no front, Express no back), o que facilita o trabalho em grupo; Express é simples para uma API REST; e o MySQL com `mysql2` oferece transações e `SELECT … FOR UPDATE`, necessários para evitar que dois guichês chamem a mesma senha.
