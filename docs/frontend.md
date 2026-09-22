# Front-end

Interface React do CRM Hospitalar: totem, painel, área do atendente e, quando existir, relatórios.

No **front-end**, todos os integrantes desenvolvem.

## Equipe (front-end)

| Nome | Matrícula | Atribuição |
| ---- | --------- | ---------- |
| Alesson Passos | 01837765 | Desenvolvedor |
| Daniel do Nascimento | 01810958 | Desenvolvedor |
| Jefté Pedro | 01856102 | Desenvolvedor |
| Luiz Alexandre | 01540149 | Desenvolvedor |

## Público na interface

| Público | Finalidade |
| ------- | ---------- |
| Recepção | Apoiar o paciente no totem e no painel |
| Corpo clínico / atendente | Login, chamada de senha e registro no guichê |
| Pacientes | Emitir senha e acompanhar o painel |
| Gestor | Relatórios, se a tela existir |

## Funcionalidades

| Funcionalidade | Descrição | Status |
| -------------- | --------- | ------ |
| Totem de emissão | Cliente escolhe SP, SE ou SG e recebe a senha | Planejado |
| Painel de chamadas | Exibe as 5 últimas senhas; não antecipa a próxima | Planejado |
| Áudio da chamada | Tipo, número e guichê; “Última chamada” na segunda chamada | Planejado |
| Login do atendente | Tela de autenticação; cliente sem login | Planejado |
| Área do atendente | Chamar, chamar novamente, iniciar e finalizar | Planejado |
| Relatórios (gestor) | Diário, mensal e auditoria | Planejado |

Cadastro de pacientes / prontuário / agenda: **fora deste escopo**.

## Autenticação na UI

```
Usuário → Login → Validação → Autenticação → Sessão → Acesso autorizado
```

Cliente no totem: **sem login**. Não publicar senhas ou tokens no repositório.

Planejado: tela de login, credenciais inválidas, sessão/token, rotas protegidas, logout, tratamento 401/403.

## Estados da aplicação

| Estado | Uso |
| ------ | --- |
| Carregamento | Enquanto dados são buscados |
| Sucesso | Operação concluída |
| Estado vazio | Sem informações para exibir |
| Erro | Falha na operação |
| Tentar novamente | Nova tentativa após falha |

## Acessibilidade, segurança e LGPD (UI)

- HTML semântico, labels, teclado, contraste, textos do painel, áudio.
- Rotas protegidas; não armazenar senhas no código; `.env` para URL da API.
- Não versionar dados reais de pacientes; totem anônimo; mostrar só o necessário ao perfil.

## Instalação e execução (quando existir `package.json`)

```bash
git clone https://github.com/alessonpassos/nassauTickets.git
cd nassauTickets/front-end
npm install
npm run dev
```

Configuração: `VITE_API_URL=`.

## Checklist

- [ ] React / Vite / React Router
- [ ] Componentes e páginas
- [ ] fetch e autenticação
- [ ] Loading, vazio, erro, tentar novamente
- [ ] Validações, acessibilidade, segurança, LGPD
- [ ] Testes e documentação atualizada
