import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { useAuth } from "../../context/AuthContext";
import logotipo from "../../assets/logotipo.png";
import Cartaz from "../../assets/Cartaz.jpeg";
import {
  validateNome, validateEmail, validatePassword,
  validatePasswordConfirm, validatePhone, validateBirthDate,
  runValidations,
} from "../../utils/validators";

function Cadastro() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    nome: "", telefone: "", email: "",
    nascimento: "", sexo: "", escola: "",
    senha: "", confirmaSenha: "",
  });
  const [errors, setErrors]       = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const escolas = [
    "Instituto Politécnico Industrial de Lunada - IPIL",
    "Instituto Medio de Economia de Luanda - IMEL",
    "Instituto Médio Comercial de Luanda - IMCL",
    "Instituto de Telecomunicações de Luanda - ITEL",
    "Instituto Médio Politécnico Nova Vida - IMP NV",
    "Instituto Médio Politécnico Alda Lara - IMPAL",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const { valid, errors: errs } = runValidations({
      nome:          () => validateNome(form.nome),
      telefone:      () => validatePhone(form.telefone),
      email:         () => validateEmail(form.email),
      nascimento:    () => validateBirthDate(form.nascimento),
      sexo:          () => form.sexo   ? { valid: true, error: null } : { valid: false, error: 'Selecione o sexo.' },
      escola:        () => form.escola ? { valid: true, error: null } : { valid: false, error: 'Selecione a escola.' },
      senha:         () => validatePassword(form.senha),
      confirmaSenha: () => validatePasswordConfirm(form.senha, form.confirmaSenha),
    });
    setErrors(errs);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
      const res = await fetch(`${apiBase}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome:       form.nome.trim(),
          telefone:   form.telefone.trim(),
          email:      form.email.trim().toLowerCase(),
          nascimento: form.nascimento,
          sexo:       form.sexo,
          escola:     form.escola,
          password:   form.senha,
        }),
      });
      const body = await res.json();

      if (!res.ok) {
        if (body.fieldErrors) {
          setErrors(body.fieldErrors);
        } else {
          setServerError(body.error || 'Erro ao cadastrar. Tente novamente.');
        }
        return;
      }

      // Auto-login
      const loginRes = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: body.data.email, senha: form.senha }),
      });
      const loginBody = await loginRes.json();
      if (loginRes.ok) {
        login(loginBody.data, loginBody.token);
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch {
      setServerError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
      errors[field]
        ? 'border-red-400 focus:ring-red-300 bg-red-50'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`;

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white text-black">
      <div className="hidden md:flex items-center justify-center bg-blue-600">
        <img src={Cartaz} alt="Comaes" className="w-4/5 h-auto rounded-2xl shadow-2xl" />
      </div>

      <div className="flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="flex justify-center mb-4">
            <img src={logotipo} alt="Comaes" className="h-24 w-auto object-contain" />
          </div>
          <p className="text-center text-gray-700 mb-6">
            Cadastre-se na melhor plataforma de competições educativas online
          </p>

          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
            >
              {serverError}
            </motion.div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <input type="text" name="nome" placeholder="Nome Completo"
                value={form.nome} onChange={handleChange}
                className={inputCls('nome')} disabled={isLoading}
                maxLength={100} autoComplete="name" />
              {errors.nome && <p className="text-red-600 text-xs mt-1">{errors.nome}</p>}
            </div>

            <div>
              <input type="tel" name="telefone" placeholder="Telefone (ex: 923456789)"
                value={form.telefone} onChange={handleChange}
                className={inputCls('telefone')} disabled={isLoading}
                maxLength={20} autoComplete="tel" />
              {errors.telefone && <p className="text-red-600 text-xs mt-1">{errors.telefone}</p>}
            </div>

            <div>
              <input type="email" name="email" placeholder="E-mail"
                value={form.email} onChange={handleChange}
                className={inputCls('email')} disabled={isLoading}
                maxLength={254} autoComplete="email" />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Data de nascimento</label>
              <input type="date" name="nascimento"
                value={form.nascimento} onChange={handleChange}
                className={inputCls('nascimento')} disabled={isLoading}
                max={new Date().toISOString().split('T')[0]} />
              {errors.nascimento && <p className="text-red-600 text-xs mt-1">{errors.nascimento}</p>}
            </div>

            <div>
              <select name="sexo" value={form.sexo} onChange={handleChange}
                className={inputCls('sexo')} disabled={isLoading}>
                <option value="">Selecione o sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
              {errors.sexo && <p className="text-red-600 text-xs mt-1">{errors.sexo}</p>}
            </div>

            <div>
              <select name="escola" value={form.escola} onChange={handleChange}
                className={inputCls('escola')} disabled={isLoading}>
                <option value="">Selecione a escola</option>
                {escolas.map((e, i) => <option key={i} value={e}>{e}</option>)}
              </select>
              {errors.escola && <p className="text-red-600 text-xs mt-1">{errors.escola}</p>}
            </div>

            <div>
              <input type="password" name="senha" placeholder="Senha"
                value={form.senha} onChange={handleChange}
                className={inputCls('senha')} disabled={isLoading}
                maxLength={128} autoComplete="new-password" />
              {errors.senha
                ? <p className="text-red-600 text-xs mt-1">{errors.senha}</p>
                : <p className="text-gray-400 text-xs mt-1">Mín. 8 caracteres, maiúscula, número e símbolo.</p>}
            </div>

            <div>
              <input type="password" name="confirmaSenha" placeholder="Confirmar senha"
                value={form.confirmaSenha} onChange={handleChange}
                className={inputCls('confirmaSenha')} disabled={isLoading}
                maxLength={128} autoComplete="new-password" />
              {errors.confirmaSenha && <p className="text-red-600 text-xs mt-1">{errors.confirmaSenha}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full mt-4 p-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Cadastrando...
                </div>
              ) : 'Cadastrar-se'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;
