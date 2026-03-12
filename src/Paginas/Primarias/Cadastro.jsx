import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { useAuth } from "../../context/AuthContext";
import logotipo from "../../assets/logotipo.png";
import Cartaz from "../../assets/Cartaz.jpeg";

function Cadastro() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    nascimento: "",
    sexo: "",
    escola: "",
    senha: "",
    confirmaSenha: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const escolas = [
    "Instituto Politécnico Industrial de Lunada - IPIL", 
    "Instituto Medio de Economia de Luanda - IMEL", 
    "Instituto Médio Comercial de Luanda - IMCL",
    "Instituto de Telecomunicações de Luanda - ITEL",
    "Instituto Médio Politécnico Nova Vida - IMP NV",
    "Instituto Médio Politécnico Alda Lara - IMPAL",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // Validação dos campos obrigatórios
    const requiredFields = ['nome', 'telefone', 'email', 'nascimento', 'sexo', 'escola', 'senha', 'confirmaSenha'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "Este campo é obrigatório";
      }
    });

    if (form.senha && form.confirmaSenha && form.senha !== form.confirmaSenha) {
      newErrors.confirmaSenha = "As senhas não coincidem";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Digite um email válido";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Chamar API de cadastro
      const payload = {
        nome: form.nome,
        telefone: form.telefone,
        email: form.email,
        nascimento: form.nascimento,
        sexo: form.sexo,
        escola: form.escola,
        password: form.senha
      };

      const res = await fetch('http://localhost:3000/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const body = await res.json();
      if (!res.ok) {
        setErrors({ geral: body.error || 'Erro ao cadastrar' });
        return;
      }

      const created = body.data;
      // Após criar, fazer login automático para obter token e dados normalizados
      const loginRes = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: created.email, senha: form.senha })
      });
      const loginBody = await loginRes.json();
      if (!loginRes.ok) {
        setErrors({ geral: 'Cadastro OK, mas falha ao autenticar automaticamente.' });
        setTimeout(() => navigate('/login'), 1200);
        return;
      }

      // Salva usuário e token no contexto
      login(loginBody.data, loginBody.token);
      setErrors({ geral: 'Cadastro realizado com sucesso!' });
      setTimeout(() => navigate('/'), 900);
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      setErrors({ geral: "Erro ao realizar cadastro. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 bg-white text-black">
      <div className="hidden md:flex items-center justify-center bg-blue-600">
        <img
          src={Cartaz}
          alt="Comaes Cadastro Preview"
          className="w-4/5 h-auto rounded-2xl shadow-2xl"
        />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
         {/* Logo no formulário */}
          <div className="flex justify-center mb-4">
            <img 
              src={logotipo}
              alt="Comaes" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <p className="text-center text-gray-700 mb-6">
            Cadastre-se na melhor plataforma de competições educativas online
          </p>

          {/* Mensagem de erro geral */}
          {errors.geral && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.geral}
            </motion.div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="nome"
                placeholder="Nome Completo"
                value={form.nome}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              {errors.nome && <p className="text-red-600 text-sm mt-1">{errors.nome}</p>}
            </div>

            <div>
              <input
                type="text"
                name="telefone"
                placeholder="Telefone"
                value={form.telefone}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              {errors.telefone && <p className="text-red-600 text-sm mt-1">{errors.telefone}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <input
                type="date"
                name="nascimento"
                value={form.nascimento}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              {errors.nascimento && <p className="text-red-600 text-sm mt-1">{errors.nascimento}</p>}
            </div>

            <div>
              <select
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              >
                <option value="">Selecione o seu Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
              {errors.sexo && <p className="text-red-600 text-sm mt-1">{errors.sexo}</p>}
            </div>

            <div>
              <select
                name="escola"
                value={form.escola}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              >
                <option value="">Onde Estudas? Selecione a Escola</option>
                {escolas.map((e, i) => (
                  <option key={i} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              {errors.escola && <p className="text-red-600 text-sm mt-1">{errors.escola}</p>}
            </div>

            <div>
              <input
                type="password"
                name="senha"
                placeholder="Palavra Passe"
                value={form.senha}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              {errors.senha && <p className="text-red-600 text-sm mt-1">{errors.senha}</p>}
            </div>

            <div>
              <input
                type="password"
                name="confirmaSenha"
                placeholder="Confirmação da Palavra Passe"
                value={form.confirmaSenha}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              {errors.confirmaSenha && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmaSenha}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 p-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;