/**
 * validators.js — Sistema centralizado de validação (Frontend)
 * Todas as regras espelham as do backend para consistência total.
 * Importar e reutilizar em todos os formulários.
 */

//  Regex 
const RE = {
  name:     /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
  email:    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
  // Angola local (9 digits starting with 9): 9XXXXXXXX
  phoneLocal: /^9[1-9]\d{7}$/,
  // Angola international: +244 9XXXXXXXX
  phoneIntl:  /^\+2449[1-9]\d{7}$/,
  // Dangerous chars for XSS / injection prevention
  dangerous:  /[<>{};'"\\]/,
  // Username: letters, numbers, underscores, hyphens, 3-30 chars
  username:   /^[a-zA-Z0-9_-]{3,30}$/,
  // URL basic
  url:        /^https?:\/\/.+\..+/,
};

//  Helpers 
const ok  = ()      => ({ valid: true,  error: null });
const err = (msg)   => ({ valid: false, error: msg  });
const isEmpty = (v) => !v || /^\s*$/.test(String(v));

/** Strip dangerous HTML/script chars from a string */
export function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[<>{}]/g, '');
}

//  Individual validators 

export function validateNome(nome) {
  if (isEmpty(nome))                          return err('O nome é obrigatório.');
  const v = nome.trim();
  if (v.length < 2)                           return err('O nome deve ter pelo menos 2 caracteres.');
  if (v.length > 100)                         return err('O nome não pode ter mais de 100 caracteres.');
  if (/\d/.test(v))                           return err('O nome não pode conter números.');
  if (!RE.name.test(v))                       return err('O nome deve conter apenas letras e espaços.');
  if (RE.dangerous.test(v))                   return err('O nome contém caracteres inválidos.');
  return ok();
}

export function validateEmail(email) {
  if (isEmpty(email))                         return err('O e-mail é obrigatório.');
  const v = email.trim().toLowerCase();
  if (v.length > 254)                         return err('O e-mail é demasiado longo.');
  if (!RE.email.test(v))                      return err('O e-mail informado é inválido.');
  if (/@{2,}/.test(v))                        return err('O e-mail informado é inválido.');
  if (/^@|@$/.test(v))                        return err('O e-mail informado é inválido.');
  // Typo domains
  if (/@(gmai|gmal|gmial|hotmal|hotmial|outlok|yaho|yhoo)\.com$/i.test(v))
                                              return err('Verifique o domínio do e-mail.');
  return ok();
}

export function validatePassword(password) {
  if (isEmpty(password))                      return err('A senha é obrigatória.');
  if (password.length < 8)                    return err('A senha deve ter no mínimo 8 caracteres.');
  if (password.length > 128)                  return err('A senha não pode ter mais de 128 caracteres.');
  if (!/[a-z]/.test(password))               return err('A senha deve conter pelo menos uma letra minúscula.');
  if (!/[A-Z]/.test(password))               return err('A senha deve conter pelo menos uma letra maiúscula.');
  if (!/\d/.test(password))                  return err('A senha deve conter pelo menos um número.');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
                                              return err('A senha deve conter pelo menos um caractere especial.');
  return ok();
}

export function validatePasswordConfirm(password, confirm) {
  if (isEmpty(confirm))                       return err('A confirmação de senha é obrigatória.');
  if (password !== confirm)                   return err('As senhas não coincidem.');
  return ok();
}

export function validatePhone(phone) {
  if (isEmpty(phone))                         return err('O telefone é obrigatório.');
  const v = phone.trim().replace(/\s/g, '');
  if (RE.phoneLocal.test(v) || RE.phoneIntl.test(v)) return ok();
  return err('O telefone deve ter 9 dígitos válidos começando com 9 (ex: 923456789).');
}

export function validateBirthDate(date) {
  if (isEmpty(date))                          return err('A data de nascimento é obrigatória.');
  const d = new Date(date);
  if (isNaN(d.getTime()))                     return err('Data de nascimento inválida.');
  const now = new Date();
  if (d > now)                                return err('A data de nascimento não pode estar no futuro.');
  const age = (now - d) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 5)                                return err('Idade mínima não atingida.');
  if (age > 120)                              return err('Data de nascimento inválida.');
  return ok();
}

