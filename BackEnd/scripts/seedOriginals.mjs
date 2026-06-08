/**
 * Seed de 45 questões adicionais para os componentes MatematicaOriginal,
 * InglesOriginal e ProgramacaoOriginal — servidos pelos endpoints
 * /torneios/:id/questoes/matematica|ingles|programacao
 *
 * 15 por disciplina: 5 fácil + 5 médio + 5 difícil
 * Todas ligadas ao torneio ativo ID=32
 */
import sequelize from '../config/db.js';
const { QueryTypes } = await import('sequelize');
const tid = 32;
const now = new Date();

const ins = async (titulo, descricao, disciplina, dificuldade, opcoes, resp, expl, pontos) => {
  const result = await sequelize.query(
    'INSERT INTO questoes (torneio_id,titulo,descricao,disciplina,tipo,dificuldade,opcoes,resposta_correta,explicacao,pontos,status_aprovacao,created_at,updated_at) VALUES (:tid,:titulo,:descricao,:disciplina,"multipla_escolha",:dificuldade,:opcoes,:resp,:expl,:pontos,"aprovada",:now,:now)',
    { replacements: { tid, titulo, descricao, disciplina, dificuldade, opcoes: JSON.stringify(opcoes), resp, expl, pontos, now }, type: QueryTypes.INSERT }
  );
  return result[0];
};

// ╔══════════════════════════════════════════════╗
// ║          MATEMÁTICA — 15 questões            ║
// ╚══════════════════════════════════════════════╝

console.log('\n📐 Inserindo questões de Matemática...');

// ── FÁCIL (5) ───────────────────────────────────
await ins('Perímetro do quadrado','Um quadrado tem lado 7 cm. Qual é o seu perímetro?','matematica','facil',
  [{id:'a',texto:'21 cm'},{id:'b',texto:'49 cm'},{id:'c',texto:'28 cm'},{id:'d',texto:'14 cm'}],
  'c','Perímetro = 4 × lado = 4 × 7 = 28 cm.',10);

await ins('Número primo','Qual dos seguintes é um número primo?','matematica','facil',
  [{id:'a',texto:'9'},{id:'b',texto:'15'},{id:'c',texto:'11'},{id:'d',texto:'21'}],
  'c','11 só é divisível por 1 e por si mesmo — é primo.',10);

await ins('Sequência de Fibonacci','Na sequência 1, 1, 2, 3, 5, 8, ... qual é o próximo número?','matematica','facil',
  [{id:'a',texto:'11'},{id:'b',texto:'13'},{id:'c',texto:'10'},{id:'d',texto:'12'}],
  'b','Cada termo é a soma dos dois anteriores: 5+8=13.',10);

await ins('Ângulos','Quantos graus tem um ângulo recto?','matematica','facil',
  [{id:'a',texto:'45°'},{id:'b',texto:'180°'},{id:'c',texto:'360°'},{id:'d',texto:'90°'}],
  'd','Um ângulo recto mede exactamente 90°.',10);

await ins('Volume do cubo','Um cubo tem aresta 3 cm. Qual é o seu volume?','matematica','facil',
  [{id:'a',texto:'9 cm³'},{id:'b',texto:'27 cm³'},{id:'c',texto:'18 cm³'},{id:'d',texto:'6 cm³'}],
  'b','Volume do cubo = aresta³ = 3³ = 27 cm³.',10);

// ── MÉDIO (5) ───────────────────────────────────
await ins('Sistema de equações','Se x + y = 10 e x - y = 4, qual é o valor de x?','matematica','medio',
  [{id:'a',texto:'6'},{id:'b',texto:'8'},{id:'c',texto:'5'},{id:'d',texto:'7'}],
  'd','Somando: 2x=14 → x=7; depois y=3.',15);

await ins('Probabilidade básica','Num saco com 3 bolas vermelhas e 5 azuis, qual é a probabilidade de retirar uma vermelha?','matematica','medio',
  [{id:'a',texto:'1/3'},{id:'b',texto:'3/8'},{id:'c',texto:'5/8'},{id:'d',texto:'3/5'}],
  'b','P = 3/(3+5) = 3/8.',15);

