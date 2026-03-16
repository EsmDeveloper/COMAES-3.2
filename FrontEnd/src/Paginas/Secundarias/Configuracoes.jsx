import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import { 
  Globe, Lock, Bell, Eye, Palette, 
  Shield, Trash2, Save, X,
  CheckCircle, ChevronRight, AlertCircle,
  HelpCircle, ExternalLink, Settings
} from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfigPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [settings, setSettings] = useState({
    privacy: {
      profilePublic: true,
      showEmail: false,
    },
    notifications: {
      email: true,
      push: true,
    },
    appearance: {
      theme: 'light',
      animations: true
    },
    security: {
      twoFactor: false,
      loginAlerts: true
    }
  });

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
      
      setMessage({ type: 'success', text: 'Preferências sincronizadas com sucesso!' });
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
          <p className="mt-4 text-gray-500 font-bold animate-pulse">Iniciando Painel...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative min-h-screen bg-gray-50/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12 pb-32">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white leading-none">
                  <Settings size={24} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  Configurações
                </h1>
              </div>
              <p className="text-gray-500 font-medium md:ml-12">Personalize sua experiência e segurança no COMAES</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveSettings}
              disabled={loading}
              className="group relative overflow-hidden w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-3">
                {loading ? <FaSpinner className="animate-spin" /> : <Save size={20} />}
                {loading ? 'Sincronizando...' : 'Salvar Alterações'}
              </span>
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`mb-8 p-5 rounded-3xl flex items-center gap-4 border shadow-2xl backdrop-blur-md ${
                  message.type === 'success' 
                    ? 'bg-green-50/80 border-green-100 text-green-800' 
                    : 'bg-red-50/80 border-red-100 text-red-800'
                }`}
              >
                <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm uppercase tracking-wider">{message.type === 'success' ? 'Sucesso' : 'Erro'}</p>
                  <p className="font-bold text-sm opacity-80">{message.text}</p>
                </div>
                <button onClick={() => setMessage({type:'', text:''})} className="opacity-40 hover:opacity-100 transition-opacity">
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-[35px] p-8 shadow-xl border border-gray-100 relative overflow-hidden group cursor-pointer"
                onClick={() => navigate('/perfil')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-[30px] border-4 border-white shadow-2xl overflow-hidden bg-gray-100 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=4F6EF7&color=fff`} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-lg" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">{user.fullName || "Usuário"}</h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">Membro Ativo</p>
                  <div className="w-full py-4 px-6 bg-gray-50 rounded-2xl flex items-center justify-between group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <span className="text-sm font-black">Editar Perfil</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </motion.div>

              <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[35px] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
                <HelpCircle size={150} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
                <h4 className="text-xl font-black mb-4">Central de Ajuda</h4>
                <p className="text-blue-100 font-medium mb-8 leading-relaxed">Dúvidas sobre o funcionamento dos torneios ou sua conta?</p>
                <button 
                  onClick={() => navigate('/suporte')}
                  className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-black text-sm border border-white/30 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={18} />
                  Contatar Suporte
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ConfigCard title="Privacidade" icon={<Eye className="text-blue-500" size={20} />}>
                  <ToggleItem 
                    label="Perfil Público" 
                    desc="Visível para outros estudantes" 
                    status={settings.privacy.profilePublic} 
                    onChange={(val) => handleUpdate('privacy', 'profilePublic', val)} 
                  />
                  <ToggleItem 
                    label="Mostrar Email" 
                    desc="Exibir contato no seu perfil" 
                    status={settings.privacy.showEmail} 
                    onChange={(val) => handleUpdate('privacy', 'showEmail', val)} 
                  />
                </ConfigCard>

                <ConfigCard title="Notificações" icon={<Bell className="text-amber-500" size={20} />}>
                  <ToggleItem 
                    label="Push Real-time" 
                    desc="Alertas de novos torneios" 
                    status={settings.notifications.push} 
                    onChange={(val) => handleUpdate('notifications', 'push', val)} 
                  />
                  <ToggleItem 
                    label="Resumo por Email" 
                    desc="Frequência semanal" 
                    status={settings.notifications.email} 
                    onChange={(val) => handleUpdate('notifications', 'email', val)} 
                  />
                </ConfigCard>

                <ConfigCard title="Design" icon={<Palette className="text-purple-500" size={20} />}>
                  <SelectItem 
                    label="Tema Visual" 
                    desc="Cores do ambiente" 
                    value={settings.appearance.theme} 
                    options={[
                      { label: '🌞 Light', value: 'light' },
                      { label: '🌙 Dark', value: 'dark' },
                      { label: '🖥️ Auto', value: 'auto' }
                    ]}
                    onChange={(val) => handleUpdate('appearance', 'theme', val)} 
                  />
                  <ToggleItem 
                    label="Animações" 
                    desc="Fluidez na navegação" 
                    status={settings.appearance.animations} 
                    onChange={(val) => handleUpdate('appearance', 'animations', val)} 
                  />
                </ConfigCard>

                <ConfigCard title="Segurança" icon={<Shield className="text-red-500" size={20} />}>
                  <div className="flex flex-col gap-5">
                    <ToggleItem 
                      label="Alertas de Login" 
                      desc="Avisar novos acessos" 
                      status={settings.security.loginAlerts} 
                      onChange={(val) => handleUpdate('security', 'loginAlerts', val)} 
                    />
                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span>Força da Senha</span>
                          <span className="text-green-500">Elevada</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-4/5 bg-green-500 rounded-full" />
                       </div>
                    </div>
                  </div>
                </ConfigCard>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-red-50/50 rounded-[35px] p-8 border border-red-100 relative overflow-hidden"
              >
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-red-100/50 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <h3 className="text-red-700 font-black text-xl flex items-center gap-3 mb-2">
                    <Trash2 size={24} />
                    Zona Crítica
                  </h3>
                  <p className="text-red-900/60 font-bold text-sm mb-8 italic">Estas ações podem ser permanentes. Prossiga com cuidado.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => { if(window.confirm('Deslogar de todos os locais?')) logout(); }}
                      className="px-6 py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-black text-sm hover:bg-black hover:text-white hover:border-black transition-all"
                    >
                      LOGOUT GLOBAL
                    </button>
                    <button 
                      disabled
                      className="px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-sm opacity-50 cursor-not-allowed"
                    >
                      EXCLUIR CONTA
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ConfigCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-[35px] shadow-lg border border-gray-100 p-8 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600">
          {icon}
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">{title}</h2>
      </div>
      <div className="space-y-7 flex-1">
        {children}
      </div>
    </div>
  );
}

function ToggleItem({ label, desc, status, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 group">
      <div className="flex-1">
        <label className="text-sm font-black text-gray-700 block mb-0.5">{label}</label>
        <p className="text-[11px] text-gray-400 font-bold leading-tight">{desc}</p>
      </div>
      <button 
        onClick={() => onChange(!status)}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${status ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-gray-200'}`}
      >
        <motion.div 
          animate={{ x: status ? 26 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

function SelectItem({ label, desc, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex-1">
        <label className="text-sm font-black text-gray-700 block mb-0.5">{label}</label>
        <p className="text-[11px] text-gray-400 font-bold mb-4">{desc}</p>
      </div>
      <div className="flex gap-1.5 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100">
        {options.map(opt => (
          <button 
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-3 text-[10px] font-black rounded-xl transition-all ${value === opt.value ? 'bg-white text-blue-600 shadow-md translate-y-[-1px]' : 'text-gray-400 hover:text-gray-500'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}