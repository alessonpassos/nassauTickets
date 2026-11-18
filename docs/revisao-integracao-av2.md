# Revisão de integração AV2

Base: `nassauTickets(1).zip`, versão enviada pelo grupo nesta conversa. Esta revisão usa as rotas e tabelas presentes nesse ZIP. Não precisa recriar o banco nem alterar o schema.

## O que foi concluído

| Área | Resultado |
| --- | --- |
| Login | `sessao.js` exporta `lerSessao`, `entrar`, `sair` e `obterRotaInicial`; usa apenas `localStorage`, chave `CHAVE_SESSAO` do `api.js`, com `token`, `usuario` e `perfil`. Gestor vai para `/relatorios`. |
| Atendente | Serviço HTTP real, guichês de `GET /guiches`, fila e senha ativa consultadas no servidor. Atualização a cada 4 s e após cada ação; seleção de guichê descarta respostas anteriores. |
| Ações | `POST /senhas/chamar` e `/repetir` com `guiche_id`; `/iniciar`, `/finalizar` e `/nao-compareceu` com `codigo`. Botões bloqueados enquanto processa, carrega ou está com erro. |
| Senha atual | Nova rota protegida `GET /api/senhas/guiche/:guicheId`, com código, tipo, estado, horários, guichê e atendente. Retorna `null` quando livre. Independe das cinco chamadas do painel. |
| Permissões | As ações exigem perfil atendente. A repetição e as transições verificam o proprietário; as transições só alteram senhas do dia. O front bloqueia guichê em uso por outro atendente. |
| Totem | A integração pública e os temporizadores já estavam no ZIP e foram preservados. Expediente corrigido para 7–17; incluído botão de nova tentativa após falha. |
| Painel | A integração já estava no ZIP: consulta pública de 4 s, cinco senhas, `chamadaAtual` nula aceita, primeira carga silenciosa e ID diferente na segunda chamada. Validada por testes de interface. |
| Relatórios | Autorização já usava `api.get`; normalização agora inclui início/fim. Nome do atendente preservado. Detalhado e auditoria aceitam dia ou mês e mostram data e hora. |
| Limpeza | `data/usuarios.js` removido; `filaService.js` e `useFila.js` substituídos por acesso HTTP, sem armazenamento local da fila. `totemService.js` já não existia no ZIP. |

> Atualização posterior: a ficha agora possui persistência. O restante deste documento registra a revisão inicial. Para a atualização do banco e uso do registro, siga [registro-atendimento.md](registro-atendimento.md).

## Decisão sobre a ficha

A lista permitia criar a persistência ou desativar a função. Foi escolhida a desativação: não existe campo no schema nem contrato de gravação. A ficha mostra um aviso e mantém os campos e "Salvar registro" desativados. Não informa que salvou algo sem gravar. O atendimento continua podendo ser iniciado e finalizado.

## Como usar

Opção 1: extraia o ZIP revisado em outra pasta, configure `backend/.env` e `frontend/.env` pelos exemplos e execute `npm ci` em cada pasta. Inicie o backend e o front em terminais separados com `npm run dev`.

Opção 2: aplique `revisao-integracao-av2.patch` na raiz da mesma versão enviada, preservando as alterações particulares do grupo. Confira primeiro o estado do seu repositório e faça um commit das alterações existentes. Depois:

```bash
git apply --check /caminho/para/revisao-integracao-av2.patch
git apply /caminho/para/revisao-integracao-av2.patch
```

Se a checagem falhar, não force a aplicação: a cópia local mudou desde o ZIP. Os patches anteriores não devem ser reaplicados sobre esta revisão.

Após aplicar, execute `npm ci` nas pastas `frontend` e `backend`. As dependências novas do front são ferramentas de teste (JSDOM, consultas de DOM e relógio simulado). Reinicie ambos os servidores e faça login novamente; a sessão antiga não tem token no formato atual.

O banco continua sendo `nassau_tickets`; use as credenciais reais do grupo. Se o banco já existe, **não execute novamente o schema para testar esta revisão**. A API continua usando a data e o horário do MySQL; alinhe o fuso do banco/Node com o horário da unidade para os filtros do dia e horários exibidos.

## Validação realizada

- `frontend`: lint, build e 18 testes aprovados.
- `backend`: sintaxe e 15 testes aprovados.
- Os testes de interface cobrem os fluxos em DOM simulado e relógio controlado. A requisição de narração é verificada; som físico e layout não foram conferidos no navegador.
- Testes de rota usam Express, JWT e bcrypt reais, com respostas simuladas do banco. Não comprovam a execução SQL ou o bloqueio simultâneo de dois guichês em MySQL.

## Verificação final pelo grupo

1. Inicie o MySQL e a API; confira `/api/health`. Faça login com um usuário cadastrado (atendente e gestor).
2. Entre 7h e 17h, emita no Totem. Confira o código devolvido pelo servidor, a impressão de 5 s e o aviso de 10 s.
3. Selecione um guichê, chame e repita. Ative o áudio no painel; a primeira carga não narra, a repetição deve narrar. Recarregue o atendimento e troque de guichê.
4. Inicie e finalize. Em outra senha, repita e marque não compareceu. Confira que outro atendente não consegue alterar a senha.
5. Com gestor, confira resumo diário/mensal e detalhado/auditoria por dia e mês. Início/fim só aparecem quando registrados.
6. Com dois atendentes e dois guichês, chame simultaneamente e confirme códigos distintos e prioridade correta.

## Limitações fora da lista desta revisão

O backend ainda não bloqueia emissão/chamada fora do expediente nem possui rotina de descarte às 17h. O bloqueio 7–17 já ocorre na tela do Totem. Há outras pendências de segurança/documentação anotadas em `pendencias.md`. Nenhuma contingência gera números no navegador.
