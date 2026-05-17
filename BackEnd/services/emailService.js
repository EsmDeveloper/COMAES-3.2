import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_EMAIL_VARS = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];

const getEmailDiagnostics = () => {
  const missing = REQUIRED_EMAIL_VARS.filter((key) => !process.env[key]);

  return {
    configured: missing.length === 0,
    missing,
    host: process.env.EMAIL_HOST || null,
    port: process.env.EMAIL_PORT || null,
    userConfigured: Boolean(process.env.EMAIL_USER),
    passConfigured: Boolean(process.env.EMAIL_PASS),
    frontendUrl: process.env.FRONTEND_URL || null
  };
};

const logEmailDiagnostics = () => {
  const diagnostics = getEmailDiagnostics();

  if (!diagnostics.configured) {
    console.warn('[email] Configuracao incompleta:', diagnostics);
  } else {
    console.log('[email] Configuracao SMTP carregada:', {
      host: diagnostics.host,
      port: diagnostics.port,
      userConfigured: diagnostics.userConfigured,
      frontendUrl: diagnostics.frontendUrl
    });
  }
};

logEmailDiagnostics();

let transporterPromise = null;

const buildTransporter = async () => {
  const diagnostics = getEmailDiagnostics();
  if (!diagnostics.configured) {
    throw new Error(`Configuracao SMTP incompleta. Variaveis em falta: ${diagnostics.missing.join(', ')}`);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  await transporter.verify();
  console.log('[email] Conexao SMTP verificada com sucesso.');
  return transporter;
};

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = buildTransporter().catch((error) => {
      transporterPromise = null;
      console.error('[email] Falha ao inicializar transporte SMTP:', error.message);
      throw error;
    });
  }

  return transporterPromise;
};

const sendEmail = async ({ to, subject, html, tag }) => {
  const transporter = await getTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  console.log(`[email] Enviando ${tag} para ${to}...`);

  const info = await transporter.sendMail({
    from: `"COMAES" <${fromAddress}>`,
    to,
    subject,
    html
  });

  console.log(`[email] ${tag} enviado com sucesso:`, {
    messageId: info.messageId,
    response: info.response
  });

  return info;
};

export const sendResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/redefinir-senha?token=${token}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Recuperacao de Senha</h2>
      <p>Ola,</p>
      <p>Recebemos um pedido de redefinicao de senha para a sua conta COMAES.</p>
      <p>Clique no botao abaixo para definir uma nova senha. Este link expira em 1 hora.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
      </div>
      <p>Se voce nao solicitou este email, basta ignorar esta mensagem.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">Equipa COMAES</p>
    </div>
  `;

  try {
    const info = await sendEmail({
      to: email,
      subject: 'Recuperacao de Senha - COMAES',
      html,
      tag: 'email de recuperacao'
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] Erro ao enviar email de recuperacao:', error.message);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, nome) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/painel`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; font-size: 28px; margin: 0;">COMAES</h1>
        <p style="color: #64748b; margin: 5px 0 0 0;">Plataforma Educacional</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Bem-vindo novamente, ${nome}!</h2>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
          O seu login na plataforma COMAES foi efetuado com sucesso.
        </p>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
          Continue a participar dos torneios educativos e acompanhe o seu progresso na plataforma.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Aceder a Minha Area
          </a>
        </div>
      </div>

      <div style="text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Este e um email automatico. Por favor, nao responda.</p>
      </div>
    </div>
  `;

  try {
    const info = await sendEmail({
      to: email,
      subject: 'Bem-vindo de volta a plataforma COMAES',
      html,
      tag: 'email de boas-vindas'
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] Erro ao enviar email de boas-vindas:', error.message);
    throw error;
  }
};

export { getEmailDiagnostics };
export default { sendResetEmail, sendWelcomeEmail, getEmailDiagnostics };
