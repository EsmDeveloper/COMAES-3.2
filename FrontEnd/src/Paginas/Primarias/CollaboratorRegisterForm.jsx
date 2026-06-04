/**
 * CollaboratorRegisterForm.jsx
 *
 * Formulário de registo de colaborador/professor — subcomponente do AuthContainer.
 * Totalmente modular, reutiliza validators.js e estilos do sistema existente.
 */

import { useState, useRef } from 'react';
import { Eye, EyeOff, Upload, X, FileText, Image, Loader2, ChevronDown } from 'lucide-react';
import {
  validateNome, validateEmail, validatePassword, validatePasswordConfirm,
  validateUsername,
} from '../../utils/validators';

/* ─── Constantes ──────────────────────────────────────────────── */
const ESPECIALIDADES = [
  { value: 'matematica',  label: 'Matemática' },
  { value: 'programacao', label: 'Programação' },
  { value: 'ingles',      label: 'Inglês' },
];

const NIVEIS_ACADEMICOS = [
  { value: 'estudante_universitario', label: 'Estudante universitário' },
  { value: 'tecnico',                 label: 'Técnico' },
  { value: 'licenciado',              label: 'Licenciado' },
  { value: 'mestre',                  label: 'Mestre' },
  { value: 'doutor',                  label: 'Doutor' },
  { value: 'professor',               label: 'Professor' },
  { value: 'profissional',            label: 'Profissional da área' },
  { value: 'outro',                   label: 'Outro' },
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE_MB   = 10;
const MAX_FILES          = 5;

const API_BASE = () =>
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`);

/* ─── helpers ─────────────────────────────────────────────────── */
function validarBio(bio) {
  if (!bio || !bio.trim()) return null; // opcional
  if (bio.trim().length < 30) return 'A biografia deve ter pelo menos 30 caracteres.';
  if (bio.trim().length > 500) return 'A biografia não pode ter mais de 500 caracteres.';
  return null;
}

function validarArquivo(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext))
    return `Extensão "${ext}" não permitida. Use: PDF, DOC, DOCX, JPG, PNG.`;
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    return `"${file.name}" excede o limite de ${MAX_FILE_SIZE_MB}MB.`;
  return null;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileIcon(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png'].includes(ext)) return <Image size={14} className="text-blue-500" />;
  return <FileText size={14} className="text-gray-500" />;
}

/* ─── Campo reutilizável ──────────────────────────────────────── */
function Field({ label, error, touched, valid, children, required, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      {error && touched && <p className="text-red-600 text-xs mt-0.5">{error}</p>}
      {valid && !error && <p className="text-green-600 text-xs mt-0.5">✓ Válido</p>}
    </div>
  );
}

function InputWrapper({ children, error, touched }) {
  return (
    <div className={`relative border rounded-xl overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
      error && touched ? 'border-red-400' : 'border-gray-300'
    }`}>
      {children}
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────── */
export default function CollaboratorRegisterForm({ onSuccess, onSwitchToLogin }) {
  const fileInputRef = useRef(null);

  const INITIAL_FORM = {
    nome: '', username: '', email: '', password: '', confirmPassword: '',
    area_especialidade: '', nivel_academico: '', biografia: '',
  };

  const [form, setForm]           = useState(INITIAL_FORM);
  const [touched, setTouched]     = useState({});
  const [errors, setErrors]       = useState({});
  const [files, setFiles]         = useState([]);
  const [fileErrors, setFileErrors] = useState([]);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [globalError, setGlobalError] = useState('');

  /* ── Validação individual ── */
  function getFieldError(name, value, formState = form) {
    switch (name) {
      case 'nome':            return validateNome(value).error;
      case 'username':        return validateUsername(value).error;
      case 'email':           return validateEmail(value).error;
      case 'password':        return validatePassword(value).error;
      case 'confirmPassword': return validatePasswordConfirm(formState.password, value).error;
      case 'area_especialidade': return !value ? 'A área de especialidade é obrigatória.' : null;
      case 'nivel_academico': return !value ? 'O nível académico é obrigatório.' : null;
      case 'biografia':       return validarBio(value);
      default: return null;
    }
  }

  function isValid(name) {
    return touched[name] && !errors[name] && form[name];
  }

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    const err = getFieldError(name, value, nextForm);
    setErrors(prev => ({ ...prev, [name]: err }));

    // Re-validar confirmação se senha mudar
    if (name === 'password' && touched.confirmPassword) {
      const confirmErr = getFieldError('confirmPassword', nextForm.confirmPassword, nextForm);
      setErrors(prev => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: getFieldError(name, form[name]) }));
  };

  /* ── Upload ── */
  const handleFileDrop = (e) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e) => addFiles(Array.from(e.target.files));

  const addFiles = (newFiles) => {
    const errs = [];
    const valid = [];

    for (const f of newFiles) {
      if (files.length + valid.length >= MAX_FILES) {
        errs.push(`Máximo de ${MAX_FILES} ficheiros.`);
        break;
      }
      const err = validarArquivo(f);
      if (err) errs.push(err);
      else valid.push(f);
    }

    setFiles(prev => [...prev, ...valid]);
    setFileErrors(errs);
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setFileErrors([]);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    // Marcar todos os campos como tocados
    const allTouched = Object.keys(INITIAL_FORM).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);

    // Validar todos
    const allErrors = {};
    Object.keys(INITIAL_FORM).forEach(k => {
      const err = getFieldError(k, form[k]);
      if (err) allErrors[k] = err;
    });

    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach(f => formData.append('documentos', f));

      const res = await fetch(`${API_BASE()}/auth/registro-colaborador`, {
        method: 'POST',
        body: formData,
        // Não definir Content-Type: o browser define automaticamente com o boundary do multipart
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.fieldErrors) {
          setErrors(json.fieldErrors);
          setTouched(
            Object.keys(json.fieldErrors).reduce((a, k) => ({ ...a, [k]: true }), {})
          );
        }
        setGlobalError(json.error || 'Erro ao enviar candidatura.');
        return;
      }

      // Sucesso — notificar componente pai
      onSuccess && onSuccess(json);

    } catch (err) {
      console.error(err);
      setGlobalError('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ── */
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

      {globalError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {globalError}
        </div>
      )}

      {/* Nome completo */}
      <Field label="Nome completo" required error={errors.nome} touched={touched.nome} valid={isValid('nome')}>
        <InputWrapper error={errors.nome} touched={touched.nome}>
          <input
            name="nome" type="text" placeholder="Cornelio Mbongo"
            value={form.nome} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm"
          />
        </InputWrapper>
      </Field>

      {/* Username */}
      <Field label="Username público" required error={errors.username} touched={touched.username} valid={isValid('username')}
        hint="Visível publicamente. Apenas letras, números, _ e - (3-30 caracteres).">
        <InputWrapper error={errors.username} touched={touched.username}>
          <input
            name="username" type="text" placeholder="prof_cornelio"
            value={form.username} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm"
          />
        </InputWrapper>
      </Field>

      {/* Email */}
      <Field label="E-mail" required error={errors.email} touched={touched.email} valid={isValid('email')}>
        <InputWrapper error={errors.email} touched={touched.email}>
          <input
            name="email" type="email" placeholder="professor@email.com"
            value={form.email} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm"
          />
        </InputWrapper>
      </Field>

      {/* Área de especialidade */}
      <Field label="Área de especialidade" required error={errors.area_especialidade} touched={touched.area_especialidade}>
        <div className={`relative border rounded-xl transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
          errors.area_especialidade && touched.area_especialidade ? 'border-red-400' : 'border-gray-300'
        }`}>
          <select
            name="area_especialidade"
            value={form.area_especialidade} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm appearance-none pr-8"
          >
            <option value="">Selecione a área</option>
            {ESPECIALIDADES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </Field>

      {/* Nível académico */}
      <Field label="Nível académico / profissional" required error={errors.nivel_academico} touched={touched.nivel_academico}>
        <div className={`relative border rounded-xl transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
          errors.nivel_academico && touched.nivel_academico ? 'border-red-400' : 'border-gray-300'
        }`}>
          <select
            name="nivel_academico"
            value={form.nivel_academico} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm appearance-none pr-8"
          >
            <option value="">Selecione o nível</option>
            {NIVEIS_ACADEMICOS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </Field>

      {/* Biografia */}
      <Field label="Biografia profissional" error={errors.biografia} touched={touched.biografia}
        hint={`${form.biografia.trim().length}/500 caracteres (mínimo 30)`}>
        <div className={`border rounded-xl transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
          errors.biografia && touched.biografia ? 'border-red-400' : 'border-gray-300'
        }`}>
          <textarea
            name="biografia"
            value={form.biografia} onChange={handleChange} onBlur={handleBlur}
            disabled={loading} rows={3}
            placeholder="Descreva brevemente a sua experiência profissional e académica..."
            className="w-full px-3 py-3 bg-transparent outline-none text-sm resize-none"
          />
        </div>
      </Field>

      {/* Palavra-passe */}
      <Field label="Palavra-passe" required error={errors.password} touched={touched.password} valid={isValid('password')}>
        <InputWrapper error={errors.password} touched={touched.password}>
          <input
            name="password" type={showPass ? 'text' : 'password'} placeholder="Senha@123"
            value={form.password} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 pr-11 bg-transparent outline-none text-sm"
          />
          <button type="button" tabIndex={-1}
            onClick={() => setShowPass(v => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </InputWrapper>
      </Field>

      {/* Confirmar palavra-passe */}
      <Field label="Confirmar palavra-passe" required error={errors.confirmPassword} touched={touched.confirmPassword}>
        <InputWrapper error={errors.confirmPassword} touched={touched.confirmPassword}>
          <input
            name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repita a senha"
            value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 pr-11 bg-transparent outline-none text-sm"
          />
          <button type="button" tabIndex={-1}
            onClick={() => setShowConfirm(v => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </InputWrapper>
      </Field>

      {/* Upload de documentos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Documentos (opcional)
          <span className="ml-1 text-xs font-normal text-gray-400">
            — PDF, DOC, DOCX, JPG, PNG · máx. 10MB cada · até {MAX_FILES} ficheiros
          </span>
        </label>
        <p className="text-xs text-blue-600 mb-2">
          💡 Adicione certificados, portfólio ou documentos relevantes para fortalecer a análise do seu perfil.
        </p>

        {/* Zona de drop */}
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors hover:bg-blue-50 hover:border-blue-400 ${
            files.length >= MAX_FILES ? 'opacity-50 pointer-events-none' : 'border-gray-300'
          }`}
        >
          <Upload size={20} className="mx-auto text-gray-400 mb-1" />
          <p className="text-xs text-gray-500">
            {files.length >= MAX_FILES
              ? `Limite de ${MAX_FILES} ficheiros atingido`
              : 'Clique ou arraste ficheiros aqui'}
          </p>
          <input
            ref={fileInputRef} type="file" className="hidden"
            multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileInput}
          />
        </div>

        {/* Erros de upload */}
        {fileErrors.map((e, i) => (
          <p key={i} className="text-red-600 text-xs mt-1">{e}</p>
        ))}

        {/* Lista de ficheiros */}
        {files.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                {fileIcon(f)}
                <span className="flex-1 truncate font-medium">{f.name}</span>
                <span className="text-gray-400 flex-shrink-0">{formatBytes(f.size)}</span>
                <button type="button" onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-1 p-3 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Enviando candidatura...</>
        ) : (
          'Enviar candidatura'
        )}
      </button>

      <p className="text-center text-sm text-gray-600">
        Já tem uma conta?{' '}
        <button type="button" onClick={onSwitchToLogin}
          className="text-blue-600 font-semibold hover:underline focus:outline-none">
          Entrar
        </button>
      </p>
    </form>
  );
}