await ins('Teorema de Pitágoras','Num triângulo rectângulo, os catetos medem 3 e 4. Qual é a hipotenusa?','matematica','medio',
  [{id:'a',texto:'6'},{id:'b',texto:'7'},{id:'c',texto:'5'},{id:'d',texto:'8'}],
  'c','c² = 3² + 4² = 9 + 16 = 25 → c = 5.',15);

await ins('Progressão geométrica','Na PG (2, 6, 18, ...) qual é o 5º termo?','matematica','medio',
  [{id:'a',texto:'108'},{id:'b',texto:'162'},{id:'c',texto:'54'},{id:'d',texto:'54'}],
  'b','Razão r=3; a₅ = 2×3⁴ = 2×81 = 162.',15);

await ins('Frações','Qual é o resultado de 3/4 + 1/6?','matematica','medio',
  [{id:'a',texto:'4/10'},{id:'b',texto:'11/12'},{id:'c',texto:'5/12'},{id:'d',texto:'2/5'}],
  'b','MMC(4,6)=12; 9/12 + 2/12 = 11/12.',15);

// ── DIFÍCIL (5) ──────────────────────────────────
await ins('Limite','Qual é o lim (x→∞) de (3x²+1)/(x²+2)?','matematica','dificil',
  [{id:'a',texto:'0'},{id:'b',texto:'1'},{id:'c',texto:'Infinito'},{id:'d',texto:'3'}],
  'd','Dividir pelo maior grau: lim = 3/1 = 3.',20);

await ins('Integral','Qual é a integral de 2x em relação a x?','matematica','dificil',
  [{id:'a',texto:'2'},{id:'b',texto:'x² + C'},{id:'c',texto:'x²'},{id:'d',texto:'2x + C'}],
  'b','∫2x dx = x² + C (regra da potência inversa).',20);

await ins('Binómio de Newton','No desenvolvimento de (a+b)⁴, qual é o coeficiente do termo a²b²?','matematica','dificil',
  [{id:'a',texto:'4'},{id:'b',texto:'8'},{id:'c',texto:'6'},{id:'d',texto:'12'}],
  'c','C(4,2) = 4!/(2!2!) = 6.',20);

await ins('Números complexos','Qual é o módulo de z = 3 + 4i?','matematica','dificil',
  [{id:'a',texto:'7'},{id:'b',texto:'5'},{id:'c',texto:'√7'},{id:'d',texto:'1'}],
  'b','|z| = √(3²+4²) = √(9+16) = √25 = 5.',20);

await ins('Matrizes','Qual é o determinante da matriz [[2,1],[3,4]]?','matematica','dificil',
  [{id:'a',texto:'5'},{id:'b',texto:'11'},{id:'c',texto:'3'},{id:'d',texto:'8'}],
  'a','det = (2×4) - (1×3) = 8 - 3 = 5.',20);

// ╔══════════════════════════════════════════════╗
// ║            INGLÊS — 15 questões              ║
// ╚══════════════════════════════════════════════╝

console.log('\n🇬🇧 Inserindo questões de Inglês...');

// ── FÁCIL (5) ───────────────────────────────────
await ins('Seasons','Which season comes after summer?','ingles','facil',
  [{id:'a',texto:'Spring'},{id:'b',texto:'Winter'},{id:'c',texto:'Autumn'},{id:'d',texto:'Summer again'}],
  'c','The four seasons in order: spring, summer, autumn, winter.',10);

await ins('Family members','What do you call your mother\'s mother?','ingles','facil',
  [{id:'a',texto:'Aunt'},{id:'b',texto:'Sister'},{id:'c',texto:'Cousin'},{id:'d',texto:'Grandmother'}],
  'd','Your mother\'s mother is your grandmother.',10);

await ins('Simple present','She ___ to school every day.','ingles','facil',
  [{id:'a',texto:'go'},{id:'b',texto:'goes'},{id:'c',texto:'going'},{id:'d',texto:'gone'}],
  'b','Third person singular takes -s: she goes.',10);

