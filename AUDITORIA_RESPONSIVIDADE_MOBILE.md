# Auditoria e melhoria de responsividade mobile

Data: 2026-06-25

## Escopo priorizado

Paginas revisadas com foco de defesa: Login, Registro, Dashboard do Usuario, Torneios, Questoes, Noticias, Notificacoes, Perfil, Ranking, Home e componentes compartilhados de botoes, formularios, tabelas, cards, modais e menus.

Breakpoints usados como criterio: 320px, 375px, 425px, 768px e 1024px.

## Problemas encontrados e correcoes

### Camada global de responsividade

Pagina/componente afetado: toda a plataforma.

Causa: `mobile-responsive.css` tinha regras muito agressivas: forcava quase todos os botoes para `fit-content`, escondia colunas de todas as tabelas no mobile, reduzia padding de qualquer `.bg-white`, escondia qualquer `aside` em tablets/celulares e aplicava `transform` global, o que podia afetar elementos `fixed`.

Antes: botoes de formulario podiam perder largura intencional, tabelas perdiam informacao, menus baseados em `aside` podiam desaparecer e modais tinham comportamento inconsistente.

Depois: a folha global agora controla overflow, preserva `w-full` intencional, limita botoes excessivos apenas quando apropriado, deixa tabelas com scroll horizontal controlado, contem modais na viewport e preserva menus mobile.

Arquivo: `FrontEnd/src/styles/mobile-responsive.css`.

### Torneios

Pagina afetada: `FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx`.

Causa: o hero usava `w-screen` com margens negativas (`-ml-[50vw]` e `-mr-[50vw]`) dentro do container do layout, padrao que pode criar scroll horizontal em 320px/375px. O CTA dos cards de disciplina usava `w-full` no mobile sem necessidade funcional.

Antes: risco de overflow horizontal no hero e botao do card ocupando toda a largura.

Depois: full-bleed controlado com `w-[100vw] max-w-[100vw] -translate-x-1/2`; CTA virou `inline-flex` com largura natural e minimo visual consistente.

### Home

Pagina afetada: `FrontEnd/src/Paginas/Secundarias/Home.jsx`.

Causa: o mesmo padrao de `w-screen` com margens negativas aparecia no hero e na secao de desafios.

Antes: risco de scroll horizontal desnecessario em smartphones.

Depois: full-bleed controlado com `w-[100vw] max-w-[100vw] -translate-x-1/2`.

### Notificacoes

Pagina afetada: `FrontEnd/src/Paginas/Secundarias/NotificacoesPage.jsx`.

Causa: o seletor de ordenacao usava `ml-auto` dentro de uma barra flex com varios botoes, podendo empurrar conteudo em telas estreitas. Cards de notificacao mantinham layout horizontal rigido.

Antes: controles podiam ficar apertados ou extrapolar; acoes do card podiam competir com o texto.

Depois: seletor ocupa `w-full` no mobile e volta a `sm:w-auto sm:ml-auto` em telas maiores; cards passam a empilhar no mobile, mantendo botoes acessiveis.

### Dashboard do Usuario

Pagina afetada: `FrontEnd/src/Paginas/Secundarias/Dashboard.jsx`.

Causa: o hero usava estilos inline com layout horizontal fixo, fora do alcance das regras globais.

Antes: metadados do hero podiam ficar comprimidos ao lado do texto em telas pequenas.

Depois: classes responsivas locais empilham o hero em ate 640px, deixam a meta alinhada a esquerda e evitam largura excessiva do shell.

## Validacao

- `npm run build` executado com sucesso em `FrontEnd`.
- Servidor Vite existente confirmado em `http://127.0.0.1:5175` com resposta `200 OK`.
- Varredura estatica nao encontrou mais `w-screen`, `-ml-[50vw]` ou `-mr-[50vw]` nas paginas primarias e secundarias.

Observacao: o build ainda emite um aviso preexistente em `src/Administrador/QuestoesTestesTab.jsx` sobre reatribuir `response` declarado como `const`; nao bloqueou a compilacao e nao foi alterado nesta auditoria.
