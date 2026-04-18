// certificates/generator/index.js
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Certificate from '../../models/Certificate.js';
import Usuario from '../../models/User.js';
import Torneio from '../../models/Torneio.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template HTML do certificado
const getCertificateHTML = (data) => {
  const { userName, tournamentName, position, score, disciplina, certificateCode, date } = data;

  // Determinar medalha e mensagem baseada na posição
  const getMedalInfo = (pos) => {
    switch(pos) {
      case 1:
        return {
          medal: '🥇',
          color: '#D9A900',
          text: 'OURO',
          positionText: '1ª posição',
          achievementTitle: 'Campeão Absoluto'
        };
      case 2:
        return {
          medal: '🥈',
          color: '#B1B5BB',
          text: 'PRATA',
          positionText: '2ª posição',
          achievementTitle: 'Vice-Campeão'
        };
      case 3:
        return {
          medal: '🥉',
          color: '#A06A3C',
          text: 'BRONZE',
          positionText: '3ª posição',
          achievementTitle: 'Terceiro Lugar'
        };
      default:
        return {
          medal: '🏅',
          color: '#2563EB',
          text: 'PARTICIPAÇÃO',
          positionText: `${pos}ª posição`,
          achievementTitle: 'Participante de Elite'
        };
    }
  };

  const medalInfo = getMedalInfo(position);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificado Oficial COMAES</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@400;600;700&family=Libre+Baskerville:ital@1&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      color: #0f172a;
      padding: 0;
    }

    .certificate-sheet {
      width: 297mm;
      height: 210mm;
      padding: 12mm;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
      position: relative;
    }

    .certificate-frame {
      width: 100%;
      height: 100%;
      border: 12px solid #111827;
      padding: 14px;
      background: #fff;
      position: relative;
      overflow: hidden;
    }

    .certificate-inner {
      width: 100%;
      height: 100%;
      border: 2px solid rgba(15, 23, 42, 0.08);
      padding: 36px 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%);
      position: relative;
      z-index: 1;
    }

    .certificate-accent {
      position: absolute;
      top: 32px;
      left: 32px;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: rgba(59,130,246,0.08);
      z-index: 0;
    }

    .certificate-accent.secondary {
      right: 32px;
      left: auto;
      top: 80px;
      width: 180px;
      height: 180px;
      background: rgba(15,23,42,0.06);
    }

    .certificate-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      position: relative;
      z-index: 2;
    }

    .brand {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .brand-name {
      font-family: 'Cinzel', serif;
      font-size: 34px;
      letter-spacing: -1px;
      font-weight: 900;
      color: #111827;
    }

    .brand-tagline {
      font-size: 9px;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: #475569;
      font-weight: 700;
    }

    .certificate-label {
      align-self: flex-end;
      font-size: 10px;
      color: #64748b;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      font-weight: 700;
    }

    .certificate-title {
      margin-top: 18px;
      font-family: 'Cinzel', serif;
      font-size: 24px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #1e293b;
      font-weight: 700;
      text-align: center;
    }

    .certificate-subtitle {
      margin-top: 10px;
      text-align: center;
      font-size: 14px;
      color: #475569;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 600;
    }

    .certificate-body {
      margin-top: 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 24px;
      position: relative;
      z-index: 2;
    }

    .intro-text {
      font-family: 'Libre Baskerville', serif;
      font-style: italic;
      font-size: 18px;
      color: #475569;
      max-width: 720px;
    }

    .recipient-name {
      font-family: 'Cinzel', serif;
      font-size: 52px;
      line-height: 1;
      color: #0f172a;
      font-weight: 900;
    }

    .achievement-description {
      max-width: 760px;
      font-size: 16px;
      line-height: 1.8;
      color: #334155;
    }

    .achievement-description strong {
      color: #111827;
      font-weight: 700;
    }

    .details-grid {
      margin-top: 36px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      width: 100%;
      position: relative;
      z-index: 2;
    }

    .detail-card {
      background: #f8fafc;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 18px;
      padding: 18px 20px;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .detail-label {
      font-size: 9px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .detail-value {
      font-size: 18px;
      color: #0f172a;
      font-weight: 700;
      line-height: 1.2;
    }

    .detail-highlight {
      background: rgba(59,130,246,0.09);
      border-color: rgba(59,130,246,0.2);
    }

    .footer-row {
      margin-top: 42px;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr 1fr;
      gap: 18px;
      align-items: end;
      position: relative;
      z-index: 2;
    }

    .signature-block {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .signature-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      color: #64748b;
      font-weight: 700;
    }

    .signature-line {
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, rgba(15,23,42,0.1), rgba(15,23,42,0.5), rgba(15,23,42,0.1));
    }

    .seal-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .seal {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 5px solid ${medalInfo.color};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      background: rgba(255,255,255,0.88);
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
    }

    .seal-text {
      font-size: 9px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #475569;
      font-weight: 700;
    }

    .meta-block {
      display: grid;
      gap: 12px;
      background: #fff;
      border-radius: 18px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      padding: 18px 20px;
    }

    .meta-label {
      font-size: 9px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
    }

    .meta-value {
      font-size: 14px;
      color: #0f172a;
      font-weight: 700;
      line-height: 1.4;
    }

    .meta-value.mono {
      font-family: monospace;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-family: 'Cinzel', serif;
      font-size: 120px;
      color: #0f172a;
      opacity: 0.04;
      pointer-events: none;
      white-space: nowrap;
      z-index: 0;
    }

    @media print {
      body { background: #fff; }
      .certificate-sheet, .certificate-frame { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="certificate-sheet">
    <div class="certificate-frame">
      <div class="certificate-accent"></div>
      <div class="certificate-accent secondary"></div>
      <div class="certificate-inner">
        <div class="certificate-header">
          <div class="brand">
            <span class="brand-name">COMAES</span>
            <span class="brand-tagline">Elite Educacional</span>
          </div>
          <span class="certificate-label">Certificado de Excelência</span>
        </div>

        <div>
          <h1 class="certificate-title">Certificamos que</h1>
          <p class="certificate-subtitle">Reconhecimento oficial de desempenho de alto nível</p>
        </div>

        <div class="certificate-body">
          <div class="intro-text">Foi comprovado que</div>
          <div class="recipient-name">${userName}</div>
          <div class="achievement-description">
            Obteve um desempenho excepcional no torneio <strong>${tournamentName}</strong>, alcançando a <strong>${medalInfo.positionText}</strong> na disciplina de <strong>${disciplina}</strong> com uma pontuação total de <strong>${score} pontos</strong>.
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-card">
            <span class="detail-label">Disciplina</span>
            <span class="detail-value">${disciplina}</span>
          </div>
          <div class="detail-card detail-highlight">
            <span class="detail-label">Conquista</span>
            <span class="detail-value">${medalInfo.achievementTitle}</span>
          </div>
          <div class="detail-card">
            <span class="detail-label">Competição</span>
            <span class="detail-value">${tournamentName}</span>
          </div>
        </div>

        <div class="footer-row">
          <div class="signature-block">
            <span class="signature-label">Assinatura Autorizada</span>
            <div class="signature-line"></div>
          </div>

          <div class="seal-block">
            <div class="seal">${medalInfo.medal}</div>
            <span class="seal-text">${medalInfo.text}</span>
          </div>

          <div class="meta-block">
            <div>
              <span class="meta-label">Data de Emissão</span>
              <span class="meta-value">${date}</span>
            </div>
            <div>
              <span class="meta-label">Código de Verificação</span>
              <span class="meta-value mono">${certificateCode}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="watermark">COMAES</div>
    </div>
  </div>
</body>
</html>`;
};

// Função principal para gerar certificado
export const generateCertificate = async ({ userId, tournamentId, disciplina }) => {
  try {
    console.log('🎯 Iniciando geração de certificado:', { userId, tournamentId, disciplina });

    // Normalizar disciplina
    const normalizeDisciplina = (disc) => {
      if (!disc) return 'Matemática';
      const map = {
        'matema': 'Matemática',
        'math': 'Matemática',
        'ingl': 'Inglês',
        'english': 'Inglês',
        'progr': 'Programação',
        'code': 'Programação',
        'program': 'Programação'
      };
      const lower = disc.toLowerCase();
      for (const [key, val] of Object.entries(map)) {
        if (lower.includes(key)) return val;
      }
      return disc;
    };

    const disciplinaNormalizada = normalizeDisciplina(disciplina);
    console.log('📝 Disciplina normalizada:', disciplinaNormalizada);

    // Buscar participação no torneio
    const ParticipanteTorneio = (await import('../../models/ParticipanteTorneio.js')).default;
    
    // GARANTIR QUE AS ASSOCIAÇÕES ESTEJAM CONFIGURADAS
    // Se por algum motivo o setupAssociations() não foi chamado ainda (ex: script standalone ou import prematuro)
    if (!ParticipanteTorneio.associations.usuario) {
      console.log('🔗 Configurando associações sob demanda para ParticipanteTorneio...');
      ParticipanteTorneio.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      Usuario.hasMany(ParticipanteTorneio, { foreignKey: 'usuario_id', as: 'torneios' });
    }

    // FORÇAR ATUALIZAÇÃO DO RANKING ANTES DE VERIFICAR POSIÇÃO
    console.log(`📊 Atualizando posições para Torneio ${tournamentId} e Disciplina ${disciplinaNormalizada}...`);
    try {
      await ParticipanteTorneio.atualizarPosicoes(tournamentId, disciplinaNormalizada);
    } catch (rankErr) {
      console.warn('⚠️ Erro ao atualizar posições (não crítico):', rankErr.message);
    }

    const participation = await ParticipanteTorneio.findOne({
      where: {
        usuario_id: userId,
        torneio_id: tournamentId,
        disciplina_competida: disciplinaNormalizada,
        status: 'confirmado'
      },
      include: [
        { model: Usuario, as: 'usuario' }
      ]
    });

    if (!participation) {
      console.warn('❌ Participação não encontrada:', { userId, tournamentId, disciplinaNormalizada });
      return { success: false, error: 'Participação não encontrada. Certifique-se de que terminou o torneio.' };
    }

    console.log('✅ Participação encontrada:', { posicao: participation.posicao, pontuacao: participation.pontuacao });

    // Verificar se está no top 3
    if (participation.posicao > 3) {
      console.warn('❌ Posição fora do top 3:', participation.posicao);
      return { success: false, error: `Certificado disponível apenas para os 3 primeiros colocados. Sua posição: ${participation.posicao}` };
    }

    // Criar/Atualizar registro do certificado
    const certificateCode = `CERT-${uuidv4().substring(0, 8).toUpperCase()}`;
    let certificate = await Certificate.findOne({
      where: {
        user_id: userId,
        tournament_id: tournamentId,
        disciplina: disciplinaNormalizada
      }
    });

    if (!certificate) {
      certificate = await Certificate.create({
        user_id: userId,
        tournament_id: tournamentId,
        score: participation.pontuacao,
        ranking_position: participation.posicao,
        certificate_code: certificateCode,
        certificate_url: '',
        disciplina: disciplinaNormalizada
      });
      console.log('✅ Novo certificado criado:', certificate.id);
    } else {
      console.log('✅ Certificado existente encontrado:', certificate.id);
    }

    // Buscar dados completos com relacionamentos
    certificate = await Certificate.findOne({
      where: {
        id: certificate.id
      },
      include: [
        { model: Usuario, as: 'user' },
        { model: Torneio, as: 'tournament' }
      ]
    });

    if (!certificate) {
      return { success: false, error: 'Certificado não encontrado após criação' };
    }

    // Preparar dados para o template
    const certificateData = {
      userName: certificate.user?.nome || 'Participante',
      tournamentName: certificate.tournament?.titulo || 'Torneio COMAES',
      position: certificate.ranking_position,
      score: certificate.score,
      disciplina: certificate.disciplina,
      certificateCode: certificate.certificate_code,
      date: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    };

    // Gerar HTML
    const htmlContent = getCertificateHTML(certificateData);

    // Garantir que o diretório de uploads existe
    const uploadsDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Gerar PDF com Puppeteer
    let browser;
    try {
      console.log('🖨️  Iniciando Puppeteer...');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
      });

      const page = await browser.newPage();
      console.log('📄 Página criada, carregando conteúdo HTML...');
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Configurar página para formato A4
      await page.setViewport({ width: 794, height: 1123 });

      const fileName = `certificado-${certificate.id}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      console.log('📝 Gerando PDF em:', filePath);
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      await browser.close();
      console.log('✅ PDF gerado com sucesso');

      // Verificar se arquivo foi criado
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo PDF não foi criado em: ${filePath}`);
      }

      // Atualizar URL do certificado no banco
      const certificateURL = `/uploads/certificates/${fileName}`;
      await certificate.update({ certificate_url: certificateURL });

      console.log('✅ Certificado gerado com sucesso:', filePath);

      return {
        success: true,
        certificateURL,
        certificateCode: certificate.certificate_code,
        fileName,
        position: certificate.ranking_position
      };
    } catch (pdfError) {
      console.error('❌ Erro ao gerar PDF:', pdfError.message);
      if (browser) {
        await browser.close().catch(() => {});
      }
      throw pdfError;
    }
  } catch (error) {
    console.error('❌ Erro ao gerar certificado:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return { success: false, error: error.message || 'Erro ao gerar certificado' };
  }
};
export const generateCertificateRoute = async (req, res) => {
  try {
    const { userId, tournamentId, disciplina } = req.body;

    if (!userId || !tournamentId || !disciplina) {
      return res.status(400).json({
        success: false,
        error: 'User ID, Tournament ID e disciplina são obrigatórios'
      });
    }

    // Verificar se usuário está autenticado
    if (!req.user && !req.body.token) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const result = await generateCertificate({ userId, tournamentId, disciplina });

    if (result.success) {
      res.json({
        success: true,
        certificateURL: result.certificateURL,
        certificateCode: result.certificateCode,
        position: result.position
      });
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Erro na rota de geração de certificado:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};