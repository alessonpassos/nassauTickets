# Front-end

## Visão geral

O front-end é uma SPA em React 19 com Vite e React Router. Ele consome a API do backend (`VITE_API_URL`) e não guarda regras de fila: numeração, prioridade e estados vêm do servidor.

## Páginas

| Página | Arquivo | Função | Fonte dos dados |
| ------ | ------- | ------ | --------------- |
| `Inicio` | `pages/Inicio.jsx` | Entrada com atalhos para totem, painel, atendimento e relatórios | — |
| `Login` | `pages/Login.jsx` | Login de atendente e gestor | `POST /auth/login` |
| `Totem` | `pages/Totem.jsx` | Emissão de senha anônima | `POST /senhas` |
| `PainelSenhas` | `pages/PainelSenhas.jsx` | 5 últimas chamadas, som e narração | `GET /senhas/atual` (a cada 4 s) |
| `PainelAtendente` | `pages/PainelAtendente.jsx` | Guichê, chamada, repetição, início, fim e não compareceu | `GET /guiches`, `/senhas/fila`, `/senhas/guiche/:id` e ações via POST |
| `Relatorios` | `pages/Relatorios.jsx` | Diário, mensal, detalhado e auditoria | `GET /relatorios/*` |

## Rotas

| Rota | Acesso | Papel |
| ---- | ------ | ----- |
| `/` | Público | Tela inicial |
| `/login` | Público | Autenticação na API |
| `/totem` | Público | Totem de emissão (abre em janela própria, sem menus de funcionário) |
| `/painel-de-senha` | Público | Painel de chamadas |
| `/atendente` | `atendente` | Área do atendente |
| `/relatorios` | `gestor` | Relatórios |

`RotaProtegida` redireciona para `/login` sem sessão e para `/` se o perfil não for permitido. Isso é só conforto de navegação: a proteção real está no servidor (401/403).

## Serviços

| Arquivo | Papel |
| ------- | ----- |
| `services/api.js` | Único cliente HTTP: monta a URL a partir de `VITE_API_URL`, envia o token, converte falhas em `ErroApi` (status 0 = sem conexão), limpa a sessão e volta ao login em caso de 401; contém `traduzirSenha` (`codigo→numero`, `status→estado`, `emitida_em→emitidaEm`) |
| `services/sessao.js` | Guarda e lê a sessão no `localStorage` (chave `CHAVE_SESSAO` exportada pelo `api.js`): `token`, `usuario` e `perfil`. **A senha nunca é guardada** |
| `services/relatorioService.js` | Chamadas de relatório e normalização das linhas para a tabela |
| `services/janelaTotem.js` | Modo "janela de totem" (isola o totem das telas de funcionário) |

## Sessão

- No login, a resposta da API (`token`, `usuario`, `perfil`) é gravada no `localStorage`; a sessão sobrevive à recarga e ao fechamento da aba. O logout remove a sessão; um 401 em rota privada também a remove.
- O token vai em `Authorization: Bearer` em toda chamada autenticada.
- Token expirado ou inválido (401): a sessão é limpa e o usuário volta para `/login`.
- Sem permissão (403): a tela de relatórios redireciona para `/`.
- Logout: botão "Sair" do cabeçalho (`Cabecalho.jsx`) limpa a sessão.

## Estados de tela

| Tela | Carregando | Erro | Vazio |
| ---- | ---------- | ---- | ----- |
| Login | Botão em estado de envio | Mensagem (401: "Usuário ou senha inválidos.") | — |
| Totem | "Gerando senha…" | Mensagem da API / sem conexão | — |
| Painel | "Carregando" na 1ª consulta | Mensagem; mantém o último estado e tenta de novo | Sem chamadas |
| Relatórios | "Carregando…" | Mensagem de erro (403 redireciona para `/`) | "Sem dados no período." |
| Atendente | Botões desabilitados durante a ação | Mensagens de erro e da fila | Fila vazia |

O Totem e o atendimento oferecem "Tentar novamente" em falhas. O painel e o atendimento consultam novamente a cada 4 s, sem sobrepor consultas concluídas. A primeira carga do painel fica silenciosa; uma segunda chamada usa outro identificador e pode ser narrada novamente.

## Acessibilidade e UX

- Rótulos, `aria-live`/`role="alert"` em mensagens importantes e foco gerenciado no totem.
- Painel com sinal sonoro e narração opcionais (precisa ser ligado pelo usuário).
- Totem responsivo, com bloqueio de envio repetido.

## Atendimento e ficha

`filaService.js` usa somente o cliente `api.js`. `useFila.js` consulta a fila e a senha ativa do guichê, cancela respostas antigas ao trocar a seleção e atualiza após cada ação. Não há cópia da fila nem da senha ativa em armazenamento do navegador. Os botões ficam bloqueados durante ações, carregamento, falha de atualização ou quando o guichê está em uso por outro atendente.

A ficha é habilitada após iniciar o atendimento. `registroService.js` consulta e salva tipo, encaminhamento e observação na API. Os dados salvos voltam ao reabrir o guichê; a atualização de quatro segundos da fila não sobrescreve campos em edição. Falhas de gravação mantêm o preenchimento para nova tentativa. Enquanto houver alterações pendentes, o atendente deve salvar ou descartá-las antes de finalizar ou trocar de guichê. O servidor confere proprietário e estado do atendimento. Veja [registro-atendimento.md](registro-atendimento.md).

## Checklist

- [x] Login pela API e sessão única; `data/usuarios.js` removido
- [x] Área do atendente integrada às rotas reais
- [x] Senha atual recuperada do servidor por guichê
- [x] Totem com API pública, expediente 7–17, impressão de 5 s e aviso de 10 s
- [x] Painel com até 5 chamadas, atualização de 4 s e primeira carga silenciosa
- [x] Detalhado e auditoria por dia ou mês, com data/hora e nome do atendente
- [x] Serviços locais da AV1 removidos ou substituídos por HTTP
- [x] Testes automatizados de serviços e interface (DOM simulado)
- [x] Persistência da ficha pela API, com recuperação, validação e tratamento de erros
- [ ] Validação no navegador e com MySQL do grupo

Veja [revisao-integracao-av2.md](revisao-integracao-av2.md) para aplicar e verificar esta revisão.
