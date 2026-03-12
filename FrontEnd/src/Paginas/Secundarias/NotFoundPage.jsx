import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaHome, FaArrowLeft, FaBook, FaExclamationTriangle } from 'react-icons/fa';
import Layout from './Layout';
import image404 from '../../assets/404.png'; // Nova imagem 404 solicitada

const NotFoundPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Determinar se é um erro de permissão (ex: 403) ou 404
    const isForbidden = location.state?.forbidden || false;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16">
                
                {/* CONTEÚDO DE TEXTO */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 text-center lg:text-left order-2 lg:order-1"
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${
                            isForbidden ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}
                    >
                        {isForbidden ? 'Acesso Restrito' : 'Erro 404'}
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        {isForbidden ? '403 — Acesso Negado' : '404 — Página não encontrada'}
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        {isForbidden
                            ? 'Lamentamos, mas você não possui permissões de administrador para aceder a esta área do sistema. Por favor, contacte o suporte se considerar isto um erro.'
                            : 'Parece que esta página não existe, foi removida ou o caminho que você tentou aceder está incorreto.'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        {user ? (
                            <Link 
                                to="/painel"
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-200 transform hover:-translate-y-1"
                            >
                                <FaHome />
                                Ir para o Meu Painel
                            </Link>
                        ) : (
                            <Link 
                                to="/"
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-200 transform hover:-translate-y-1"
                            >
                                <FaHome />
                                Voltar para a página inicial
                            </Link>
                        )}
                        
                        <Link 
                            to="/teste-seu-conhecimento"
                            className="w-full sm:w-auto px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-full transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                        >
                            <FaBook />
                            Explorar Desafios
                        </Link>
                    </div>

                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-10 text-gray-500 hover:text-blue-600 flex items-center gap-2 font-bold transition-colors mx-auto lg:mx-0 group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar à página anterior</span>
                    </button>
                </motion.div>

                {/* ILUSTRAÇÃO / IMAGEM */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className="flex-1 order-1 lg:order-2 w-full flex justify-center lg:justify-end"
                >
                    <div className="relative w-full max-w-lg lg:max-w-xl">
                        {/* Elementos decorativos de fundo */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10" />
                        
                        <div className="relative overflow-hidden rounded-3xl shadow-xl bg-white border border-gray-100 group">
                            <img 
                                src={image404} 
                                alt="Página não encontrada" 
                                className="w-full h-auto object-contain max-h-[400px] md:max-h-[500px] lg:max-h-[600px] group-hover:scale-105 transition-transform duration-700 p-4"
                            />
                        </div>

                        {/* Floating Interaction (Badge) */}
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -bottom-6 -right-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hidden md:flex items-center gap-4 z-20"
                        >
                            <div className={`w-10 h-10 rounded-xl ${isForbidden ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center font-bold text-lg`}>
                                {isForbidden ? '!' : '?'}
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{isForbidden ? 'Segurança' : 'Navegação'}</p>
                                <p className="text-sm font-bold text-gray-800">
                                    {isForbidden ? 'Acesso restrito' : 'Caminho perdido'}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

            </div>
        </Layout>
    );
};

export default NotFoundPage;