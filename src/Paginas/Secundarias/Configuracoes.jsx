import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import { 
  Globe, Lock, Bell, Eye, Palette, 
  Moon, Download, Key, Shield, User,
  Mail, Smartphone, EyeOff, Volume2,
  Trash2, LogOut, Save, X,
  CheckCircle
} from 'lucide-react';

// Componente Seção de Configurações
const SettingsSection = ({ title, description, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// Componente Item de Configuração
const SettingsItem = ({ icon: Icon, title, description, type = 'toggle', value, onChange, options, placeholder }) => {
  const renderInput = () => {
    switch(type) {
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        );
      
      case 'select':
        return (
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'text':
        return (
          <input 
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      case 'password':
        return (
          <input 
            type="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <div className="ml-4">
        {renderInput()}
      </div>
    </div>
  );
};

// Componente Perigo (Zona Vermelha)
const DangerZoneItem = ({ icon: Icon, title, description, buttonText, onClick, destructive = true }) => (
  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
    <div className="flex items-center space-x-4 flex-1">
      <div className="p-3 rounded-lg bg-red-100 text-red-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium ${
        destructive 
          ? 'bg-red-600 text-white hover:bg-red-700' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } transition-colors`}
    >
      {buttonText}
    </button>
  </div>
);

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Estado para configurações de privacidade
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showActivity: true,
    showRanking: true,
    showAchievements: true,
    dataSharing: true
  });

  // Estado para configurações de notificações
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    testReminders: true,
    rankingUpdates: true,
    achievementAlerts: true,
    weeklyReports: true
  });

  // Estado para preferências
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'pt',
    fontSize: 'medium',
    soundEffects: true,
    animations: true,
    reduceMotion: false
  });

  // Estado para segurança
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
    autoLogout: true
  });

  // Estado para dados
  const [dataSettings, setDataSettings] = useState({
    autoBackup: true,
    backupFrequency: 'weekly',
    exportFormat: 'json'
  });

  // Funções para modais
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Verificar se usuário está autenticado
  React.useEffect(() => {
    if (!user) {
      setIsRedirecting(true);
      // Redirecionar para login após 2 segundos
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Salvar configurações
  const handleSaveSettings = () => {
    setSaving(true);
    // Simular chamada à API
    setTimeout(() => {
      // Aqui você salvaria as configurações no backend
      console.log('Configurações salvas:', {
        privacy,
        notifications,
        preferences,
        security,
        dataSettings,
        userId: user?.id
      });
      
      setSaving(false);
      alert('Configurações salvas com sucesso!');
    }, 1000);
  };

  // Exportar dados
  const handleExportData = () => {
    setShowExportModal(true);
    // Simular exportação
    setTimeout(() => {
      setShowExportModal(false);
      alert('Dados exportados com sucesso! Um link de download foi enviado para seu email.');
    }, 2000);
  };

  // Deletar conta
  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja deletar sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.')) {
      // Lógica para deletar conta
      logout();
      alert('Sua conta será deletada em 30 dias. Você pode cancelar esta ação entrando em contato com o suporte.');
      navigate('/');
    }
  };

  // Modal de Exportação
  const ExportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Dados COMAES</h3>
        <p className="text-gray-600 mb-6">Selecione o formato e período dos dados que deseja exportar.</p>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="json">JSON (Recomendado)</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">Todos os dados</option>
              <option value="year">Último ano</option>
              <option value="month">Último mês</option>
              <option value="week">Última semana</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancelar
          </button>
          <button 
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Exportar
          </button>
        </div>
      </div>
    </div>
  );

  // Terminar todas as sessões
  const handleTerminateAllSessions = () => {
    logout();
    alert('Todas as sessões foram terminadas. Faça login novamente.');
    navigate('/login');
  };

  // Se usuário não está autenticado, mostrar tela de login
  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-red-100 to-orange-100">
                <Lock className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Restrito às Configurações
            </h2>
            
            <p className="text-gray-700 mb-6">
              As configurações da plataforma COMAES estão disponíveis apenas para usuários autenticados.
              <br />
              Faça login ou cadastre-se para personalizar sua experiência.
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
              <p className="text-sm text-gray-600 mb-3">O que você pode configurar no COMAES:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Privacidade e segurança</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Notificações personalizadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Aparência da plataforma</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Gerenciamento de dados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Usuário autenticado - mostrar configurações
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho com informações do usuário */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Configurações COMAES</h2>
              <p className="text-gray-600 mt-2">Personalize sua experiência na plataforma, {user.fullName || user.username}</p>
            </div>
            <div className="text-sm text-gray-500">
              ID: {user.id ? user.id.toString().slice(-8) : 'COMAES-USER'}
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>

        {/* Configurações de Privacidade */}
        <SettingsSection 
          title="Privacidade" 
          description="Controle quem pode ver suas informações e atividades"
        >
          <SettingsItem
            icon={Globe}
            title="Perfil Público"
            description="Tornar seu perfil visível para outros usuários"
            type="toggle"
            value={privacy.profilePublic}
            onChange={(value) => setPrivacy({...privacy, profilePublic: value})}
          />
          
          <SettingsItem
            icon={Eye}
            title="Mostrar Email"
            description="Permitir que outros usuários vejam seu email"
            type="toggle"
            value={privacy.showEmail}
            onChange={(value) => setPrivacy({...privacy, showEmail: value})}
          />
          
          <SettingsItem
            icon={User}
            title="Mostrar Atividade"
            description="Compartilhar seus testes e conquistas recentes"
            type="toggle"
            value={privacy.showActivity}
            onChange={(value) => setPrivacy({...privacy, showActivity: value})}
          />
          
          <SettingsItem
            icon={Shield}
            title="Compartilhamento de Dados"
            description="Permitir uso de dados anonimizados para melhorias"
            type="toggle"
            value={privacy.dataSharing}
            onChange={(value) => setPrivacy({...privacy, dataSharing: value})}
          />
        </SettingsSection>

        {/* Configurações de Notificações */}
        <SettingsSection 
          title="Notificações" 
          description="Escolha quais notificações deseja receber"
        >
          <SettingsItem
            icon={Mail}
            title="Notificações por Email"
            description="Receber alertas importantes por email"
            type="toggle"
            value={notifications.emailNotifications}
            onChange={(value) => setNotifications({...notifications, emailNotifications: value})}
          />
          
          <SettingsItem
            icon={Bell}
            title="Notificações Push"
            description="Receber notificações no navegador"
            type="toggle"
            value={notifications.pushNotifications}
            onChange={(value) => setNotifications({...notifications, pushNotifications: value})}
          />
          
          <SettingsItem
            icon={Smartphone}
            title="Lembretes de Testes"
            description="Lembretes para completar seus testes pendentes"
            type="toggle"
            value={notifications.testReminders}
            onChange={(value) => setNotifications({...notifications, testReminders: value})}
          />
          
          <SettingsItem
            icon={Volume2}
            title="Atualizações de Ranking"
            description="Alertas quando sua posição no ranking mudar"
            type="toggle"
            value={notifications.rankingUpdates}
            onChange={(value) => setNotifications({...notifications, rankingUpdates: value})}
          />
          
          <SettingsItem
            icon={Bell}
            title="Relatórios Semanais"
            description="Resumo semanal do seu progresso"
            type="toggle"
            value={notifications.weeklyReports}
            onChange={(value) => setNotifications({...notifications, weeklyReports: value})}
          />
        </SettingsSection>

        {/* Preferências de Aparência */}
        <SettingsSection 
          title="Aparência" 
          description="Personalize a aparência da plataforma"
        >
          <SettingsItem
            icon={Moon}
            title="Tema"
            description="Escolha entre tema claro ou escuro"
            type="select"
            value={preferences.theme}
            onChange={(value) => setPreferences({...preferences, theme: value})}
            options={[
              { value: 'light', label: '🌞 Claro' },
              { value: 'dark', label: '🌙 Escuro' },
              { value: 'auto', label: '🔄 Automático' }
            ]}
          />
          
          <SettingsItem
            icon={Palette}
            title="Tamanho da Fonte"
            description="Ajuste o tamanho do texto para melhor leitura"
            type="select"
            value={preferences.fontSize}
            onChange={(value) => setPreferences({...preferences, fontSize: value})}
            options={[
              { value: 'small', label: 'Pequeno' },
              { value: 'medium', label: 'Médio' },
              { value: 'large', label: 'Grande' },
              { value: 'xlarge', label: 'Extra Grande' }
            ]}
          />
          
          <SettingsItem
            icon={Eye}
            title="Efeitos de Animação"
            description="Ativar animações suaves na interface"
            type="toggle"
            value={preferences.animations}
            onChange={(value) => setPreferences({...preferences, animations: value})}
          />
          
          <SettingsItem
            icon={EyeOff}
            title="Reduzir Movimento"
            description="Minimizar animações para acessibilidade"
            type="toggle"
            value={preferences.reduceMotion}
            onChange={(value) => setPreferences({...preferences, reduceMotion: value})}
          />
        </SettingsSection>

        {/* Segurança */}
        <SettingsSection 
          title="Segurança" 
          description="Gerencie a segurança da sua conta"
        >
          <SettingsItem
            icon={Key}
            title="Autenticação de Dois Fatores"
            description="Adicione uma camada extra de segurança"
            type="toggle"
            value={security.twoFactorAuth}
            onChange={(value) => setSecurity({...security, twoFactorAuth: value})}
          />
          
          <SettingsItem
            icon={Bell}
            title="Alertas de Login"
            description="Receber notificações de novos logins"
            type="toggle"
            value={security.loginAlerts}
            onChange={(value) => setSecurity({...security, loginAlerts: value})}
          />
          
          <SettingsItem
            icon={Lock}
            title="Tempo de Sessão"
            description="Tempo de inatividade antes do logout automático"
            type="select"
            value={security.sessionTimeout}
            onChange={(value) => setSecurity({...security, sessionTimeout: value})}
            options={[
              { value: '15', label: '15 minutos' },
              { value: '30', label: '30 minutos' },
              { value: '60', label: '1 hora' },
              { value: '120', label: '2 horas' },
              { value: 'never', label: 'Nunca' }
            ]}
          />
          
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Alterar Senha</h4>
                <p className="text-sm text-gray-600">Atualize sua senha regularmente</p>
              </div>
            </div>
            <span className="text-blue-600">Alterar</span>
          </button>
        </SettingsSection>

        {/* Dados e Backup */}
        <SettingsSection 
          title="Dados e Backup" 
          description="Gerencie seus dados e backups"
        >
          <SettingsItem
            icon={Download}
            title="Backup Automático"
            description="Salvar automaticamente seus dados"
            type="toggle"
            value={dataSettings.autoBackup}
            onChange={(value) => setDataSettings({...dataSettings, autoBackup: value})}
          />
          
          <SettingsItem
            icon={Download}
            title="Frequência de Backup"
            description="Com que frequência fazer backup"
            type="select"
            value={dataSettings.backupFrequency}
            onChange={(value) => setDataSettings({...dataSettings, backupFrequency: value})}
            options={[
              { value: 'daily', label: 'Diariamente' },
              { value: 'weekly', label: 'Semanalmente' },
              { value: 'monthly', label: 'Mensalmente' }
            ]}
          />
          
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Exportar Dados</h4>
                <p className="text-sm text-gray-600">Baixar todos os seus dados em formato JSON/CSV</p>
              </div>
            </div>
            <span className="text-blue-600">Exportar</span>
          </button>
        </SettingsSection>

        {/* Zona de Perigo */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Zona de Perigo COMAES</h3>
              <p className="text-gray-600 mt-1">Ações que não podem ser desfeitas</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <DangerZoneItem
              icon={LogOut}
              title="Terminar Todas as Sessões"
              description="Forçar logout em todos os dispositivos"
              buttonText="Terminar Sessões"
              destructive={false}
              onClick={handleTerminateAllSessions}
            />
            
            <DangerZoneItem
              icon={Trash2}
              title="Excluir Todos os Dados"
              description="Remover permanentemente todos os seus dados"
              buttonText="Excluir Dados"
              onClick={() => alert('Esta funcionalidade está em desenvolvimento')}
            />
            
            <DangerZoneItem
              icon={Trash2}
              title="Deletar Conta Permanentemente"
              description="Esta ação não pode ser desfeita"
              buttonText="Deletar Conta"
              onClick={handleDeleteAccount}
            />
          </div>
        </div>

        {/* Info Footer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Precisa de ajuda?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Entre em contato com nosso suporte em support@comaes.com ou consulte nossa 
                <a href="/help" className="text-blue-600 hover:text-blue-700 ml-1">documentação</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      {showExportModal && <ExportModal />}

      {/* Modal de Alterar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alterar Senha COMAES</h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  alert('Senha alterada com sucesso! Faça login novamente.');
                  logout();
                  navigate('/login');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}