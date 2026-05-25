/**
 * UserModal.jsx
 * Dedicated admin user management modal with full validation,
 * password strength meter, show/hide password, and super-admin privilege guard.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  validateNome, validateEmail, validatePassword,
  validatePasswordConfirm, validatePhone, validateBirthDate,
} from '../utils/validators.js';
import { Eye, EyeOff, Crown, Lock, AlertCircle, X, Plus, Edit, Trash2, Key, Save } from 'lucide-react';

// ── Password strength ─────────────────────────────────────────
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
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

// ── Field component ───────────────────────────────────────────
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

// ── Main component ────────────────────────────────────────────
export default function UserModal({ mode, item, currentUser, onClose, onSubmit }) {
  const isCreate = mode === 'create';
  const isEdit   = mode === 'edit';
  const isDelete = mode === 'delete';
  const isReset  = mode === 'reset-password';

  // Super-admin = the authenticated admin (isAdmin flag in JWT)
  const isSuperAdmin = Boolean(currentUser?.isAdmin);

  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', nascimento: '',
    sexo: '', escola: '', biografia: '',
    password: '', confirmPassword: '',
    isAdmin: false,
  });
  const [errors, setErrors]     = useState({});
  const [touched, setTouched]   = useState({});
  const [loading, setLoading]   = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Populate form when editing
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
        isAdmin:    Boolean(item.isAdmin),
        password: '', confirmPassword: '',
      }));
    }
  }, [item, isEdit, isDelete, isReset]);

  // ── Per-field validation ──────────────────────────────────
  const validateField = useCallback((name, value, formState = form) => {
    switch (name) {
      case 'nome':            return validateNome(value).error || '';
      case 'email':           return validateEmail(value).error || '';
      case 'telefone':        return isCreate ? (validatePhone(value).error || '') : (value ? validatePhone(value).error || '' : '');
      case 'nascimento':      return isCreate ? (validateBirthDate(value).error || '') : (value ? validateBirthDate(value).error || '' : '');
      case 'sexo':            return isCreate && !value ? 'O sexo é obrigatório.' : '';
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
  }, [form, isCreate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    const newForm = { ...form, [name]: newValue };
    setForm(newForm);
    setServerError('');
    if (touched[name]) {
      const err = validateField(name, newValue, newForm);
      setErrors(prev => ({ ...prev, [name]: err }));
      // Re-validate confirmPassword when password changes
      if (name === 'password' && touched.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: validatePasswordConfirm(newValue, newForm.confirmPassword).error || '' }));
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
    const fields = isReset
      ? ['password', 'confirmPassword']
      : ['nome', 'email', 'telefone', 'nascimento', 'sexo', 'password', 'confirmPassword'];

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
      try { await onSubmit({}); } catch (err) { setServerError(err?.response?.data?.message || 'Erro ao excluir.'); }
      finally { setLoading(false); }
      return;
    }

    if (!validateAll()) return;

    setLoading(true);
    setServerError('');
    try {
      const payload = isReset
        ? { newPassword: form.password, confirmPassword: form.confirmPassword }
        : {
            nome:       form.nome.trim(),
            email:      form.email.trim().toLowerCase(),
            telefone:   form.telefone.trim(),
            nascimento: form.nascimento,
            sexo:       form.sexo,
            escola:     form.escola || null,
            biografia:  form.biografia || '',
            isAdmin:    isSuperAdmin ? form.isAdmin : undefined,
            ...(form.password ? { password: form.password, confirmPassword: form.confirmPassword } : {}),
          };

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

  const pwdStrength = getPasswordStrength(form.password);

  // ── Titles ────────────────────────────────────────────────
  const titles = {
    create: 'Criar Novo Usuário',
    edit:   'Editar Usuário',
    delete: 'Excluir Usuário',
    'reset-password': 'Redefinir Senha',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {mode === 'create' && <Plus className="w-5 h-5 text-green-500" />}
            {mode === 'edit'   && <Edit className="w-5 h-5 text-blue-500" />}
            {mode === 'delete' && <Trash2 className="w-5 h-5 text-red-500" />}
            {mode === 'reset-password' && <Key className="w-5 h-5 text-amber-500" />}
            {titles[mode] || 'Usuário'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* DELETE confirmation */}
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
              {serverError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{serverError}</p>}
            </div>
          )}

          {/* RESET PASSWORD form */}
          {isReset && (
            <form id="userForm" onSubmit={handleSubmit} className="space-y-5" noValidate>
              <p className="text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                Definindo nova senha para <strong>{item?.nome}</strong>.
              </p>

              <Field label="Nova Senha" required error={touched.password && errors.password}
                hint="Mín. 8 caracteres, maiúscula, minúscula, número e símbolo.">
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} name="password"
                    value={form.password} onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.password && errors.password)} placeholder="Nova senha" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-1.5">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pwdStrength.pct}%`, background: pwdStrength.color }} />
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: pwdStrength.color }}>{pwdStrength.label}</p>
                  </div>
                )}
              </Field>

              <Field label="Confirmar Nova Senha" required error={touched.confirmPassword && errors.confirmPassword}>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                    className={inputCls(touched.confirmPassword && errors.confirmPassword)} placeholder="Confirmar nova senha" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              {serverError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{serverError}</p>}
            </form>
          )}

          {/* CREATE / EDIT form */}
          {(isCreate || isEdit) && (
            <form id="userForm" onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Super-admin badge */}
              {isSuperAdmin && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700 font-medium">
                  <Crown className="w-4 h-4" />
                  Você é o Administrador Supremo — pode criar e promover administradores.
                </div>
              )}

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
                  <Field label={isCreate ? 'Senha' : 'Nova Senha'} required={isCreate}
                    error={touched.password && errors.password}
                    hint="Mín. 8 caracteres, maiúscula, minúscula, número e símbolo.">
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} name="password"
                        value={form.password} onChange={handleChange} onBlur={handleBlur}
                        className={inputCls(touched.password && errors.password)}
                        placeholder={isCreate ? 'Senha forte' : 'Nova senha (opcional)'}
                        maxLength={128} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="mt-1.5">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pwdStrength.pct}%`, background: pwdStrength.color }} />
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: pwdStrength.color }}>
                          Força: {pwdStrength.label}
                        </p>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirmar Senha" required={isCreate || Boolean(form.password)}
                    error={touched.confirmPassword && errors.confirmPassword}>
                    <div className="relative">
                      <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                        value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                        className={inputCls(touched.confirmPassword && errors.confirmPassword)}
                        placeholder="Confirmar senha" maxLength={128} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && form.confirmPassword && form.password === form.confirmPassword && (
                      <p className="text-xs text-green-600 mt-0.5">✓ Senhas coincidem</p>
                    )}
                  </Field>
                </div>
              </div>

              {/* Admin privilege — only super-admin sees this */}
              {isSuperAdmin && (
                <div className="border-t border-slate-100 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="isAdmin" checked={form.isAdmin}
                      onChange={handleChange}
                      className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500" />
                    <div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-purple-700 transition-colors flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Conceder privilégios de Administrador
                      </span>
                      <p className="text-xs text-slate-400">
                        Administradores têm acesso total ao painel de gestão.
                      </p>
                    </div>
                  </label>
                  {isEdit && item?.isAdmin && !form.isAdmin && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Ao salvar, os privilégios de administrador serão removidos deste usuário.
                    </p>
                  )}
                </div>
              )}

              {/* Non-super-admin info */}
              {!isSuperAdmin && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    Apenas o Administrador Supremo pode conceder ou remover privilégios administrativos.
                  </p>
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
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3 bg-slate-50 flex-shrink-0">
          <button onClick={onClose} disabled={loading}
            className="px-5 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition-all font-medium disabled:opacity-50 text-sm">
            Cancelar
          </button>
          <button
            type={isDelete ? 'button' : 'submit'}
            form={isDelete ? undefined : 'userForm'}
            onClick={isDelete ? handleSubmit : undefined}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-white font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 text-sm ${
              isDelete ? 'bg-red-600 hover:bg-red-700' :
              isReset  ? 'bg-amber-500 hover:bg-amber-600' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /><span>Processando...</span></>
            ) : isDelete ? (
              <><Trash2 className="w-4 h-4" /><span>Excluir</span></>
            ) : isReset ? (
              <><Key className="w-4 h-4" /><span>Redefinir Senha</span></>
            ) : isCreate ? (
              <><Plus className="w-4 h-4" /><span>Criar Usuário</span></>
            ) : (
              <><Save className="w-4 h-4" /><span>Salvar Alterações</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
