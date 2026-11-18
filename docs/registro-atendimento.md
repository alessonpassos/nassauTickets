# Registro do atendimento

A ficha que estava desativada na revisão inicial agora consulta e salva o registro na API. Ela mantém os campos do protótipo: tipo de atendimento, encaminhamento e observação opcional. O escopo permanece operacional e anônimo, sem identificação do paciente.

## Aplicar sobre a versão revisada

Na raiz do repositório, onde ficam `frontend`, `backend` e `docs`:

```bash
git apply --check /caminho/para/habilitar-registro-atendimento.patch
git apply /caminho/para/habilitar-registro-atendimento.patch
sudo mariadb < docs/mer/migrations/001-registro-atendimento.sql
```

O patch foi feito sobre o projeto revisado entregue anteriormente nesta conversa. A checagem deve passar antes da aplicação. Alterações particulares em títulos e credenciais não são modificadas pelo patch.

A migração cria somente `registros_atendimento` no banco `nassau_tickets`, com uma chave estrangeira para `atendimentos`. Pode ser executada novamente; não apaga registros nem recria o banco. Execute-a com uma conta autorizada a criar tabelas; no Debian configurado nesta conversa, `sudo mariadb` usa a conta administrativa local. Se o nome do banco foi personalizado, ajuste o `USE` da migração.

Para este banco já instalado, execute apenas a migração, sem reimportar o `schema.sql`. O schema completo foi atualizado para futuras instalações.

Não há dependências novas. Preserve os arquivos `.env`, as senhas de acesso e o `JWT_SECRET`. Reinicie o backend e o frontend nos terminais respectivos com `npm run dev` e recarregue a página.

## Uso

1. Entre como atendente, selecione o guichê e chame uma senha.
2. Clique em **Iniciar atendimento**. O formulário carrega o registro salvo, se houver, e habilita os campos.
3. Selecione **Tipo de atendimento** e **Encaminhar para**. A observação é opcional e tem limite de 200 caracteres.
4. Clique em **Salvar registro** e aguarde a confirmação.
5. As informações salvas podem ser recuperadas ao recarregar a tela ou voltar ao mesmo guichê enquanto o atendimento estiver ativo.
6. Finalize o atendimento normalmente. O registro permanece no banco, mas a tela passa a mostrar o próximo atendimento.

As atualizações automáticas da fila não sobrescrevem um formulário em edição. Enquanto houver alterações pendentes, salve-as ou use **Descartar alterações** antes de finalizar ou trocar de guichê. Durante o salvamento, esses controles ficam bloqueados para evitar requisições simultâneas. Se o salvamento falhar, os campos são mantidos e a confirmação de sucesso não é mostrada; tente salvar novamente.

O preenchimento é opcional para finalizar um atendimento que não tenha alterações pendentes. A funcionalidade não cria um cadastro de pacientes e não inclui prontuário, nome ou CPF.

## Backend e banco

- `GET /api/senhas/:codigo/registro`: retorna o registro ou `null`.
- `POST /api/senhas/:codigo/registro`: cria ou atualiza tipo, setor e observação.
- Ambas as rotas exigem token com perfil `ATENDENTE` e conferem o responsável pelo atendimento.
- A gravação aceita somente senha do dia em estado `EM_ATENDIMENTO`; registros finalizados não podem ser editados.
- A gravação usa transação e bloqueia a mesma linha da senha usada na finalização.
- A tabela usa `atendimento_id` como chave primária e estrangeira: cada atendimento possui zero ou um registro, e cada registro pertence a exatamente um atendimento.
- O DER do grupo precisa incluir a tabela `registros_atendimento` e essa relação.
- Os registros não são expostos nas rotas públicas do Totem e do painel. O atendente responsável pode consultar um registro finalizado pela rota de leitura; não foi adicionada uma tela de histórico de fichas.

## Verificação

Validação automatizada: 23 testes do backend e 24 do frontend, lint e build aprovados. As consultas SQL e a interface dos testes usam respostas controladas; não há MariaDB instalado neste ambiente de execução. A tentativa de abrir Chromium foi bloqueada pelo ambiente, portanto o layout não foi validado em navegador nesta atualização.

No MariaDB do grupo, execute a migração e confira:

1. Inicie uma senha e salve os três campos.
2. Recarregue a página e verifique os valores recuperados.
3. Edite a observação e espere a atualização da fila: ela deve manter a edição.
4. Tente salvar com a API parada: o formulário deve manter os campos e permitir nova tentativa após o servidor voltar.
5. Finalize a senha e confirme que o registro continua no banco:

```bash
sudo mariadb nassau_tickets -e "SELECT atendimento_id, tipo_atendimento, setor, observacao, atualizado_em FROM registros_atendimento ORDER BY atualizado_em DESC LIMIT 5;"
```

Para repetir os testes automatizados, execute `npm test` em `backend` e `frontend`. No frontend, execute também `npm run lint` e `npm run build`.
