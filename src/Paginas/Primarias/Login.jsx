// pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import logotipo from "../../assets/logotipo.png";
import Cartaz from "../../assets/Cartaz.jpeg";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    usuario: "",
    senha: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    let newErrors = {};

    if (!form.usuario.trim()) newErrors.usuario = "Este campo é obrigatório";
    if (!form.senha.trim()) newErrors.senha = "Este campo é obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: form.usuario, senha: form.senha })
      });
      const body = await res.json();

      if (!res.ok) {
        setLoginError(body.error || 'Usuário ou senha inválidos');
      } else {
        const user = body.data;
        const token = body.token || null;
        login(user, token);
        navigate('/');
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setLoginError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full h-screen grid grid-cols-1 md:grid-cols-2 bg-white text-black"
    >
      {/* LEFT SECTION - IMAGE/CARTZ BACKGROUND */}
       <div className="hidden md:flex items-center justify-center bg-blue-600">
              <img
                src={Cartaz}
                alt="Comaes Cadastro Preview"
                className="w-4/5 h-auto rounded-2xl shadow-2xl"
              />
            </div>

      {/* RIGHT SECTION (FORM) */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
        >
          {/* Logo no formulário */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <img 
              src={logotipo} 
              alt="Comaes" 
              className="h-24 w-auto object-contain"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-gray-700 mb-6"
          >
            Entre na melhor plataforma de competições educativas online
          </motion.p>

          {/* Mensagem de erro geral */}
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
            >
              {loginError}
            </motion.div>
          )}

          {/* FORM */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* INPUT USUÁRIO */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <input
                type="text"
                name="usuario"
                placeholder="Nome, Telefone ou Email"
                value={form.usuario}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              {errors.usuario && (
                <p className="text-red-600 text-sm mt-1">{errors.usuario}</p>
              )}
            </motion.div>

            {/* INPUT SENHA */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <input
                type="password"
                name="senha"
                placeholder="Senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              {errors.senha && (
                <p className="text-red-600 text-sm mt-1">{errors.senha}</p>
              )}
            </motion.div>

            {/* BOTÃO ENTRAR */}
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 p-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </motion.button>
          </form>

          {/* LINHA DE CADASTRO */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-4 text-center text-sm"
          >
            ou{" "}
            <Link to="/Cadastro" className="text-blue-600 font-semibold hover:underline">
              Cadastrar-se
            </Link>
          </motion.p>

          {/* ESQUECI A SENHA */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-2 text-center text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
          >
            <Link to="/recuperar-senha">
              Esqueci a minha senha
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Login;