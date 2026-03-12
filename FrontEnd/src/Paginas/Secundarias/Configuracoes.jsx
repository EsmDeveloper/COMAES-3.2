import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import { 
  Globe, Lock, Bell, Eye, Palette, 
  Moon, Download, Key, Shield, User,
  Mail, Smartphone, EyeOff, Volume2,
  Trash2, LogOut, Save, X,
  CheckCircle, ChevronRight, AlertCircle,
  HelpCircle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Settings State grouped similar to actual app needs
  const [settings, setSettings] = useState({
    privacy: {
      profilePublic: true,
      showEmail: false,
      showActivity: true
    },
    notifications: {
      email: true,
      push: true,
      reminders: true
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      animations: true
    },
    security: {
      twoFactor: false,
      loginAlerts: true
    }
  });

  // Load settings from backend
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/usuarios/${user.id}/configuracao`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data?.preferencias) {
          // Merge with defaults in case of new fields
          setSettings(prev => ({
            ...prev,
            ...data.data.preferencias
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, [user, navigate, token]);

  const handleUpdate = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/usuarios/${user.id}/configuracao`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferencias: settings })
      });
      
      if (!res.ok) throw new Error('Erro ao salvar no servidor.');
      
      setMessage({ type: 'success', text: 'Configurações sincronizadas com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user || fetching) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-lg shadow-blue-100"></div>
          <p className="mt-4 text-gray-500 font-bold animate-pulse">Carregando Preferências...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <Settings className="text-blue-600" size={32} />
              Configurações
            </h1>
            <p className="text-gray-500 font-medium">Gerencie suas preferências e segurança no COMAES</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 disabled:opacity-50"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <Save size={20} />}
            Salvar Alterações
          </button>
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
            >
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-bold text-sm tracking-tight">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          
          {/* Link para Perfil */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex items-center justify-between group cursor-pointer" onClick={() => navigate('/perfil')}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden bg-white">
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`} alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-800">Dados Pessoais</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-0.5">Nome, Email, Bio e Foto</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
              Ir para Perfil <ChevronRight size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Privacidade */}
            <ConfigCard title="Privacidade" icon={<Eye className="text-blue-500" size={20} />}>
              <ToggleItem 
                label="Perfil Público" 
                desc="Visível para outros estudantes" 
                status={settings.privacy.profilePublic} 
                onChange={(val) => handleUpdate('privacy', 'profilePublic', val)} 
              />
              <ToggleItem 
                label="Mostrar Email" 
                desc="Exibir seu contato no perfil" 
                status={settings.privacy.showEmail} 
                onChange={(val) => handleUpdate('privacy', 'showEmail', val)} 
              />
              <ToggleItem 
                label="Compartilhar Atividade" 
                desc="Mostrar conquistas no feed" 
                status={settings.privacy.showActivity} 
                onChange={(val) => handleUpdate('privacy', 'showActivity', val)} 
              />
            </ConfigCard>

            {/* Notificações */}
            <ConfigCard title="Notificações" icon={<Bell className="text-amber-500" size={20} />}>
              <ToggleItem 
                label="Alertas por Email" 
                desc="Resumo semanal e avisos" 
                status={settings.notifications.email} 
                onChange={(val) => handleUpdate('notifications', 'email', val)} 
              />
              <ToggleItem 
                label="Push de Navegador" 
                desc="Alertas de torneios em tempo real" 
                status={settings.notifications.push} 
                onChange={(val) => handleUpdate('notifications', 'push', val)} 
              />
              <ToggleItem 
                label="Lembretes de Estudo" 
                desc="Sugerir desafios diariamente" 
                status={settings.notifications.reminders} 
                onChange={(val) => handleUpdate('notifications', 'reminders', val)} 
              />
            </ConfigCard>

            {/* Aparência */}
            <ConfigCard title="Plataforma" icon={<Palette className="text-purple-500" size={20} />}>
              <SelectItem 
                label="Tema Global" 
                desc="Escolha a paleta de cores" 
                value={settings.appearance.theme} 
                options={[
                  { label: '🌞 Modo Claro', value: 'light' },
                  { label: '🌙 Modo Escuro', value: 'dark' },
                  { label: '🖥️ Sistema', value: 'auto' }
                ]}
                onChange={(val) => handleUpdate('appearance', 'theme', val)} 
              />
              <ToggleItem 
                label="Animações Fluídas" 
                desc="Efeitos visuais na interface" 
                status={settings.appearance.animations} 
                onChange={(val) => handleUpdate('appearance', 'animations', val)} 
              />
            </ConfigCard>

            {/* Segurança */}
            <ConfigCard title="Segurança" icon={<Shield className="text-red-500" size={20} />}>
              <ToggleItem 
                label="Verificação em 2 Passos" 
                desc="SMS ou Aplicativo de Auth" 
                status={settings.security.twoFactor} 
                onChange={(val) => handleUpdate('security', 'twoFactor', val)} 
              />
              <ToggleItem 
                label="Alertas de Login" 
                desc="Avisar sobre novos acessos" 
                status={settings.security.loginAlerts} 
                onChange={(val) => handleUpdate('security', 'loginAlerts', val)} 
              />
              <div className="pt-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm border border-gray-100 hover:border-red-200 transition-all">
                  Redefinir Senha <ExternalLink size={16} />
                </button>
              </div>
            </ConfigCard>

          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
            <h3 className="text-red-700 font-black flex items-center gap-2 mb-2">
              <Trash2 size={24} />
              ZONA DE PERIGO
            </h3>
            <p className="text-red-600 text-sm font-medium mb-6 italic opacity-80">Cuidado: estas ações são irreversíveis e apagam seu histórico educacional.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => { if(window.confirm('Deseja realmente sair de todos os dispositivos?')) logout(); }}
                className="flex-1 px-6 py-4 bg-white border-2 border-red-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                TERMINAR TODAS AS SESSÕES
              </button>
              <button 
                onClick={() => alert('Recurso em desenvolvimento')}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              >
                DELETAR MINHA CONTA COMAES
              </button>
            </div>
          </div>

          <div className="text-center py-6 border-t border-gray-100 mt-20">
            <div className="flex items-center justify-center gap-6 mb-4">
              <HelpCircle className="text-blue-200" size={40} />
            </div>
            <h4 className="text-gray-800 font-bold mb-1">Dúvidas sobre sua conta?</h4>
            <p className="text-gray-500 text-sm mb-4">Consulte nossa equipe de suporte disponível 24/7</p>
            <button onClick={() => navigate('/suporte')} className="text-blue-600 font-black border-b-2 border-blue-100 hover:text-blue-800">Contatar Central de Ajuda →</button>
          </div>

        </div>
      </div>
    </Layout>
  );
}

// Components
function ConfigCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gray-50 rounded-xl">
          {icon}
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">{title}</h2>
      </div>
      <div className="space-y-6 flex-1">
        {children}
      </div>
    </div>
  );
}

function ToggleItem({ label, desc, status, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <label className="text-sm font-black text-gray-700 block mb-0.5">{label}</label>
        <p className="text-xs text-gray-400 font-medium">{desc}</p>
      </div>
      <button 
        onClick={() => onChange(!status)}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${status ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${status ? 'left-7' : 'left-1'}`}></div>
      </button>
    </div>
  );
}

function SelectItem({ label, desc, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex-1">
        <label className="text-sm font-black text-gray-700 block mb-0.5">{label}</label>
        <p className="text-xs text-gray-400 font-medium mb-3">{desc}</p>
      </div>
      <div className="flex gap-1.5 p-1 bg-gray-50 rounded-xl">
        {options.map(opt => (
          <button 
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 px-2 text-[10px] sm:text-xs font-black rounded-lg transition-all ${value === opt.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}