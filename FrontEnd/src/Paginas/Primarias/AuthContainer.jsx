import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, getPostLoginRoute } from "../../context/AuthContext";
import imgPreview from "../../assets/celebring.jpeg";
import logotipo from "../../assets/logotipo.png";
import { validateNome, validateEmail, validatePassword } from "../../utils/validators";
import CollaboratorRegisterForm from "./CollaboratorRegisterForm";
import ApprovalPending from "./ApprovalPending";

// mode: "login" | "cadastro" | "colaborador" | "aprovacao-pendente"
function AuthContainer({ initialMode = "login" }) {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Modo actual (pode ser alterado dinamicamente)
  const [mode, setMode] = useState(initialMode);
  // Dados do colaborador após registo bem-sucedido (para exibir na tela de aprovação)
  const [pendingEmail, setPendingEmail] = useState('');

  // isLogin mantido para compatibilidade com a animação desktop existente
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Estados do Login
  const [loginForm, setLoginForm] = useState({
    usuario: "",
    senha: ""
  });
  const [loginErrors, setLoginErrors] = useState({});
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Estados do Cadastro
  const [cadastroForm, setCadastroForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    nascimento: "",
    sexo: "",
    escola: "",
    senha: "",
    confirmaSenha: ""
  });
  const [cadastroErrors, setCadastroErrors] = useState({});
  const [cadastroTouched, setCadastroTouched] = useState({});
  const [isCadastroLoading, setIsCadastroLoading] = useState(false);

  // Estados de visibilidade das senhas
  const [showLoginSenha, setShowLoginSenha]           = useState(false);
  const [showCadastroSenha, setShowCadastroSenha]     = useState(false);
  const [showConfirmaSenha, setShowConfirmaSenha]     = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.includes(':3001')
    ? `http://${window.location.hostname}:3000`
    : (import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`);

  const escolas = [
    "Instituto Politécnico Industrial de Lunada - IPIL", 
    "Instituto Medio de Economia de Luanda - IMEL", 
    "Instituto Médio Comercial de Luanda - IMCL",
    "Instituto de Telecomunicações de Luanda - ITEL",
    "Instituto Médio Politécnico Nova Vida - IMP NV",
    "Instituto Médio Politécnico Alda Lara - IMPAL",
  ];

  // Redireciona se já estiver logado — para o destino correto do seu papel
  useEffect(() => {
    if (user) {
      navigate(getPostLoginRoute(user), { replace: true });
    }
  }, [user, navigate]);

  // Função de transição entre Login e Cadastro
  const handleSwitch = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      const next = !isLogin;
      setIsLogin(next);
      setMode(next ? 'cadastro' : 'login');
      // Limpar erros ao trocar
      setLoginError("");
      setLoginErrors({});
      setCadastroErrors({});
      setCadastroTouched({});
      setTimeout(() => setIsAnimating(false), 400);
    }, 400);
  };

  // Mudar para formulário de colaborador
  const handleSwitchToColaborador = () => {
    setMode('colaborador');
  };

  // Callback após registo de colaborador bem-sucedido
  const handleColaboradorSuccess = (json) => {
    setPendingEmail(json.data?.email || '');
    setMode('aprovacao-pendente');
  };

  // ========== HANDLERS DO LOGIN ==========
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setLoginErrors({ ...loginErrors, [e.target.name]: "" });
    setLoginError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    let newErrors = {};

    if (!loginForm.usuario.trim()) newErrors.usuario = "Este campo é obrigatório";
    if (!loginForm.senha.trim()) newErrors.senha = "Este campo é obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setLoginErrors(newErrors);
      return;
    }

    setIsLoginLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          usuario: loginForm.usuario,
          senha: loginForm.senha
        })
      });

      const body = await res.json();

      if (!res.ok) {
        setLoginError(body.error || 'Erro ao fazer login');
      } else {
        // Limpar qualquer sessão anterior antes de guardar a nova
        localStorage.removeItem('comaes_user');
        localStorage.removeItem('comaes_token');
        login(body.data, body.token);
        // Redirecionar para o destino correto com base no papel do utilizador
        navigate(getPostLoginRoute(body.data), { replace: true });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginError('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleCadastroChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'telefone') {
      nextValue = value.replace(/\D/g, '').slice(0, 9);
    }

    const nextForm = { ...cadastroForm, [name]: nextValue };
    setCadastroForm(nextForm);

    const nextErrors = { ...cadastroErrors, geral: '' };
    nextErrors[name] = cadastroTouched[name]
      ? getCadastroFieldError(name, nextValue, nextForm)
      : '';

    if (name === 'senha' && cadastroTouched.confirmaSenha) {
      nextErrors.confirmaSenha = getCadastroFieldError('confirmaSenha', nextForm.confirmaSenha, nextForm);
    }

    setCadastroErrors(nextErrors);
  };

  const validarTelefone = (telefone) => {
    if (!telefone) return 'Este campo é obrigatório';
    if (telefone.length !== 9) return 'O telefone deve ter 9 dígitos';
    if (!telefone.startsWith('9')) return 'O telefone deve começar com 9';

    const segundoDigito = telefone[1];
    const digitosValidos = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (!digitosValidos.includes(segundoDigito)) {
      return 'Número de telefone inválido';
    }

    return '';
  };

  const validarNascimento = (nascimento) => {
    if (!nascimento) return 'Este campo é obrigatório';

    const dataNasc = new Date(nascimento);
    const hoje = new Date();

    if (Number.isNaN(dataNasc.getTime())) return 'Data de nascimento inválida';
    if (dataNasc > hoje) return 'Data de nascimento não pode ser no futuro';

    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNascimento = dataNasc.getMonth();
    const diaNascimento = dataNasc.getDate();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
      idade -= 1;
    }

    if (idade < 14) return 'Você deve ter pelo menos 15 anos';
    return '';
  };

  const getCadastroFieldError = (field, value, formState = cadastroForm) => {
    switch (field) {
      case 'nome': {
        const result = validateNome(value);
        return result.valid ? '' : result.error;
      }
      case 'telefone':
        return validarTelefone(value);
      case 'email': {
        const result = validateEmail(value);
        return result.valid ? '' : result.error;
      }
      case 'nascimento':
        return validarNascimento(value);
      case 'sexo':
        return value ? '' : 'Este campo é obrigatório';
      case 'escola':
        return value ? '' : 'Este campo é obrigatório';
      case 'senha': {
        const result = validatePassword(value);
        return result.valid ? '' : result.error;
      }
      case 'confirmaSenha':
        if (!value) return 'Este campo é obrigatório';
        if (value !== formState.senha) return 'As senhas não coincidem';
        return '';
      default:
        return '';
    }
  };

  const handleCadastroBlur = (e) => {
    const { name } = e.target;
    const error = getCadastroFieldError(name, cadastroForm[name]);

    setCadastroTouched((prev) => ({ ...prev, [name]: true }));
    setCadastroErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isCadastroFieldValid = (field) => {
    const value = cadastroForm[field];
    return Boolean(cadastroTouched[field] && value && !getCadastroFieldError(field, value));
  };

  const validateCadastroForm = () => {
    const fieldsToValidate = ['nome', 'telefone', 'email', 'nascimento', 'sexo', 'senha', 'confirmaSenha'];
    const newErrors = {};

    fieldsToValidate.forEach((field) => {
      const error = getCadastroFieldError(field, cadastroForm[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    return newErrors;
  };

  const handleCadastroSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateCadastroForm();

    setCadastroTouched({
      nome: true,
      telefone: true,
      email: true,
      nascimento: true,
      sexo: true,
      senha: true,
      confirmaSenha: true
    });

    if (Object.keys(newErrors).length > 0) {
      setCadastroErrors(newErrors);
      return;
    }

    setIsCadastroLoading(true);

    try {
      const payload = {
        nome: cadastroForm.nome,
        telefone: cadastroForm.telefone,
        email: cadastroForm.email,
        nascimento: cadastroForm.nascimento,
        sexo: cadastroForm.sexo,
        escola: cadastroForm.escola,
        password: cadastroForm.senha
      };

      const res = await fetch(`${API_BASE_URL}/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const body = await res.json();

      if (!res.ok) {
        setCadastroErrors({
          ...body.fieldErrors,
          geral: body.error || 'Erro ao cadastrar'
        });

        if (body.fieldErrors) {
          setCadastroTouched((prev) => ({
            ...prev,
            ...Object.keys(body.fieldErrors).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {})
          }));
        }

        return;
      }

      setCadastroErrors({ geral: 'Cadastro realizado com sucesso! Redirecionando...' });
      login(body.data, body.token);
      // Registo público cria sempre estudantes — mas usar getPostLoginRoute por segurança
      setTimeout(() => navigate(getPostLoginRoute(body.data), { replace: true }), 1500);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setCadastroErrors({ geral: 'Erro ao realizar cadastro. Verifique se o servidor está rodando.' });
    } finally {
      setIsCadastroLoading(false);
    }
  };

  // Formatar telefone para exibição (opcional)
  const formatarTelefoneParaExibicao = (telefone) => {
    if (!telefone) return "";
    if (telefone.length === 9) {
      return `${telefone.slice(0, 3)} ${telefone.slice(3, 6)} ${telefone.slice(6)}`;
    }
    return telefone;
  };

  // ── Modos especiais (colaborador e aprovação pendente) ──────────
  if (mode === 'aprovacao-pendente') {
    return (
      <ApprovalPending
        email={pendingEmail}
        onBackToLogin={() => { setMode('login'); setIsLogin(true); }}
      />
    );
  }

  if (mode === 'colaborador') {
    return (
      <div className="w-full min-h-screen bg-white text-black overflow-x-hidden">
        {/* DESKTOP */}
        <div className="hidden md:block relative w-full min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex w-full max-w-5xl mx-auto shadow-2xl rounded-2xl overflow-hidden min-h-[600px]">
            {/* Painel lateral */}
            <div className="w-2/5 bg-blue-600 flex flex-col items-center justify-center p-10 text-white">
              <img src={imgPreview} alt="COMAES" className="w-full max-w-xs rounded-xl shadow-xl mb-6" />
              <h2 className="text-2xl font-bold mb-2">Torne-se Colaborador</h2>
              <p className="text-white/90 text-sm text-center leading-relaxed">
                Partilhe o seu conhecimento com estudantes da COMAES. Crie questões, contribua para torneios e faça parte da nossa comunidade educativa.
              </p>
            </div>
            {/* Formulário */}
            <div className="flex-1 bg-white flex flex-col justify-center p-8 overflow-y-auto max-h-screen">
              <div className="flex justify-center mb-5">
                <img src={logotipo} alt="COMAES" className="h-16 w-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Candidatura a Colaborador</h3>
              <p className="text-sm text-gray-500 mb-5">
                Preencha os dados abaixo. A sua candidatura será analisada pelo administrador.
              </p>
              <CollaboratorRegisterForm
                onSuccess={handleColaboradorSuccess}
                onSwitchToLogin={() => { setMode('login'); setIsLogin(true); }}
              />
              <p className="mt-4 text-center text-sm text-gray-500">
                Quer registar-se como estudante?{' '}
                <button type="button" onClick={() => { setMode('cadastro'); setIsLogin(false); }}
                  className="text-blue-600 font-semibold hover:underline">
                  Criar conta de estudante
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="md:hidden min-h-screen bg-white">
          <div className="bg-blue-600 p-5 text-white text-center">
            <img src={logotipo} alt="COMAES" className="h-10 w-auto mx-auto mb-1" />
            <p className="text-white/90 text-sm">Candidatura a Colaborador</p>
          </div>
          <div className="px-4 py-6">
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Criar conta de colaborador</h3>
              <p className="text-sm text-gray-500 mb-4">A sua candidatura será analisada pelo administrador.</p>
              <CollaboratorRegisterForm
                onSuccess={handleColaboradorSuccess}
                onSwitchToLogin={() => { setMode('login'); setIsLogin(true); }}
              />
              <p className="mt-4 text-center text-sm text-gray-500">
                Estudante?{' '}
                <button type="button" onClick={() => { setMode('cadastro'); setIsLogin(false); }}
                  className="text-blue-600 font-semibold hover:underline">
                  Criar conta de estudante
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-black overflow-x-hidden">
      {/* DESKTOP VERSION */}
      <div className="hidden md:block relative w-full h-screen overflow-hidden">
        <div className="relative w-full h-full">
          {/* PAINEL DA IMAGEM (ESQUERDA/DIREITA) */}
          <div className={`
            absolute top-0 w-1/2 h-full bg-blue-600 flex items-center justify-center
            transition-all duration-700 ease-in-out z-10
            ${isLogin ? 'left-0' : 'left-1/2'}
          `}>
            <div className="w-4/5 max-w-lg">
              <img
                src={imgPreview}
                alt="Comaes Platform Preview"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="mt-6 text-center text-white px-4">
                <h2 className="text-2xl font-bold mb-2">
                  {isLogin ? "Bem-vindo de volta!" : "Junte-se à comunidade!"}
                </h2>
                <p className="text-white/90">
                  {isLogin 
                    ? "Faça login para continuar sua jornada nas competições educativas"
                    : "Crie sua conta e participe das melhores competições online"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* PAINEL DOS FORMULÁRIOS (DIREITA/ESQUERDA) */}
          <div className={`
            absolute top-0 w-1/2 h-full flex items-center justify-center
            transition-all duration-700 ease-in-out
            ${isLogin ? 'right-0' : 'left-0'}
          `}>
            {/* FORMULÁRIO DE LOGIN */}
            <div className={`
              absolute w-full max-w-md px-8
              transition-all duration-700 ease-in-out
              ${isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}
              ${!isLogin ? 'pointer-events-none' : ''}
            `}>
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                <div className="flex justify-center mb-4">
                  <img 
                    src={logotipo}
                    alt="Comaes Logo"
                    className="h-24 w-auto"
                  />
                </div>
                <p className="text-center text-gray-700 mb-6">
                  Entre na melhor plataforma de competições educativas online
                </p>

                {loginError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {loginError}
                  </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
                  <div>
                    <input
                      type="text"
                      name="usuario"
                      placeholder="Email do Usuário"
                      value={loginForm.usuario}
                      onChange={handleLoginChange}
                      className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      disabled={isLoginLoading}
                    />
                    {loginErrors.usuario && (
                      <p className="text-red-600 text-sm mt-1">{loginErrors.usuario}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showLoginSenha ? "text" : "password"}
                        name="senha"
                        placeholder="Senha"
                        value={loginForm.senha}
                        onChange={handleLoginChange}
                        className="w-full p-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        disabled={isLoginLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginSenha(v => !v)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showLoginSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {loginErrors.senha && (
                      <p className="text-red-600 text-sm mt-1">{loginErrors.senha}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoginLoading || isAnimating}
                    className="w-full mt-2 p-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoginLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Entrando...
                      </div>
                    ) : (
                      "Entrar"
                    )}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm">
                  ou{" "}
                  <button
                    type="button"
                    onClick={handleSwitch}
                    disabled={isAnimating}
                    className="text-blue-600 font-semibold hover:underline focus:outline-none disabled:opacity-50"
                  >
                    Cadastrar-se
                  </button>
                </p>

                <p className="mt-2 text-center text-sm text-gray-600 hover:text-blue-600">
                  <a href="/recuperar-senha" className="hover:underline">
                    Esqueci a minha senha
                  </a>
                </p>
              </div>
            </div>

            {/* FORMULÁRIO DE CADASTRO COM NOVAS VALIDAÇÕES */}
            <div className={`
              absolute w-full max-w-md px-8
              transition-all duration-700 ease-in-out
              ${!isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}
              ${isLogin ? 'pointer-events-none' : ''}
            `}>
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-center mb-4">
                  <img 
                    src={logotipo}
                    alt="Comaes Logo"
                    className="h-24 w-auto"
                  />
                </div>
                <p className="text-center text-gray-700 mb-6">
                  Cadastre-se na melhor plataforma de competições educativas online
                </p>

                {cadastroErrors.geral && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    cadastroErrors.geral.includes('sucesso') 
                      ? 'bg-green-50 border border-green-200 text-green-700' 
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {cadastroErrors.geral}
                  </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleCadastroSubmit}>
                  {/* Campo Nome com validação */}
                  <div>
                    <input
                      type="text"
                      name="nome"
                      placeholder="Nome Completo (ex: Cornelio Mbongo)"
                      value={cadastroForm.nome}
                      onChange={handleCadastroChange}
                      onBlur={handleCadastroBlur}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.nome && cadastroTouched.nome ? 'border-red-500' :
                        isCadastroFieldValid('nome') ? 'border-green-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    />
                    {cadastroErrors.nome && cadastroTouched.nome && (
                      <p className="text-red-600 text-sm mt-1">{cadastroErrors.nome}</p>
                    )}
                    {isCadastroFieldValid('nome') && (
                      <p className="text-green-600 text-sm mt-1">✓ Nome válido</p>
                    )}
                  </div>

                  {/* Campo Telefone com validação em tempo real */}
                  <div>
                    <input
                      type="tel"
                      name="telefone"
                      placeholder="Telefone (9 dígitos - ex: 923456789)"
                      value={cadastroForm.telefone}
                      onChange={handleCadastroChange}
                      onBlur={handleCadastroBlur}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.telefone && cadastroTouched.telefone ? 'border-red-500' : 
                        isCadastroFieldValid('telefone') ? 'border-green-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                      maxLength={9}
                    />
                    {cadastroErrors.telefone && cadastroTouched.telefone && (
                      <p className="text-red-600 text-sm mt-1">{cadastroErrors.telefone}</p>
                    )}
                    {isCadastroFieldValid('telefone') && (
                      <p className="text-green-600 text-sm mt-1">
                        ✓ Número válido: {formatarTelefoneParaExibicao(cadastroForm.telefone)}
                      </p>
                    )}
                    {cadastroForm.telefone && cadastroForm.telefone.length < 9 && (
                      <p className="text-gray-500 text-sm mt-1">
                        Faltam {9 - cadastroForm.telefone.length} dígitos
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={cadastroForm.email}
                      onChange={handleCadastroChange}
                      onBlur={handleCadastroBlur}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.email && cadastroTouched.email ? 'border-red-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    />
                    {cadastroErrors.email && cadastroTouched.email && <p className="text-red-600 text-sm mt-1">{cadastroErrors.email}</p>}
                    {isCadastroFieldValid('email') && <p className="text-green-600 text-sm mt-1">✓ Email válido</p>}
                  </div>

                  <div>
                    <input
                      type="date"
                      name="nascimento"
                      value={cadastroForm.nascimento}
                      onChange={handleCadastroChange}
                      onBlur={handleCadastroBlur}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.nascimento && cadastroTouched.nascimento ? 'border-red-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    />
                    {cadastroErrors.nascimento && cadastroTouched.nascimento && <p className="text-red-600 text-sm mt-1">{cadastroErrors.nascimento}</p>}
                  </div>

                  <div>
                    <select
                      name="sexo"
                      value={cadastroForm.sexo}
                      onChange={handleCadastroChange}
                      onBlur={handleCadastroBlur}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.sexo && cadastroTouched.sexo ? 'border-red-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    >
                      <option value="">Selecione o seu Sexo</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                    {cadastroErrors.sexo && cadastroTouched.sexo && <p className="text-red-600 text-sm mt-1">{cadastroErrors.sexo}</p>}
                  </div>

                  <div>
                    <select
                      name="escola"
                      value={cadastroForm.escola}
                      onChange={handleCadastroChange}
                      className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      disabled={isCadastroLoading}
                    >
                      <option value="">Onde Estudas? Selecione a Escola</option>
                      {escolas.map((e, i) => (
                        <option key={i} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                    {cadastroErrors.escola && <p className="text-red-600 text-sm mt-1">{cadastroErrors.escola}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showCadastroSenha ? "text" : "password"}
                        name="senha"
                        placeholder="Palavra Passe (ex: Senha@123)"
                        value={cadastroForm.senha}
                        onChange={handleCadastroChange}
                        onBlur={handleCadastroBlur}
                        className={`w-full p-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          cadastroErrors.senha && cadastroTouched.senha ? 'border-red-500' : ''
                        }`}
                        disabled={isCadastroLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCadastroSenha(v => !v)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showCadastroSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {cadastroErrors.senha && cadastroTouched.senha && <p className="text-red-600 text-sm mt-1">{cadastroErrors.senha}</p>}
                    {isCadastroFieldValid('senha') && <p className="text-green-600 text-sm mt-1">✓ Senha forte</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showConfirmaSenha ? "text" : "password"}
                        name="confirmaSenha"
                        placeholder="Confirmação da Palavra Passe"
                        value={cadastroForm.confirmaSenha}
                        onChange={handleCadastroChange}
                        onBlur={handleCadastroBlur}
                        className={`w-full p-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          cadastroErrors.confirmaSenha && cadastroTouched.confirmaSenha ? 'border-red-500' : ''
                        }`}
                        disabled={isCadastroLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmaSenha(v => !v)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {cadastroErrors.confirmaSenha && cadastroTouched.confirmaSenha && (
                      <p className="text-red-600 text-sm mt-1">{cadastroErrors.confirmaSenha}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isCadastroLoading || isAnimating}
                    className="w-full mt-2 p-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCadastroLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Cadastrando...
                      </div>
                    ) : (
                      "Cadastrar-se"
                    )}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={handleSwitch}
                    disabled={isAnimating}
                    className="text-blue-600 font-semibold hover:underline focus:outline-none disabled:opacity-50"
                  >
                    Entrar
                  </button>
                </p>
                <p className="mt-2 text-center text-xs text-gray-500">
                  É professor ou profissional?{" "}
                  <button
                    type="button"
                    onClick={handleSwitchToColaborador}
                    className="text-blue-600 font-semibold hover:underline focus:outline-none"
                  >
                    Candidatar-se como colaborador
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className="md:hidden min-h-screen bg-white">
        {/* HEADER MOBILE */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="flex justify-center mb-2">
            <img 
              src={logotipo}
              alt="Comaes Logo"
              className="h-10 w-auto"
            />
          </div>
          <p className="text-white/90">
            {isLogin 
              ? "Entre na melhor plataforma de competições educativas"
              : "Cadastre-se e participe das competições"
            }
          </p>
        </div>

        {/* IMAGEM MOBILE */}
        <div className="px-4 py-6">
          <img
            src={imgPreview}
            alt="Comaes Platform Preview"
            className="w-full max-w-md mx-auto rounded-xl shadow-lg"
          />
        </div>

        {/* FORMULÁRIOS MOBILE */}
        <div className="px-4 pb-8">
          {/* TOGGLE BUTTONS */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 rounded-full p-1 flex">
              <button
                onClick={() => !isAnimating && setIsLogin(true)}
                className={`px-6 py-2 rounded-full transition-all ${isLogin ? 'bg-blue-600 text-white shadow' : 'text-blue-600'}`}
                disabled={isAnimating}
              >
                Entrar
              </button>
              <button
                onClick={() => !isAnimating && setIsLogin(false)}
                className={`px-6 py-2 rounded-full transition-all ${!isLogin ? 'bg-blue-600 text-white shadow' : 'text-blue-600'}`}
                disabled={isAnimating}
              >
                Cadastrar
              </button>
            </div>
          </div>

          {/* LOGIN MOBILE */}
          <div className={`
            transition-all duration-500 ease-in-out
            ${isLogin ? 'block opacity-100' : 'hidden opacity-0'}
          `}>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-auto">
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
                <div>
                  <input
                    type="text"
                    name="usuario"
                    placeholder="Nome, Telefone ou Email"
                    value={loginForm.usuario}
                    onChange={handleLoginChange}
                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoginLoading}
                  />
                  {loginErrors.usuario && (
                    <p className="text-red-600 text-sm mt-1">{loginErrors.usuario}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showLoginSenha ? "text" : "password"}
                      name="senha"
                      placeholder="Senha"
                      value={loginForm.senha}
                      onChange={handleLoginChange}
                      className="w-full p-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoginLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginSenha(v => !v)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showLoginSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {loginErrors.senha && (
                    <p className="text-red-600 text-sm mt-1">{loginErrors.senha}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full p-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  {isLoginLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Entrando...
                    </div>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center space-y-2">
                <p className="text-sm">
                  <button
                    onClick={handleSwitch}
                    className="text-blue-600 font-semibold"
                  >
                    Cadastrar-se
                  </button>
                </p>
                <p className="text-sm text-gray-600">
                  <a href="/recuperar-senha" className="hover:text-blue-600">
                    Esqueci a minha senha
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* CADASTRO MOBILE COM VALIDAÇÕES */}
          <div className={`
            transition-all duration-500 ease-in-out
            ${!isLogin ? 'block opacity-100' : 'hidden opacity-0'}
          `}>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-auto">
              {cadastroErrors.geral && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  cadastroErrors.geral.includes('sucesso') 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {cadastroErrors.geral}
                </div>
              )}

              <form className="flex flex-col gap-3" onSubmit={handleCadastroSubmit}>
                {/* Nome mobile */}
                <div>
                  <input
                    type="text"
                    name="nome"
                    placeholder="Nome Completo"
                    value={cadastroForm.nome}
                    onChange={handleCadastroChange}
                    onBlur={handleCadastroBlur}
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      cadastroErrors.nome && cadastroTouched.nome ? 'border-red-500' : ''
                    }`}
                  />
                  {cadastroErrors.nome && cadastroTouched.nome && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.nome}</p>
                  )}
                  {isCadastroFieldValid('nome') && <p className="text-green-600 text-sm mt-1">✓ Nome válido</p>}
                </div>

                {/* Telefone mobile */}
                <div>
                  <input
                    type="tel"
                    name="telefone"
                    placeholder="Telefone (9 dígitos)"
                    value={cadastroForm.telefone}
                    onChange={handleCadastroChange}
                    onBlur={handleCadastroBlur}
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      cadastroErrors.telefone && cadastroTouched.telefone ? 'border-red-500' : ''
                    }`}
                    maxLength={9}
                  />
                  {cadastroErrors.telefone && cadastroTouched.telefone && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.telefone}</p>
                  )}
                  {isCadastroFieldValid('telefone') && <p className="text-green-600 text-sm mt-1">✓ Número válido: {formatarTelefoneParaExibicao(cadastroForm.telefone)}</p>}
                  {cadastroForm.telefone && cadastroForm.telefone.length < 9 && (
                    <p className="text-gray-500 text-sm mt-1">
                      Faltam {9 - cadastroForm.telefone.length} dígitos
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={cadastroForm.email}
                    onChange={handleCadastroChange}
                    onBlur={handleCadastroBlur}
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      cadastroErrors.email && cadastroTouched.email ? 'border-red-500' : ''
                    }`}
                  />
                  {cadastroErrors.email && cadastroTouched.email && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.email}</p>
                  )}
                  {isCadastroFieldValid('email') && <p className="text-green-600 text-sm mt-1">✓ Email válido</p>}
                </div>

                <div>
                  <input
                    type="date"
                    name="nascimento"
                    value={cadastroForm.nascimento}
                    onChange={handleCadastroChange}
                    onBlur={handleCadastroBlur}
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      cadastroErrors.nascimento && cadastroTouched.nascimento ? 'border-red-500' : ''
                    }`}
                  />
                  {cadastroErrors.nascimento && cadastroTouched.nascimento && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.nascimento}</p>
                  )}
                </div>

                <div>
                  <select
                    name="sexo"
                    value={cadastroForm.sexo}
                    onChange={handleCadastroChange}
                    onBlur={handleCadastroBlur}
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      cadastroErrors.sexo && cadastroTouched.sexo ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Selecione o seu Sexo</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                  {cadastroErrors.sexo && cadastroTouched.sexo && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.sexo}</p>
                  )}
                </div>

                <div>
                  <select
                    name="escola"
                    value={cadastroForm.escola}
                    onChange={handleCadastroChange}
                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Onde Estudas?</option>
                    {escolas.map((e, i) => (
                      <option key={i} value={e}>{e}</option>
                    ))}
                  </select>
                  {cadastroErrors.escola && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.escola}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showCadastroSenha ? "text" : "password"}
                      name="senha"
                      placeholder="Palavra Passe"
                      value={cadastroForm.senha}
                      onChange={handleCadastroChange}
                      onBlur={handleCadastroBlur}
                      className={`w-full p-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        cadastroErrors.senha && cadastroTouched.senha ? 'border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCadastroSenha(v => !v)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showCadastroSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {cadastroErrors.senha && cadastroTouched.senha && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.senha}</p>
                  )}
                  {isCadastroFieldValid('senha') && <p className="text-green-600 text-sm mt-1">✓ Senha forte</p>}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showConfirmaSenha ? "text" : "password"}
                      name="confirmaSenha"
                      placeholder="Confirmação da Palavra Passe"
                      value={cadastroForm.confirmaSenha}
                      onChange={handleCadastroChange}
                      onBlur={handleCadastroBlur}
                      className={`w-full p-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        cadastroErrors.confirmaSenha && cadastroTouched.confirmaSenha ? 'border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmaSenha(v => !v)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {cadastroErrors.confirmaSenha && cadastroTouched.confirmaSenha && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.confirmaSenha}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isCadastroLoading}
                  className="w-full p-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition mt-2"
                >
                  {isCadastroLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Cadastrando...
                    </div>
                  ) : (
                    "Cadastrar-se"
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-sm">
                Já tem uma conta?{" "}
                <button
                  onClick={handleSwitch}
                  className="text-blue-600 font-semibold"
                >
                  Entrar
                </button>
              </p>
              <p className="mt-2 text-center text-xs text-gray-500">
                É professor ou profissional?{" "}
                <button
                  type="button"
                  onClick={handleSwitchToColaborador}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Candidatar-se como colaborador
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY DE LOADING DA ANIMAÇÃO */}
      {isAnimating && (
        <div className="fixed inset-0 bg-black/5 pointer-events-none z-50"></div>
      )}
    </div>
  );
}

AuthContainer.propTypes = {
  initialMode: PropTypes.oneOf(["login", "cadastro", "colaborador"]),
};

export default AuthContainer;






