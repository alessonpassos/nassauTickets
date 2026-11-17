# NassauTickets — Totem

Extensão do frontend React fornecido, com uma nova aba de autoatendimento. Mantém os componentes de cabeçalho e rodapé, a fonte Public Sans, a paleta ciano, os tokens de CSS e as telas existentes.

## Executar

Requer uma versão de Node compatível com o Vite 8 já utilizado pelo projeto (Node 22.12+).

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

```sh
npm run build
npm run preview -- --host 0.0.0.0
```

Esta pasta corresponde a `frontend/` no repositório acadêmico. Não inclui backend, banco de dados ou autenticação de atendentes.

## Rotas

- `/totem`: abre a seleção dos tipos de atendimento em qualquer tamanho de tela.
- `/totem/retirar?totem=recepcao-01`: endereço alternativo para a mesma tela.
- `/`: página inicial com acesso ao Totem, ao atendimento e ao painel de chamadas.

## Fluxo

1. Abra o Totem e selecione atendimento geral, prioritário ou retirada de exames.
2. Confira a senha no comprovante. Uma barra verde diminui durante os cinco segundos de impressão simulada.
3. Após o aviso de conclusão, o Totem volta à seleção em dez segundos. O botão **Nova senha** permite voltar antes.

O totem é identificado como `recepcao-01`. Seus dados, expediente e tempos de impressão estão em `src/data/totem.js`.

## Regras implementadas

- SG: atendimento geral; SP: atendimento prioritário; SE: retirada de exames.
- Código `YYMMDD-PPSQ`, por exemplo `260925-SP001`.
- Contadores independentes por tipo, de 001 a 999, com reinício diário.
- Datas e expediente de 7h até antes das 17h no fuso `America/Sao_Paulo`.
- Bloqueio da emissão fora do expediente, inclusive no momento do envio.
- Em telas pequenas e no endereço alternativo, a página pode restaurar o comprovante durante a janela de impressão e aviso.
- Validação do formulário, estado de envio, erros de armazenamento, link de totem inválido e comprovante de sucesso.
- Bloqueio de envio repetido no formulário e Web Locks, quando disponível, para serializar a emissão entre abas do mesmo navegador.
- Campos com rótulos, navegação por teclado, mensagens acessíveis e apresentação responsiva.

## Dados locais e limites

A chave `nassautickets:totem:demo:v1` no `localStorage` armazena apenas a data, os contadores SG/SP/SE e o último comprovante, sem nome ou documentos. Não há uma fila real. Cada navegador possui sua própria numeração; senhas podem repetir entre dispositivos. A interface informa explicitamente que é uma demonstração. A implementação não deve ser usada para atendimento real antes da integração.

O serviço `src/services/totemService.js` concentra a emissão e a recuperação local. Na AV2, substitua o adaptador de emissão por uma requisição `fetch` ao backend acordado. O contrato lógico esperado deve devolver número, tipo, identificador do totem, data/hora e estado da senha. **Não há endpoint real configurado ou contrato HTTP presumido.**

O backend deverá assumir a numeração global, horário oficial, idempotência, fila, prioridade, concorrência, estados e descarte de senhas no encerramento do expediente. A interface não antecipa próxima senha, posição ou estimativa de espera.

As outras telas mantêm as limitações do arquivo original: o painel de atendimento possui dados demonstrativos e o painel de chamadas consulta `http://localhost:3000/api/senhas/atual`. A emissão do Totem não foi conectada artificialmente a essas telas.

## Organização da alteração

- `src/pages/Totem.jsx`: visão responsiva e coordenação do fluxo.
- `src/components/FormularioTotem.jsx`: dados controlados, validação e envio.
- `src/components/ComprovanteTotem.jsx`: senha, progresso da impressão e retorno à seleção.
- `src/components/IconeTotem.jsx`: ícones da nova interface.
- `src/hooks/useFormatoTotem.js`: detecção reativa da largura da tela.
- `src/data/totem.js`: configuração do Totem e tipos de atendimento.
- `src/services/totemService.js`: regras e persistência local.
- `src/styles/totem.css`: estilos da nova tela, usando os tokens existentes.

Alterações pontuais em `App.jsx`, `Cabecalho.jsx`, `layout.css`, `index.html`, `package.json` e `package-lock.json` integram a nova aba. A estrutura de rotas existente foi mantida.

## Verificação

Para verificar a emissão, abra o Totem durante o expediente, selecione um tipo de atendimento e aguarde a barra, o aviso e o retorno automático. Para compilar a versão de produção, use `npm run build`.

## Autoria e entrega acadêmica

Esta extensão foi desenvolvida com auxílio de IA. A equipe deve revisar, compreender, testar e registrar a utilização conforme as orientações da disciplina. Os nomes, matrículas, papéis, branches e evidências do trabalho em grupo não foram inventados; devem ser preenchidos no repositório principal pela equipe.
