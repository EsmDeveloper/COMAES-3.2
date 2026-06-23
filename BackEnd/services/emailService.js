/**
 * emailService.js
 * Serviço centralizado de envio de emails via Nodemailer (Gmail SMTP)
 * Inclui: recuperação de senha, boas-vindas, nova notícia publicada
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// ─── Diagnóstico ───────────────────────────────────────────────────────────
const REQUIRED = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];

export const getEmailDiagnostics = () => {
  const missing = REQUIRED.filter(k => !process.env[k]);
  return {
    configured: missing.length === 0,
    missing,
    host: process.env.EMAIL_HOST || null,
    port: process.env.EMAIL_PORT || null,
    userConfigured: Boolean(process.env.EMAIL_USER),
    passConfigured: Boolean(process.env.EMAIL_PASS),
    frontendUrl: process.env.FRONTEND_URL || null,
  };
};

(() => {
  const d = getEmailDiagnostics();
  if (!d.configured) {
    console.warn('[email] Configuração SMTP incompleta:', d.missing);
  } else {
    console.log('[email] SMTP pronto:', { host: d.host, port: d.port, user: process.env.EMAIL_USER });
  }
})();

// ─── Transporter (singleton lazy) ──────────────────────────────────────────
let _transporterPromise = null;

const getTransporter = async () => {
  if (_transporterPromise) return _transporterPromise;

  const d = getEmailDiagnostics();
  if (!d.configured) {
    throw new Error(`SMTP incompleto. Faltam: ${d.missing.join(', ')}`);
  }

  _transporterPromise = (async () => {
    const t = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT || 587),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls:    { rejectUnauthorized: false },
    });
    await t.verify();
    console.log('[email] Conexão SMTP verificada.');
    return t;
  })().catch(err => {
    _transporterPromise = null;
    console.error('[email] Falha ao inicializar SMTP:', err.message);
    throw err;
  });

  return _transporterPromise;
};

// ─── Envio base ─────────────────────────────────────────────────────────────
const send = async ({ to, subject, html, tag = 'email' }) => {
  const t    = await getTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  console.log(`[email] Enviando "${tag}" → ${to}`);
  const info = await t.sendMail({ from: `"COMAES" <${from}>`, to, subject, html });
  console.log(`[email] Enviado (${tag}):`, info.messageId);
  return info;
};

// ─── CSS base compartilhado ─────────────────────────────────────────────────
const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #f8fafc;
`;
const cardStyle = `
  background: #ffffff;
  border-radius: 12px;
  padding: 32px 28px;
  margin: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  border: 1px solid #e2e8f0;
`;
const btnStyle = (color = '#2563eb') => `
  display: inline-block;
  padding: 14px 32px;
  background: ${color};
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.3px;
`;
const footerStyle = `
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  padding: 16px 20px;
`;
const headerHtml = `
  <div style="text-align:center; padding: 28px 20px 4px;">
    <span style="font-size:26px; font-weight:800; color:#2563eb; letter-spacing:-0.5px;">COMAES</span>
    <p style="margin:4px 0 0; color:#64748b; font-size:13px;">Plataforma Educacional</p>
  </div>
`;

// ─── 1. Email de recuperação de senha ───────────────────────────────────────
export const sendResetEmail = async (email, token) => {
  const url  = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/redefinir-senha?token=${token}`;
  const html = `
<div style="${baseStyle}">
  ${headerHtml}
  <div style="${cardStyle}">
    <h2 style="color:#1e293b;font-size:20px;margin:0 0 12px;text-align:center;">
      🔒 Recuperação de Senha
    </h2>
    <p style="color:#475569;line-height:1.7;margin:0 0 12px;">
      Olá! Recebemos um pedido de redefinição de senha para a sua conta COMAES.
    </p>
    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
      Clique no botão abaixo para definir uma nova senha. <strong>Este link expira em 1 hora.</strong>
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${url}" style="${btnStyle()}">Redefinir Senha</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:20px 0 0;">
      Se não solicitou este email, pode ignorá-lo com segurança.
    </p>
  </div>
  <div style="${footerStyle}">
    <p>© ${new Date().getFullYear()} COMAES · Este é um email automático, não responda.</p>
  </div>
</div>`;

  const info = await send({ to: email, subject: '🔒 Recuperação de Senha — COMAES', html, tag: 'reset-password' });
  return { success: true, messageId: info.messageId };
};

// ─── 2. Email de boas-vindas (pós-registo) ──────────────────────────────────
export const sendWelcomeEmail = async (email, nome) => {
  const url  = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
  const html = `
<div style="${baseStyle}">
  ${headerHtml}
  <div style="${cardStyle}">
    <h2 style="color:#1e293b;font-size:20px;margin:0 0 12px;text-align:center;">
      🎉 Bem-vindo(a) ao COMAES, ${nome}!
    </h2>
    <p style="color:#475569;line-height:1.7;margin:0 0 12px;">
      A sua conta foi criada com sucesso. Estamos muito felizes em tê-lo(a) connosco!
    </p>
    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
      Participe dos torneios educativos, acompanhe o seu progresso e evolua na plataforma.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${url}" style="${btnStyle('#10b981')}">Aceder à Plataforma</a>
    </div>
  </div>
  <div style="${footerStyle}">
    <p>© ${new Date().getFullYear()} COMAES · Este é um email automático, não responda.</p>
  </div>
</div>`;

  const info = await send({ to: email, subject: '🎉 Bem-vindo(a) ao COMAES!', html, tag: 'welcome' });
  return { success: true, messageId: info.messageId };
};

// ─── 3. Email de nova notícia publicada ────────────────────────────────────
/**
 * sendNewsEmail — envia email de nova notícia para uma lista de destinatários
 * @param {string[]} emails    - Lista de emails dos utilizadores
 * @param {Object}  noticia    - { titulo, resumo, categoria }
 */
