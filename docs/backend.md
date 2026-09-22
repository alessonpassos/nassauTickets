# Back-end

Sistema de controle de atendimento para laboratório de análises clínicas.

## Equipe

| Nome | Matrícula | Atribuição |
| ---- | --------- | ---------- |
| Alesson Passos | 01837765 | Scrum Master & Desenvolvedor |
| Daniel do Nascimento | 01810958 | Documentador & Tester |
| Jefté Pedro | 01856102 | Desenvolvedor |
| Luiz Alexandre | 01540149 | Tester |

## Agentes

| Agente | Sigla | Responsabilidade |
| ------ | ----- | ---------------- |
| Agente Sistema | AS | Persistência, infraestrutura, emissão, painel e processamento |
| Agente Atendente | AA | Chamar o próximo cliente e atender no guichê |
| Agente Cliente | AC | Totem para emitir senha e espera no painel |

## Objetivos

Emitir senhas, gerenciar filas e prioridade, chamar / chamar novamente, iniciar e finalizar atendimento, estados, autenticação, MySQL, relatórios, auditoria, concorrência entre guichês, API para o React.

## Banco de dados (MySQL 8.0)

Campos reais: a definir.

| Entidade | Papel |
| -------- | ----- |
| usuários / atendentes | Login e perfil |
| senhas | Numeração, tipo, estado |
| atendimentos | Guichê e horários |
| guichês | Ponto de atendimento |
| auditoria | Rastreio |

Migrations/seeds: a definir.

## Concorrência

Dois atendentes não podem receber a mesma senha. Previsto: transação MySQL e/ou `SELECT … FOR UPDATE`.

## Relatórios e auditoria

Totais emitidas/atendidas, por tipo, detalhado, tempo médio. Detalhado: número, tipo, emissão, atendimento, guichê.

Auditoria: atendente, guichê, senha, 1ª chamada, 2ª chamada, início, finalização.

## Painel e áudio (dados)

- Painel: **5 últimas** senhas chamadas; não exibir a próxima.
- Segunda chamada: marcar “Última chamada”.
- Back-end envia tipo, número e guichê para o front reproduzir o áudio.

## Segurança e LGPD

Autenticação, autorização, hash de senha, validação, proteção contra SQL Injection, CORS, não versionar `.env`. Minimizar dados pessoais; totem anônimo; acesso por perfil.

## Instalação e execução (quando existir `package.json`)

```bash
cd nassauTickets/back-end
npm install
npm run dev
```

Criar banco MySQL 8.0 e arquivo `.env` a partir de `.env.example` (planejado).

Dois terminais: um para a API, outro para o front-end.

## Checklist

- [ ] API REST e MySQL
- [ ] Emissão, numeração, fila, prioridade SP → SE/SG
- [ ] Chamada, chamar novamente, estados, abandono
- [ ] Horário, guichê, concorrência
- [ ] Autenticação e perfil gestor
- [ ] Relatórios e auditoria
- [ ] Erros, segurança, LGPD, testes, `.env.example`
