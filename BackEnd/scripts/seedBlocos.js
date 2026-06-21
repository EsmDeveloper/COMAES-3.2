import sequelize from '../config/db.js';
import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';
import Questao from '../models/Questao.js';
import Torneio from '../models/Torneio.js';
import Usuario from '../models/User.js';

// ── TESTE DE CONHECIMENTO: MATEMÁTICA (30 questões) 
const TESTE_MAT = [
  { enunciado:'Quanto é 15 + 27?', opcoes:['40','42','44','46'], resposta_correta:'42', dificuldade:'facil', pontos:5 },
  { enunciado:'Quanto é 85 − 38?', opcoes:['45','47','43','49'], resposta_correta:'47', dificuldade:'facil', pontos:5 },
  { enunciado:'Quanto é 12 × 8?', opcoes:['96','86','98','88'], resposta_correta:'96', dificuldade:'facil', pontos:5 },
  { enunciado:'Quanto é 144 ÷ 12?', opcoes:['10','11','12','14'], resposta_correta:'12', dificuldade:'facil', pontos:5 },
  { enunciado:'Qual é o resultado de 3²?', opcoes:['6','9','12','5'], resposta_correta:'9', dificuldade:'facil', pontos:5 },
  { enunciado:'Quanto é 100 − 67?', opcoes:['33','32','31','34'], resposta_correta:'33', dificuldade:'facil', pontos:5 },
  { enunciado:'Qual é a raiz quadrada de 81?', opcoes:['7','8','9','10'], resposta_correta:'9', dificuldade:'facil', pontos:5 },
  { enunciado:'Quanto é 7 × 7?', opcoes:['42','47','49','51'], resposta_correta:'49', dificuldade:'facil', pontos:5 },
  { enunciado:'Qual é o dobro de 36?', opcoes:['62','70','72','74'], resposta_correta:'72', dificuldade:'facil', pontos:5 },
  { enunciado:'Quanto é 200 ÷ 4?', opcoes:['40','50','60','25'], resposta_correta:'50', dificuldade:'facil', pontos:5 },
  { enunciado:'Resolva: 3x + 7 = 22', opcoes:['x=3','x=5','x=7','x=4'], resposta_correta:'x=5', dificuldade:'medio', pontos:10 },
  { enunciado:'Quanto é 15% de 200?', opcoes:['25','30','35','40'], resposta_correta:'30', dificuldade:'medio', pontos:10 },
  { enunciado:'Área de um quadrado de lado 7?', opcoes:['42','49','56','28'], resposta_correta:'49', dificuldade:'medio', pontos:10 },
  { enunciado:'Quanto é 2⁵?', opcoes:['16','32','64','10'], resposta_correta:'32', dificuldade:'medio', pontos:10 },
  { enunciado:'Qual é o MMC de 4 e 6?', opcoes:['8','10','12','24'], resposta_correta:'12', dificuldade:'medio', pontos:10 },
  { enunciado:'Resolva: 2x − 4 = 10', opcoes:['x=5','x=6','x=7','x=8'], resposta_correta:'x=7', dificuldade:'medio', pontos:10 },
  { enunciado:'Quanto é 25% de 80?', opcoes:['15','20','25','30'], resposta_correta:'20', dificuldade:'medio', pontos:10 },
  { enunciado:'Perímetro de um retângulo 5×3?', opcoes:['15','16','18','20'], resposta_correta:'16', dificuldade:'medio', pontos:10 },
  { enunciado:'Quanto é √144?', opcoes:['10','11','12','13'], resposta_correta:'12', dificuldade:'medio', pontos:10 },
  { enunciado:'Qual é o MDC de 12 e 18?', opcoes:['3','4','6','9'], resposta_correta:'6', dificuldade:'medio', pontos:10 },
  { enunciado:'Resolva: x² − 5x + 6 = 0', opcoes:['x=1 e x=6','x=2 e x=3','x=−2 e x=−3','x=3 e x=4'], resposta_correta:'x=2 e x=3', dificuldade:'dificil', pontos:15 },
  { enunciado:'Derivada de f(x) = 3x²?', opcoes:['3x','6x','6x²','3x³'], resposta_correta:'6x', dificuldade:'dificil', pontos:15 },
  { enunciado:'Quanto é log₂(64)?', opcoes:['4','5','6','8'], resposta_correta:'6', dificuldade:'dificil', pontos:15 },
  { enunciado:'Valor de sen(90°)?', opcoes:['0','0.5','1','√2/2'], resposta_correta:'1', dificuldade:'dificil', pontos:15 },
  { enunciado:'Sistema: 2x+3y=12 e x−y=1', opcoes:['x=3,y=2','x=2,y=3','x=4,y=1','x=1,y=4'], resposta_correta:'x=3,y=2', dificuldade:'dificil', pontos:15 },
  { enunciado:'Integral de 2x dx?', opcoes:['x','x²','2x²','x² + C'], resposta_correta:'x² + C', dificuldade:'dificil', pontos:15 },
  { enunciado:'Quanto é 5! (fatorial)?', opcoes:['60','100','120','150'], resposta_correta:'120', dificuldade:'dificil', pontos:15 },
  { enunciado:'Valor de cos(0°)?', opcoes:['0','0.5','1','−1'], resposta_correta:'1', dificuldade:'dificil', pontos:15 },
  { enunciado:'Resolva: x² = 49', opcoes:['x=7','x=±7','x=−7','x=49'], resposta_correta:'x=±7', dificuldade:'dificil', pontos:15 },
  { enunciado:'Soma dos ângulos internos de um pentágono?', opcoes:['360°','450°','540°','720°'], resposta_correta:'540°', dificuldade:'dificil', pontos:15 },
];