await ins('Months','How many months have 30 days?','ingles','facil',
  [{id:'a',texto:'4'},{id:'b',texto:'6'},{id:'c',texto:'7'},{id:'d',texto:'3'}],
  'a','April, June, September and November — 4 months have exactly 30 days.',10);

await ins('Food vocabulary','Which of these is a vegetable?','ingles','facil',
  [{id:'a',texto:'Apple'},{id:'b',texto:'Carrot'},{id:'c',texto:'Mango'},{id:'d',texto:'Banana'}],
  'b','Carrot is a vegetable; the others are fruits.',10);

// ── MÉDIO (5) ───────────────────────────────────
await ins('Past continuous','What were you doing when I called? I ___ TV.','ingles','medio',
  [{id:'a',texto:'watched'},{id:'b',texto:'was watching'},{id:'c',texto:'have watched'},{id:'d',texto:'watch'}],
  'b','Past continuous: was/were + -ing. Describes an ongoing past action.',15);

await ins('Comparatives','Mount Everest is ___ mountain in the world.','ingles','medio',
  [{id:'a',texto:'higher'},{id:'b',texto:'more high'},{id:'c',texto:'the highest'},{id:'d',texto:'the most high'}],
  'c','Superlative of short adjectives: add -est with "the".',15);

await ins('Modal verbs','You ___ wear a seatbelt. It\'s the law.','ingles','medio',
  [{id:'a',texto:'could'},{id:'b',texto:'might'},{id:'c',texto:'must'},{id:'d',texto:'would'}],
  'c','"Must" expresses obligation. The others express possibility or preference.',15);

await ins('Collocations','Which verb collocates correctly: ___ a mistake.','ingles','medio',
  [{id:'a',texto:'do'},{id:'b',texto:'make'},{id:'c',texto:'have'},{id:'d',texto:'take'}],
  'b','The correct collocation is "make a mistake", not "do a mistake".',15);

await ins('Connectors','___ she was tired, she continued working.','ingles','medio',
  [{id:'a',texto:'Because'},{id:'b',texto:'So'},{id:'c',texto:'Although'},{id:'d',texto:'Therefore'}],
  'c','"Although" introduces a contrast. Despite being tired, she kept working.',15);

// ── DIFÍCIL (5) ──────────────────────────────────
await ins('Cleft sentences','It ___ John who broke the window, not Peter.','ingles','dificil',
  [{id:'a',texto:'is'},{id:'b',texto:'were'},{id:'c',texto:'was'},{id:'d',texto:'has been'}],
  'c','Cleft sentence in the past: "It was + noun + who/that + verb".',20);

await ins('Advanced vocabulary','The politician\'s speech was full of ___: deliberately vague language.','ingles','dificil',
  [{id:'a',texto:'pleonasm'},{id:'b',texto:'ambiguity'},{id:'c',texto:'obfuscation'},{id:'d',texto:'circumlocution'}],
  'c','"Obfuscation" means making something unclear or confusing deliberately.',20);

await ins('Mixed conditional','If I ___ harder at school, I would have a better job now.','ingles','dificil',
  [{id:'a',texto:'worked'},{id:'b',texto:'had worked'},{id:'c',texto:'would work'},{id:'d',texto:'work'}],
  'b','Mixed conditional: past perfect for condition (past cause), would + infinitive for result (present).',20);

await ins('Discourse markers','___ speaking, the results were disappointing.','ingles','dificil',
  [{id:'a',texto:'Frankly'},{id:'b',texto:'However'},{id:'c',texto:'Therefore'},{id:'d',texto:'Nevertheless'}],
  'a','"Frankly speaking" is a fixed discourse marker meaning "to be honest".',20);

await ins('Formal register','Which sentence is most appropriate in a formal letter?','ingles','dificil',
  [{id:'a',texto:'I wanna let you know about the changes.'},{id:'b',texto:'Just wanted to say the stuff changed.'},{id:'c',texto:'I am writing to inform you of the recent amendments.'},{id:'d',texto:'Hey, things have changed, FYI.'}],
  'c','"I am writing to inform you" is the appropriate formal register for business correspondence.',20);

