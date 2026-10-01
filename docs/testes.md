# Registro de testes

## Feedbacks dos testadores (originalmente em comentários do código)

- **Luiz — `backend/app.js`:** sistema sem bugs aparentes; aguardava a conexão com o banco para testar o armazenamento do histórico e se todos os processos funcionam.
- **Luiz — `backend/routes/senhas.js`:** chamada de senhas, segunda chamada, histórico (somente em localhost), prioridade e padronização conferem com a documentação.

> Sugestão: os desenvolvedores podem remover esses comentários do código, pois já estão registrados aqui.

## Checklist para a integração com o banco

- [ ] Duas chamadas simultâneas não retornam a mesma senha
- [ ] Alternância SP → SE|SG → SP → SE|SG
- [ ] Emissão e chamada fora de 7h–17h são recusadas
- [ ] Numeração reinicia a cada dia
- [ ] Segunda chamada só uma vez; NÃO_COMPARECEU após duas
- [ ] Painel mostra as 5 últimas e oculta a próxima
- [ ] Relatórios acessíveis apenas ao gestor (403 para atendente)
- [ ] Com o MySQL parado, frontend e painel exibem aviso de indisponibilidade
