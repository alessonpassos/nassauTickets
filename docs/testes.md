# Registro de testes

## Revisão de integração AV2

47 testes aprovados após a implementação do registro: 23 no backend e 24 no frontend. Execute `npm ci` e `npm test` em cada pasta. Não é preciso MySQL nem `.env` para esses testes; o banco e as respostas HTTP são simulados. Os testes usam credenciais fictícias e não gravam no banco do grupo.

- Backend: login com bcrypt/JWT, proteção 401/403, emissão pública e transação, guichê ocupado, senha atual, propriedade, repetição, transições e relatórios por mês com início/fim.
- Frontend: sessão única, token em rotas privadas, 401 público sem logout, rotas/corpos corretos, tradução de dados e expediente.
- Interface em DOM simulado: login/redirecionamento, atendimento completo, não compareceu, recuperação por guichê, erros e nova tentativa, ficha (validação, gravação, recuperação, falhas, troca de guichê e envio duplicado), Totem (5 s + 10 s), painel (silêncio inicial, segunda narração, falhas, vazio e limite 5) e relatórios mensais.

`npm run lint` e `npm run build` do frontend também passaram. Os arquivos do backend passaram na checagem de sintaxe do Node.

**Limite desta validação:** consultas SQL, travas e concorrência ainda precisam ser exercitadas em MySQL real. O ambiente não conseguiu abrir o servidor local no navegador; os testes de interface usam JSDOM e não verificam layout nem som físico. Abaixo permanece o roteiro manual para execução pelo grupo.

## Feedbacks dos testadores (originalmente em comentários do código)

Os comentários já foram removidos do código; ficam registrados aqui.

- **Luiz — `backend/app.js`:** sistema sem bugs aparentes; aguardava a conexão com o banco para testar o armazenamento do histórico e se todos os processos funcionam.
- **Luiz — `backend/routes/senhas.js`:** chamada de senhas, segunda chamada, histórico (somente em localhost), prioridade e padronização conferem com a documentação.

## Como testar o backend

1. Suba o banco com `docs/mer/schema.sql` e crie um atendente e um gestor (`node scripts/criar_usuario.js`).
2. Rode `npm run dev` em `backend/`.
3. Abra `backend/requests.http`, execute os logins primeiro (os tokens ficam em variáveis) e depois as demais requisições.

O arquivo cobre: health, login (atendente e gestor), emissão SG/SP/SE, painel, fila, chamar, repetir, iniciar, finalizar, não compareceu, os quatro relatórios e os casos de erro 401 (sem token e token alterado) e 403 (atendente em relatório; gestor chamando senha).

## Registro do atendimento

Os testes adicionais cobrem autenticação, proprietário, transação, bloqueio por estado/dia, atualização de registro e ausência da migração. A interface cobre recuperação e preservação dos campos durante a consulta da fila, nova tentativa, bloqueio enquanto salva e descarte de alterações. As respostas do banco são simuladas; execute também o roteiro em [registro-atendimento.md](registro-atendimento.md) no MariaDB/MySQL do grupo.

## Checklist de testes

Marque ao executar. Nenhum item foi marcado automaticamente.

| Cenário | Como verificar | Status |
| ------- | -------------- | ------ |
| Emissão gera `YYMMDD-PPSQ` e sequência por tipo | `POST /senhas` repetido | [x] |
| Duas chamadas simultâneas não retornam a mesma senha | Dois guichês chamando ao mesmo tempo | [x] |
| Alternância SP → SE\|SG → SP → SE\|SG | Emitir vários tipos e chamar em sequência | [x] |
| Guichê com senha em andamento não chama outra (409) | `chamar` duas vezes no mesmo guichê | [x] |
| Segunda chamada só uma vez (409 depois) | `repetir` duas vezes | [x] |
| `NAO_COMPARECEU` só após a 2ª chamada (409 antes) | `nao-compareceu` logo após `chamar` | [x] |
| Transições inválidas retornam 409 | `finalizar` em senha `AGUARDANDO` | [x] |
| Painel mostra no máximo 5 chamadas | `GET /senhas/atual` | [x] |
| Login incorreto retorna 401 com mensagem genérica | Senha errada e usuário inexistente | [x] |
| Rotas protegidas sem token retornam 401 | Casos 401 do `requests.http` | [x] |
| Relatórios só para gestor (403 para atendente) | Casos 403 do `requests.http` | [x] |
| Com o MySQL parado, `/health` retorna 503 | Parar o serviço e chamar `/health` | [x] |
| Com a API parada, totem e painel exibem aviso | Parar o backend e abrir as telas | [x] |
| Numeração reinicia a cada dia | Comparar emissões em dias diferentes | [ ] |
| Emissão e chamada fora de 7h–17h são recusadas | **Ainda não implementado** | [ ] |


