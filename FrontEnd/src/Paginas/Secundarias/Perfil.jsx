import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import {
  User, Mail, Calendar, Book, Edit, Shield, CheckCircle,
  Lock, LogOut, Camera, Sparkles, Save, X, AlertCircle,
  Settings, BarChart2, Bell, ChevronRight, Phone, MapPin,
  Trash2, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, logout, token, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Edit States for independent fields
  const [editFields, setEditFields] = useState({
    nome: false,
    email: false,
    telefone: false,
    biografia: false,
    escola: false
  });

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    biografia: '',
    escola: ''
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPhotoEditMode, setIsPhotoEditMode] = useState(false);

  // Initialize data
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.fullName || user.name || '',
        email: user.email || '',
        telefone: user.phone || user.telefone || '',
        biografia: user.biografia || user.bio || '',
        escola: user.escola || ''
      });
    } else {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md w-full"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
            <p className="text-gray-600 mb-8">Você precisa estar autenticado para visualizar seu perfil.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
              >
                Fazer Login
              </button>
              <button 
                onClick={() => navigate('/cadastro')}
                className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all"
              >
                Criar Conta
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const handleFieldEdit = (field) => {
    setEditFields(prev => ({ ...prev, [field]: !prev[field] }));
    // Reset field value if canceling
    if (editFields[field]) {
      setFormData(prev => ({ ...prev, [field]: user[field] || '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveField = async (field) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const body = {
        [field === 'nome' ? 'nome' : field]: formData[field]
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar campo.');

      login(data.data, token);
      setEditFields(prev => ({ ...prev, [field]: false }));
      setMessage({ type: 'success', text: 'Informação atualizada com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setIsPhotoEditMode(true);
    }
  };

  const savePhoto = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', selectedFile);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/usuarios/${user.id}/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao subir foto.');

      login(data.data, token);
      setIsPhotoEditMode(false);
      setSelectedFile(null);
      setAvatarPreview(null);
      setMessage({ type: 'success', text: 'Foto de perfil atualizada!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const cancelPhotoEdit = () => {
    setIsPhotoEditMode(false);
    setSelectedFile(null);
    setAvatarPreview(null);
  };

  const tabs = [
    { id: 'info', label: 'Sobre Mim', icon: User },
    { id: 'stats', label: 'Desempenho', icon: BarChart2 },
    { id: 'security', label: 'Conta', icon: Shield },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header de Perfil */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute top-4 right-4 text-white/50">
              <Sparkles size={100} className="opacity-10 rotate-12" />
            </div>
          </div>
          
          <div className="px-6 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar Section */}
            <div className="relative group -mt-16 sm:-mt-20">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                <img 
                  src={avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=4F6EF7&color=fff`} 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Botão de Câmera - Sempre visível mas discreto, ou conforme pedido do usuario */}
              {/* Botão de Câmera - Visível apenas em modo de edição conforme solicitado */}
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-2 p-2.5 bg-blue-600 text-white rounded-full border-2 border-white shadow-lg hover:bg-blue-700 transition-all transform active:scale-95 animate-in zoom-in"
                  title="Alterar foto"
                >
                  <Camera size={18} />
                </button>
              )}
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>

            <div className="flex-1 text-center sm:text-left mb-2">
              <div className="flex flex-col items-center sm:items-start">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2 break-words max-w-full">
                  {user.fullName || user.nome || user.name || 'Usuário'}
                  {user.role === 'admin' && <Shield className="text-amber-500 flex-shrink-0" size={20} title="Administrador" />}
                </h1>
                <p className="text-gray-500 font-medium">@{user.username || 'estudante'}</p>
              </div>
              
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Nível {user.level || 1}
                </span>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {user.points || 0} Pontos
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Conta Ativa
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-0">
              {isPhotoEditMode ? (
                <div className="flex gap-2">
                  <button 
                    onClick={savePhoto}
                    disabled={loading}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all border-b-4 border-green-800"
                  >
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Save size={18} />}
                    Salvar Foto
                  </button>
                  <button 
                    onClick={cancelPhotoEdit}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-6 py-2.5 ${isEditing ? 'bg-amber-100 text-amber-700' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 border-blue-800'} rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1`}
                >
                  <Edit size={18} />
                  {isEditing ? 'Visualizar' : 'Editar Dados'}
                </button>
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {message.text && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`px-6 py-3 border-t flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}
              >
                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span className="text-sm font-medium">{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Lateral / Tabs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={active ? 'text-blue-600' : 'text-gray-400'} />
                      <span className={`font-bold ${active ? 'text-blue-600' : 'text-gray-600'}`}>{tab.label}</span>
                    </div>
                    {active && <ChevronRight size={18} />}
                  </button>
                );
              })}
            </div>

            {/* Card de Mini Bio */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Book size={18} className="text-blue-500" />
                Biografia
              </h3>
              {editFields.biografia ? (
                <div className="space-y-3">
                  <textarea 
                    name="biografia"
                    value={formData.biografia}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[120px]"
                    placeholder="Conte um pouco sobre você..."
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveField('biografia')} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Salvar</button>
                    <button onClick={() => handleFieldEdit('biografia')} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <p className="text-gray-600 text-sm leading-relaxed italic">
                    {user.biografia || 'Nenhuma biografia adicionada ainda.'}
                  </p>
                  {isEditing && (
                    <button 
                      onClick={() => handleFieldEdit('biografia')}
                      className="absolute -top-1 -right-1 p-1.5 bg-amber-100 text-amber-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Informações Pessoais</h2>
                    
                    <div className="space-y-2">
                      {/* Name Field */}
                      <ProfileField 
                        label="Nome Completo" 
                        value={user.fullName || user.nome || user.name || '—'} 
                        icon={<User size={18} />} 
                        isEditing={isEditing}
                        editMode={editFields.nome}
                        onEdit={() => handleFieldEdit('nome')}
                        onSave={() => saveField('nome')}
                        name="nome"
                        inputValue={formData.nome}
                        onChange={handleInputChange}
                      />
                      
                      {/* Email Field */}
                      <ProfileField 
                        label="Endereço de Email" 
                        value={user.email} 
                        icon={<Mail size={18} />} 
                        isEditing={isEditing}
                        editMode={editFields.email}
                        onEdit={() => handleFieldEdit('email')}
                        onSave={() => saveField('email')}
                        name="email"
                        type="email"
                        inputValue={formData.email}
                        onChange={handleInputChange}
                      />

                      {/* Phone Field */}
                      <ProfileField 
                        label="Telemóvel" 
                        value={user.phone || '—'} 
                        icon={<Phone size={18} />} 
                        isEditing={isEditing}
                        editMode={editFields.telefone}
                        onEdit={() => handleFieldEdit('telefone')}
                        onSave={() => saveField('telefone')}
                        name="telefone"
                        inputValue={formData.telefone}
                        onChange={handleInputChange}
                      />

                      {/* School Field */}
                      <ProfileField 
                        label="Instituição de Ensino" 
                        value={user.escola || '—'} 
                        icon={<MapPin size={18} />} 
                        isEditing={isEditing}
                        editMode={editFields.escola}
                        onEdit={() => handleFieldEdit('escola')}
                        onSave={() => saveField('escola')}
                        name="escola"
                        inputValue={formData.escola}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Detalhes Adicionais */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <Settings size={20} className="text-blue-500" />
                      Detalhes da Conta
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">ID do Usuário</p>
                        <p className="text-gray-700 font-mono text-sm">{user.id ? `#${user.id.toString().padStart(6, '0')}` : '—'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Membro Desde</p>
                        <p className="text-gray-700 font-medium">{user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tipo de Perfil</p>
                        <p className="text-gray-700 font-medium capitalize">{user.role || 'Estudante'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status Global</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-gray-700 font-medium">Verificado</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatBox label="Torneios" value={user.tournamentsPlayed || 0} color="blue" />
                    <StatBox label="Vitórias" value={user.tournamentsWon || 0} color="amber" />
                    <StatBox label="Desafios" value={user.challengesSolved || 0} color="green" />
                    <StatBox label="Ranking" value={user.rankPosition || '—'} color="purple" />
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center py-16">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BarChart2 size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Desempenho Detalhado</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">Gráficos de evolução e histórico de competições estão sendo sincronizados via IA.</p>
                    <button onClick={() => navigate('/painel')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 active:translate-y-1 transition-all">
                      Ir para Painel Completo
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-100">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">Segurança da Conta</h2>
                      <p className="text-gray-500 text-sm">Proteja seu acesso e gerencie sua autenticação.</p>
                    </div>
                    
                    <div className="divide-y divide-gray-50">
                      <SecurityItem 
                        icon={<Lock size={20} />} 
                        title="Palavra-passe" 
                        desc="Mudar minha senha atual" 
                        onAction={() => navigate('/configuracoes')} 
                      />
                      <SecurityItem 
                        icon={<Bell size={20} />} 
                        title="Dupla Autenticação" 
                        desc="Ativar verificação em dois passos" 
                        status="Desativado"
                      />
                      <SecurityItem 
                        icon={<Trash2 size={20} className="text-red-500" />} 
                        title="Excluir Conta" 
                        desc="Remover permanentemente meus dados" 
                        danger 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-3 border border-red-100"
                  >
                    <LogOut size={20} />
                    Terminar Sessão em COMAES
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Small Components
function ProfileField({ label, value, icon, isEditing, editMode, onEdit, onSave, name, inputValue, onChange, type="text" }) {
  return (
    <div className="py-4 border-b border-gray-50 last:border-0 group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            {icon}
            {label}
          </p>
          
          <div className="min-h-[40px] flex items-center">
            {editMode ? (
              <div className="flex gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-200">
                <input 
                  type={type}
                  name={name}
                  value={inputValue}
                  onChange={onChange}
                  className="flex-1 w-full bg-blue-50/50 border-2 border-blue-200 outline-none p-2 rounded-xl font-bold text-gray-800 transition-all focus:border-blue-500 text-sm"
                  autoFocus
                />
                <button 
                  onClick={onSave}
                  className="p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors"
                  title="Salvar"
                >
                  <Save size={18} />
                </button>
                <button 
                  onClick={onEdit}
                  className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  title="Cancelar"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group/field">
                <p className="text-gray-800 font-bold text-lg break-words">{value}</p>
                {isEditing && (
                  <button 
                    onClick={onEdit}
                    className="p-1.5 opacity-0 group-hover/field:opacity-100 transition-all bg-amber-50 text-amber-600 rounded-lg shadow-sm hover:bg-amber-100"
                    title="Editar campo"
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  
  return (
    <div className={`${colors[color]} border p-4 rounded-2xl text-center shadow-sm`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-80">{label}</p>
    </div>
  );
}

function SecurityItem({ icon, title, desc, onAction, status, danger }) {
  return (
    <div 
      className={`flex items-center justify-between p-5 sm:p-6 transition-all cursor-pointer ${danger ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}
      onClick={onAction}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${danger ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
          {icon}
        </div>
        <div>
          <p className={`font-bold ${danger ? 'text-red-600' : 'text-gray-800'}`}>{title}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      {status ? (
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{status}</span>
      ) : (
        <ChevronRight size={18} className="text-gray-300" />
      )}
    </div>
  );
}