export const sendNewsEmail = async (emails, noticia) => {
  if (!emails || emails.length === 0) return { success: true, sent: 0 };

  const { titulo, resumo, categoria = 'novidade' } = noticia;
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/noticias`;

  const catColors = {
    novidade:    '#2563eb',
    atualizacao: '#10b981',
    evento:      '#8b5cf6',
    dica:        '#f59e0b',
  };
  const catLabels = {
    novidade:    'Novidade',
    atualizacao: 'Atualização',
    evento:      'Evento',
    dica:        'Dica',
  };
  const catEmojis = {
    novidade:    '✨',
    atualizacao: '🔄',
    evento:      '📅',
    dica:        '💡',
  };

  const color    = catColors[categoria]  || catColors.novidade;
  const catLabel = catLabels[categoria]  || 'Notícia';
  const emoji    = catEmojis[categoria]  || '📰';

  const html = `
<div style="${baseStyle}">
  ${headerHtml}
  <div style="${cardStyle}">
    <div style="text-align:center;margin-bottom:16px;">
      <span style="
        display:inline-block;
        padding:4px 14px;
        background:${color}20;
        color:${color};
        border-radius:999px;
        font-size:11px;
        font-weight:700;
        letter-spacing:0.5px;
        text-transform:uppercase;
      ">${emoji} ${catLabel}</span>
    </div>
    <h2 style="color:#1e293b;font-size:20px;margin:0 0 14px;text-align:center;line-height:1.4;">
      ${titulo}
    </h2>
    ${resumo ? `<p style="color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">${resumo}</p>` : ''}
    <div style="text-align:center;margin:24px 0;">
      <a href="${url}" style="${btnStyle(color)}">Ler Notícia</a>
    </div>
  </div>
  <div style="${footerStyle}">
    <p>© ${new Date().getFullYear()} COMAES · Este é um email automático.</p>
    <p style="margin:4px 0 0;">Recebe estes emails por ser utilizador da plataforma COMAES.</p>
  </div>
</div>`;

  let sent  = 0;
  let failed = 0;

  // Envio em lotes de 10 para evitar saturar o SMTP
  const BATCH = 10;
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(to =>
        send({ to, subject: `${emoji} Nova notícia COMAES: ${titulo}`, html, tag: 'news-broadcast' })
          .then(() => sent++)
          .catch(err => {
            failed++;
            console.error(`[email] Falha ao enviar notícia para ${to}:`, err.message);
          })
      )
    );
  }

  console.log(`[email] Broadcast de notícia concluído: ${sent} enviados, ${failed} falhas`);
  return { success: true, sent, failed };
};

export default { sendResetEmail, sendWelcomeEmail, sendNewsEmail, getEmailDiagnostics };
