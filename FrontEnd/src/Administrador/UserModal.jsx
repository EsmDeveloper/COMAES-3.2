/**
 * UserModal.jsx
 * Admin user management modal with account-type toggle:
 *   • "Usuário"       → full registration form (student)
 *   • "Administrador" → simplified form (email + password only)
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  validateNome, validateEmail, validatePassword,
  validatePasswordConfirm, validatePhone, validateBirthDate,
} from '../utils/validators.js';
import {
  Eye, EyeOff, Crown, Lock, AlertCircle,
  User, ShieldCheck, Plus, Edit, Trash2, Key, Save, GraduationCap,
} from 'lucide-react';
import ComaesModal, { ModalBtnCancel, ModalBtnPrimary, ModalBtnDanger } from '../components/ComaesModal';

// ── Password strength ─────────────────────────────────────────
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '', pct: 0 };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd))    score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) score++;
  if (score <= 2) return { score, label: 'Fraca',  color: '#EF4444', pct: 25 };
  if (score <= 3) return { score, label: 'Média',  color: '#F59E0B', pct: 50 };
  if (score <= 4) return { score, label: 'Boa',    color: '#3B82F6', pct: 75 };
  return             { score, label: 'Forte', color: '#10B981', pct: 100 };
}

// ── Field wrapper ─────────────────────────────────────────────
function Field({ label, required, error, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error  && <p className="text-xs text-red-600 flex items-center gap-1"><span>⚠</span>{error}</p>}
      {!error && hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls = (hasError) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? 'border-red-400 bg-red-50 focus:ring-red-300'
      : 'border-slate-300 bg-white focus:ring-blue-500 focus:border-blue-500'
  }`;

const ESCOLAS = [
  'Instituto Politécnico Industrial de Lunada - IPIL',
  'Instituto Medio de Economia de Luanda - IMEL',
  'Instituto Médio Comercial de Luanda - IMCL',
  'Instituto de Telecomunicações de Luanda - ITEL',
  'Instituto Médio Politécnico Nova Vida - IMP NV',
  'Instituto Médio Politécnico Alda Lara - IMPAL',
];

// ── Account-type toggle (only shown on create mode) ───────────
function AccountTypeToggle({ value, onChange, disabled }) {
  const opts = [
    {
      id: 'user',
      label: 'Usuário',
      desc: 'Estudante da plataforma',
      icon: User,
      activeClass: 'border-blue-500 bg-blue-50 text-blue-700',
      iconClass: 'text-blue-500',
    },
    {
      id: 'colaborador',
      label: 'Colaborador',
      desc: 'Professor por disciplina',
      icon: GraduationCap,
      activeClass: 'border-teal-500 bg-teal-50 text-teal-700',
      iconClass: 'text-teal-500',
    },
    {
      id: 'admin',
      label: 'Administrador',
      desc: 'Acesso ao painel de gestão',
      icon: ShieldCheck,
      activeClass: 'border-purple-500 bg-purple-50 text-purple-700',
      iconClass: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {opts.map(opt => {
        const Icon = opt.icon;
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${active ? opt.activeClass : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
              ${active ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
              <Icon className={`w-5 h-5 ${active ? opt.iconClass : 'text-slate-400'}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{opt.label}</p>
              <p className="text-xs opacity-70 mt-0.5 leading-tight">{opt.desc}</p>
            </div>
            {active && (
              <div className={`ml-auto w-2 h-2 rounded-full flex-shrink-0 ${opt.id === 'admin' ? 'bg-purple-500' : opt.id === 'colaborador' ? 'bg-teal-500' : 'bg-blue-500'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Password field with show/hide + strength bar ──────────────
function PwdField({ label, name, value, onChange, onBlur, touched, error, showPwd, onToggleShow, required, placeholder }) {
  const strength = getPasswordStrength(value);
  return (
    <Field label={label} required={required} error={touched && error}
      hint="Mín. 8 caracteres, maiúscula, minúscula, número e símbolo.">
      <div className="relative">
        <input
          type={showPwd ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={inputCls(touched && error)}
          placeholder={placeholder}
          maxLength={128}
          autoComplete="new-password"
        />
        <button type="button" onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {value && (
        <div className="mt-1.5">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${strength.pct}%`, background: strength.color }} />
          </div>
          <p className="text-xs mt-0.5" style={{ color: strength.color }}>Força: {strength.label}</p>
        </div>
      )}
    </Field>
  );
}

// ── Main component ────────────────────────────────────────────
export default function UserModal({ mode, item, currentUser, onClose, onSubmit }) {
  const isCreate = mode === 'create';
  const isEdit   = mode === 'edit';
  const isDelete = mode === 'delete';
  const isReset  = mode === 'reset-password';
  const isSuperAdmin = Boolean(currentUser?.isAdmin);

  // "user" | "admin" — only relevant on create mode
  const [accountType, setAccountType] = useState('user');

  // Full form state (used for both user and admin modes)
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', nascimento: '',
    sexo: '', escola: '', biografia: '',
    role: 'estudante', disciplina_colaborador: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset account type when modal opens
  useEffect(() => {
    setAccountType('user');
    setErrors({});
    setTouched({});
    setServerError('');
    setShowPwd(false);
    setShowConfirm(false);
  }, [mode]);

  // Populate form when editing / deleting / resetting
  useEffect(() => {
    if (item && (isEdit || isDelete || isReset)) {
      setForm(prev => ({
        ...prev,
        nome:       item.nome       || '',
        email:      item.email      || '',
        telefone:   item.telefone   || '',
        nascimento: item.nascimento ? item.nascimento.slice(0, 10) : '',
        sexo:       item.sexo       || '',
        escola:     item.escola     || '',
        biografia:  item.biografia  || '',
        role:       item.role || (item.isAdmin ? 'admin' : 'estudante'),
        disciplina_colaborador: item.disciplina_colaborador || '',
        password: '', confirmPassword: '',
      }));
    }
  }, [item, isEdit, isDelete, isReset]);

  // Clear errors when switching account type
  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setErrors({});
    setTouched({});
    setServerError('');
    setForm(prev => ({ ...prev, role: type === 'user' ? 'estudante' : type, password: '', confirmPassword: '' }));
  };

  // ── Per-field validation ──────────────────────────────────
  const validateField = useCallback((name, value, formState = form) => {
    const isAdminCreate = isCreate && accountType === 'admin';
    switch (name) {
      case 'nome':       return validateNome(value).error || '';
      case 'email':      return validateEmail(value).error || '';
      case 'telefone':
        if (isAdminCreate) return '';
        return isCreate ? (validatePhone(value).error || '') : (value ? validatePhone(value).error || '' : '');
      case 'nascimento':
        if (isAdminCreate) return '';
        return isCreate ? (validateBirthDate(value).error || '') : (value ? validateBirthDate(value).error || '' : '');
      case 'sexo':
        if (isAdminCreate) return '';
        return isCreate && !value ? 'O sexo é obrigatório.' : '';
      case 'role':
        return ['estudante', 'colaborador', 'admin'].includes(value) ? '' : 'Perfil inválido.';
      case 'disciplina_colaborador':
        if ((isCreate && accountType === 'colaborador') || formState.role === 'colaborador') {
          return value ? '' : 'A disciplina é obrigatória para colaborador.';
        }
        return '';
      case 'password':
        if (isCreate && !value) return 'A senha é obrigatória.';
        if (value) return validatePassword(value).error || '';
        return '';
      case 'confirmPassword':
        if (isCreate && !value) return 'A confirmação é obrigatória.';
        if (value || formState.password) return validatePasswordConfirm(formState.password, value).error || '';
        return '';
      default: return '';
    }
  }, [form, isCreate, accountType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    setServerError('');
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value, newForm) }));
      if (name === 'password' && touched.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: validatePasswordConfirm(value, newForm.confirmPassword).error || '' }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // ── Full form validation ──────────────────────────────────
  const validateAll = () => {
    let fields;
    if (isReset) {
      fields = ['password', 'confirmPassword'];
    } else if (isCreate && accountType === 'admin') {
      fields = ['email', 'password', 'confirmPassword'];
    } else if (isCreate && accountType === 'colaborador') {
      fields = ['nome', 'email', 'telefone', 'nascimento', 'sexo', 'disciplina_colaborador', 'password', 'confirmPassword'];
    } else {
      fields = ['nome', 'email', 'telefone', 'nascimento', 'sexo', 'role', 'password', 'confirmPassword'];
      if (form.role === 'colaborador') fields.push('disciplina_colaborador');
    }
    const newErrors = {};
    const newTouched = {};
    fields.forEach(f => {
      newTouched[f] = true;
      const err = validateField(f, form[f]);
      if (err) newErrors[f] = err;
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDelete) {
      setLoading(true);
      try { await onSubmit({}); }
      catch (err) { setServerError(err?.response?.data?.message || 'Erro ao excluir.'); }
      finally { setLoading(false); }
      return;
    }

    if (!validateAll()) return;

    setLoading(true);
    setServerError('');
    try {
      let payload;

      if (isReset) {
        payload = { newPassword: form.password, confirmPassword: form.confirmPassword };
      } else if (isCreate && accountType === 'admin') {
        // Admin creation — usa o mesmo endpoint POST /api/admin/users com isAdmin:true
        // Gera dados mínimos obrigatórios a partir do email
        const emailLocal = form.email.trim().toLowerCase().split('@')[0];
        const nomeGerado = emailLocal
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase()) || 'Administrador';
        const telefoneGerado = `9${String(Math.floor(10000000 + Math.random() * 89999999))}`;
        payload = {
          nome:            nomeGerado,
          email:           form.email.trim().toLowerCase(),
          telefone:        telefoneGerado,
          nascimento:      '1990-01-01',
          sexo:            'Masculino',
          escola:          null,
          biografia:       '',
          password:        form.password,
          confirmPassword: form.confirmPassword,
          isAdmin:         true,
        };
      } else {
        // Regular user creation / edit
        payload = {
          nome:       form.nome.trim(),
          email:      form.email.trim().toLowerCase(),
          telefone:   form.telefone.trim(),
          nascimento: form.nascimento,
          sexo:       form.sexo,
          escola:     form.escola || null,
          biografia:  form.biografia || '',
          ...(form.password ? { password: form.password, confirmPassword: form.confirmPassword } : {}),
        };
      }

      await onSubmit(payload);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.fieldErrors) {
        setErrors(prev => ({ ...prev, ...data.fieldErrors }));
        setTouched(prev => {
          const t = { ...prev };
          Object.keys(data.fieldErrors).forEach(k => { t[k] = true; });
          return t;
        });
      }
      setServerError(data?.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ── Modal meta ────────────────────────────────────────────
  const isAdminCreate = isCreate && accountType === 'admin';
  const isColaboradorCreate = isCreate && accountType === 'colaborador';

  const titleMap = {
    create: isAdminCreate ? 'Criar Administrador' : isColaboradorCreate ? 'Criar Professor/Colaborador' : 'Criar Novo Usuário',
    edit:   'Editar Usuário',
    delete: 'Excluir Usuário',
    'reset-password': 'Redefinir Senha',
  };

  const modeIcon = isDelete ? <Trash2 className="w-5 h-5" />
    : isReset    ? <Key className="w-5 h-5" />
    : isAdminCreate ? <ShieldCheck className="w-5 h-5" />
    : isColaboradorCreate ? <GraduationCap className="w-5 h-5" />
    : isCreate   ? <Plus className="w-5 h-5" />
    : <Edit className="w-5 h-5" />;

  const modeIconBg    = isDelete ? 'bg-red-100'
    : isReset          ? 'bg-amber-100'
    : isAdminCreate    ? 'bg-purple-100'
    : isColaboradorCreate ? 'bg-teal-100'
    : isCreate         ? 'bg-green-100'
    : 'bg-blue-100';

  const modeIconColor = isDelete ? 'text-red-600'
    : isReset          ? 'text-amber-600'
    : isAdminCreate    ? 'text-purple-600'
    : isColaboradorCreate ? 'text-teal-600'
    : isCreate         ? 'text-green-600'
    : 'text-blue-600';

  const Spinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
  );

  const footerButtons = (
    <>
      <ModalBtnCancel onClick={onClose} disabled={loading}>Cancelar</ModalBtnCancel>
      {isDelete ? (
        <ModalBtnDanger onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spinner /><span>Processando...</span></> : <><Trash2 className="w-4 h-4" /><span>Excluir</span></>}
        </ModalBtnDanger>
      ) : (
        <ModalBtnPrimary
          type="submit"
          form="userForm"
          disabled={loading}
          className={
            isReset       ? '!bg-amber-500 hover:!bg-amber-600 !shadow-amber-200' :
            isAdminCreate ? '!bg-purple-600 hover:!bg-purple-700 !shadow-purple-200' :
            isColaboradorCreate ? '!bg-teal-600 hover:!bg-teal-700 !shadow-teal-200' : ''
          }
        >
          {loading ? (
            <><Spinner /><span>Processando...</span></>
          ) : isReset ? (
            <><Key className="w-4 h-4" /><span>Redefinir Senha</span></>
          ) : isAdminCreate ? (
            <><ShieldCheck className="w-4 h-4" /><span>Criar Administrador</span></>
          ) : isColaboradorCreate ? (
            <><GraduationCap className="w-4 h-4" /><span>Criar Colaborador</span></>
          ) : isCreate ? (
            <><Plus className="w-4 h-4" /><span>Criar Usuário</span></>
          ) : (
            <><Save className="w-4 h-4" /><span>Salvar Alterações</span></>
          )}
        </ModalBtnPrimary>
      )}
    </>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <ComaesModal
      isOpen
      onClose={onClose}
      title={titleMap[mode] || 'Usuário'}
      icon={modeIcon}
      iconBg={modeIconBg}
      iconColor={modeIconColor}
      maxWidth="max-w-2xl"
      footer={footerButtons}
    >
      {/* ── DELETE confirmation ── */}
      {isDelete && (
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold">Ação irreversível</p>
              <p className="text-red-700 text-sm mt-1">
                Tem certeza que deseja excluir permanentemente o usuário{' '}
                <strong>{item?.nome}</strong>?
              </p>
              <p className="text-red-600 text-xs mt-2">
                Todos os dados associados (participações, conquistas, etc.) serão removidos.
              </p>
            </div>
          </div>
          {serverError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{serverError}</p>
          )}
        </div>
      )}

      {/* ── RESET PASSWORD ── */}
      {isReset && (
        <form id="userForm" onSubmit={handleSubmit} className="space-y-5" noValidate>
          <p className="text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            Definindo nova senha para <strong>{item?.nome}</strong>.
          </p>
          <PwdField
            label="Nova Senha" name="password" value={form.password}
            onChange={handleChange} onBlur={handleBlur}
            touched={touched.password} error={errors.password}
            showPwd={showPwd} onToggleShow={() => setShowPwd(v => !v)}
            required placeholder="Nova senha"
          />
          <Field label="Confirmar Nova Senha" required error={touched.confirmPassword && errors.confirmPassword}>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                className={inputCls(touched.confirmPassword && errors.confirmPassword)}
                placeholder="Confirmar nova senha" maxLength={128} autoComplete="new-password" />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          {serverError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{serverError}</p>
          )}
        </form>
      )}

      {/* ── CREATE / EDIT ── */}
      {(isCreate || isEdit) && (
        <form id="userForm" onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Account-type toggle — only on create, only for super-admin */}
          {isCreate && isSuperAdmin && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Tipo de conta</p>
              <AccountTypeToggle
                value={accountType}
                onChange={handleAccountTypeChange}
                disabled={loading}
              />
            </div>
          )}

          {/* ── ADMIN creation form (simplified) ── */}
          {isCreate && accountType === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <Crown className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-800">Sub-administrador</p>
                  <p className="text-xs text-purple-600 mt-0.5">
                    Este utilizador terá acesso completo ao painel administrativo.
                    O nome de exibição será gerado automaticamente a partir do e-mail.
                  </p>
                </div>
              </div>

              <Field label="E-mail" required error={touched.email && errors.email}>
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} onBlur={handleBlur}
                  className={inputCls(touched.email && errors.email)}
                  placeholder="admin@exemplo.com" maxLength={254} />
              </Field>

              <PwdField
                label="Senha" name="password" value={form.password}
                onChange={handleChange} onBlur={handleBlur}
                touched={touched.password} error={errors.password}
                showPwd={showPwd} onToggleShow={() => setShowPwd(v => !v)}
                required placeholder="Senha forte"
              />

              <Field label="Confirmar Senha" required error={touched.confirmPassword && errors.confirmPassword}>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.confirmPassword && errors.confirmPassword)}
                    placeholder="Confirmar senha" maxLength={128} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && form.confirmPassword && form.password === form.confirmPassword && (
                  <p className="text-xs text-green-600 mt-0.5">✓ Senhas coincidem</p>
                )}
              </Field>
            </div>
          )}

          {/* ── COLABORADOR creation form ── */}
          {isCreate && accountType === 'colaborador' && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <GraduationCap className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-teal-800">Professor / Colaborador</p>
                  <p className="text-xs text-teal-600 mt-0.5">
                    Este utilizador poderá criar e gerenciar questões para uma disciplina específica.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome Completo" required error={touched.nome && errors.nome}>
                  <input type="text" name="nome" value={form.nome}
                    onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.nome && errors.nome)}
                    placeholder="Ex: Maria Silva" maxLength={100} />
                </Field>

                <Field label="E-mail" required error={touched.email && errors.email}>
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.email && errors.email)}
                    placeholder="email@exemplo.com" maxLength={254} />
                </Field>

                <Field label="Telefone" required error={touched.telefone && errors.telefone}
                  hint="Formato: 923456789">
                  <input type="tel" name="telefone" value={form.telefone}
                    onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.telefone && errors.telefone)}
                    placeholder="923456789" maxLength={20} />
                </Field>

                <Field label="Data de Nascimento" required error={touched.nascimento && errors.nascimento}>
                  <input type="date" name="nascimento" value={form.nascimento}
                    onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.nascimento && errors.nascimento)}
                    max={new Date().toISOString().split('T')[0]} />
                </Field>

                <Field label="Sexo" required error={touched.sexo && errors.sexo}>
                  <select name="sexo" value={form.sexo} onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.sexo && errors.sexo)}>
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </Field>

                <Field label="Disciplina" required error={touched.disciplina_colaborador && errors.disciplina_colaborador}>
                  <select name="disciplina_colaborador" value={form.disciplina_colaborador}
                    onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.disciplina_colaborador && errors.disciplina_colaborador)}>
                    <option value="">Selecione a disciplina</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Inglês">Inglês</option>
                    <option value="Programação">Programação</option>
                  </select>
                </Field>
              </div>

              <Field label="Biografia">
                <textarea name="biografia" value={form.biografia}
                  onChange={handleChange} rows={2}
                  className={`${inputCls(false)} resize-none`}
                  placeholder="Breve descrição (opcional)" maxLength={300} />
                <p className="text-xs text-slate-400 text-right">{form.biografia.length}/300</p>
              </Field>

              {/* Password section */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha de Acesso
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PwdField
                    label="Senha"
                    name="password" value={form.password}
                    onChange={handleChange} onBlur={handleBlur}
                    touched={touched.password} error={errors.password}
                    showPwd={showPwd} onToggleShow={() => setShowPwd(v => !v)}
                    required
                    placeholder="Senha forte"
                  />
                  <Field label="Confirmar Senha" required
                    error={touched.confirmPassword && errors.confirmPassword}>
                    <div className="relative">
                      <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                        value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                        className={inputCls(touched.confirmPassword && errors.confirmPassword)}
                        placeholder="Confirmar senha" maxLength={128} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && form.confirmPassword && form.password === form.confirmPassword && (
                      <p className="text-xs text-green-600 mt-0.5">✓ Senhas coincidem</p>
                    )}
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── USER creation / edit form (full) ── */}
          {(!isCreate || accountType === 'user') && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome Completo" required error={touched.nome && errors.nome}>
                  <input type="text" name="nome" value={form.nome}
                    onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.nome && errors.nome)}
                    placeholder="Ex: Maria Silva" maxLength={100} />
                </Field>

                <Field label="E-mail" required error={touched.email && errors.email}>
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.email && errors.email)}
                    placeholder="email@exemplo.com" maxLength={254} />
                </Field>

                <Field label="Telefone" required={isCreate} error={touched.telefone && errors.telefone}
                  hint="Formato: 923456789">
                  <input type="tel" name="telefone" value={form.telefone}
                    onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.telefone && errors.telefone)}
                    placeholder="923456789" maxLength={20} />
                </Field>

                <Field label="Data de Nascimento" required={isCreate} error={touched.nascimento && errors.nascimento}>
                  <input type="date" name="nascimento" value={form.nascimento}
                    onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.nascimento && errors.nascimento)}
                    max={new Date().toISOString().split('T')[0]} />
                </Field>

                <Field label="Sexo" required={isCreate} error={touched.sexo && errors.sexo}>
                  <select name="sexo" value={form.sexo} onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.sexo && errors.sexo)}>
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </Field>

                <Field label="Escola">
                  <select name="escola" value={form.escola} onChange={handleChange}
                    className={inputCls(false)}>
                    <option value="">Selecione (opcional)</option>
                    {ESCOLAS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Biografia">
                <textarea name="biografia" value={form.biografia}
                  onChange={handleChange} rows={2}
                  className={`${inputCls(false)} resize-none`}
                  placeholder="Breve descrição (opcional)" maxLength={300} />
                <p className="text-xs text-slate-400 text-right">{form.biografia.length}/300</p>
              </Field>

              {/* Password section */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {isCreate ? 'Senha de Acesso' : 'Nova Senha (deixe em branco para manter a atual)'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PwdField
                    label={isCreate ? 'Senha' : 'Nova Senha'}
                    name="password" value={form.password}
                    onChange={handleChange} onBlur={handleBlur}
                    touched={touched.password} error={errors.password}
                    showPwd={showPwd} onToggleShow={() => setShowPwd(v => !v)}
                    required={isCreate}
                    placeholder={isCreate ? 'Senha forte' : 'Nova senha (opcional)'}
                  />
                  <Field label="Confirmar Senha" required={isCreate || Boolean(form.password)}
                    error={touched.confirmPassword && errors.confirmPassword}>
                    <div className="relative">
                      <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                        value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                        className={inputCls(touched.confirmPassword && errors.confirmPassword)}
                        placeholder="Confirmar senha" maxLength={128} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && form.confirmPassword && form.password === form.confirmPassword && (
                      <p className="text-xs text-green-600 mt-0.5">✓ Senhas coincidem</p>
                    )}
                  </Field>
                </div>
              </div>

              {/* Non-super-admin info on edit */}
              {!isSuperAdmin && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    Apenas o Administrador Supremo pode conceder ou remover privilégios administrativos.
                  </p>
                </div>
              )}
            </div>
          )}

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}
        </form>
      )}
    </ComaesModal>
  );
}
