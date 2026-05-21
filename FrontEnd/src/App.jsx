import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";

//import Login from "./Paginas/Primarias/Login";
//import Cadastro from "./Paginas/Primarias/Cadastro"

import AuthContainer from "./Paginas/Primarias/AuthContainer";
import Recuperar from "./Paginas/Primarias/Recuperar";
import { AuthProvider } from './context/AuthContext';

import Layout from "./Paginas/Secundarias/Layout";
import AdminDashboard from './Administrador/AdminDashboard';
import ProtectedAdminRoute from './context/ProtectedAdminRoute';
import ResetPasswordPage from './pages/ResetPasswordPage';
// module wrappers will be lazy-loaded via routes below
import Home from "./Paginas/Secundarias/Home";
import EntrarTorneio from "./Paginas/Secundarias/EntrarTorneio";
import Configuracoes from "./Paginas/Secundarias/Configuracoes";
import Dashboard from "./Paginas/Secundarias/Dashboard";
import Noticias from "./Paginas/Secundarias/Noticias";
import Perfil from "./Paginas/Secundarias/Perfil";
import Sobre from "./Paginas/Secundarias/Sobre";
import Suporte from "./Paginas/Secundarias/Suporte";
import Teste from "./Paginas/Secundarias/Teste";
import Ranking from "./Paginas/Secundarias/Ranking";
import RankingCompleto from "./Paginas/Secundarias/RankingCompleto";
import NotificacoesPage from "./Paginas/Secundarias/NotificacoesPage";

import MatematicaOriginal from "./Paginas/Tercearios.jsx/ModeloOriginal/MatematicaOriginal";
import ProgramacaoOriginal from "./Paginas/Tercearios.jsx/ModeloOriginal/ProgramacaoOriginal";
import InglesOriginal from "./Paginas/Tercearios.jsx/ModeloOriginal/InglesOriginal";

import NotFoundPage from "./Paginas/Secundarias/NotFoundPage";
import NavbarDemo from "./components/ui/resizable-navbar-demo";

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Depois (mantenha ambas as rotas apontando para o mesmo componente): */}
        <Route path="/login" element={<PageTransition><AuthContainer /></PageTransition>} />
        <Route path="/cadastro" element={<PageTransition><AuthContainer initialMode="cadastro" /></PageTransition>} />
        <Route path="/recuperar-senha" element={<PageTransition><Recuperar /></PageTransition>} />
        <Route path="/redefinir-senha" element={<PageTransition><ResetPasswordPage /></PageTransition>} />

        <Route path="/layout" element={<PageTransition><Layout /></PageTransition>} />
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/entrar-no-torneio" element={<PageTransition><EntrarTorneio /></PageTransition>} />
        <Route path="/configuracoes" element={<PageTransition><Configuracoes /></PageTransition>} />
        <Route path="/painel" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/administrador" element={<ProtectedAdminRoute><PageTransition><AdminDashboard /></PageTransition></ProtectedAdminRoute>} />
        <Route path="/portal-de-noticias" element={<PageTransition><Noticias /></PageTransition>} />
        <Route path="/perfil" element={<PageTransition><Perfil /></PageTransition>} />
        <Route path="/sobre-nos" element={<PageTransition><Sobre /></PageTransition>} />
        <Route path="/suporte" element={<PageTransition><Suporte /></PageTransition>} />
        <Route path="/teste-seu-conhecimento" element={<PageTransition><Teste /></PageTransition>} />
        <Route path="/ranking" element={<PageTransition><Ranking /></PageTransition>} />
        <Route path="/ranking/:tournamentId" element={<PageTransition><RankingCompleto /></PageTransition>} />
        <Route path="/notificacoes" element={<PageTransition><NotificacoesPage /></PageTransition>} />

        <Route path="/matematica-original/:username" element={<PageTransition><MatematicaOriginal /></PageTransition>} />
        <Route path="/programacao-original/:username" element={<PageTransition><ProgramacaoOriginal /></PageTransition>} />
        <Route path="/ingles-original/:username" element={<PageTransition><InglesOriginal /></PageTransition>} />

        {/* Rota temporária para testar navbar sem animações */}
        <Route path="/test-navbar" element={<PageTransition><NavbarDemo /></PageTransition>} />

        {/* Rota 404 Específica (para usar com Navigate) */}
        <Route path="/404" element={<PageTransition><NotFoundPage /></PageTransition>} />

        {/* Rota de Fallback para qualquer Caminho Inexistente */}
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
