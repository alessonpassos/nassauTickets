# nassauTickets — Frontend

Interface React do sistema de controle de atendimento por senhas. Consome a API do backend (`../backend`). Visão geral do projeto, regras e API no [README da raiz](../README.md) e em [`../docs`](../docs/Indice.md).

## Executar

Requer Node.js 22.12 ou superior (Vite 8) e o backend rodando.

```sh
cp .env.example .env     # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev              # http://localhost:5173
```

```sh
npm run build            # build de produção
npm run preview
npm run lint
```

Para abrir o totem em outro dispositivo da rede (QR Code), use `npm run dev -- --host 0.0.0.0` e inclua a origem do front em `CORS_ORIGIN` no `.env` do backend.

## Variáveis de ambiente

| Variável | Descrição |
| :------- | :-------- |
| `VITE_API_URL` | URL-base da API (padrão `http://localhost:3000/api`) |

## Rotas

| Rota | Acesso | Descrição |
| :--- | :----- | :-------- |
| `/` | Público | Entrada com atalhos |
| `/totem` | Público | Emissão de senha (também `/totem/retirar?totem=recepcao-01`) |
| `/painel-de-senha` | Público | Painel com as 5 últimas chamadas, som e narração |
| `/login` | Público | Login na API |
| `/atendente` | Atendente e gestor | Chamar, repetir, iniciar, finalizar e não compareceu |
| `/relatorios` | Gestor | Relatórios diário, mensal, detalhado e auditoria |

O totem abre em janela própria (`services/janelaTotem.js`), sem os menus de funcionário.

## Organização

```
src/
├── components/   # blocos reutilizáveis e RotaProtegida
├── data/         # configuração do totem e tipos de senha
├── hooks/
├── pages/        # telas
├── services/     # api.js (fetch), sessao.js, relatorioService.js, janelaTotem.js
├── styles/
└── utils/        # horário, formatação, áudio
```

- `services/api.js`: único ponto de `fetch`. Envia o token, trata 401 (limpa a sessão e volta ao login) e converte campos (`codigo→numero`, `status→estado`, `emitida_em→emitidaEm`).
- `services/sessao.js`: sessão no `sessionStorage` (token, nome, perfil). A senha nunca é guardada.

## Totem

- Tipos: SG (geral), SP (prioritário) e SE (retirada de exames).
- O front envia só `{tipo}`; o **servidor** gera o número `YYMMDD-PPSQ` (ex.: `261117-SP003`), com sequência diária por tipo.
- O totem é anônimo: não coleta nem grava dados pessoais.
- Após emitir, mostra o comprovante com barra de progresso (impressão simulada) e volta à seleção; o botão **Nova senha** volta antes.
- Bloqueio de envio repetido; acessível por teclado, com rótulos e mensagens para leitores de tela.

## Dados no navegador

Apenas `sessionStorage`: sessão do usuário, guichê escolhido, senha em atendimento e o modo "janela de totem". Não há fila nem numeração no navegador.

## Limitações e pendências

- A tela `/atendente` está em migração para a API (ver [`../docs/pendencias.md`](../docs/pendencias.md), item 1).
- `src/data/totem.js` ainda está com expediente 0–24 h; o correto é 7–17.
- Restos da AV1 a remover: `data/usuarios.js`, `services/filaService.js`, `hooks/useFila.js`.
- Ainda não há botão "Tentar novamente" nem dados locais de contingência; quando a API cai, as telas mostram a mensagem de erro.

## Uso de IA

A extensão do Totem foi desenvolvida com auxílio de IA. O registro de uso de IA da equipe está em [`../docs/equipe.md`](../docs/equipe.md).
