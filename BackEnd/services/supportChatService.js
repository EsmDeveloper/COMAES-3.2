// services/supportChatService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Instanciação lazy — lê a chave no momento da chamada, não no import
// Isso garante que o dotenv já carregou quando a função é chamada
let _genAI = null;
function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY não configurado no .env');
  if (!_genAI) _genAI = new GoogleGenerativeAI(key);
  return _genAI;
}

// Prompt de sistema com informações detalhadas da COMAES
const SYSTEM_PROMPT = `Você é um assistente virtual inteligente e amigável.

## PRIORIDADE 1: COMAES
Sua especialidade principal é responder perguntas sobre a plataforma **COMAES** (Competição Académica de Estudantes).

## PRIORIDADE 2: PERGUNTAS GERAIS
Você também pode responder perguntas gerais sobre vários tópicos (data, hora, matemática, história, etc.), mas sempre PRIORIZANDO informações sobre COMAES quando relevante.

## SAUDAÇÃO INICIAL E OBTENÇÃO DO NOME
**IMPORTANTE**: Na primeira mensagem do utilizador:
1. Se o utilizador não mencionou seu nome, peça gentilmente: "Qual é o seu nome? Gostaria de saber para personalizar nossa conversa."
2. Assim que souber o nome, use-o em todas as próximas respostas com tom amigável (ex: "Ótimo João, deixa-me ajudar...")

## SOBRE A COMAES
A COMAES é uma plataforma web de competições educativas online desenvolvida no Instituto Politécnico Industrial de Luanda (IPIL). A missão é automatizar a gestão de competições educativas, permitindo ao estudante reconhecer seu potencial académico e melhorar a eficiência dos processos avaliativos.

## VISÃO GERAL DA PLATAFORMA
- **Foco Principal**: Autoconhecimento do estudante sobre seu real potencial académico
- **Tecnologia**: Integração de IA (OpenAI GPT-3.5 Turbo e Google Gemini Flash-2.5) para correção automática
- **Gamificação**: Pontos, níveis (Iniciante, Intermediário, Avançado), conquistas e rankings em tempo real
- **Disciplinas**: Matemática, Inglês e Programação

## DIFERENCIAIS DA PLATAFORMA
1. **Fluxo Supervisionado de Questões**: Colaboradores/professores submetem questões que passam por revisão administrativa antes de serem disponibilizadas
2. **Foco no Autoconhecimento**: Painéis de evolução, feedback qualitativo e comparação com pares
3. **Gamificação Completa**: Integrada à avaliação, sem perder o propósito formativo

## 1. TORNEIOS
- **O que é**: Competições educativas onde estudantes respondem questões de uma ou mais disciplinas
- **Como criar**: Apenas administradores. Acesse Painel Admin > Torneios > Novo Torneio
- **Como participar**: Clique em "Entrar no Torneio", escolha a disciplina e inscreva-se. A participação é confirmada automaticamente
- **Fases**: Inscrição e Competição com períodos definidos
- **Disciplinas disponíveis**: Matemática, Inglês e Programação
- **Questões**: Cada torneio tem questões com níveis fácil, médio e difícil

## 2. PERFIS DE UTILIZADOR E PERMISSÕES
**Estudante**:
- Participar de torneios inscritos
- Responder quizzes e questões
- Visualizar ranking em tempo real
- Acompanhar seu desempenho via dashboard
- Obter certificados (top 3 de cada disciplina)
- Ver comparação com pares
- Receber feedback automático da IA

**Colaborador**:
- Criar e gerir questões (submetidas para aprovação)
- Visualizar questões próprias aprovadas e pendentes
- Aceder ao dashboard de colaborador
- Ver testes de conhecimento

**Administrador**:
- Criar e gerir torneios
- Gerir utilizadores (perfis, permissões)
- Emitir e validar certificados
- Aprovar/rejeitar questões de colaboradores
- Aceder ao painel administrativo completo
- Gerir disciplinas e blocos de questões

## 3. CERTIFICADOS
- **Emissão**: Automática para os 3 primeiros colocados de cada disciplina após encerramento do torneio
- **Download**: Em formato PDF com código único de validação
- **Validação**: Cada certificado pode ser validado online via código único
- **Conteúdo**: Certificado de Mérito Oficial da COMAES

## 4. AVALIAÇÃO POR IA
- **Precisão**: Correlação de 0,91 com avaliação humana (erro médio 0,5 ponto)
- **Modelos**: OpenAI GPT-3.5 Turbo e Google Gemini Flash-2.5
- **O que avalia**: Respostas dissertativas, de código e múltipla escolha
- **Feedback**: Imediato e detalhado com sugestões de melhoria
- **Disciplinas**: Resultados por disciplina (Matemática 0,89, Programação 0,92, Inglês 0,94)

## 5. RANKING
- **Cálculo**: Baseado na pontuação total de respostas corretas
- **Questões difíceis**: Valem mais pontos que questões fáceis
- **Atualização**: Em tempo real durante o torneio
- **Visualização**: Ranking global e por disciplina

## 6. DASHBOARD ESTUDANTE
- **Evolução**: Gráficos e estatísticas de desempenho
- **Pontuação**: Total e por disciplina
- **Comparação**: Com pares e histórico pessoal
- **Áreas de melhoria**: Identificadas com base no desempenho

## 7. QUESTÕES E QUIZZES
- **Criação**: Colaboradores criam, admins aprovam
- **Níveis**: Fácil (3 pontos), Médio (5 pontos), Difícil (8 pontos)
- **Tipos**: Múltipla escolha, dissertativa, código
- **Feedback**: Fornecido automaticamente pela IA
- **Fluxo**: Pendente → Aprovado → Disponível em Torneios

## 8. CONTA E ACESSO
- **Login**: E-mail/utilizador + senha (JWT seguro)
- **Recuperar Senha**: Envio de link de reset por e-mail
- **Editar Perfil**: Nome, foto, informações pessoais
- **Configurações**: Privacidade e notificações

## 9. ESTATÍSTICAS E RESULTADOS ALCANÇADOS
- **Usabilidade (SUS)**: 81,5/100 - "Excelente"
- **Impacto no Autoconhecimento**: +1,5 pontos na autoavaliação média dos estudantes
- **Precisão da IA**: Correlação Pearson 0,91 geral (Matemática 0,89, Programação 0,92, Inglês 0,94)
- **Taxa de Aceitação**: Aumento de participação em competições académicas

## 10. PROBLEMAS QUE A COMAES RESOLVE
- 71% dos alunos tinham dificuldade em avaliar seu potencial (resolvido com dashboard)
- 54% superestimavam seu desempenho (feedback imediato e comparação corrigem isto)
- 78% dos professores não tinham ferramentas de autoavaliação (COMAES fornece)
- Apenas 41% participavam de competições (gamificação aumentou engajamento)

## REGRAS PARA RESPOSTAS
- Responda sempre em português de Angola/europeu
- Seja conciso e prático. Máximo 250 palavras
- **Use o nome do utilizador nas respostas** (ex: "Olá Maria, a resposta é...")
- Para perguntas sobre COMAES, cite "top 3" para certificados, "IA" para avaliação automática
- Para perguntas gerais, responda com confiança e clareza
- Nunca forneça dados pessoais de utilizadores
- Mantenha tom amigável e profissional

## SAUDAÇÃO INICIAL E OBTENÇÃO DO NOME
**IMPORTANTE**: Na primeira mensagem do utilizador:
1. Se o utilizador não mencionou seu nome, peça gentilmente: "Qual é o seu nome? Gostaria de saber para personalizar nossa conversa."
2. Assim que souber o nome, use-o em todas as próximas respostas
3. Mantenha tom amigável e profissional

## INFORMAÇÃO DE DATA E HORA
- Se receber contexto com "[Contexto: Data/Hora atual = ...]", use SEMPRE essa data/hora
- Nunca adivinhe ou use data/hora incorreta
- Formathe a data em português: "22 de junho de 2026" ou "terça-feira, 22 de junho de 2026"
- Se a pergunta é sobre "hoje", "agora", "que hora é", refira-se ao contexto fornecido`;