export function validateUsername(username) {
  if (isEmpty(username))                      return err('O username é obrigatório.');
  const v = username.trim();
  if (v.length < 3)                           return err('O username deve ter pelo menos 3 caracteres.');
  if (v.length > 30)                          return err('O username não pode ter mais de 30 caracteres.');
  if (!RE.username.test(v))                   return err('O username pode conter apenas letras, números, _ e -.');
  return ok();
}

export function validateBio(bio) {
  if (isEmpty(bio)) return ok(); // optional
  const v = bio.trim();
  if (v.length > 300)                         return err('A biografia não pode ter mais de 300 caracteres.');
  if (RE.dangerous.test(v))                   return err('A biografia contém caracteres inválidos.');
  return ok();
}

export function validateSubject(subject) {
  if (isEmpty(subject))                       return err('O assunto é obrigatório.');
  const v = subject.trim();
  if (v.length < 5)                           return err('O assunto deve ter pelo menos 5 caracteres.');
  if (v.length > 120)                         return err('O assunto não pode ter mais de 120 caracteres.');
  if (RE.dangerous.test(v))                   return err('O assunto contém caracteres inválidos.');
  return ok();
}

export function validateMessage(message) {
  if (isEmpty(message))                       return err('A mensagem é obrigatória.');
  const v = message.trim();
  if (v.length < 10)                          return err('A mensagem deve ter pelo menos 10 caracteres.');
  if (v.length > 2000)                        return err('A mensagem não pode ter mais de 2000 caracteres.');
  if (RE.dangerous.test(v))                   return err('A mensagem contém caracteres inválidos.');
  return ok();
}

export function validateTournamentDate(dateStr, label = 'A data') {
  if (isEmpty(dateStr))                       return err(`${label} é obrigatória.`);
  const d = new Date(dateStr);
  if (isNaN(d.getTime()))                     return err(`${label} é inválida.`);
  if (d < new Date())                         return err(`${label} não pode ser anterior ao horário atual.`);
  return ok();
}

export function validateTournamentDates(inicia_em, termina_em) {
  const startResult = validateTournamentDate(inicia_em, 'A data de início');
  if (!startResult.valid) return { inicia_em: startResult.error };

  const endResult = validateTournamentDate(termina_em, 'A data de término');
  if (!endResult.valid) return { termina_em: endResult.error };

  if (new Date(termina_em) <= new Date(inicia_em))
    return { termina_em: 'A data de término deve ser posterior à data de início.' };

  return {};
}

export function validateFileUpload(file, opts = {}) {
  const {
    maxSizeMB   = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  } = opts;

  if (!file) return err('Nenhum arquivo selecionado.');

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes)
    return err(`O arquivo não pode ter mais de ${maxSizeMB}MB.`);

  if (!allowedTypes.includes(file.type))
    return err(`Tipo de arquivo não permitido. Use: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}.`);

  return ok();
}

//  Batch validator 
/**
 * Run multiple field validators at once.
 * @param {Record<string, () => {valid, error}>} checks — key: field name, value: validator call
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function runValidations(checks) {
  const errors = {};
  for (const [field, fn] of Object.entries(checks)) {
    const result = fn();
    if (!result.valid) errors[field] = result.error;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

//  Legacy named exports (backward compat) 
export function validateField(field, value) {
  switch (field) {
    case 'nome':     return validateNome(value);
    case 'email':    return validateEmail(value);
    case 'password': return validatePassword(value);
    case 'phone':    return validatePhone(value);
    case 'username': return validateUsername(value);
    case 'bio':      return validateBio(value);
    default:         return ok();
  }
}

export function validateUserData(data) {
  const errors = {};
  if (data.nome     !== undefined) { const r = validateNome(data.nome);     if (!r.valid) errors.nome     = r.error; }
  if (data.email    !== undefined) { const r = validateEmail(data.email);   if (!r.valid) errors.email    = r.error; }
  if (data.password !== undefined) { const r = validatePassword(data.password); if (!r.valid) errors.password = r.error; }
  return { valid: Object.keys(errors).length === 0, errors };
}

export default {
  validateNome, validateEmail, validatePassword, validatePasswordConfirm,
  validatePhone, validateBirthDate, validateUsername, validateBio,
  validateSubject, validateMessage, validateTournamentDate, validateTournamentDates,
  validateFileUpload, runValidations, validateField, validateUserData, sanitizeText,
};
