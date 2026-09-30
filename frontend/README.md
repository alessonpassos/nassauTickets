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

- `/totem`: exibe QR Code a partir de 768px; em telas menores, exibe o formulário.
- `/totem/retirar?totem=recepcao-01`: abre o formulário em qualquer tamanho de tela; é o destino do QR Code.
- `/atendente`, `/relatorios` e `/painel-de-senha`: telas originais preservadas.
- `/`: abre `/totem` como entrada desta demonstração. Para manter a entrada anterior, altere apenas o redirecionamento em `src/App.jsx` para `/atendente`.

O link do QR Code utiliza a origem atual, sem dados pessoais. Em desenvolvimento, abra o site pelo IP acessível na rede local: `localhost` no QR Code aponta para o próprio celular. No site publicado, o endereço é gerado automaticamente. A prévia do Sites é privada; para abri-la em outro dispositivo, utilize a mesma conta autorizada. O Totem em si não implementa login.

## Fluxo

1. Abra a aba Totem em uma tela de computador.
2. Leia o QR Code no celular ou escolha “Abrir neste dispositivo”.
3. Informe um nome e selecione SG, SP ou SE.
4. Gere e copie a senha. O comprovante permanece disponível após atualizar a página no mesmo navegador durante o expediente.
5. Use “Emitir outra senha” para começar uma nova solicitação, mantendo os contadores.

Os PDFs não fornecem campos obrigatórios do cadastro do cliente nem um contrato HTTP de emissão. Por isso, este recorte solicita somente o nome de exibição e o tipo de atendimento. CPF, data de nascimento, informações clínicas e cadastro completo ficam fora do Totem. O nome é validado em memória e não é persistido. O totem demonstrativo é identificado como `recepcao-01`; seus dados estão centralizados em `src/data/totem.js`.

## Regras implementadas

- SG: atendimento geral; SP: atendimento prioritário; SE: retirada de exames.
- Código `YYMMDD-PPSQ`, por exemplo `260925-SP001`.
- Contadores independentes por tipo, de 001 a 999, com reinício diário.
- Datas e expediente de 7h até antes das 17h no fuso `America/Sao_Paulo`.
- Bloqueio da emissão fora do expediente, inclusive no momento do envio.
- Senhas de dias anteriores ou fora do expediente não são restauradas como válidas.
- Validação do formulário, estado de envio, erros de armazenamento, erro de QR Code com nova tentativa, link de totem inválido e comprovante de sucesso.
- Bloqueio de envio repetido no formulário e Web Locks, quando disponível, para serializar a emissão entre abas do mesmo navegador.
- QR Code gerado localmente pela biblioteca `qrcode`; não envia seu conteúdo a serviços de terceiros.
- Campos com rótulos, navegação por teclado, mensagens acessíveis e apresentação responsiva.

## Dados locais e limites

A chave `nassautickets:totem:demo:v1` no `localStorage` armazena apenas a data, os contadores SG/SP/SE e o último comprovante, sem nome ou documentos. Não há uma fila real. Cada navegador possui sua própria numeração; senhas podem repetir entre dispositivos. A interface informa explicitamente que é uma demonstração. A implementação não deve ser usada para atendimento real antes da integração.

O serviço `src/services/totemService.js` concentra a emissão e a recuperação local. Na AV2, substitua o adaptador de emissão por uma requisição `fetch` ao backend acordado. O contrato lógico esperado deve devolver número, tipo, identificador do totem, data/hora e estado da senha. **Não há endpoint real configurado ou contrato HTTP presumido.**

O backend deverá assumir a numeração global, horário oficial, idempotência, fila, prioridade, concorrência, estados e descarte de senhas no encerramento do expediente. A interface não antecipa próxima senha, posição ou estimativa de espera.

As outras telas mantêm as limitações do arquivo original: o painel de atendimento possui dados demonstrativos e o painel de chamadas consulta `http://localhost:3000/api/senhas/atual`. A emissão do Totem não foi conectada artificialmente a essas telas.

## Organização da alteração

- `src/pages/Totem.jsx`: visão responsiva e coordenação do fluxo.
- `src/components/QrCodeTotem.jsx`: QR Code e acesso alternativo.
- `src/components/FormularioTotem.jsx`: dados controlados, validação e envio.
- `src/components/ComprovanteTotem.jsx`: resultado, cópia e nova solicitação.
- `src/components/IconeTotem.jsx`: ícones da nova interface.
- `src/hooks/useFormatoTotem.js`: detecção reativa da largura da tela.
- `src/data/totem.js`: informações do totem e tipos de atendimento.
- `src/services/totemService.js`: regras e persistência local.
- `src/styles/totem.css`: estilos da nova tela, usando os tokens existentes.

Alterações pontuais em `App.jsx`, `Cabecalho.jsx`, `layout.css`, `index.html`, `package.json` e `package-lock.json` integram a nova aba. A estrutura de rotas existente foi mantida.

## Verificação

Verificadas as regras de horário e data de Brasília, validação, sequência por tipo, reinício diário, recuperação do comprovante, ausência do nome na persistência e erros de armazenamento. O frontend também deve passar pelo build de produção. A verificação visual em navegador não pôde ser realizada neste ambiente por indisponibilidade da prévia supervisionada.

## Autoria e entrega acadêmica

Esta extensão foi desenvolvida com auxílio de IA. A equipe deve revisar, compreender, testar e registrar a utilização conforme as orientações da disciplina. Os nomes, matrículas, papéis, branches e evidências do trabalho em grupo não foram inventados; devem ser preenchidos no repositório principal pela equipe.