## Resultados dos testes feitos por Luiz antes da entrega

Cada teste feito foi feito seguindo as ordem de cada item listado no "Checklist de testes",
e marcado pelo teste Luiz após sua realização.

Emissão de senhas: segue a regra de diferenciação de senha de atendimento geral, prioritário e
de retirada de exames, seguindos os parametros de numeração de cada, com a sigla seguida pela
numeração da ficha, logo em baixo, data na ordem: dois últimos digitos do ano, mês e dia, além de
informar o horário que foi retirada a ficha.
Duas chamadas simultâneas não retornam a mesma senha: feito o teste, com dois guichês chamando ao
mesmo tempo, e chamando fichas diferentes.
Alternancia de senhas seguindo a ordem prioridaria: as senhas chamadas seguem uma alternancia,
chamando primeiro uma prioridaria, logo chama uma geral ou de retirada de exames, volta a chamar
uma prioridaria e depois, se antes chamou uma geral, agora chama uma retirada de exames, e visse e versa.
Guichê com senha em andamento não chama outra: feito o teste, após a chamada de uma senha, não será possível chamar outra senha caso não chame ela novamente e a coloque como não comparecida, ou finalizado o atendimento daquela senha.
Segunda chamada só uma vez: após a chamada de uma senha o botão de chamar de novo só funciona uma vez para aquela senha, sendo necessário chamar outra senha para usar novamente o botão.
`NAO_COMPARECEU` só após a 2ª chamada: o botão não compareceu só funciona a partir do momento que a segunda chamada da senha já foi efetuada, caso não ocorra de chamar novamente, não é possível por como não compareceu.
Transições inválidas retornam 409: nas transições entre telas, se não tiver a autorização, pode haver dois acontecimentos, caso não tenha feito o login, será mandando para tela de login, caso já tenha feito o login e não possua a permissão de acessar aquela página, é mandada para tela do home.
Painel mostra no máximo 5 chamadas: o painel de senhas só mostra no máximo as últimas 5 senhas chamadas, com destaque a última chamada, dizendo a senha e qual guichê a chamou, além dos horarios que foram chamadas.
Login incorreto retorna 401 com mensagem genérica: Quando feito login incorreto aparecerá uma mensagem de ou usuário ou senha incorreta, em caixa vermelha em cima do login.
Rotas protegidas sem token retornam 401: Mesmo caso do item de transições acima citado.
Relatórios só para gestor: Somente tem conta com categoria de gestor tem acesso, podendo ver todas suas funcinalidades.
Com o MySQL parado, `/health` retorna 503: Casos o banco não esteja ativo ou conectado, mostrará uma mensagem de que não foi possível se conectar com o sevidor, impossibilidando logins, emissões de fichas, e das funcionalidades que depedem dessas duas coisas.
Com a API parada, totem e painel exibem aviso: Quando api não está funcionando, ambas mostram aviso de não conecção, não conseguindo fazer a emissão das fichas.

## Notas adicionais sobres os testes de Luiz

Caminho de rotas está totalmemte funcional, cada dela encaminha para tela correspondente como deveria, home podendo podendo direcionar para o totem, painel de chamadas e telas de atendimento e relatorios caso já tenha feito o login correspontente.
Além da barra de caminhos na parte superior também funcionar com um direcionamento funcional na hora de navegar pelo programa.
Totem se mantém em uma aba a parte, sem a possibilidade de navegar para qualquer outra aba, protegendo que algum cliente entre em uma aba não devida no totem.
Tela do painel se mantém com problema de chamada de voz fica desativada toda vez que sair daquela tela, tendo que ser ativada manualmente toda vez que voltar para ela, mas todas as necessidades visuais se enquadram como deviam.
Painel de atendente com suas funcionalidades conforme a documentação, podendo ver quais senhas estão na fila de espera para serem chamadas, preencher os campos estão tudo nos conformes.
tela de gestor com seu relatórios podendo ver tanto somente do dia, como do mês que mostra a quantidade atendida, quais fichas foram chamadas, quais não, quantos não compareceram e descartadas, além do tempo médio dos atendimentos, e por fim os relatorios detalhados, onde mostra quem atendeu cada senha, em qual guichê, quando que foi emitida a senha e quando foi atendida, podendo filtrar por qual tipo de senha ou deixar todas as senhas.