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
| `PainelAtendente` | `pages/PainelAtendente.jsx` | Guichê, chamada, repetição, início, fim e não compareceu | **Em migração** (ver abaixo) |
| `Relatorios` | `pages/Relatorios.jsx` | Diário, mensal, detalhado e auditoria | `GET /relatorios/*` |

## Rotas

| Rota | Acesso | Papel |
| ---- | ------ | ----- |
| `/` | Público | Tela inicial |
| `/login` | Público | Autenticação na API |
| `/totem` | Público | Totem de emissão (abre em janela própria, sem menus de funcionário) |
| `/painel-de-senha` | Público | Painel de chamadas |
| `/atendente` | `atendente`, `gestor` | Área do atendente |
| `/relatorios` | `gestor` | Relatórios |

`RotaProtegida` redireciona para `/login` sem sessão e para `/` se o perfil não for permitido. Isso é só conforto de navegação: a proteção real está no servidor (401/403).

## Serviços

| Arquivo | Papel |
| ------- | ----- |
| `services/api.js` | Único cliente HTTP: monta a URL a partir de `VITE_API_URL`, envia o token, converte falhas em `ErroApi` (status 0 = sem conexão), limpa a sessão e volta ao login em caso de 401; contém `traduzirSenha` (`codigo→numero`, `status→estado`, `emitida_em→emitidaEm`) |
| `services/sessao.js` | Guarda e lê a sessão no `sessionStorage` (`nassautickets:sessao`): token, nome, perfil e função. **A senha nunca é guardada** |
| `services/relatorioService.js` | Chamadas de relatório e normalização das linhas para a tabela |
| `services/janelaTotem.js` | Modo "janela de totem" (isola o totem das telas de funcionário) |

## Sessão

- No login, a resposta da API (`token`, `usuario`, `perfil`) é gravada no `sessionStorage`; a sessão sobrevive ao recarregar a página e acaba ao fechar a aba.
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

Ainda não há botão "Tentar novamente" nas telas (o painel e a fila do atendente repetem a consulta sozinhos a cada 4 s).

## Acessibilidade e UX

- Rótulos, `aria-live`/`role="alert"` em mensagens importantes e foco gerenciado no totem.
- Painel com sinal sonoro e narração opcionais (precisa ser ligado pelo usuário).
- Totem responsivo, com bloqueio de envio repetido.

## Pendências do front

- **`/atendente` está a meio caminho da migração.** A página já foi escrita para a API, mas ainda importa `services/filaService.js` (a versão local da AV1), que não tem `listarFila`, `listarGuiches` etc.; além disso a página usa `GUICHES` e `sair` (no `InfoUsuario`), que não estão definidos nela. Falta criar o serviço com `fetch` (`/guiches`, `/senhas/fila`, `/senhas/chamar`, `/repetir`, `/iniciar`, `/finalizar`, `/nao-compareceu`) e corrigir esses pontos.
- `data/totem.js` está com `abertura: 0` e `encerramento: 24`; o expediente correto é 7–17.
- `data/usuarios.js` e a função `entrar()` de `sessao.js` são restos da AV1 (usuários e senhas em texto puro no bundle) e devem ser removidos.
- `services/filaService.js` e `hooks/useFila.js` são o legado local; remover quando o atendente usar a API.
- Relatório detalhado e auditoria mostram "—" em atendimento, início e fim porque a API ainda não devolve esses campos.
- Botão "Tentar novamente" e dados locais de contingência.

## Checklist

- [x] React 19, Vite e React Router
- [x] Cliente HTTP único com `VITE_API_URL` e `frontend/.env.example`
- [x] Login real, sessão sem senha, logout e tratamento de 401/403
- [x] Totem, painel e relatórios integrados à API
- [x] Acessibilidade básica e painel com áudio
- [ ] Área do atendente integrada à API
- [ ] Expediente 7h–17h na configuração do totem
- [ ] Remoção do legado da AV1 (`usuarios.js`, `filaService.js`, `useFila.js`)
- [ ] Botão "Tentar novamente" e contingência local
