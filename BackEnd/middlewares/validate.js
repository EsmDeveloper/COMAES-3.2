/**
 * validate.js — Centralized backend validation middleware
 *
 * Usage:
 *   import { validate, rules } from '../middlewares/validate.js';
 *   router.post('/route', validate(rules.register), handler);
 *
 * Each rule set is an array of { field, checks[] } objects.
 * A check is { fn: (value) => bool, msg: string }.
 */

// ─── Regex (mirrors frontend validators.js) ───────────────────
const RE = {
  name:       /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,100}$/,
  email:      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/,
  phoneLocal: /^9[1-9]\d{7}$/,
  phoneIntl:  /^\+2449[1-9]\d{7}$/,
  username:   /^[a-zA-Z0-9_-]{3,30}$/,
  dangerous:  /[<>{};'"\\]/,
};

// ─── Primitive checks ─────────────────────────────────────────
const isEmpty  = (v) => v === undefined || v === null || String(v).trim() === '';
const isString = (v) => typeof v === 'string';
const hasDanger= (v) => isString(v) && RE.dangerous.test(v);

// ─── Rule builders ────────────────────────────────────────────
export const r = {
  required:  (msg = 'Campo obrigatório.')                => (v) => !isEmpty(v)          || msg,
  minLen:    (n, msg)                                    => (v) => !isString(v) || v.trim().length >= n || (msg || `Mínimo de ${n} caracteres.`),
  maxLen:    (n, msg)                                    => (v) => !isString(v) || v.trim().length <= n || (msg || `Máximo de ${n} caracteres.`),
  email:     (msg = 'O e-mail informado é inválido.')    => (v) => isEmpty(v) || RE.email.test(String(v).trim().toLowerCase()) || msg,
  password:  (msg = 'A senha deve ter no mínimo 8 caracteres, maiúscula, minúscula, número e símbolo.') => (v) => isEmpty(v) || RE.password.test(v) || msg,
  phone:     (msg = 'O telefone deve ter 9 dígitos válidos começando com 9.') => (v) => isEmpty(v) || RE.phoneLocal.test(String(v).trim()) || RE.phoneIntl.test(String(v).trim()) || msg,
  name:      (msg = 'O nome deve conter apenas letras e espaços (2–100 caracteres).') => (v) => isEmpty(v) || (RE.name.test(String(v).trim()) && !/\d/.test(String(v))) || msg,
  username:  (msg = 'O username pode conter apenas letras, números, _ e - (3–30 caracteres).') => (v) => isEmpty(v) || RE.username.test(String(v).trim()) || msg,
  noScript:  (msg = 'O campo contém caracteres inválidos.')  => (v) => isEmpty(v) || !hasDanger(v) || msg,
  noSql:     (msg = 'O campo contém caracteres inválidos.')  => (v) => isEmpty(v) || !/(\bSELECT\b|\bDROP\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|--|;)/i.test(String(v)) || msg,
  date:      (msg = 'Data inválida.')                        => (v) => isEmpty(v) || !isNaN(new Date(v).getTime()) || msg,
  futureDate:(msg = 'A data não pode ser anterior ao horário atual.') => (v) => isEmpty(v) || new Date(v) >= new Date() || msg,
  number:    (msg = 'Deve ser um número válido.')            => (v) => isEmpty(v) || !isNaN(Number(v)) || msg,
  min:       (n, msg)                                        => (v) => isEmpty(v) || Number(v) >= n || (msg || `Valor mínimo: ${n}.`),
  max:       (n, msg)                                        => (v) => isEmpty(v) || Number(v) <= n || (msg || `Valor máximo: ${n}.`),
  oneOf:     (arr, msg)                                      => (v) => isEmpty(v) || arr.includes(v) || (msg || `Valor inválido. Opções: ${arr.join(', ')}.`),
};

// ─── Rule sets ────────────────────────────────────────────────
export const rules = {
  register: [
    { field: 'nome',       checks: [r.required('O nome é obrigatório.'), r.name(), r.noScript(), r.noSql()] },
    { field: 'email',      checks: [r.required('O e-mail é obrigatório.'), r.email(), r.maxLen(254)] },
    { field: 'telefone',   checks: [r.required('O telefone é obrigatório.'), r.phone()] },
    { field: 'password',   checks: [r.required('A senha é obrigatória.'), r.password()] },
    { field: 'nascimento', checks: [r.required('A data de nascimento é obrigatória.'), r.date()] },
    { field: 'sexo',       checks: [r.required('O sexo é obrigatório.'), r.oneOf(['Masculino', 'Feminino'])] },
  ],

  login: [
    { field: 'usuario', checks: [r.required('O usuário é obrigatório.'), r.noScript(), r.noSql()] },
    { field: 'senha',   checks: [r.required('A senha é obrigatória.')] },
  ],

  passwordRecover: [
    { field: 'email', checks: [r.required('O e-mail é obrigatório.'), r.email()] },
  ],

  passwordReset: [
    { field: 'token',    checks: [r.required('Token inválido.')] },
    { field: 'novaSenha',checks: [r.required('A nova senha é obrigatória.'), r.password()] },
  ],

  updateProfile: [
    { field: 'nome',      checks: [r.name(), r.noScript(), r.noSql(), r.maxLen(100)] },
    { field: 'email',     checks: [r.email(), r.maxLen(254)] },
    { field: 'biografia', checks: [r.maxLen(300), r.noScript()] },
  ],

  supportTicket: [
    { field: 'assunto',  checks: [r.required('O assunto é obrigatório.'), r.minLen(5), r.maxLen(120), r.noScript(), r.noSql()] },
    { field: 'mensagem', checks: [r.required('A mensagem é obrigatória.'), r.minLen(10), r.maxLen(2000), r.noScript(), r.noSql()] },
  ],

  createTournament: [
    { field: 'titulo',    checks: [r.required('O título é obrigatório.'), r.minLen(3), r.maxLen(200), r.noScript(), r.noSql()] },
    { field: 'inicia_em', checks: [r.required('A data de início é obrigatória.'), r.date(), r.futureDate('A data de início não pode ser anterior ao horário atual.')] },
    { field: 'termina_em',checks: [r.required('A data de término é obrigatória.'), r.date(), r.futureDate('A data de término não pode ser anterior ao horário atual.')] },
  ],

  updateSettings: [
    { field: 'conta.email',    checks: [r.email(), r.maxLen(254)] },
    { field: 'conta.telefone', checks: [r.phone()] },
  ],
};

// ─── Middleware factory ───────────────────────────────────────
/**
 * @param {Array} ruleSet — array of { field, checks[] }
 * @param {{ strict?: boolean }} opts
 *   strict: if true, reject any extra fields not in ruleSet (default false)
 */
export function validate(ruleSet, opts = {}) {
  return (req, res, next) => {
    const errors = {};

    for (const { field, checks } of ruleSet) {
      // Support nested fields like 'conta.email'
      const value = field.split('.').reduce((obj, key) => obj?.[key], req.body);

      for (const check of checks) {
        const result = check(value);
        if (result !== true) {
          errors[field] = result; // first failing check wins
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        success: false,
        error: 'Verifique os campos do formulário.',
        fieldErrors: errors,
      });
    }

    next();
  };
}

export default validate;