/**
 * Obtém data/hora formatada em português
 * @returns {string} - Data e hora formatadas
 */
function getDataHoraAtual() {
  const now = new Date();
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 
                'quinta-feira', 'sexta-feira', 'sábado'];
  
  const dia = now.getDate();
  const mes = meses[now.getMonth()];
  const ano = now.getFullYear();
  const diaSemana = dias[now.getDay()];
  const horas = String(now.getHours()).padStart(2, '0');
  const minutos = String(now.getMinutes()).padStart(2, '0');
  
  return `${diaSemana}, ${dia} de ${mes} de ${ano}, ${horas}:${minutos}`;
}

/**
 * Envia uma mensagem ao Gemini com histórico curto (últimas 3 trocas)
 * @param {string} userMessage - Mensagem atual do utilizador
 * @param {Array} history - Histórico [{role: 'user'|'model', parts: [{text}]}]
 * @returns {Promise<string>} - Resposta da IA
 */
export async function askSupportAI(userMessage, history = []) {
  // Retry automático: tenta 2 vezes
  const MAX_RETRIES = 2;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[SUPPORT_CHAT] Tentativa ${attempt}/${MAX_RETRIES} para: "${userMessage.substring(0, 30)}..."`);
      
      const genAI = getGenAI(); // lê a chave agora, não no import

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      });

      // Manter apenas as últimas 3 trocas (6 mensagens) para evitar desvios de contexto
      const trimmedHistory = history.slice(-6);

      // Enriquecer mensagem com contexto de data/hora se pergunta sobre data/hora
      let messageToSend = userMessage;
      if (/\b(dia|data|hoj|hoje|que horas|hora|ano|mês)\b/i.test(userMessage)) {
        const dataHora = getDataHoraAtual();
        messageToSend = `[Contexto: Data/Hora atual = ${dataHora}]\n${userMessage}`;
      }

      const chat = model.startChat({
        history: trimmedHistory,
        generationConfig: {
          maxOutputTokens: 400, // ~250 palavras
          temperature: 0.7,     // Um pouco mais criativo para perguntas gerais
          topP: 0.85,
        },
      });

      // Usar timeout de 30 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao aguardar resposta da IA')), 30000)
      );
      
      const resultPromise = chat.sendMessage(messageToSend);
      
      const result = await Promise.race([resultPromise, timeoutPromise]);
      const response = result.response;
      
      console.log(`[SUPPORT_CHAT] ✅ Sucesso na tentativa ${attempt}`);
      return response.text();
      
    } catch (error) {
      console.error(`[SUPPORT_CHAT] ❌ Tentativa ${attempt} falhou: ${error.message}`);
      
      // Se foi a última tentativa, lançar o erro
      if (attempt === MAX_RETRIES) {
        console.error('[SUPPORT_CHAT_ERROR] Detalhes do erro final:');
        console.error('- Mensagem:', error.message);
        console.error('- Status:', error.status);
        console.error('- Erro completo:', error);
        
        // Re-throw com mensagem melhorada
        if (error.message?.includes('API key')) {
          throw new Error('Chave de API do Gemini não configurada ou inválida');
        }
        if (error.message?.includes('401') || error.message?.includes('403')) {
          throw new Error('Autenticação falhou com a API do Gemini');
        }
        if (error.message?.includes('Timeout')) {
          throw new Error('A IA demorou muito para responder. Tente novamente.');
        }
        throw error;
      }
      
      // Aguardar 1 segundo antes de tentar novamente
      console.log('[SUPPORT_CHAT] Aguardando 1 segundo antes de retry...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
