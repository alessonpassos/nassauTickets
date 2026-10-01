# Back-end

## Visão geral

O back-end está em `backend/` e usa Express para responder às rotas do sistema de atendimento por senha. A estrutura observada no código reflete uma API inicial para guichês e para a fila de senhas.

## Stack real

| Tecnologia | Versão/uso |
| ---------- | ---------- |
| Node.js | 22, runtime do servidor |
| Express | 4.x, framework web |
| MySQL | 8.0, persistência real do projeto |
| mysql2 | driver para conexão com MySQL |
| dotenv | leitura de variáveis de ambiente |
| cors | comunicação do front-end em desenvolvimento |

## Rotas reais implementadas

| Método | Rota | Observação |
| ------ | ---- | ---------- |
| GET | `/api/health` | status do serviço |
| GET | `/api/guiches` | retorna guichês ativos |
| GET | `/api/senhas/atual` | chamada atual + histórico |
| GET | `/api/senhas/fila` | fila em espera |
| POST | `/api/senhas/chamar` | chama a próxima senha |
| POST | `/api/senhas/repetir` | segunda chamada |

## Tabelas consultadas

As tabelas encontradas nas consultas SQL são:

- `guiches`
- `senhas`
- `atendimentos`

A implementação também usa `atendente_id` e `guiche_id` diretamente nas queries. Não há migrations nem SQL versionado no repositório.

## Lógica de negócio observada

- Filas são consultadas por `status = 'AGUARDANDO'`.
- A prioridade segue alternância de tipos e é calculada em memória na rota `chamar`.
- A segunda chamada atualiza `segunda_chamada_em` e marca `status = 'CHAMADA_NOVAMENTE'`.
- A regra de não comparecimento depende do estado da senha e é tratada no front-end local.

## Segurança e autenticação

O back-end não implementa autenticação real. O `users.js` é apenas um stub padrão do Express e não expõe login ou sessão. O login do atendente/gestor do front-end é local e guardado em `sessionStorage`.

## Banco de dados e configuração

Arquivo de conexão real:

- `backend/config/database.js`

O pool usa variáveis de ambiente como:

```env
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

## Observações de qualidade

- O `CORS` está configurado para aceitar `http://localhost:5173`.
- O projeto usa `express.json()` e `express.urlencoded()`.
- A rota de erro final responde `res.status(err.status || 500).json({ erro: err.message });`.

## Checklist de status

- [x] API Express com rotas de saúde, fila e chamadas
- [x] Consulta real de guichês e senhas
- [x] Uso de MySQL em pool de conexão
- [ ] Autenticação e autorização reais
- [ ] Usuários e perfis em banco
- [ ] Relatórios diários e mensais completos
- [ ] Auditoria completa e versionada
- [ ] Migrations SQL e seed de dados
- [ ] `.env.example` versionado

## Conclusão

O back-end atual já valida as rotas fundamentais do atendimento, mas ainda precisa avançar para autenticação, persistência completa e relatórios de gestão.

