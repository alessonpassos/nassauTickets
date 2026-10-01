# Front-end

## Visão geral

O front-end foi implementado em React 19 com Vite e organiza as telas de acesso, atendimento e relatórios do sistema.

## Páginas reais existentes

| Página | Arquivo | Função |
| ------ | ------- | ------ |
| `Inicio` | `frontend/src/pages/Inicio.jsx` | tela de entrada com links para totem, painel e atendimento |
| `Login` | `frontend/src/pages/Login.jsx` | autenticação local para atendente e gestor |
| `PainelAtendente` | `frontend/src/pages/PainelAtendente.jsx` | seleção do guichê, chamada, início e fim de atendimento |
| `PainelSenhas` | `frontend/src/pages/PainelSenhas.jsx` | painel com histórico das últimas 5 chamadas |
| `Relatorios` | `frontend/src/pages/Relatorios.jsx` | relatórios diários, mensais, detalhados e auditoria |
| `Totem` | `frontend/src/pages/Totem.jsx` | emissão local de senha |

## Rotas reais

| Rota | Papel |
| ---- | ----- |
| `/` | tela inicial |
| `/login` | autenticação local |
| `/atendente` | área do atendente |
| `/painel-de-senha` | painel de senhas |
| `/relatorios` | gestor |
| `/totem` | totem de emissão |

## Funcionalidades implementadas

| Funcionalidade | Status |
| -------------- | ------ |
| Emissão de senha no totem | Implementado localmente |
| Numeração diária por tipo | Implementado localmente |
| Prioridade SP → SE → SG → SP | Implementado localmente |
| Chamada da próxima senha | Implementado localmente |
| Chamada novamente com “Última chamada” | Implementado localmente |
| Início e fim de atendimento | Implementado localmente |
| Não comparecimento após 2 chamadas | Implementado localmente |
| Painel com 5 últimas chamadas | Implementado localmente |
| Login de atendente e gestor | Implementado localmente |
| Relatórios diário e mensal | Implementado localmente |
| Auditoria | Implementado localmente |

## Persistência e sessão

- O estado da fila fica em `localStorage` usando `nassautickets:fila:v1`.
- O estado do totem fica em `localStorage` usando `nassautickets:totem:demo:v1`.
- A sessão do usuário fica em `sessionStorage` usando `nassautickets:sessao`.

Isso confirma que o protótipo atual é local e depende do navegador, sem integração com API.

## Acessibilidade e UX

A interface usa:

- labels e `aria-live` em elementos importantes
- botões e estados de erro visíveis
- CSS reforçando a leitura do painel e da senha
- som e narração opcional no painel de chamadas

## Limitações da UI atual

- O login não é autenticado no back-end.
- A API real da fila ainda não está integrada.
- O totem e o painel usam a mesma fila local por navegador, não por serviço compartilhado.

## Checklist de verificação

- [x] React 19, Vite 8 e React Router 7
- [x] Componentes, páginas e lógica local
- [x] Login local em `sessionStorage`
- [x] Estados de vazio, erro e sucesso na interface
- [x] Acessibilidade básica e painel com áudio
- [ ] Integração real com a API do back-end
- [ ] Autenticação real e autorização por perfil
- [ ] Persistência centralizada em MySQL


