// Home.jsx
import { motion } from "framer-motion";
import {
  FaTrophy,
  FaBook,
  FaChartLine,
  FaUsers,
  FaBullhorn,
  FaHeadset,
  FaCalculator,
  FaLaptopCode,
  FaMoneyBillWave,
  FaMedal,
  FaCrown,
  FaClock,
  FaLayerGroup,
  FaStar,
  FaChartBar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Layout from "./Layout";
import videoComaes from "../../assets/video.mp4";
import logotipo from "../../assets/logo.png"

const overviewCards = [
  {
    icon: <FaTrophy className="text-3xl text-blue-600" />,
    title: "Competições",
    description: "Participe de competições educativas e desafie seus conhecimentos em diferentes áreas.",
  },
  
  {
    icon: <FaChartLine className="text-3xl text-blue-600" />,
    title: "Progresso",
    description:
      "Acompanhe sua evolução com estatísticas e desempenho ao longo das competições.",
  },
  {
    icon: <FaBullhorn className="text-3xl text-blue-600" />,
    title: "Desafios",
    description: "Resolva desafios práticos que estimulam o raciocínio e o aprendizado.",
  },
  {
    icon: <FaHeadset className="text-3xl text-indigo-600" />,
    title: "Suporte",
    description: "Obtenha ajuda rápida sempre que precisar durante a utilização da plataforma.",
  },
  {
    icon: <FaBullhorn className="text-3xl text-cyan-600" />,
    title: "Ranking",
    description: "Veja sua posição entre os participantes e acompanhe os melhores resultados.",
  },
  {
    icon: <FaChartLine className="text-3xl text-blue-600" />,
    title: "Avaliação",
    description: "Receba feedback automático sobre suas respostas e melhore continuamente.",
  },
];

const recompensasCards = [
  {
    icon: <FaMedal className="text-3xl text-blue-600" />,
    title: "Modelo Original",
    description:
      "Os 3 melhores recebem Certificado de Mérito Oficial da Comaes.",
  },
  {
    icon: <FaCrown className="text-3xl text-indigo-600" />,
    title: "Prêmios por Ranking",
    description: "Jogadores disputam posições globais e acumulam pontos.",
  },
  {
    icon: <FaMoneyBillWave className="text-3xl text-cyan-600" />,
    title: "Modelo Prêmio",
    description:
      "Em desafios especiais, os 3 primeiros recebem prémio em dinheiro.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Layout>
      {/* HERO COM VÍDEO - AGORA FORA DO CONTAINER MAIN, OCUPANDO 100% DA LARGURA */}
      <div className="relative left-1/2 w-[100vw] max-w-[100vw] -translate-x-1/2 -mt-8">
        <div className="relative h-[90vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
          {/* Vídeo de background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover brightness-50"
            poster="https://images.unsplash.com/photo-1519677100203-5f5a1c56b7b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          >
            <source src={videoComaes} type="video/mp4" />
            <source src={videoComaes} type="video/webm" />
            {/* Fallback para imagem caso o vídeo não carregue */}
            <img 
              src={videoComaes}
              alt="COMAES"
              className="w-full h-full object-cover"
            />
          </video>

          {/* Overlay gradiente para melhor contraste */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-indigo-900/70" />
          <div className="absolute inset-0 bg-black/40" />

          {/* Conteúdo sobre o vídeo - CENTRALIZADO COM PADDING CORRETO */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 md:px-8">
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex justify-center items-center mb-2 sm:mb-4">
                <img 
                  src={logotipo}
                  alt="Comaes Logo"
                  className="h-24 sm:h-32 md:h-40 lg:h-48 w-auto object-contain"
                />
              </div>
              
              {/* Subtítulo - Ajustado para mobile */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 drop-shadow-lg px-2 sm:px-4"
              >
                A maior plataforma de competições educativas online
              </motion.p>

              {/* Botões CENTRALIZADOS - Ajustados para mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2"
              >
                {/* CTA diferenciado para colaboradores */}
                {user?.role === 'colaborador' ? (
                  <>
                    <button 
                      onClick={() => navigate('/colaborador/questoes')}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 rounded-full text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-2 w-auto justify-center"
                    >
                      <span>Minhas Questões</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => navigate('/colaborador/dashboard')}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 rounded-full text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-2 w-auto justify-center"
                    >
                      <span>Meu Painel</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                {/* Botão Entrar no Torneio */}
                <button 
                  onClick={() => navigate('/entrar-no-torneio')}
                  className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 rounded-full text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-2 w-auto justify-center"
                >
                  <span>Entrar no Torneio</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>

                {/* Botão Teste Básico */}
                <button 
                  onClick={() => navigate('/teste-seu-conhecimento')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 rounded-full text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-2 w-auto justify-center"
                >
                  <span>Teste Básico</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Indicador de rolagem - Ajustado para mobile */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CONTEÚDO DENTRO DO CONTAINER MAIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* VISÃO GERAL */}
        <div className="py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
            Nossa Plataforma
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {overviewCards.map((card, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col items-center text-center cursor-pointer border border-gray-100 hover:border-blue-300 transition-all"
              >
                <div className="mb-2 sm:mb-3 md:mb-4">{card.icon}</div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* NOSSOS TORNEIOS */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center py-12 sm:py-16">
          <motion.img
            src="https://static.vecteezy.com/system/resources/previews/070/254/539/non_2x/collaborative-university-students-engaged-in-group-study-sharing-ideas-and-working-together-on-laptop-atmosphere-is-positive-and-focused-highlighting-teamwork-and-learning-free-photo.jpeg"
            className="w-full lg:w-1/2 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          />
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              Nossos Torneios
            </h2>
            <p className="mb-4 sm:mb-5 text-sm sm:text-base text-gray-700 leading-relaxed">
              Torneios contínuos temporários por 1 mês. A cada mês é realizado um novo
              torneio para que os estudantes tenham oportunidades de competir sempre e
              ganhar mérito e prêmios. Nos nossos torneios, incluem:
            </p>
            <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
              <div className="flex items-start gap-2 sm:gap-3">
                <FaClock className="text-xl sm:text-2xl text-blue-600 flex-shrink-0" />
                <p><strong>Temporizador por questão</strong>: cada pergunta tem um limite de tempo.</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <FaLayerGroup className="text-xl sm:text-2xl text-blue-600 flex-shrink-0" />
                <p><strong>Níveis de dificuldade</strong>: fácil, médio e difícil.</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <FaChartBar className="text-xl sm:text-2xl text-blue-600 flex-shrink-0" />
                <p><strong>Ranking em tempo real</strong>: veja sua posição durante o torneio.</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <FaStar className="text-xl sm:text-2xl text-blue-600 flex-shrink-0" />
                <p><strong>Áreas de disputa</strong>: matemática, programação, inglês, etc.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* DESAFIOS DA COMAES - FUNDO CINZA OCUPANDO 100% DA LARGURA */}
      <div className="relative left-1/2 w-[100vw] max-w-[100vw] -translate-x-1/2 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6"
          >
            Desafios da Comaes
          </motion.h2>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base md:text-lg px-2">
            Os desafios incluem perguntas de cálculo, lógica e interpretação. Cada disciplina possui níveis:
            <br />
            <span className="font-semibold">
              Fácil (5 pontos), Médio (10 pontos), Difícil (20 pontos)
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {[
              {
                icon: <FaCalculator className="text-2xl sm:text-3xl text-blue-600" />,
                title: "Matemática",
                description: "Cálculos numéricos, problemas e lógica quantitativa.",
              },
              {
                icon: <FaLaptopCode className="text-2xl sm:text-3xl text-indigo-600" />,
                title: "Programação",
                description: "Algoritmos, lógica computacional e pequenos códigos.",
              },
              {
                icon: <FaBook className="text-2xl sm:text-3xl text-cyan-600" />,
                title: "Inglês",
                description: "Vocabulário, gramática e compreensão de textos.",
              },
            ].map((card, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-center cursor-pointer border border-gray-100 hover:border-blue-300 transition-all"
              >
                <div className="mb-2 sm:mb-3 md:mb-4">{card.icon}</div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* RECOMPENSAS - DENTRO DO CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8 md:mb-10"
        >
          Recompensas da Comaes
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {recompensasCards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="bg-white p-3 sm:p-4 md:p-6 shadow-lg rounded-xl text-center cursor-pointer border border-gray-100 hover:border-blue-300 transition-all"
            >
              <div className="mb-2 sm:mb-3 md:mb-4 flex justify-center">{card.icon}</div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">{card.title}</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
