/**
 * CollaboratorRegisterForm.jsx
 *
 * FormulÃ¡rio de registo de colaborador/professor â€” subcomponente do AuthContainer.
 * Totalmente modular, reutiliza validators.js e estilos do sistema existente.
 */

import { useState, useRef } from 'react';
import { Eye, EyeOff, Upload, X, FileText, Image, Loader2, ChevronDown } from 'lucide-react';
import {
  validateNome, validateEmail, validatePassword, validatePasswordConfirm,
  validateUsername,
} from '../../utils/validators';

/* â”€â”€â”€ Constantes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ESPECIALIDADES = [
  { value: 'matematica',  label: 'MatemÃ¡tica' },
  { value: 'programacao', label: 'ProgramaÃ§Ã£o' },
  { value: 'ingles',      label: 'InglÃªs' },
];

const NIVEIS_ACADEMICOS = [
  { value: 'estudante_universitario', label: 'Estudante universitÃ¡rio' },
  { value: 'tecnico',                 label: 'TÃ©cnico' },
  { value: 'licenciado',              label: 'Licenciado' },
  { value: 'mestre',                  label: 'Mestre' },
  { value: 'doutor',                  label: 'Doutor' },
  { value: 'professor',               label: 'Professor' },
  { value: 'profissional',            label: 'Profissional da Ã¡rea' },
  { value: 'outro',                   label: 'Outro' },
];

const GENEROS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino',  label: 'Feminino' },
  { value: 'Outro',     label: 'Outro' },
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE_MB   = 10;
const MAX_FILES          = 5;

const API_BASE = () =>
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`);

/* â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function validarBio(bio) {
  if (!bio || !bio.trim()) return null; // opcional
  if (bio.trim().length < 30) return 'A biografia deve ter pelo menos 30 caracteres.';
  if (bio.trim().length > 500) return 'A biografia nÃ£o pode ter mais de 500 caracteres.';
  return null;
}

function validarArquivo(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext))
    return `ExtensÃ£o "${ext}" nÃ£o permitida. Use: PDF, DOC, DOCX, JPG, PNG.`;
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

/* â”€â”€â”€ Campo reutilizÃ¡vel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Field({ label, error, touched, valid, children, required, hint }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      {error && touched && <p className="text-red-600 text-xs mt-0.5">{error}</p>}
      {valid && !error && <p className="text-green-600 text-xs mt-0.5">âœ“ VÃ¡lido</p>}
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

/* â”€â”€â”€ Componente principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function CollaboratorRegisterForm({ onSuccess, onSwitchToLogin }) {
  const fileInputRef = useRef(null);

  const INITIAL_FORM = {
    nome: '', username: '', email: '', telefone: '', password: '', confirmPassword: '',
    area_especialidade: '', nivel_academico: '', biografia: '', nascimento: '', sexo: '',
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

  /* â”€â”€ ValidaÃ§Ã£o individual â”€â”€ */
  function getFieldError(name, value, formState = form) {
    switch (name) {
      case 'nome':            return validateNome(value).error;
      case 'username':        return validateUsername(value).error;
      case 'email':           return validateEmail(value).error;
      case 'telefone':        return value && !/^[0-9]{9}$/.test(value.replace(/\D/g, '')) ? 'O telefone deve ter 9 dÃ­gitos.' : null;
      case 'password':        return validatePassword(value).error;
      case 'confirmPassword': return validatePasswordConfirm(formState.password, value).error;
      case 'area_especialidade': return !value ? 'A Ã¡rea de especialidade Ã© obrigatÃ³ria.' : null;
      case 'nivel_academico': return !value ? 'O nÃ­vel acadÃ©mico Ã© obrigatÃ³rio.' : null;
      case 'sexo':            return !value ? 'O gÃ©nero Ã© obrigatÃ³rio.' : null;
      case 'nascimento': {
        if (!value) return 'A data de nascimento Ã© obrigatÃ³ria.';
        const d = new Date(value);
        if (isNaN(d.getTime())) return 'Data invÃ¡lida.';
        const now = new Date();
        if (d > now) return 'A data nÃ£o pode estar no futuro.';
        const age = (now - d) / (1000 * 60 * 60 * 24 * 365.25);
        if (age < 5) return 'Deve ter no mÃ­nimo 5 anos.';
        if (age > 120) return 'Data de nascimento invÃ¡lida.';
        return null;
      }
      case 'biografia':       return validarBio(value);
      default: return null;
    }
  }

  function isValid(name) {
    return touched[name] && !errors[name] && form[name];
  }

  /* â”€â”€ Handlers â”€â”€ */
  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // ðŸ” Debug area_especialidade changes
    if (name === 'area_especialidade') {
      console.log(`ðŸŽ¯ MUDANÃ‡A DETECTADA: area_especialidade = "${value}"`);
      console.log(`   Tipo do valor: ${typeof value}`);
      console.log(`   Valor estÃ¡ vazio? ${value === ''}`);
    }
    
    // Formatar telefone: apenas nÃºmeros, mÃ¡ximo 9
    if (name === 'telefone') {
      value = value.replace(/\D/g, '').slice(0, 9);
    }
    
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    const err = getFieldError(name, value, nextForm);
    setErrors(prev => ({ ...prev, [name]: err }));

    // Re-validar confirmaÃ§Ã£o se senha mudar
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

  /* â”€â”€ Upload â”€â”€ */
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
        errs.push(`MÃ¡ximo de ${MAX_FILES} ficheiros.`);
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

  /* â”€â”€ Submit â”€â”€ */
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
      
      // DEBUG: Log cada campo sendo adicionado
      console.log('ðŸ” â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
      console.log('ðŸ“¤ PREPARANDO FORMDATA PARA ENVIO:');
      console.log('ðŸ” Form State ANTES:', JSON.stringify(form, null, 2));
      
      Object.entries(form).forEach(([k, v]) => {
        console.log(`   âœ… Adicionando: ${k} = "${v}"`);
        formData.append(k, v);
      });
      
      files.forEach(f => {
        console.log(`   âœ… Adicionando ficheiro: ${f.name}`);
        formData.append('documentos', f);
      });
      
      console.log('ðŸ“‹ FormData construÃ­do. Campos:');
      for (let pair of formData.entries()) {
        console.log(`   - ${pair[0]}: ${pair[1]}`);
      }
      console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

      const res = await fetch(`${API_BASE()}/auth/registro-colaborador`, {
        method: 'POST',
        body: formData,
        // NÃ£o definir Content-Type: o browser define automaticamente com o boundary do multipart
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

      // Sucesso â€” notificar componente pai
      onSuccess && onSuccess(json);

    } catch (err) {
      console.error(err);
      setGlobalError('Erro de conexÃ£o com o servidor. Verifique se o backend estÃ¡ rodando.');
    } finally {
      setLoading(false);
    }
  };

  /* â”€â”€ Render â”€â”€ */
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-2xl" noValidate>

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
      <Field label="Username pÃºblico" required error={errors.username} touched={touched.username} valid={isValid('username')}
        hint="VisÃ­vel publicamente. Apenas letras, nÃºmeros, _ e - (3-30 caracteres).">
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

      {/* Telefone */}
      <Field label="Telefone (opcional)" error={errors.telefone} touched={touched.telefone} valid={isValid('telefone')}
        hint="9 dÃ­gitos (ex: 923456789)">
        <InputWrapper error={errors.telefone} touched={touched.telefone}>
          <input
            name="telefone" type="tel" placeholder="923456789"
            value={form.telefone} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm"
            maxLength={9}
          />
        </InputWrapper>
      </Field>

      {/* Ãrea de especialidade */}
      <Field label="Ãrea de especialidade" required error={errors.area_especialidade} touched={touched.area_especialidade}>
        <div className={`relative border rounded-xl transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
          errors.area_especialidade && touched.area_especialidade ? 'border-red-400' : 'border-gray-300'
        }`}>
          <select
            name="area_especialidade"
            value={form.area_especialidade} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm appearance-none pr-8"
          >
            <option value="">Selecione a Ã¡rea</option>
            {ESPECIALIDADES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </Field>

      {/* GÃ©nero */}
      <Field label="GÃ©nero" required error={errors.sexo} touched={touched.sexo}>
        <div className={`relative border rounded-xl transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
          errors.sexo && touched.sexo ? 'border-red-400' : 'border-gray-300'
        }`}>
          <select
            name="sexo"
            value={form.sexo} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm appearance-none pr-8"
          >
            <option value="">Selecione o gÃ©nero</option>
            {GENEROS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </Field>

      {/* Data de Nascimento */}
      <Field label="Data de nascimento" required error={errors.nascimento} touched={touched.nascimento} valid={isValid('nascimento')}>
        <InputWrapper error={errors.nascimento} touched={touched.nascimento}>
          <input
            name="nascimento" type="date"
            value={form.nascimento} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm"
          />
        </InputWrapper>
      </Field>

      {/* NÃ­vel acadÃ©mico */}
      <Field label="NÃ­vel acadÃ©mico / profissional" required error={errors.nivel_academico} touched={touched.nivel_academico}>
        <div className={`relative border rounded-xl transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
          errors.nivel_academico && touched.nivel_academico ? 'border-red-400' : 'border-gray-300'
        }`}>
          <select
            name="nivel_academico"
            value={form.nivel_academico} onChange={handleChange} onBlur={handleBlur}
            disabled={loading}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm appearance-none pr-8"
          >
            <option value="">Selecione o nÃ­vel</option>
            {NIVEIS_ACADEMICOS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </Field>

      {/* Biografia */}
      <Field label="Biografia profissional" error={errors.biografia} touched={touched.biografia}
        hint={`${form.biografia.trim().length}/500 caracteres (mÃ­nimo 30)`}>
        <div className={`border rounded-xl transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
          errors.biografia && touched.biografia ? 'border-red-400' : 'border-gray-300'
        }`}>
          <textarea
            name="biografia"
            value={form.biografia} onChange={handleChange} onBlur={handleBlur}
            disabled={loading} rows={3}
            placeholder="Descreva brevemente a sua experiÃªncia profissional e acadÃ©mica..."
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
            â€” PDF, DOC, DOCX, JPG, PNG Â· mÃ¡x. 10MB cada Â· atÃ© {MAX_FILES} ficheiros
          </span>
        </label>
        <p className="text-xs text-blue-600 mb-2">
          ðŸ’¡ Adicione certificados, portfÃ³lio ou documentos relevantes para fortalecer a anÃ¡lise do seu perfil.
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

      {/* Resumo antes de enviar */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2 text-xs">
        <p className="font-semibold text-blue-900">ðŸ“‹ Resumo da sua candidatura:</p>
        <div className="space-y-1 text-blue-800">
          <p>â€¢ <strong>Nome:</strong> {form.nome || '(vazio)'}</p>
          <p>â€¢ <strong>Email:</strong> {form.email || '(vazio)'}</p>
          <p>â€¢ <strong>GÃ©nero:</strong> {GENEROS.find(g => g.value === form.sexo)?.label || '(vazio)'}</p>
          <p>â€¢ <strong>Nascimento:</strong> {form.nascimento ? new Date(form.nascimento).toLocaleDateString('pt-PT') : '(vazio)'}</p>
          <p>â€¢ <strong>Ãrea:</strong> {ESPECIALIDADES.find(e => e.value === form.area_especialidade)?.label || '(vazio)'}
            <span className="text-red-600 ml-2">
              {form.area_especialidade === '' && 'âŒ NÃƒO PREENCHIDA'}
              {form.area_especialidade !== '' && `âœ… ${form.area_especialidade}`}
            </span>
          </p>
          <p>â€¢ <strong>NÃ­vel:</strong> {NIVEIS_ACADEMICOS.find(n => n.value === form.nivel_academico)?.label || '(vazio)'}</p>
          <p>â€¢ <strong>Documentos:</strong> {files.length > 0 ? `${files.length} ficheiro${files.length > 1 ? 's' : ''}` : 'Nenhum'}</p>
        </div>
        {form.area_especialidade !== '' && (
          <p className="text-blue-700 text-xs italic mt-2">âœ… Disciplina preenchida! Pronto para submeter.</p>
        )}
        {form.area_especialidade === '' && (
          <p className="text-red-700 text-xs italic mt-2">âŒ FALTA PREENCHER A DISCIPLINA!</p>
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
          'âœ“ Enviar Candidatura para AnÃ¡lise do Admin'
        )}
      </button>

      <p className="text-center text-sm text-gray-600">
        JÃ¡ tem uma conta?{' '}
        <button type="button" onClick={onSwitchToLogin}
          className="text-blue-600 font-semibold hover:underline focus:outline-none">
          Entrar
        </button>
      </p>
    </form>
  );
}

