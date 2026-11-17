# Registro de testes

Não há testes automatizados no projeto. A verificação é manual, com o arquivo [`backend/requests.http`](../backend/requests.http) (extensão REST Client do VS Code) e navegando pelas telas.

## Feedbacks dos testadores (originalmente em comentários do código)

Os comentários já foram removidos do código; ficam registrados aqui.

- **Luiz — `backend/app.js`:** sistema sem bugs aparentes; aguardava a conexão com o banco para testar o armazenamento do histórico e se todos os processos funcionam.
- **Luiz — `backend/routes/senhas.js`:** chamada de senhas, segunda chamada, histórico (somente em localhost), prioridade e padronização conferem com a documentação.

## Como testar o backend

1. Suba o banco com `docs/mer/schema.sql` e crie um atendente e um gestor (`node scripts/criar_usuario.js`).
2. Rode `npm run dev` em `backend/`.
3. Abra `backend/requests.http`, execute os logins primeiro (os tokens ficam em variáveis) e depois as demais requisições.

O arquivo cobre: health, login (atendente e gestor), emissão SG/SP/SE, painel, fila, chamar, repetir, iniciar, finalizar, não compareceu, os quatro relatórios e os casos de erro 401 (sem token e token alterado) e 403 (atendente em relatório; gestor chamando senha).

## Checklist de testes

Marque ao executar. Nenhum item foi marcado automaticamente.

| Cenário | Como verificar | Status |
| ------- | -------------- | ------ |
| Emissão gera `YYMMDD-PPSQ` e sequência por tipo | `POST /senhas` repetido | [ ] |
| Duas chamadas simultâneas não retornam a mesma senha | Dois guichês chamando ao mesmo tempo | [ ] |
| Alternância SP → SE\|SG → SP → SE\|SG | Emitir vários tipos e chamar em sequência | [ ] |
| Guichê com senha em andamento não chama outra (409) | `chamar` duas vezes no mesmo guichê | [ ] |
| Segunda chamada só uma vez (409 depois) | `repetir` duas vezes | [ ] |
| `NAO_COMPARECEU` só após a 2ª chamada (409 antes) | `nao-compareceu` logo após `chamar` | [ ] |
| Transições inválidas retornam 409 | `finalizar` em senha `AGUARDANDO` | [ ] |
| Painel mostra no máximo 5 chamadas | `GET /senhas/atual` | [ ] |
| Login incorreto retorna 401 com mensagem genérica | Senha errada e usuário inexistente | [ ] |
| Rotas protegidas sem token retornam 401 | Casos 401 do `requests.http` | [ ] |
| Relatórios só para gestor (403 para atendente) | Casos 403 do `requests.http` | [ ] |
| Com o MySQL parado, `/health` retorna 503 | Parar o serviço e chamar `/health` | [ ] |
| Com a API parada, totem e painel exibem aviso | Parar o backend e abrir as telas | [ ] |
| Numeração reinicia a cada dia | Comparar emissões em dias diferentes | [ ] |
| Emissão e chamada fora de 7h–17h são recusadas | **Ainda não implementado** | [ ] |