// ── TESTE DE CONHECIMENTO: PROGRAMAÇÃO (30 questões) 
const TESTE_PROG = [
  { enunciado:'O que significa HTML?', opcoes:['HyperText Markup Language','High Text Machine Language','HyperText Machine Link','High Transfer Markup Language'], resposta_correta:'HyperText Markup Language', dificuldade:'facil', pontos:5 },
  { enunciado:'Símbolo de comentário de linha em JavaScript?', opcoes:['#','//','/*','--'], resposta_correta:'//', dificuldade:'facil', pontos:5 },
  { enunciado:'O que faz console.log() em JavaScript?', opcoes:['Salva dados','Exibe no console','Cria variável','Fecha o programa'], resposta_correta:'Exibe no console', dificuldade:'facil', pontos:5 },
  { enunciado:'Resultado de 5 + "3" em JavaScript?', opcoes:['8','53','Erro','undefined'], resposta_correta:'53', dificuldade:'facil', pontos:5 },
  { enunciado:'O que é uma variável?', opcoes:['Um tipo de loop','Espaço de memória para armazenar dados','Uma função matemática','Um arquivo de configuração'], resposta_correta:'Espaço de memória para armazenar dados', dificuldade:'facil', pontos:5 },
  { enunciado:'Palavra-chave para constante em JavaScript?', opcoes:['var','let','const','def'], resposta_correta:'const', dificuldade:'facil', pontos:5 },
  { enunciado:'O que é um loop for?', opcoes:['Uma condição','Uma estrutura de repetição','Uma função','Um tipo de dado'], resposta_correta:'Uma estrutura de repetição', dificuldade:'facil', pontos:5 },
  { enunciado:'Tag HTML que cria parágrafo?', opcoes:['<div>','<span>','<p>','<h1>'], resposta_correta:'<p>', dificuldade:'facil', pontos:5 },
  { enunciado:'O que significa CSS?', opcoes:['Computer Style Sheets','Cascading Style Sheets','Creative Style System','Coded Style Sheets'], resposta_correta:'Cascading Style Sheets', dificuldade:'facil', pontos:5 },
  { enunciado:'Operador de igualdade estrita em JavaScript?', opcoes:['==','=','===','!='], resposta_correta:'===', dificuldade:'facil', pontos:5 },
  { enunciado:'O que é uma função recursiva?', opcoes:['Chama outra função','Chama a si mesma','Sem retorno','Com múltiplos parâmetros'], resposta_correta:'Chama a si mesma', dificuldade:'medio', pontos:10 },
  { enunciado:'O que é o DOM em JavaScript?', opcoes:['Document Object Model','Data Object Management','Dynamic Object Module','Document Order Map'], resposta_correta:'Document Object Model', dificuldade:'medio', pontos:10 },
  { enunciado:'Método que adiciona elemento ao final de array?', opcoes:['push()','pop()','shift()','unshift()'], resposta_correta:'push()', dificuldade:'medio', pontos:10 },
  { enunciado:'O que é uma Promise em JavaScript?', opcoes:['Tipo de variável','Objeto que representa operação assíncrona','Função síncrona','Método de array'], resposta_correta:'Objeto que representa operação assíncrona', dificuldade:'medio', pontos:10 },
  { enunciado:'O que faz o método map() em JavaScript?', opcoes:['Filtra elementos','Cria novo array transformando cada elemento','Ordena o array','Remove duplicatas'], resposta_correta:'Cria novo array transformando cada elemento', dificuldade:'medio', pontos:10 },
  { enunciado:'O que é herança em POO?', opcoes:['Copiar código','Uma classe receber propriedades de outra','Criar objetos','Encapsular dados'], resposta_correta:'Uma classe receber propriedades de outra', dificuldade:'medio', pontos:10 },
  { enunciado:'Complexidade da busca binária?', opcoes:['O(n)','O(n²)','O(log n)','O(1)'], resposta_correta:'O(log n)', dificuldade:'medio', pontos:10 },
  { enunciado:'O que é JSON?', opcoes:['JavaScript Object Notation','Java Syntax Object Notation','JavaScript Online Network','Java Script Object Name'], resposta_correta:'JavaScript Object Notation', dificuldade:'medio', pontos:10 },
  { enunciado:'O que faz o método filter() em JavaScript?', opcoes:['Transforma elementos','Retorna elementos que passam num teste','Ordena elementos','Conta elementos'], resposta_correta:'Retorna elementos que passam num teste', dificuldade:'medio', pontos:10 },
  { enunciado:'O que é uma API REST?', opcoes:['Um banco de dados','Interface de comunicação entre sistemas via HTTP','Um framework JavaScript','Um tipo de servidor'], resposta_correta:'Interface de comunicação entre sistemas via HTTP', dificuldade:'medio', pontos:10 },
  { enunciado:'O que é o padrão Singleton?', opcoes:['Garante múltiplas instâncias','Garante apenas uma instância de uma classe','Cria objetos sem especificar classe','Define interface para criar objetos'], resposta_correta:'Garante apenas uma instância de uma classe', dificuldade:'dificil', pontos:15 },
  { enunciado:'O que é memoização?', opcoes:['Técnica de compressão','Cache de resultados de funções para evitar recálculo','Tipo de recursão','Padrão de design'], resposta_correta:'Cache de resultados de funções para evitar recálculo', dificuldade:'dificil', pontos:15 },
  { enunciado:'Estrutura de dados que usa LIFO?', opcoes:['Fila','Pilha','Lista ligada','Árvore'], resposta_correta:'Pilha', dificuldade:'dificil', pontos:15 },
  { enunciado:'O que é Big O Notation?', opcoes:['Linguagem de programação','Notação para descrever complexidade de algoritmos','Tipo de banco de dados','Framework de testes'], resposta_correta:'Notação para descrever complexidade de algoritmos', dificuldade:'dificil', pontos:15 },
  { enunciado:'O que é injeção de dependência?', opcoes:['Técnica de hacking','Padrão onde dependências são fornecidas externamente','Tipo de herança','Método de encapsulamento'], resposta_correta:'Padrão onde dependências são fornecidas externamente', dificuldade:'dificil', pontos:15 },
  { enunciado:'O que é event loop em JavaScript?', opcoes:['Um tipo de loop for','Mecanismo que permite execução assíncrona não bloqueante','Uma estrutura de dados','Um padrão de design'], resposta_correta:'Mecanismo que permite execução assíncrona não bloqueante', dificuldade:'dificil', pontos:15 },
  { enunciado:'O que é closure em JavaScript?', opcoes:['Fechar o programa','Função que acessa variáveis do escopo externo após execução','Tipo de loop','Método de array'], resposta_correta:'Função que acessa variáveis do escopo externo após execução', dificuldade:'dificil', pontos:15 },
  { enunciado:'Diferença entre == e === em JavaScript?', opcoes:['"==" compara valor e tipo','=== compara valor e tipo, == só valor','São idênticos','Nenhuma diferença prática'], resposta_correta:'=== compara valor e tipo, == só valor', dificuldade:'dificil', pontos:15 },
  { enunciado:'O que é debouncing em JavaScript?', opcoes:['Técnica de compressão','Atrasar execução de função até parar de ser chamada','Tipo de loop','Padrão de design'], resposta_correta:'Atrasar execução de função até parar de ser chamada', dificuldade:'dificil', pontos:15 },
  { enunciado:'O que é prototype chain em JavaScript?', opcoes:['Lista de funções','Mecanismo de herança baseado em protótipos','Tipo de array','Estrutura de dados'], resposta_correta:'Mecanismo de herança baseado em protótipos', dificuldade:'dificil', pontos:15 },
];

