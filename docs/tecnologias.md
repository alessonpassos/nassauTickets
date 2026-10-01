# Tecnologias

## Stack real do projeto

### Front-end

| Tecnologia | Versão atual | Uso |
| ---------- | ------------ | --- |
| React | 19.2.8 | interface do sistema |
| Vite | 8.3.0 | build e servidor de desenvolvimento |
| React Router | 7.18.4 | navegação entre páginas e rotas protegidas |
| JavaScript | ES modules | desenvolvimento da interface |
| CSS | nativo | estilos da aplicação |

### Back-end

| Tecnologia | Versão atual | Uso |
| ---------- | ------------ | --- |
| Node.js | 22 | runtime do servidor |
| Express | 4.16.1 | API e rotas HTTP |
| MySQL | 8.0 | persistência real da aplicação |
| mysql2 | 3.24.4 | driver do banco |
| dotenv | 18.0.3 | leitura de variáveis de ambiente |
| cors | 2.8.6 | permissão de acesso do front-end |

## Dependências relevantes

- `frontend/package.json`: Vite, React, React Router, ESLint
- `backend/package.json`: Express, `mysql2`, `dotenv`, `cors`, `nodemon`

## Configuração do ambiente

O ambiente do back-end usa variáveis de ambiente em `.env` e `process.env` em `backend/config/database.js`.

Exemplo de configuração esperada:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=nassauTickets
PORT=3000
```

## Decisão técnica

A escolha do back-end em Node.js 22 + Express + MySQL 8.0 foi adequada para a disciplina porque combina simplicidade, compatibilidade com o front-end em React e suporte à persistência e consultas estruturadas em produção.

## Observações finais

- O protótipo AV1 usa `localStorage` e `sessionStorage`.
- O banco MySQL não possui schema versionado no repositório.
- A autenticação real continua planejada para a AV2.

