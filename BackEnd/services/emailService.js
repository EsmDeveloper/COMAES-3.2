import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validar configuração de email
const validateEmailConfig = () => {
  const required = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Configuração de email incompleta. Variáveis faltando:', missing);
  }
};

validateEmailConfig();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: parseInt(process.env.EMAIL_PORT) === 465, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Permite conexões com certificados não confiáveis (desenvolvimento)
  }
});

// Verificar conexão do transporte
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erro ao conectar ao servidor de email:', error.message);
  } else {
    console.log('✅ Servidor de email conectado com sucesso');
  }
});

export const sendResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/redefinir-senha?token=${token}`;
  
  const mailOptions = {
    from: `"COMAES" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperação de Senha - COMAES',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-lg: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Recuperação de Senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação de redefinição de senha para a sua conta no COMAES.</p>
        <p>Clique no botão abaixo para criar uma nova senha. Este link expira em 1 hora.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Senha</a>
        </div>
        <p>Se você não solicitou isso, por favor ignore este email.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">Equipa COMAES</p>
      </div>
    `,
  };

  try {
    console.log(`📧 Tentando enviar email para: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, nome) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/painel`;

  const mailOptions = {
    from: `"COMAES" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Bem-vindo novamente à plataforma COMAES 🎉',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; font-size: 28px; margin: 0;">🎯 COMAES</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Plataforma Educacional</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Bem-vindo novamente, ${nome}! 👋</h2>

          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Seja bem-vindo novamente à plataforma COMAES!
          </p>

          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Estamos felizes em ter você conosco. Continue participando dos torneios educativos e evoluindo com a comunidade.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
              Acessar Minha Área
            </a>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin-top: 20px;">
            <h3 style="color: #334155; margin: 0 0 10px 0; font-size: 16px;">💡 Dicas para começar:</h3>
            <ul style="color: #64748b; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 5px;">Participe dos torneios ativos</li>
              <li style="margin-bottom: 5px;">Acompanhe seu progresso no dashboard</li>
              <li style="margin-bottom: 5px;">Explore as diferentes disciplinas disponíveis</li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 14px;">
          <p>Este é um email automático. Por favor, não responda.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>© 2024 COMAES - Plataforma Educacional</p>
        </div>
      </div>
    `,
  };

  try {
    console.log(`📧 Enviando email de boas-vindas para: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de boas-vindas enviado com sucesso:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error);
    throw error;
  }
};

export default { sendResetEmail, sendWelcomeEmail };