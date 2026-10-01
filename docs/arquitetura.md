# Arquitetura

## Visão geral

```text
Usuário (totem / painel / guichê / gestor)
          │
          ▼
   Front-end React (frontend/)
          │
          │  localStorage / sessionStorage (AV1)
          ▼
  API REST Express (backend/)
          │
          ▼
      MySQL 8.0
```

## Estrutura real do projeto

```text
nassauTickets-dev/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/
│   ├── routes/
│   ├── config/
│   ├── public/
│   ├── views/
│   ├── app.js
│   └── package.json
├── docs/
└── README.md
```

## Camadas do front-end

| Camada | Responsabilidade |
| ------ | ---------------- |
| `pages/` | telas de início, login, totem, atendimento, painel, relatórios |
| `components/` | blocos reutilizáveis e roteamento protegido |
| `services/` | lógica de fila, sessão, relatórios, totem e adaptação local |
| `hooks/` | sincronização e leitura da fila compartilhada |
| `styles/` | CSS por tela e layout |
| `utils/` | horário, formatação, audio |

## Camadas do back-end

| Camada | Responsabilidade |
| ------ | ---------------- |
| `routes/` | `health`, `guiches`, `senhas` |
| `config/database.js` | conexão com MySQL via pool |
| `app.js` | inicialização do Express e middleware |
| `views/` | páginas padrão do exemplo Express |

## Fluxo principal

```text
Cliente acessa o Totem
    ↓
Emite senha (SP/SE/SG)
    ↓
Dados ficam em localStorage (AV1)
    ↓
Atendente entra localmente
    ↓
Chama a próxima senha e controla o guichê
    ↓
Painel mostra as 5 últimas chamads
    ↓
Relatórios exibem indicadores do dia/mês
```

## Integração real

- O front-end atual usa `localStorage` e `sessionStorage` para simular a aplicação sem integração com a API.
- O back-end atual consulta MySQL real para guichês e senhas, mas não há autenticação ni backend nem script SQL versionado.
- O padrão de arquitetura para AV2 é manter o front-end em React e trocar a camada de dados por integração REST ao back-end Node.js/Express.

## Status da arquitetura

- Implementado: front-end UI local e modelo de fluxo de atendimento
- Implementado no back-end: health check, guichês e rotas de senhas
- Parcial: autenticação, usuários e persistência completa
- Planejado: autenticação real do gestor/atendente e integração completa com MySQL em produção