// ╔══════════════════════════════════════════════╗
// ║         PROGRAMAÇÃO — 15 questões            ║
// ╚══════════════════════════════════════════════╝

console.log('\n💻 Inserindo questões de Programação...');

// ── FÁCIL (5) ───────────────────────────────────
await ins('Variáveis','Qual é a forma correcta de declarar uma variável em Python?','programacao','facil',
  [{id:'a',texto:'var x = 5'},{id:'b',texto:'int x = 5'},{id:'c',texto:'x = 5'},{id:'d',texto:'declare x = 5'}],
  'c','Em Python as variáveis são declaradas sem palavra-chave: x = 5.',10);

await ins('CSS básico','Qual propriedade CSS altera a cor do texto?','programacao','facil',
  [{id:'a',texto:'background-color'},{id:'b',texto:'font-color'},{id:'c',texto:'text-color'},{id:'d',texto:'color'}],
  'd','A propriedade CSS para cor do texto é "color".',10);

await ins('JavaScript — tipo de dados','Qual é o tipo de "42" em JavaScript (sem aspas)?','programacao','facil',
  [{id:'a',texto:'string'},{id:'b',texto:'int'},{id:'c',texto:'number'},{id:'d',texto:'float'}],
  'c','Em JavaScript, números inteiros e decimais têm o tipo "number".',10);

await ins('Operador módulo','Qual é o resultado de 17 % 5 em programação?','programacao','facil',
  [{id:'a',texto:'3'},{id:'b',texto:'2'},{id:'c',texto:'12'},{id:'d',texto:'0'}],
  'b','17 % 5 = o resto da divisão = 17 - (3×5) = 17-15 = 2.',10);

await ins('Estrutura de dados','Qual estrutura armazena pares chave-valor?','programacao','facil',
  [{id:'a',texto:'Array'},{id:'b',texto:'Stack'},{id:'c',texto:'Queue'},{id:'d',texto:'Dicionário/Mapa'}],
  'd','Dicionários (Python) ou Maps (JavaScript) armazenam pares chave-valor.',10);

// ── MÉDIO (5) ───────────────────────────────────
await ins('Programação orientada a objectos','O que é encapsulamento em OOP?','programacao','medio',
  [{id:'a',texto:'Herdar propriedades de outra classe'},{id:'b',texto:'Ter múltiplas formas'},{id:'c',texto:'Esconder dados internos e expor apenas interface pública'},{id:'d',texto:'Criar instâncias de uma classe'}],
  'c','Encapsulamento: ocultar detalhes de implementação, expondo apenas o necessário.',15);

await ins('Complexidade espacial','Qual algoritmo de ordenação usa O(1) de espaço auxiliar?','programacao','medio',
  [{id:'a',texto:'Merge Sort'},{id:'b',texto:'Heap Sort'},{id:'c',texto:'Bubble Sort'},{id:'d',texto:'Quick Sort'}],
  'c','Bubble Sort é in-place (O(1) espaço auxiliar), ao contrário do Merge Sort que usa O(n).',15);

await ins('Promises JavaScript','O que retorna uma Promise que foi resolvida com sucesso?','programacao','medio',
  [{id:'a',texto:'Um erro'},{id:'b',texto:'O valor no bloco .catch()'},{id:'c',texto:'O valor no bloco .then()'},{id:'d',texto:'Undefined'}],
  'c','Uma Promise resolvida chama o callback do .then() com o valor de resolução.',15);

await ins('Normalização SQL','O que significa a 1ª Forma Normal (1FN) em bases de dados relacionais?','programacao','medio',
  [{id:'a',texto:'Eliminar dependências transitivas'},{id:'b',texto:'Cada coluna deve conter valores atómicos, sem grupos repetidos'},{id:'c',texto:'Cada atributo não-chave depende da chave toda'},{id:'d',texto:'Não ter redundâncias'}],
  'b','1FN: valores atómicos por célula e sem grupos de colunas repetidas.',15);

