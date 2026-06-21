import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, CheckCircle, AlertCircle, Loader, ChevronDown } from 'lucide-react';

/**
 * AtribuirColaborador Component
 * 
 * Form for assigning a user to be a collaborator for a specific discipline
 * 
 * Features:
 * - User select dropdown (searchable)
 * - Discipline select dropdown
 * - Assign button with loading state
 * - Validation and error messages
 * - Success feedback
 * - Form clearing after success
 * 
 * Requirements met:
 * - 11.1: Update user role to 'colaborador'
 * - 11.2: Set disciplina_colaborador
 * - 11.3: Validate user not admin
 * - 11.4: Validate disciplina valid
 * - 11.5: Validate user exists
 * - 11.6: Return updated user
 */

const AtribuirColaborador = () => {
  const { token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

  // Form state
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Data state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Valid disciplines
  const disciplinas = [
    { id: 'matematica', nome: 'Matemática' },
    { id: 'ingles', nome: 'InglÃªs' },
    { id: 'programacao', nome: 'Programação' }
  ];

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users from API
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let usersList = [];
      if (Array.isArray(data)) {
        usersList = data;
      } else if (data.dados && Array.isArray(data.dados)) {
        usersList = data.dados;
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
      }

      // Filter out admin users
      const nonAdminUsers = usersList.filter(u => u.role !== 'admin' && !u.isAdmin);
      setUsers(nonAdminUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Erro ao carregar usuários: ${err.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.nome?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUserSearchTerm('');
    setShowUserDropdown(false);
    setError('');
  };

  // Handle discipline selection
  const handleSelectDisciplina = (disciplina) => {
    setSelectedDisciplina(disciplina);
    setError('');
  };

  // Clear form
  const clearForm = () => {
    setSelectedUser(null);
    setSelectedDisciplina('');
    setUserSearchTerm('');
    setError('');
    setSuccess(false);
    setSuccessMessage('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedUser) {
      setError('Selecione um usuário');
      return;
    }

    if (!selectedDisciplina) {
      setError('Selecione uma disciplina');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(
        `${API_BASE}/api/usuarios/${selectedUser.id}/atribuir`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            disciplina_nome: selectedDisciplina
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.mensagem || 
          errorData.error || 
          `Erro ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      // Success
      setSuccess(true);
      setSuccessMessage(
        `${selectedUser.nome} foi atribuído como colaborador de ${
          disciplinas.find(d => d.id === selectedDisciplina)?.nome || selectedDisciplina
        } com sucesso!`
      );

      // Clear form
      setTimeout(() => {
        clearForm();
      }, 2000);
    } catch (err) {
      console.error('Error assigning colaborador:', err);
      
      // Handle specific error messages
      if (err.message.includes('admin')) {
        setError('Não é possível atribuir um administrador como colaborador');
      } else if (err.message.includes('Disciplina')) {
        setError('Disciplina inválida');
      } else if (err.message.includes('não encontrado')) {
        setError('Usuário não encontrado');
      } else {
        setError(`Erro ao atribuir colaborador: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Atribuir Colaborador</h2>
        </div>
        <p className="text-blue-100">Selecione um usuário e atribua uma disciplina</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">Sucesso!</p>
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Erro</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Selecione um Professor
            </div>
          </label>
          
          <div className="relative">
            {/* Dropdown trigger */}
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-left flex items-center justify-between hover:border-gray-400 transition-colors"
            >
              <span className={selectedUser ? 'text-gray-900' : 'text-gray-500'}>
                {selectedUser ? `${selectedUser.nome} (${selectedUser.email})` : 'Selecione um professor...'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showUserDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-500 rounded-lg shadow-lg z-50">
                {/* Search input */}
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                {/* User list */}
                <div className="max-h-64 overflow-y-auto">
                  {loadingUsers ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{user.nome}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.role === 'colaborador' && (
                          <p className="text-xs text-blue-600 mt-1">
                            Já é colaborador de: {user.disciplina_colaborador}
                          </p>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {loadingUsers && (
            <p className="text-xs text-gray-500 mt-2">Carregando usuários...</p>
          )}
        </div>

        {/* Discipline Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Selecione a Disciplina
            </div>
          </label>

          <div className="grid grid-cols-1 gap-3">
            {disciplinas.map((disciplina) => (
              <button
                key={disciplina.id}
                type="button"
                onClick={() => handleSelectDisciplina(disciplina.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedDisciplina === disciplina.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-blue-300'
                }`}
              >
                <p className={`font-medium ${
                  selectedDisciplina === disciplina.id ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {disciplina.nome}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !selectedUser || !selectedDisciplina}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Atribuindo...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Atribuir Colaborador
              </>
            )}
          </button>

          <button
            type="button"
            onClick={clearForm}
            disabled={loading}
            className="px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AtribuirColaborador;

