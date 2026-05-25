import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from "./Layout";
import { enviarTentativa } from '../../services/tentativasService';
import { 
  CheckCircle,
  Lock
} from 'lucide-react';

function Teste() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [torneioId, setTorneioId] = useState(null);

  // Verificar se usuário está autenticado
  useEffect(() => {
    if (!user) {
      setIsRedirecting(true);
      // Redirecionar para login após 2 segundos
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const [loading, setLoading] = useState(false);

  // Dados dos quizzes por ├írea (metadados estáticos, Questões dinâmicas)
  const [quizzes, setQuizzes] = useState({
    matematica: {
      title: "Matemática",
      icon: "­ƒº«",
      color: "#3B82F6",
      gradient: "from-blue-500 to-blue-600",
      questions: []
    },
    programacao: {
      title: "Programação",
      icon: "­ƒÆ╗",
      color: "#10B981",
      gradient: "from-emerald-500 to-emerald-600",
      questions: []
    },
    ingles: {
      title: "Inglês",
      icon: "­ƒöñ",
      color: "#8B5CF6",
      gradient: "from-violet-500 to-violet-600",
      questions: []
    }
  });

  // Carregar Questões do backend ao selecionar ├írea
  useEffect(() => {
    const fetchQuestions = async (area) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/questoes/quiz/${area}`);
        const result = await response.json();
        
        if (result.success) {
          const mappedQuestions = result.data.map(q => {
            const options = [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(opt => opt !== null);
            
            return {
              id: q.id,
              question: q.texto_pergunta,
              options: options
            };
          });

          setQuizzes(prev => ({
            ...prev,
            [area]: {
              ...prev[area],
              questions: mappedQuestions
            }
          }));
        }
      } catch (error) {
        console.error(`Erro ao carregar Questões de ${area}:`, error);
      }
    };

    // Pr├®-carregar todas as áreas para mostrar contagem
    Object.keys(quizzes).forEach(area => {
      fetchQuestions(area);
    });
  }, []);

  // Recarregar Questões se necess├írio ao selecionar ├írea (opcional se j├í pr├®-carregado)
  useEffect(() => {
    if (selectedArea && quizzes[selectedArea].questions.length === 0) {
      // For├ºar carregamento se ainda n├úo tiver
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [selectedArea]);

  useEffect(() => {
    let timer;
    if (selectedArea && timeLeft > 0 && !quizCompleted) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && selectedArea) {
      handleNextQuestion();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, selectedArea, quizCompleted]);

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setCurrentQuestion(0);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTimeLeft(30);
    setUserAnswers([]);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = async (optionIndex) => {
    if (quizCompleted || submittingAnswer) return;

    const currentQuiz = quizzes[selectedArea];
    const currentQ = currentQuiz.questions[currentQuestion];
    const selectedOption = currentQ.options[optionIndex];
    
    setSubmittingAnswer(true);

    try {
      // Calcular tempo gasto nesta questão
      const tempoGasto = 30 - timeLeft;

      // Enviar resposta para o backend (backend valida e calcula pontos)
      const result = await enviarTentativa({
        torneio_id: torneioId || 1,
        disciplina_competida: selectedArea === 'matematica' ? 'Matemática' : selectedArea === 'programacao' ? 'Programação' : 'Inglês',
        questao_id: currentQ.id,
        resposta_selecionada: selectedOption,
        tempo_gasto: tempoGasto
      });

      // Backend retorna validação e pontos
      const tentativa = result.tentativa;
      const resumo = result.resumo;

      // Armazenar resposta com dados do backend (sem validação local)
      const newUserAnswers = [...userAnswers, {
        question: currentQuestion,
        selected: optionIndex,
        correct: tentativa.correta,
        pontosObtidos: tentativa.pontos_obtidos,
        respostaCorreta: tentativa.resposta_correta
      }];
      
      setUserAnswers(newUserAnswers);

      // Atualizar pontuação com dados do backend
      setScore(resumo.total_pontos);
      setCorrectAnswers(resumo.total_acertos);
      setWrongAnswers(resumo.total_questoes - resumo.total_acertos);

      // Passar para próxima questão ou finalizar
      if (currentQuestion === currentQuiz.questions.length - 1) {
        setQuizCompleted(true);
      } else {
        setTimeout(() => {
          handleNextQuestion();
        }, 1500);
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      alert(`Erro ao enviar resposta: ${error.message}`);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizzes[selectedArea].questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleBackToSelection = () => {
    setSelectedArea(null);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTimeLeft(30);
    setUserAnswers([]);
    setQuizCompleted(false);
  };

  // Se usu├írio n├úo est├í autenticado, mostrar tela de login
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-gradient-to-r from-red-100 to-orange-100">
                  <Lock className="h-12 w-12 text-red-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acesso Restrito aos Testes COMAES
              </h2>
              
              <p className="text-gray-700 mb-6">
                Os testes de conhecimento COMAES est├úo disponíveis apenas para usuários autenticados.
                <br />
                Faça login ou cadastre-se para testar seus conhecimentos e competir.
              </p>
              
              {isRedirecting ? (
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600 font-medium">Redirecionando para login...</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">Você será redirecionado automaticamente em instantes</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => navigate('/cadastro')}
                    className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all"
                  >
                    Cadastrar-se
                  </button>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Benefícios dos Testes COMAES:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Questões de diferentes áreas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Temporizador por questão</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Pontuação por velocidade</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Estatísticas detalhadas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de Áreas (exemplo visual) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 opacity-50">
              {Object.entries(quizzes).map(([key, area]) => (
                <div
                  key={key}
                  className={`bg-white rounded-xl shadow-md border-t-4 border-${area.color.split('-')[1]}-500 overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="text-4xl mb-4 text-center">{area.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{area.title}</h3>
                    <p className="text-gray-600 text-sm text-center mb-4">
                      {area.questions.length} Questões ÔÇó 30s por questão
                    </p>
                    <div className="w-full py-2.5 px-5 bg-gray-200 text-gray-500 font-semibold rounded-lg flex items-center justify-center gap-1.5 text-sm">
                      Faça login para acessar
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Se n├úo h├í ├írea selecionada, mostrar seleção de áreas
  if (!selectedArea) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-3">
                ­ƒôè Teste Teu Conhecimento COMAES
              </h1>
              <p className="text-gray-600 text-base max-w-xl mx-auto">
                Bem-vindo, <span className="font-semibold text-blue-600">{user.fullName || user.username}</span>! 
                Escolhe uma ├írea e mostra o que sabes! Desafia-te com Questões das principais competições da Comaes.
              </p>
              <div className="text-sm text-gray-500 mt-2">
                ID: {user.id ? user.id.toString().slice(-8) : 'COMAES-USER'}
              </div>
            </div>

            {/* Cards de Áreas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {Object.entries(quizzes).map(([key, area]) => (
                <div
                  key={key}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-${area.color.split('-')[1]}-500 cursor-pointer overflow-hidden`}
                  onClick={() => handleAreaSelect(key)}
                >
                  <div className="p-6">
                    <div className="text-4xl mb-4 text-center">{area.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{area.title}</h3>
                    <p className="text-gray-600 text-sm text-center mb-4">
                      {area.questions.length > 0 ? `${area.questions.length} Questões` : 'Carregando Questões...'} ÔÇó 30s por questão
                    </p>
                    <button className={`w-full py-2.5 px-5 bg-gradient-to-r ${area.gradient} text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-1.5 text-sm`}>
                      Iniciar Teste
                      <span className="text-lg">ÔåÆ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Estatísticas */}
            <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Como Funciona o COMAES</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1.5">4</div>
                  <p className="text-gray-600 text-sm">Questões por ├írea</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1.5">30s</div>
                  <p className="text-gray-600 text-sm">Tempo por questão</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600 mb-1.5">+10</div>
                  <p className="text-gray-600 text-sm">Pontos por acerto</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQuiz = quizzes[selectedArea];
  
  if (loading || !currentQuiz || currentQuiz.questions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando Questões do teste...</p>
            <button 
              onClick={handleBackToSelection}
              className="mt-4 text-blue-600 hover:underline"
            >
              Voltar para seleção
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQ = currentQuiz.questions[currentQuestion];
  const totalQuestions = currentQuiz.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header do Quiz */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-8">
            <button
              onClick={handleBackToSelection}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              ÔåÉ Voltar para áreas
            </button>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full ${selectedArea === 'matematica' ? 'bg-blue-100 text-blue-600' : selectedArea === 'programacao' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'} font-semibold text-sm`}>
                {currentQuiz.icon} {currentQuiz.title}
              </span>
              <div className={`px-3 py-1.5 rounded-lg ${timeLeft < 10 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} font-bold flex items-center gap-1.5 text-sm transition-colors duration-300`}>
                ÔÅ▒´©Å {timeLeft}s
              </div>
            </div>
          </div>

          {/* ├ürea Principal - Aumentada e com mais espa├ºo */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* ├ürea do Quiz - Mais larga */}
            <div className="lg:col-span-3">
              {quizCompleted ? (
                <div className="bg-white rounded-xl shadow-md p-8">
                  <div className="text-center max-w-2xl mx-auto">
                    <div className="text-5xl mb-6">­ƒÅå</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Teste Concluído COMAES!</h2>
                    <p className="text-gray-600 text-base mb-8">Resultados de {currentQuiz.title}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-gray-50 rounded-lg p-5 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">{score}</div>
                        <div className="text-gray-600 text-sm">Pontos</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-5 text-center">
                        <div className="text-2xl font-bold text-emerald-600 mb-2">{correctAnswers}</div>
                        <div className="text-gray-600 text-sm">Acertos</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-5 text-center">
                        <div className="text-2xl font-bold text-red-600 mb-2">{wrongAnswers}</div>
                        <div className="text-gray-600 text-sm">Erros</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-5 text-center">
                        <div className="text-2xl font-bold text-gray-800 mb-2">{totalQuestions}</div>
                        <div className="text-gray-600 text-sm">Total</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={handleRestartQuiz}
                        className={`px-6 py-3 bg-gradient-to-r ${currentQuiz.gradient} text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 text-sm`}
                      >
                        Ôå╗ Refazer Teste
                      </button>
                      <button
                        onClick={handleBackToSelection}
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm"
                      >
                        ÔåÉ Nova ├ürea
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Barra de Progresso */}
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-700 font-medium text-sm">
                        questão {currentQuestion + 1} de {totalQuestions}
                      </span>
                      <span className="text-gray-600 text-sm">{Math.round(progress)}% completo</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${selectedArea === 'matematica' ? 'bg-blue-500' : selectedArea === 'programacao' ? 'bg-emerald-500' : 'bg-violet-500'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Card da questão - Aumentado */}
                  <div className="bg-white rounded-xl shadow-md p-7 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-7 leading-relaxed">
                      {currentQ.question}
                    </h2>

                    {/* Opções */}
                    <div className="space-y-3">
                      {currentQ.options.map((option, index) => {
                        const userAnswer = userAnswers.find(a => a.question === currentQuestion);
                        let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 ";
                        
                        if (userAnswer) {
                          if (index === userAnswer.selected) {
                            // Mostrar resposta selecionada pelo usuário
                            buttonClass += userAnswer.correct 
                              ? "bg-emerald-50 border-emerald-400 text-emerald-700 " 
                              : "bg-red-50 border-red-400 text-red-700 ";
                          } else if (index === userAnswer.respostaCorreta) {
                            // Mostrar resposta correta (se errou)
                            buttonClass += "bg-emerald-50 border-emerald-400 text-emerald-700 opacity-70 ";
                          } else {
                            buttonClass += "bg-gray-50 border-gray-200 text-gray-700 opacity-50 ";
                          }
                        } else {
                          buttonClass += "bg-gray-50 border-gray-200 text-gray-800 ";
                          buttonClass += "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 ";
                        }

                        return (
                          <button
                            key={index}
                            className={buttonClass}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={userAnswers.some(a => a.question === currentQuestion) || submittingAnswer}
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${userAnswer && index === userAnswer.selected ? (userAnswer.correct ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : userAnswer && index === userAnswer.respostaCorreta ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 border'}`}>
                              <span className="font-bold text-sm">{String.fromCharCode(65 + index)}</span>
                            </div>
                            <span className="flex-1 text-sm">{option}</span>
                            {userAnswer && index === userAnswer.selected && (
                              <span className="text-lg">{userAnswer.correct ? '✓' : '✗'}</span>
                            )}
                            {userAnswer && !userAnswer.correct && index === userAnswer.respostaCorreta && (
                              <span className="text-lg text-emerald-500">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navegação */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      disabled={!userAnswers.some(a => a.question === currentQuestion) || submittingAnswer}
                      className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 text-sm ${userAnswers.some(a => a.question === currentQuestion) && !submittingAnswer ? `bg-gradient-to-r ${currentQuiz.gradient} text-white hover:opacity-90` : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      {submittingAnswer ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          {currentQuestion === totalQuestions - 1 ? 'Finalizar' : 'Próxima Questão'}
                          <span className="text-base">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar de Resultados - Mais larga e separada */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-8 h-fit">
                <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b">­ƒôê Seus Resultados</h3>
                
                <div className="space-y-4 mb-7">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-11 h-11 bg-yellow-100 rounded-full">
                      <span className="text-xl">Ô¡É</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-800">{score}</div>
                      <div className="text-gray-600 text-xs">Pontos</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-11 h-11 bg-emerald-100 rounded-full">
                      <span className="text-xl text-emerald-600">Ô£ô</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-800">{correctAnswers}</div>
                      <div className="text-gray-600 text-xs">Acertos</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-11 h-11 bg-red-100 rounded-full">
                      <span className="text-xl text-red-600">Ô£ù</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-800">{wrongAnswers}</div>
                      <div className="text-gray-600 text-xs">Erros</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-11 h-11 bg-blue-100 rounded-full">
                      <span className="text-xl text-blue-600">­ƒôØ</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-800">{currentQuestion + 1}/{totalQuestions}</div>
                      <div className="text-gray-600 text-xs">Questões</div>
                    </div>
                  </div>
                </div>

                {/* Progresso das Questões */}
                <div className="mb-7">
                  <h4 className="font-semibold text-gray-700 text-sm mb-4">Progresso das Questões</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {currentQuiz.questions.map((_, index) => {
                      const userAnswer = userAnswers.find(a => a.question === index);
                      let dotClass = "w-9 h-9 rounded-full flex items-center justify-center font-medium transition-all duration-300 text-sm ";
                      
                      if (userAnswer) {
                        dotClass += userAnswer.correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white";
                      } else if (index === currentQuestion) {
                        dotClass += `border-2 ${selectedArea === 'matematica' ? 'border-blue-500 text-blue-600' : selectedArea === 'programacao' ? 'border-emerald-500 text-emerald-600' : 'border-violet-500 text-violet-600'} bg-white`;
                      } else {
                        dotClass += "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300";
                      }
                      
                      return (
                        <button
                          key={index}
                          className={dotClass}
                          onClick={() => !quizCompleted && userAnswers.some(a => a.question === index) && setCurrentQuestion(index)}
                          title={`Questão ${index + 1}`}
                          disabled={quizCompleted || !userAnswers.some(a => a.question === index)}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Informa├º├Áes de Tempo */}
                <div className="space-y-3 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Tempo Restante:</span>
                    <span className="font-semibold text-blue-600 text-sm">{timeLeft}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Velocidade M├®dia:</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {currentQuestion > 0 ? Math.round((30 * currentQuestion - (30 - timeLeft)) / currentQuestion) : 0}s/q
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Teste;