await ins('REST API','Qual código HTTP indica que um recurso foi criado com sucesso?','programacao','medio',
  [{id:'a',texto:'200 OK'},{id:'b',texto:'204 No Content'},{id:'c',texto:'201 Created'},{id:'d',texto:'202 Accepted'}],
  'c','201 Created é o código padrão para criação bem-sucedida de recursos via POST.',15);

// ── DIFÍCIL (5) ──────────────────────────────────
await ins('Algoritmos — Busca Binária','Qual é o pré-requisito obrigatório para aplicar busca binária?','programacao','dificil',
  [{id:'a',texto:'Array com tamanho par'},{id:'b',texto:'Array ordenado'},{id:'c',texto:'Array sem duplicados'},{id:'d',texto:'Array em memória RAM'}],
  'b','Busca binária exige array ordenado para funcionar correctamente.',20);

await ins('Design Pattern — Observer','O padrão Observer é usado principalmente para:','programacao','dificil',
  [{id:'a',texto:'Criar objectos complexos passo a passo'},{id:'b',texto:'Garantir uma única instância de classe'},{id:'c',texto:'Notificar múltiplos objectos quando o estado de um objecto muda'},{id:'d',texto:'Converter a interface de uma classe noutras'}],
  'c','Observer: define dependência 1-para-muitos — quando um objecto muda, os dependentes são notificados.',20);

await ins('Programação funcional — Currying','O que é currying em programação funcional?','programacao','dificil',
  [{id:'a',texto:'Converter um loop em recursão'},{id:'b',texto:'Transformar uma função de múltiplos argumentos em sequência de funções de um argumento'},{id:'c',texto:'Aplicar uma função a cada elemento de uma lista'},{id:'d',texto:'Memoizar resultados de funções'}],
  'b','Currying: f(a,b,c) → f(a)(b)(c). Cada chamada retorna uma nova função esperando o próximo argumento.',20);

await ins('Segurança — XSS','O que é um ataque Cross-Site Scripting (XSS)?','programacao','dificil',
  [{id:'a',texto:'Injectar código SQL malicioso'},{id:'b',texto:'Interceptar comunicação HTTPS'},{id:'c',texto:'Injectar scripts maliciosos em páginas web vistas por outros utilizadores'},{id:'d',texto:'Forjar identidade do servidor'}],
  'c','XSS: o atacante injeta scripts no browser das vítimas através de conteúdo não sanitizado.',20);

await ins('Concorrência — Semáforo','Em programação concorrente, para que serve um semáforo?','programacao','dificil',
  [{id:'a',texto:'Aumentar a velocidade de execução'},{id:'b',texto:'Controlar o acesso a recursos partilhados limitando o número de threads simultâneas'},{id:'c',texto:'Distribuir tarefas entre processadores'},{id:'d',texto:'Eliminar condições de corrida automaticamente'}],
  'b','Semáforo: variável de controlo que limita o acesso simultâneo a recursos partilhados.',20);

// ─── Verificação final ──────────────────────────
const rows = await sequelize.query(
  'SELECT disciplina, dificuldade, COUNT(*) as total FROM questoes WHERE torneio_id=32 GROUP BY disciplina,dificuldade ORDER BY disciplina,dificuldade',
  { type: QueryTypes.SELECT }
);

let grandTotal = 0;
console.log('\n╔══════════════════════════════════════════╗');
console.log('║        RESULTADO FINAL NO TORNEIO 32     ║');
console.log('╠══════════════════════════════════════════╣');
rows.forEach(r => {
  const bar = '█'.repeat(Math.min(r.total, 20));
  console.log(`║ ${r.disciplina.padEnd(13)} ${r.dificuldade.padEnd(8)} ${String(r.total).padStart(3)} ${bar}`);
  grandTotal += parseInt(r.total);
});
console.log('╠══════════════════════════════════════════╣');
console.log(`║ TOTAL GERAL:                          ${String(grandTotal).padStart(3)} ║`);
console.log('╚══════════════════════════════════════════╝');

process.exit(0);
