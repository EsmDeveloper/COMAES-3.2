import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import imgPreview from "../../assets/celebring.jpeg";
import logotipo from "../../assets/logotipo.png";

function AuthContainer({ initialMode = "login" }) {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  // Estados para controle da transição
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
  const [isCadastroLoading, setIsCadastroLoading] = useState(false);

  const escolas = [
    "Instituto Politécnico Industrial de Lunada - IPIL", 
    "Instituto Medio de Economia de Luanda - IMEL", 
    "Instituto Médio Comercial de Luanda - IMCL",
    "Instituto de Telecomunicações de Luanda - ITEL",
    "Instituto Médio Politécnico Nova Vida - IMP NV",
    "Instituto Médio Politécnico Alda Lara - IMPAL",
  ];

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Função de transição entre Login e Cadastro
  const handleSwitch = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsLogin(!isLogin);
      // Limpar erros ao trocar
      setLoginError("");
      setLoginErrors({});
      setCadastroErrors({});
      setTimeout(() => setIsAnimating(false), 400);
    }, 400);
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

    console.log('🔐 Tentando login com:', loginForm);

    if (!loginForm.usuario.trim()) newErrors.usuario = "Este campo é obrigatório";
    if (!loginForm.senha.trim()) newErrors.senha = "Este campo é obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setLoginErrors(newErrors);
      return;
    }

    setIsLoginLoading(true);

    try {
      console.log('📡 Enviando requisição para login...');
      const res = await fetch('http://localhost:3000/auth/login', {
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
      
      console.log('📥 Status da resposta:', res.status);
      
      const body = await res.json();
      console.log('📦 Resposta do servidor:', body);

      if (!res.ok) {
        setLoginError(body.error || 'Erro ao fazer login');
      } else {
        const user = body.data;
        const token = body.token;
        console.log('✅ Login bem-sucedido!', { user, token });
        login(user, token);
        navigate('/');
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      setLoginError("Erro de conexão com o servidor. Verifique se o backend está rodando.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  // ========== HANDLERS DO CADASTRO COM NOVAS VALIDAÇÕES ==========
  const handleCadastroChange = (e) => {
    const { name, value } = e.target;
    
    // Validação em tempo real para telefone (apenas números)
    if (name === 'telefone') {
      // Permite apenas dígitos
      const apenasNumeros = value.replace(/\D/g, '');
      // Limita a 9 dígitos
      const telefoneLimitado = apenasNumeros.slice(0, 9);
      setCadastroForm({ ...cadastroForm, [name]: telefoneLimitado });
    } else {
      setCadastroForm({ ...cadastroForm, [name]: value });
    }
    
    // Limpar erro do campo
    setCadastroErrors({ ...cadastroErrors, [name]: "" });
  };

  // Função para validar nome (mínimo 2 palavras)
  const validarNome = (nome) => {
    const nomeTrim = nome.trim();
    if (!nomeTrim) return "Este campo é obrigatório";
    
    const palavras = nomeTrim.split(/\s+/);
    if (palavras.length < 2) {
      return "Digite o nome completo (primeiro e último nome)";
    }
    
    // Verifica se cada palavra tem pelo menos 2 caracteres
    for (const palavra of palavras) {
      if (palavra.length < 2) {
        return "Cada nome deve ter pelo menos 2 caracteres";
      }
    }
    
    return "";
  };

  // Função para validar telefone angolano
  const validarTelefone = (telefone) => {
    if (!telefone) return "Este campo é obrigatório";
    
    // Verifica se tem exatamente 9 dígitos
    if (telefone.length !== 9) {
      return "O telefone deve ter 9 dígitos";
    }
    
    // Verifica se começa com 9
    if (!telefone.startsWith('9')) {
      return "O telefone deve começar com 9";
    }
    
    // Verifica se o segundo dígito é válido (9, 2, 3, 4, 5, 6, 7, 8)
    const segundoDigito = telefone[1];
    const digitosValidos = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (!digitosValidos.includes(segundoDigito)) {
      return "Número de telefone inválido";
    }
    
    return "";
  };

  const handleCadastroSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    console.log('📝 Tentando cadastro com:', cadastroForm);

    // Validações obrigatórias básicas
    const requiredFields = ['nome', 'telefone', 'email', 'nascimento', 'sexo', 'senha', 'confirmaSenha'];
    requiredFields.forEach(field => {
      if (!cadastroForm[field]) {
        newErrors[field] = "Este campo é obrigatório";
      }
    });

    // Validação específica do nome
    if (cadastroForm.nome) {
      const erroNome = validarNome(cadastroForm.nome);
      if (erroNome) newErrors.nome = erroNome;
    }

    // Validação específica do telefone
    if (cadastroForm.telefone) {
      const erroTelefone = validarTelefone(cadastroForm.telefone);
      if (erroTelefone) newErrors.telefone = erroTelefone;
    }

    // Validação de senhas
    if (cadastroForm.senha && cadastroForm.confirmaSenha && cadastroForm.senha !== cadastroForm.confirmaSenha) {
      newErrors.confirmaSenha = "As senhas não coincidem";
    }

    // Validação de senha (mínimo 6 caracteres)
    if (cadastroForm.senha && cadastroForm.senha.length < 6) {
      newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
    }

    // Validação de email
    if (cadastroForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cadastroForm.email)) {
      newErrors.email = "Digite um email válido";
    }

    // Validação de data de nascimento (não pode ser data futura)
    if (cadastroForm.nascimento) {
      const dataNasc = new Date(cadastroForm.nascimento);
      const hoje = new Date();
      if (dataNasc > hoje) {
        newErrors.nascimento = "Data de nascimento não pode ser no futuro";
      }
      
      // Verificar idade mínima (10 anos)
      const idade = hoje.getFullYear() - dataNasc.getFullYear();
      if (idade < 10) {
        newErrors.nascimento = "Você deve ter pelo menos 10 anos";
      }
    }

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

      console.log('📡 Enviando requisição para registro...', payload);

      const res = await fetch('http://localhost:3000/auth/registro', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Status da resposta:', res.status);
      const body = await res.json();
      console.log('📦 Resposta do servidor:', body);

      if (!res.ok) {
        setCadastroErrors({ geral: body.error || 'Erro ao cadastrar' });
        return;
      }

      // Login automático após cadastro
      console.log('✅ Cadastro bem-sucedido!', body.data);
      
      // Mostrar mensagem de sucesso
      setCadastroErrors({ geral: 'Cadastro realizado com sucesso! Redirecionando...' });
      
      // Fazer login automaticamente
      login(body.data, body.token);
      
      // Redirecionar após breve delay
      setTimeout(() => navigate('/'), 1500);
      
    } catch (error) {
      console.error("❌ Erro no cadastro:", error);
      setCadastroErrors({ geral: "Erro ao realizar cadastro. Verifique se o servidor está rodando." });
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
                      placeholder="Nome, Telefone ou Email"
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
                    <input
                      type="password"
                      name="senha"
                      placeholder="Senha"
                      value={loginForm.senha}
                      onChange={handleLoginChange}
                      className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      disabled={isLoginLoading}
                    />
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
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.nome ? 'border-red-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    />
                    {cadastroErrors.nome && (
                      <p className="text-red-600 text-sm mt-1">{cadastroErrors.nome}</p>
                    )}
                    {!cadastroErrors.nome && cadastroForm.nome && (
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
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.telefone ? 'border-red-500' : 
                        cadastroForm.telefone && cadastroForm.telefone.length === 9 ? 'border-green-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                      maxLength={9}
                    />
                    {cadastroErrors.telefone && (
                      <p className="text-red-600 text-sm mt-1">{cadastroErrors.telefone}</p>
                    )}
                    {!cadastroErrors.telefone && cadastroForm.telefone && cadastroForm.telefone.length === 9 && (
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
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.email ? 'border-red-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    />
                    {cadastroErrors.email && <p className="text-red-600 text-sm mt-1">{cadastroErrors.email}</p>}
                  </div>

                  <div>
                    <input
                      type="date"
                      name="nascimento"
                      value={cadastroForm.nascimento}
                      onChange={handleCadastroChange}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.nascimento ? 'border-red-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    />
                    {cadastroErrors.nascimento && <p className="text-red-600 text-sm mt-1">{cadastroErrors.nascimento}</p>}
                  </div>

                  <div>
                    <select
                      name="sexo"
                      value={cadastroForm.sexo}
                      onChange={handleCadastroChange}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.sexo ? 'border-red-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    >
                      <option value="">Selecione o seu Sexo</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                    {cadastroErrors.sexo && <p className="text-red-600 text-sm mt-1">{cadastroErrors.sexo}</p>}
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
                    <input
                      type="password"
                      name="senha"
                      placeholder="Palavra Passe (mínimo 6 caracteres)"
                      value={cadastroForm.senha}
                      onChange={handleCadastroChange}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.senha ? 'border-red-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    />
                    {cadastroErrors.senha && <p className="text-red-600 text-sm mt-1">{cadastroErrors.senha}</p>}
                  </div>

                  <div>
                    <input
                      type="password"
                      name="confirmaSenha"
                      placeholder="Confirmação da Palavra Passe"
                      value={cadastroForm.confirmaSenha}
                      onChange={handleCadastroChange}
                      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        cadastroErrors.confirmaSenha ? 'border-red-500' : ''
                      }`}
                      disabled={isCadastroLoading}
                    />
                    {cadastroErrors.confirmaSenha && (
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
                  <input
                    type="password"
                    name="senha"
                    placeholder="Senha"
                    value={loginForm.senha}
                    onChange={handleLoginChange}
                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoginLoading}
                  />
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
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      cadastroErrors.nome ? 'border-red-500' : ''
                    }`}
                  />
                  {cadastroErrors.nome && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.nome}</p>
                  )}
                </div>

                {/* Telefone mobile */}
                <div>
                  <input
                    type="tel"
                    name="telefone"
                    placeholder="Telefone (9 dígitos)"
                    value={cadastroForm.telefone}
                    onChange={handleCadastroChange}
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      cadastroErrors.telefone ? 'border-red-500' : 
                      cadastroForm.telefone && cadastroForm.telefone.length === 9 ? 'border-green-500' : ''
                    }`}
                    maxLength={9}
                  />
                  {cadastroErrors.telefone && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.telefone}</p>
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
                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {cadastroErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.email}</p>
                  )}
                </div>

                <div>
                  <input
                    type="date"
                    name="nascimento"
                    value={cadastroForm.nascimento}
                    onChange={handleCadastroChange}
                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {cadastroErrors.nascimento && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.nascimento}</p>
                  )}
                </div>

                <div>
                  <select
                    name="sexo"
                    value={cadastroForm.sexo}
                    onChange={handleCadastroChange}
                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione o seu Sexo</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                  {cadastroErrors.sexo && (
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
                  <input
                    type="password"
                    name="senha"
                    placeholder="Palavra Passe"
                    value={cadastroForm.senha}
                    onChange={handleCadastroChange}
                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {cadastroErrors.senha && (
                    <p className="text-red-600 text-sm mt-1">{cadastroErrors.senha}</p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    name="confirmaSenha"
                    placeholder="Confirmação da Palavra Passe"
                    value={cadastroForm.confirmaSenha}
                    onChange={handleCadastroChange}
                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {cadastroErrors.confirmaSenha && (
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

export default AuthContainer;