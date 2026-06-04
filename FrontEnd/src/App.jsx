import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";

import AuthContainer from "./Paginas/Primarias/AuthContainer";
import Recuperar from "./Paginas/Primarias/Recuperar";
import { AuthProvider, getPostLoginRoute } from './context/AuthContext';

import Layout from "./Paginas/Secundarias/Layout";
import AdminDashboard from './Administrador/AdminDashboard';
import ProtectedAdminRoute from './context/ProtectedAdminRoute';
import ProtectedColaboradorRoute from './context/ProtectedColaboradorRoute';
import ProtectedEstudanteRoute from './context/ProtectedEstudanteRoute';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MinhasQuestoes from './Paginas/Secundarias/MinhasQuestoes';
import ColaboradorDashboard from './Paginas/Secundarias/ColaboradorDashboard';
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
import RankingGlobal from "./Paginas/Secundarias/RankingGlobal";
import NotificacoesPage from "./Paginas/Secundarias/NotificacoesPage";
import MinhaJornada from "./Paginas/Secundarias/MinhaJornada";

import MatematicaOriginal from "./Paginas/Tercearios.jsx/ModeloOriginal/MatematicaOriginal";
import ProgramacaoOriginal from "./Paginas/Tercearios.jsx/ModeloOriginal/ProgramacaoOriginal";
import InglesOriginal from "./Paginas/Tercearios.jsx/ModeloOriginal/InglesOriginal";

import NotFoundPage from "./Paginas/Secundarias/NotFoundPage";
import NavbarDemo from "./components/ui/resizable-navbar-demo";

import { useAuth } from './context/AuthContext';

/**
 * SmartHome — rota "/" inteligente.
 * - Admin           → /administrador
 * - Colaborador     → /colaborador/dashboard
 * - Estudante auth. → /painel
 * - Público         → Home
 */
function SmartHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={getPostLoginRoute(user)} replace />;
  return <PageTransition><Home /></PageTransition>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── ROTAS PÚBLICAS ─────────────────────────────────────────── */}
        <Route path="/login"          element={<PageTransition><AuthContainer /></PageTransition>} />
        <Route path="/cadastro"       element={<PageTransition><AuthContainer initialMode="cadastro" /></PageTransition>} />
        <Route path="/recuperar-senha" element={<PageTransition><Recuperar /></PageTransition>} />
        <Route path="/redefinir-senha" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        <Route path="/sobre-nos"      element={<PageTransition><Sobre /></PageTransition>} />
        <Route path="/portal-de-noticias" element={<PageTransition><Noticias /></PageTransition>} />

        {/* Raiz inteligente — redireciona com base no papel */}
        <Route path="/" element={<SmartHome />} />

        {/* ── AMBIENTE DO ADMINISTRADOR (/administrador e alias /admin/*) ── */}
        {/* Toda a gestão administrativa fica dentro deste escopo            */}
        <Route
          path="/administrador"
          element={
            <ProtectedAdminRoute>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedAdminRoute>
          }
        />
        {/* Alias /admin/dashboard → /administrador para clareza de URL */}
        <Route path="/admin"           element={<Navigate to="/administrador" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/administrador" replace />} />
        <Route path="/admin/*"         element={<Navigate to="/administrador" replace />} />

        {/* ── AMBIENTE DO COLABORADOR ───────────────────────────────── */}
        <Route
          path="/colaborador/dashboard"
          element={
            <ProtectedColaboradorRoute>
              <PageTransition><ColaboradorDashboard /></PageTransition>
            </ProtectedColaboradorRoute>
          }
        />
        <Route
          path="/colaborador/questoes"
          element={
            <ProtectedColaboradorRoute>
              <PageTransition><MinhasQuestoes /></PageTransition>
            </ProtectedColaboradorRoute>
          }
        />

        {/* ── AMBIENTE DO ESTUDANTE (exclusivo — admin e colaborador bloqueados) ── */}
        <Route path="/painel"
          element={<ProtectedEstudanteRoute><PageTransition><Dashboard /></PageTransition></ProtectedEstudanteRoute>}
        />
        <Route path="/entrar-no-torneio"
          element={<ProtectedEstudanteRoute><PageTransition><EntrarTorneio /></PageTransition></ProtectedEstudanteRoute>}
        />
        <Route path="/ranking"
          element={<ProtectedEstudanteRoute><PageTransition><Ranking /></PageTransition></ProtectedEstudanteRoute>}
        />
        <Route path="/ranking-global"
          element={<PageTransition><RankingGlobal /></PageTransition>}
        />
        <Route path="/minha-jornada"
          element={<ProtectedEstudanteRoute><PageTransition><MinhaJornada /></PageTransition></ProtectedEstudanteRoute>}
        />
        <Route path="/ranking/:tournamentId"
          element={<ProtectedEstudanteRoute><PageTransition><RankingCompleto /></PageTransition></ProtectedEstudanteRoute>}
        />
        <Route path="/teste-seu-conhecimento"
          element={<ProtectedEstudanteRoute><PageTransition><Teste /></PageTransition></ProtectedEstudanteRoute>}
        />
        <Route path="/matematica-original/:username"
          element={<ProtectedEstudanteRoute><PageTransition><MatematicaOriginal /></PageTransition></ProtectedEstudanteRoute>}
        />
        <Route path="/programacao-original/:username"
          element={<ProtectedEstudanteRoute><PageTransition><ProgramacaoOriginal /></PageTransition></ProtectedEstudanteRoute>}
        />
        <Route path="/ingles-original/:username"
          element={<ProtectedEstudanteRoute><PageTransition><InglesOriginal /></PageTransition></ProtectedEstudanteRoute>}
        />

        {/* ── ROTAS PARTILHADAS (autenticação obrigatória, qualquer papel) ── */}
        <Route path="/perfil"         element={<PageTransition><Perfil /></PageTransition>} />
        <Route path="/suporte"        element={<PageTransition><Suporte /></PageTransition>} />
        <Route path="/notificacoes"   element={<PageTransition><NotificacoesPage /></PageTransition>} />
        <Route path="/configuracoes"  element={<PageTransition><Configuracoes /></PageTransition>} />

        {/* ── UTILITÁRIO ────────────────────────────────────────────── */}
        <Route path="/layout"         element={<PageTransition><Layout /></PageTransition>} />
        <Route path="/test-navbar"    element={<PageTransition><NavbarDemo /></PageTransition>} />

        {/* ── ERROS ─────────────────────────────────────────────────── */}
        <Route path="/404"            element={<PageTransition><NotFoundPage /></PageTransition>} />
        <Route path="*"               element={<PageTransition><NotFoundPage /></PageTransition>} />

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
