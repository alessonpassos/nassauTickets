# Arquitetura

## Visão geral

```
Cliente (totem / painel)     Atendente / Gestor
            \                      /
             \                    /
              v                  v
           Front-end React (Vite)
                    |
                    | HTTP JSON (fetch)
                    v
           API REST (Node.js + Express)
                    |
                    v
                MySQL 8.0
```

## Camadas do front-end

```
Usuário
   ↓
Frontend React
   ↓
React Router
   ↓
Páginas e componentes
   ↓
Services (fetch)
```

| Camada | Responsabilidade |
| ------ | ---------------- |
| Usuário | Totem, painel, guichê, gestor |
| Front-end React | Telas, estados da UI, áudio |
| React Router | Navegação e rotas protegidas (planejado) |
| Páginas e componentes | Totem, painel, login, atendimento |
| Services | Comunicação com a API (planejado) |

## Estrutura de pastas (repositório atual)

```
nassauTickets/
├── README.md
├── LICENSE
├── .gitignore
├── docs/                 ← documentação (INDICE.md)
├── front-end/            ← UI (esqueleto)
└── back-end/
    └── docs/             ← MER, UML, mockups, branding, requisitos
```

## Estrutura esperada (planejada)

```
front-end/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── styles/
├── package.json
└── ...

back-end/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── database/
│   ├── utils/
│   └── app.js
├── tests/
├── .env.example
└── package.json
```

## Fluxo principal

```
Cliente no totem escolhe SP, SE ou SG
        ↓
API gera senha YYMMDD-PPSQ e coloca na fila
        ↓
Atendente autenticado pede a próxima senha
        ↓
Regra SP → SE|SG com reserva atômica
        ↓
Painel (5 últimas) + áudio
        ↓
Início e fim do atendimento (ou NÃO_COMPARECEU)
        ↓
Relatórios e auditoria
```

## Integração

- Front-end consome a API REST em JSON.
- CORS e URL base (`VITE_API_URL`) a definir.
- Endpoints públicos: emissão no totem, painel (a confirmar).
- Endpoints protegidos: fila, chamada, atendimento, relatórios.