// ── TESTE DE CONHECIMENTO: INGLÊS (30 questões) 
const TESTE_ING = [
  { enunciado:'What does "Hello" mean in Portuguese?', opcoes:['Tchau','Olá','Obrigado','Por favor'], resposta_correta:'Olá', dificuldade:'facil', pontos:5 },
  { enunciado:'What is the color of the sky?', opcoes:['Red','Green','Blue','Yellow'], resposta_correta:'Blue', dificuldade:'facil', pontos:5 },
  { enunciado:'How do you say "Gato" in English?', opcoes:['Dog','Bird','Cat','Fish'], resposta_correta:'Cat', dificuldade:'facil', pontos:5 },
  { enunciado:'What does "Good morning" mean?', opcoes:['Boa tarde','Boa noite','Bom dia','Até logo'], resposta_correta:'Bom dia', dificuldade:'facil', pontos:5 },
  { enunciado:'How do you write 21 in English?', opcoes:['Twine-one','Twenty-one','Twin-one','Two-one'], resposta_correta:'Twenty-one', dificuldade:'facil', pontos:5 },
  { enunciado:'What is the opposite of "big"?', opcoes:['Large','Huge','Small','Tall'], resposta_correta:'Small', dificuldade:'facil', pontos:5 },
  { enunciado:'Complete: "I ___ a student."', opcoes:['am','is','are','be'], resposta_correta:'am', dificuldade:'facil', pontos:5 },
  { enunciado:'What does "Thank you" mean?', opcoes:['De nada','Por favor','Obrigado','Com licença'], resposta_correta:'Obrigado', dificuldade:'facil', pontos:5 },
  { enunciado:'How do you say "Casa" in English?', opcoes:['Car','House','Tree','Book'], resposta_correta:'House', dificuldade:'facil', pontos:5 },
  { enunciado:'What day comes after Monday?', opcoes:['Sunday','Wednesday','Tuesday','Thursday'], resposta_correta:'Tuesday', dificuldade:'facil', pontos:5 },
  { enunciado:'Complete: "I ___ lived here for 5 years."', opcoes:['have','has','had','am'], resposta_correta:'have', dificuldade:'medio', pontos:10 },
  { enunciado:'If I study hard, I ___ pass the exam.', opcoes:['will','would','can','shall'], resposta_correta:'will', dificuldade:'medio', pontos:10 },
  { enunciado:'What is the past tense of "go"?', opcoes:['goed','gone','went','going'], resposta_correta:'went', dificuldade:'medio', pontos:10 },
  { enunciado:'Correct sentence about coffee preference?', opcoes:['She dont like coffee','She doesnt likes coffee','She doesnt like coffee','She not like coffee'], resposta_correta:'She doesnt like coffee', dificuldade:'medio', pontos:10 },
  { enunciado:'What does "although" mean?', opcoes:['porque','portanto','embora','então'], resposta_correta:'embora', dificuldade:'medio', pontos:10 },
  { enunciado:'Complete: "By tomorrow, I ___ finished the project."', opcoes:['will have','will be','have','am'], resposta_correta:'will have', dificuldade:'medio', pontos:10 },
  { enunciado:'What is the plural of "child"?', opcoes:['childs','childes','children','childre'], resposta_correta:'children', dificuldade:'medio', pontos:10 },
  { enunciado:'Correct passive voice: "The book ___ by John."', opcoes:['wrote','was written','is writing','has written'], resposta_correta:'was written', dificuldade:'medio', pontos:10 },
  { enunciado:'What does "nevertheless" mean?', opcoes:['além disso','portanto','no entanto','porque'], resposta_correta:'no entanto', dificuldade:'medio', pontos:10 },
  { enunciado:'Complete: "She asked me ___ I was feeling."', opcoes:['that','what','which','how'], resposta_correta:'how', dificuldade:'medio', pontos:10 },
  { enunciado:'Subjunctive: "I suggest that he ___ on time."', opcoes:['is','be','was','were'], resposta_correta:'be', dificuldade:'dificil', pontos:15 },
  { enunciado:'Inversion: "Not only ___ late, but also forgot his keys."', opcoes:['he was','was he','he is','is he'], resposta_correta:'was he', dificuldade:'dificil', pontos:15 },
  { enunciado:'What does "ubiquitous" mean?', opcoes:['rare','unique','present everywhere','ancient'], resposta_correta:'present everywhere', dificuldade:'dificil', pontos:15 },
  { enunciado:'Mixed conditional: "If I ___ harder, I would be rich now."', opcoes:['worked','had worked','have worked','work'], resposta_correta:'had worked', dificuldade:'dificil', pontos:15 },
  { enunciado:'Difference between "affect" and "effect"?', opcoes:['"affect" is a noun','affect is a verb, effect is a noun','They are synonyms','No difference'], resposta_correta:'affect is a verb, effect is a noun', dificuldade:'dificil', pontos:15 },
  { enunciado:'What does "perspicacious" mean?', opcoes:['lazy','having a ready insight','confused','talkative'], resposta_correta:'having a ready insight', dificuldade:'dificil', pontos:15 },
  { enunciado:'Complete: "Had I known earlier, I ___ differently."', opcoes:['would act','would have acted','will act','acted'], resposta_correta:'would have acted', dificuldade:'dificil', pontos:15 },
  { enunciado:'What is "anaphora" in rhetoric?', opcoes:['A type of metaphor','Repetition of a word at the start of successive clauses','A figure of contrast','A type of irony'], resposta_correta:'Repetition of a word at the start of successive clauses', dificuldade:'dificil', pontos:15 },
  { enunciado:'What does "ephemeral" mean?', opcoes:['permanent','lasting a very short time','ancient','powerful'], resposta_correta:'lasting a very short time', dificuldade:'dificil', pontos:15 },
  { enunciado:'Identify the correct use of "whom": ___', opcoes:['Who did you call?','Whom did you call?','Who called you?','Whom called you?'], resposta_correta:'Whom did you call?', dificuldade:'dificil', pontos:15 },
];

// ── QUESTÕES DE TORNEIO: MATEMÁTICA (30 questões) 
const TORNEIO_MAT = [
  { titulo:'Adição básica', descricao:'Quanto é 48 + 35?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['81','83','85','87'], resposta_correta:'83', pontos:10 },
  { titulo:'Subtração', descricao:'Quanto é 120 − 47?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['63','73','83','93'], resposta_correta:'73', pontos:10 },
  { titulo:'Multiplicação', descricao:'Quanto é 9 × 11?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['89','99','109','119'], resposta_correta:'99', pontos:10 },
  { titulo:'Divisão', descricao:'Quanto é 180 ÷ 9?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['18','20','22','24'], resposta_correta:'20', pontos:10 },
  { titulo:'Potência', descricao:'Quanto é 4³?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['12','48','64','16'], resposta_correta:'64', pontos:10 },
  { titulo:'Raiz quadrada', descricao:'Qual é a raiz quadrada de 121?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['9','10','11','12'], resposta_correta:'11', pontos:10 },
  { titulo:'Fração simples', descricao:'Quanto é 1/2 + 1/4?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['1/6','2/6','3/4','1/3'], resposta_correta:'3/4', pontos:10 },
  { titulo:'Porcentagem básica', descricao:'Quanto é 10% de 150?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['10','15','20','25'], resposta_correta:'15', pontos:10 },
  { titulo:'Número par', descricao:'Qual destes números é par?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['13','17','22','31'], resposta_correta:'22', pontos:10 },
  { titulo:'Ordem de operações', descricao:'Quanto é 2 + 3 × 4?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['14','20','24','10'], resposta_correta:'14', pontos:10 },
  { titulo:'Equação linear', descricao:'Resolva: 4x − 8 = 12', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['x=4','x=5','x=6','x=7'], resposta_correta:'x=5', pontos:15 },
  { titulo:'Área do triângulo', descricao:'Área de triângulo base=10 e altura=6?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['30','40','50','60'], resposta_correta:'30', pontos:15 },
  { titulo:'Progressão aritmética', descricao:'Próximo termo: 3, 7, 11, 15, ___', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['17','18','19','20'], resposta_correta:'19', pontos:15 },
  { titulo:'Regra de três', descricao:'Se 5 livros custam 75 kz, quanto custam 8?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['100','110','120','130'], resposta_correta:'120', pontos:15 },
  { titulo:'Média aritmética', descricao:'Média de 8, 12, 16, 20?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['12','14','16','18'], resposta_correta:'14', pontos:15 },
  { titulo:'Fatoração', descricao:'Fatore: x² − 9', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['(x+3)(x+3)','(x−3)(x−3)','(x+3)(x−3)','(x+9)(x−1)'], resposta_correta:'(x+3)(x−3)', pontos:15 },
  { titulo:'Juros simples', descricao:'Capital 1000 kz, taxa 5% ao mês, 3 meses. Juros?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['100','150','200','250'], resposta_correta:'150', pontos:15 },
  { titulo:'Volume do cubo', descricao:'Volume de cubo com aresta 4?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['16','32','48','64'], resposta_correta:'64', pontos:15 },
  { titulo:'Inequação', descricao:'Resolva: 2x + 3 > 11', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['x>3','x>4','x>5','x>6'], resposta_correta:'x>4', pontos:15 },
  { titulo:'Probabilidade básica', descricao:'Prob. de tirar cara num lançamento de moeda?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['1/4','1/3','1/2','2/3'], resposta_correta:'1/2', pontos:15 },
  { titulo:'Equação quadrática', descricao:'Resolva: x² − 7x + 12 = 0', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['x=2 e x=6','x=3 e x=4','x=1 e x=12','x=−3 e x=−4'], resposta_correta:'x=3 e x=4', pontos:20 },
  { titulo:'Logaritmo', descricao:'Quanto é log₁₀(1000)?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['2','3','4','10'], resposta_correta:'3', pontos:20 },
  { titulo:'Trigonometria', descricao:'Num triângulo retângulo, sen(30°) = ?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['√3/2','1/2','√2/2','1'], resposta_correta:'1/2', pontos:20 },
  { titulo:'Progressão geométrica', descricao:'Próximo termo: 2, 6, 18, 54, ___', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['108','162','216','270'], resposta_correta:'162', pontos:20 },
  { titulo:'Binômio de Newton', descricao:'Coeficiente de x² em (x+1)⁴?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['4','6','8','10'], resposta_correta:'6', pontos:20 },
  { titulo:'Limite', descricao:'lim(x→2) de (x²−4)/(x−2) = ?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['0','2','4','indefinido'], resposta_correta:'4', pontos:20 },
  { titulo:'Matriz determinante', descricao:'Det de [[2,1],[3,4]] = ?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['5','6','7','8'], resposta_correta:'5', pontos:20 },
  { titulo:'Combinação', descricao:'C(6,2) = ?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['12','15','18','30'], resposta_correta:'15', pontos:20 },
  { titulo:'Integral definida', descricao:' 2x dx = ?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['2','4','6','8'], resposta_correta:'4', pontos:20 },
  { titulo:'Números complexos', descricao:'Módulo de 3 + 4i = ?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['3','4','5','7'], resposta_correta:'5', pontos:20 },
];

// ── QUESTÕES DE TORNEIO: PROGRAMAÇÃO (30 questões) 
const TORNEIO_PROG = [
  { titulo:'Variável JS', descricao:'Qual palavra-chave declara variável de bloco em JS?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['var','let','const','def'], resposta_correta:'let', pontos:10 },
  { titulo:'Tipo de dado', descricao:'Qual é o tipo de "true" em JavaScript?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['string','number','boolean','object'], resposta_correta:'boolean', pontos:10 },
  { titulo:'Array length', descricao:'Qual propriedade retorna o tamanho de um array?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['size','count','length','total'], resposta_correta:'length', pontos:10 },
  { titulo:'Condicional', descricao:'Qual estrutura verifica múltiplas condições em JS?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['for','while','switch','do'], resposta_correta:'switch', pontos:10 },
  { titulo:'Função arrow', descricao:'Sintaxe correta de arrow function?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['function() =>','() =>','=> ()','function =>'], resposta_correta:'() =>', pontos:10 },
  { titulo:'String método', descricao:'Método para converter string para maiúsculas?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['toUpper()','toUpperCase()','upper()','uppercase()'], resposta_correta:'toUpperCase()', pontos:10 },
  { titulo:'Objeto JS', descricao:'Como acessar propriedade "nome" de objeto "user"?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['user->nome','user::nome','user.nome','user[nome]'], resposta_correta:'user.nome', pontos:10 },
  { titulo:'Null vs Undefined', descricao:'O que é "undefined" em JavaScript?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['Valor nulo atribuído','Variável declarada sem valor','Erro de sintaxe','Tipo de objeto'], resposta_correta:'Variável declarada sem valor', pontos:10 },
  { titulo:'Loop while', descricao:'Quando o loop while para de executar?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['Após 10 iterações','Quando a condição é falsa','Quando encontra break','Nunca para'], resposta_correta:'Quando a condição é falsa', pontos:10 },
  { titulo:'typeof', descricao:'typeof 42 retorna?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['"integer"','"float"','"number"','"digit"'], resposta_correta:'"number"', pontos:10 },
  { titulo:'Async/Await', descricao:'O que faz "await" em JavaScript?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['Cria uma Promise','Pausa execução até Promise resolver','Cancela operação assíncrona','Cria thread nova'], resposta_correta:'Pausa execução até Promise resolver', pontos:15 },
  { titulo:'Spread operator', descricao:'O que faz "..." (spread) em arrays?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['Remove elementos','Expande elementos do array','Filtra elementos','Ordena elementos'], resposta_correta:'Expande elementos do array', pontos:15 },
  { titulo:'Destructuring', descricao:'const {a, b} = obj; O que é isso?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['Criação de objeto','Desestruturação de objeto','Cópia de objeto','Comparação de objetos'], resposta_correta:'Desestruturação de objeto', pontos:15 },
  { titulo:'HTTP Status', descricao:'O que significa status HTTP 404?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['Servidor indisponível','Não autorizado','Recurso não encontrado','Requisição inválida'], resposta_correta:'Recurso não encontrado', pontos:15 },
  { titulo:'Git commit', descricao:'Comando para salvar alterações no Git?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['git save','git push','git commit','git add'], resposta_correta:'git commit', pontos:15 },
  { titulo:'SQL SELECT', descricao:'Query para buscar todos registros da tabela "users"?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['GET * FROM users','FETCH users','SELECT * FROM users','READ users'], resposta_correta:'SELECT * FROM users', pontos:15 },
  { titulo:'React useState', descricao:'O que retorna useState(0) em React?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['Apenas o valor','Apenas a função','Array com valor e função setter','Objeto com propriedades'], resposta_correta:'Array com valor e função setter', pontos:15 },
  { titulo:'CSS Flexbox', descricao:'Propriedade para centralizar itens horizontalmente no Flexbox?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['align-items','justify-content','flex-direction','flex-wrap'], resposta_correta:'justify-content', pontos:15 },
  { titulo:'Node.js', descricao:'O que é Node.js?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['Framework front-end','Runtime JavaScript no servidor','Banco de dados','Linguagem de programação'], resposta_correta:'Runtime JavaScript no servidor', pontos:15 },
  { titulo:'REST vs GraphQL', descricao:'Principal vantagem do GraphQL sobre REST?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['Mais rápido sempre','Cliente especifica exatamente os dados que precisa','Mais seguro','Mais fácil de implementar'], resposta_correta:'Cliente especifica exatamente os dados que precisa', pontos:15 },
  { titulo:'Design Pattern Observer', descricao:'O padrão Observer é usado para?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Criar objetos','Notificar múltiplos objetos sobre mudanças de estado','Garantir uma instância','Encapsular algoritmos'], resposta_correta:'Notificar múltiplos objetos sobre mudanças de estado', pontos:20 },
  { titulo:'Complexidade O(n²)', descricao:'Qual algoritmo tem complexidade O(n²) no pior caso?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Merge Sort','Quick Sort','Bubble Sort','Binary Search'], resposta_correta:'Bubble Sort', pontos:20 },
  { titulo:'SOLID - SRP', descricao:'O que é o Princípio da Responsabilidade Única (SRP)?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Classe deve ter múltiplas responsabilidades','Classe deve ter apenas uma razão para mudar','Módulos devem ser abertos para extensão','Dependa de abstrações'], resposta_correta:'Classe deve ter apenas uma razão para mudar', pontos:20 },
  { titulo:'WebSocket', descricao:'Diferença entre HTTP e WebSocket?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['HTTP é mais rápido','WebSocket permite comunicação bidirecional persistente','HTTP é mais seguro','WebSocket usa UDP'], resposta_correta:'WebSocket permite comunicação bidirecional persistente', pontos:20 },
  { titulo:'JWT', descricao:'O que é JWT (JSON Web Token)?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Banco de dados JSON','Padrão para transmitir informações seguras entre partes','Framework JavaScript','Protocolo de rede'], resposta_correta:'Padrão para transmitir informações seguras entre partes', pontos:20 },
  { titulo:'Microserviços', descricao:'Principal vantagem da arquitetura de microserviços?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Mais simples de desenvolver','Escalabilidade e deploy independente de serviços','Menor custo','Sem necessidade de API'], resposta_correta:'Escalabilidade e deploy independente de serviços', pontos:20 },
  { titulo:'Docker', descricao:'O que é um container Docker?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Máquina virtual completa','Ambiente isolado e leve para executar aplicações','Banco de dados','Servidor web'], resposta_correta:'Ambiente isolado e leve para executar aplicações', pontos:20 },
  { titulo:'CI/CD', descricao:'O que significa CI/CD?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Code Integration/Code Deployment','Continuous Integration/Continuous Delivery','Computer Interface/Computer Design','None of the above'], resposta_correta:'Continuous Integration/Continuous Delivery', pontos:20 },
  { titulo:'Índice de banco de dados', descricao:'Para que serve um índice em banco de dados?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Aumentar espaço de armazenamento','Acelerar consultas de busca','Garantir integridade referencial','Criptografar dados'], resposta_correta:'Acelerar consultas de busca', pontos:20 },
  { titulo:'Race condition', descricao:'O que é uma race condition?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Competição de velocidade entre servidores','Comportamento imprevisível quando múltiplas threads acessam recurso compartilhado','Tipo de algoritmo de ordenação','Padrão de design'], resposta_correta:'Comportamento imprevisível quando múltiplas threads acessam recurso compartilhado', pontos:20 },
];

// ── QUESTÕES DE TORNEIO: INGLÊS (30 questões) 
const TORNEIO_ING = [
  { titulo:'Vocabulary - Animals', descricao:'What is "Leão" in English?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['Tiger','Lion','Bear','Wolf'], resposta_correta:'Lion', pontos:10 },
  { titulo:'Simple Present', descricao:'Complete: "She ___ to school every day."', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['go','goes','going','gone'], resposta_correta:'goes', pontos:10 },
  { titulo:'Greetings', descricao:'What does "Good night" mean?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['Bom dia','Boa tarde','Boa noite','Até logo'], resposta_correta:'Boa noite', pontos:10 },
  { titulo:'Numbers', descricao:'How do you say "100" in English?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['Ten','Hundred','One hundred','A hundred'], resposta_correta:'One hundred', pontos:10 },
  { titulo:'Colors', descricao:'What color is "Vermelho" in English?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['Blue','Green','Red','Yellow'], resposta_correta:'Red', pontos:10 },
  { titulo:'Pronouns', descricao:'What pronoun replaces "Maria and I"?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['They','We','You','He'], resposta_correta:'We', pontos:10 },
  { titulo:'Verb To Be', descricao:'Complete: "They ___ happy."', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['am','is','are','be'], resposta_correta:'are', pontos:10 },
  { titulo:'Days of week', descricao:'What day comes after Wednesday?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['Tuesday','Friday','Thursday','Saturday'], resposta_correta:'Thursday', pontos:10 },
  { titulo:'Months', descricao:'What is the 12th month of the year?', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['November','October','January','December'], resposta_correta:'December', pontos:10 },
  { titulo:'Prepositions', descricao:'The book is ___ the table. (em cima)', dificuldade:'facil', tipo:'multipla_escolha', opcoes:['under','behind','on','in'], resposta_correta:'on', pontos:10 },
  { titulo:'Past Simple', descricao:'What is the past tense of "eat"?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['eated','eaten','ate','eating'], resposta_correta:'ate', pontos:15 },
  { titulo:'Comparatives', descricao:'Complete: "She is ___ than her sister." (tall)', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['more tall','tallest','taller','most tall'], resposta_correta:'taller', pontos:15 },
  { titulo:'Modal Verbs', descricao:'Which modal expresses obligation?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['can','might','must','would'], resposta_correta:'must', pontos:15 },
  { titulo:'Future Simple', descricao:'Complete: "I ___ visit you tomorrow."', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['am going','will','going to','shall'], resposta_correta:'will', pontos:15 },
  { titulo:'Vocabulary - Synonyms', descricao:'What is a synonym for "happy"?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['sad','angry','joyful','tired'], resposta_correta:'joyful', pontos:15 },
  { titulo:'Present Continuous', descricao:'Complete: "She ___ reading a book now."', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['is','are','am','be'], resposta_correta:'is', pontos:15 },
  { titulo:'Irregular Verbs', descricao:'Past tense of "write"?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['writed','written','wrote','writing'], resposta_correta:'wrote', pontos:15 },
  { titulo:'Conjunctions', descricao:'What does "however" indicate?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['Addition','Contrast','Cause','Result'], resposta_correta:'Contrast', pontos:15 },
  { titulo:'Reported Speech', descricao:'Direct: "I am tired." Reported: She said she ___ tired.', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['is','was','were','be'], resposta_correta:'was', pontos:15 },
  { titulo:'Phrasal Verbs', descricao:'What does "give up" mean?', dificuldade:'medio', tipo:'multipla_escolha', opcoes:['começar','continuar','desistir','melhorar'], resposta_correta:'desistir', pontos:15 },
  { titulo:'Third Conditional', descricao:'Complete: "If she had studied, she ___ passed."', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['would pass','would have passed','will pass','had passed'], resposta_correta:'would have passed', pontos:20 },
  { titulo:'Inversion', descricao:'Correct inversion: "Rarely ___ such talent."', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['I have seen','have I seen','I had seen','had I seen'], resposta_correta:'have I seen', pontos:20 },
  { titulo:'Advanced Vocabulary', descricao:'What does "loquacious" mean?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['silent','talkative','intelligent','brave'], resposta_correta:'talkative', pontos:20 },
  { titulo:'Passive Voice Advanced', descricao:'"They will build a bridge." Passive?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['A bridge will be built','A bridge is built','A bridge was built','A bridge has been built'], resposta_correta:'A bridge will be built', pontos:20 },
  { titulo:'Gerund vs Infinitive', descricao:'"I enjoy ___ music." (listen)', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['to listen','listen','listening','listened'], resposta_correta:'listening', pontos:20 },
  { titulo:'Cleft Sentences', descricao:'Emphasize "John": "John broke the window."', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['It was John who broke the window','John it was who broke','Who broke was John','It is John broke the window'], resposta_correta:'It was John who broke the window', pontos:20 },
  { titulo:'Discourse Markers', descricao:'What does "consequently" indicate?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Contrast','Addition','Result/Consequence','Condition'], resposta_correta:'Result/Consequence', pontos:20 },
  { titulo:'Ellipsis', descricao:'What is ellipsis in English grammar?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Adding extra words','Omitting words to avoid repetition','Changing word order','Using passive voice'], resposta_correta:'Omitting words to avoid repetition', pontos:20 },
  { titulo:'Nominalization', descricao:'"Decide" nominalized is?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['decided','deciding','decision','decisive'], resposta_correta:'decision', pontos:20 },
  { titulo:'Register', descricao:'Which sentence uses formal register?', dificuldade:'dificil', tipo:'multipla_escolha', opcoes:['Gonna do it later','I will attend the meeting','Wanna come?','Its gonna be fine'], resposta_correta:'I will attend the meeting', pontos:20 },
];

// ── FUNÇÃO PRINCIPAL 

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Banco conectado');

    // ── 1. Questões do Teste de Conhecimento 
    console.log('\n📚 Inserindo questões do Teste de Conhecimento...');

    const testeData = [
      ...TESTE_MAT.map(q => ({ ...q, categoria: 'matematica', ativo: true })),
      ...TESTE_PROG.map(q => ({ ...q, categoria: 'programacao', ativo: true })),
      ...TESTE_ING.map(q => ({ ...q, categoria: 'ingles', ativo: true })),
    ];

    let testeInseridas = 0;
    for (const q of testeData) {
      const existe = await QuestaoTesteConhecimento.findOne({
        where: { enunciado: q.enunciado, categoria: q.categoria }
      });
      if (!existe) {
        await QuestaoTesteConhecimento.create(q);
        testeInseridas++;
      }
    }
    console.log(`   ✅ ${testeInseridas} questões inseridas (${testeData.length - testeInseridas} já existiam)`);

    // ── 2. Questões de Torneio 
    console.log('\n🏆 Inserindo questões de Torneio...');

    // Buscar torneio ativo ou o primeiro disponível
    let torneio = await Torneio.findOne({ where: { status: 'ativo' } });
    if (!torneio) torneio = await Torneio.findOne({ order: [['id', 'ASC']] });

    if (!torneio) {
      // Criar torneio de seed se não existir nenhum
      const admin = await Usuario.findOne({ where: { isAdmin: true }, order: [['id', 'ASC']] });
      if (!admin) { console.log('❌ Nenhum admin encontrado. Crie um torneio primeiro.'); process.exit(1); }
      torneio = await Torneio.create({
        titulo: 'Torneio COMAES 2026',
        slug: 'torneio-comaes-2026',
        descricao: 'Torneio principal da plataforma COMAES',
        criado_por: admin.id,
        status: 'agendado',
      });
      console.log(`   📌 Torneio criado: "${torneio.titulo}" (ID: ${torneio.id})`);
    } else {
      console.log(`   📌 Usando torneio: "${torneio.titulo}" (ID: ${torneio.id})`);
    }

    const torneioData = [
      ...TORNEIO_MAT.map(q => ({ ...q, disciplina: 'matematica', torneio_id: torneio.id })),
      ...TORNEIO_PROG.map(q => ({ ...q, disciplina: 'programacao', torneio_id: torneio.id })),
      ...TORNEIO_ING.map(q => ({ ...q, disciplina: 'ingles', torneio_id: torneio.id })),
    ];

    let torneioInseridas = 0;
    for (const q of torneioData) {
      const existe = await Questao.findOne({
        where: { titulo: q.titulo, torneio_id: torneio.id }
      });
      if (!existe) {
        await Questao.create({
          torneio_id: q.torneio_id,
          titulo: q.titulo,
          descricao: q.descricao,
          disciplina: q.disciplina,
          tipo: q.tipo,
          dificuldade: q.dificuldade,
          opcoes: q.opcoes,
          resposta_correta: q.resposta_correta,
          pontos: q.pontos,
        });
        torneioInseridas++;
      }
    }
    console.log(`   ✅ ${torneioInseridas} questões inseridas (${torneioData.length - torneioInseridas} já existiam)`);

    // ── 3. Resumo 
    const totalTeste = await QuestaoTesteConhecimento.count();
    const totalTorneio = await Questao.count({ where: { torneio_id: torneio.id } });

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log(`   Teste de Conhecimento: ${totalTeste} questões no total`);
    console.log(`   Torneio ID ${torneio.id}: ${totalTorneio} questões no total`);
    console.log('\n💡 Agora abra o painel admin → Questões e clique em "Recarregar"');
    console.log('   Os blocos serão preenchidos automaticamente ao associar questões.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
