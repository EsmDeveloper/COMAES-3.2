// certificates/generator/index.js
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Certificate from '../../models/Certificate.js';
import Usuario from '../../models/User.js';
import Torneio from '../../models/Torneio.js';
import ParticipanteTorneio from '../../models/ParticipanteTorneio.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template HTML do certificado
const getCertificateHTML = (data) => {
  const {
    userName,
    tournamentName,
    position,
    scorePercent,
    disciplina,
    certificateCode,
    date,
    totalParticipants,
    percentile,
    logoDataUri,
  } = data;

  const getRankText = (pos) => {
    return pos + "º LUGAR";
  };

  return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado COMAES - ${userName}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page {
            size: A4 landscape;
            margin: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            background: #f6f4ee;
            width: 297mm;
            height: 210mm;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .certificate {
            font-family: Georgia, 'Times New Roman', serif;
            background: #f7f5ef;
            position: relative;
            width: 297mm;
            height: 210mm;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            color: #1a1a1a;
            border: 1px solid #d5d1c8;
        }

        .watermark {
            position: absolute;
            inset: 0;
            overflow: hidden;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            padding: 10px;
            z-index: 0;
            pointer-events: none;
            color: #2055a8;
            opacity: 0.085;
            font-weight: 600;
            font-size: 11px;
            letter-spacing: 0.2em;
            line-height: 2.8;
        }

        .border-outer {
            position: absolute;
            inset: 0;
            border: 7mm solid #1e3a8a;
            z-index: 5;
        }

        .border-inner {
            position: absolute;
            inset: 8mm;
            border: 0.6mm solid #7cb4dd;
            z-index: 5;
        }

        .corner {
            position: absolute;
            width: 25mm;
            height: 25mm;
            background: linear-gradient(135deg, #2a73d5 0%, #7ec3ea 100%);
            z-index: 6;
        }

        .corner-tl { top: 0; left: 0; clip-path: polygon(0 0, 100% 0, 100% 24%, 24% 24%, 24% 100%, 0 100%); }
        .corner-tr { top: 0; right: 0; clip-path: polygon(0 0, 100% 0, 100% 100%, 76% 100%, 76% 24%, 0 24%); }
        .corner-bl { bottom: 0; left: 0; clip-path: polygon(0 0, 24% 0, 24% 76%, 100% 76%, 100% 100%, 0 100%); }
        .corner-br { bottom: 0; right: 0; clip-path: polygon(76% 0, 100% 0, 100% 100%, 0 100%, 0 76%, 76% 76%); }

        .layout {
            position: relative;
            z-index: 2;
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 14mm 26mm 0;
        }

        .header { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .dots { color: #87b8dd; letter-spacing: 0.25em; font-size: 10px; margin-bottom: 3.5mm; }
        
        .seal {
            width: 24mm;
            height: 24mm;
            background: white;
            border-radius: 50%;
            border: 2px solid #1a3a6b;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 4mm;
            font-size: 36px;
        }

        .title {
            font-size: 24px;
            font-weight: 800;
            color: #1a3a6b;
            text-transform: uppercase;
            line-height: 1.2;
        }

        .subtitle {
            font-size: 10.5mm;
            font-weight: 600;
            color: #1a3a6b;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            margin-top: 1.2mm;
        }

        .body {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 5mm 0;
        }

        .intro { font-size: 7.2mm; color: #222; }
        .userName { 
            font-size: 16mm; 
            font-weight: 800; 
            color: #1a3a6b; 
            text-transform: uppercase;
            margin: 2.5mm 0;
        }
        .achievement { font-size: 9mm; color: #222; }
        
        .divider { 
            width: 140mm; 
            height: 0.5mm; 
            background: #1a3a6b; 
            margin: 4mm 0; 
            opacity: 0.6;
        }

        .metrics { font-size: 8.4mm; line-height: 1.45; }
        .date { font-size: 8.6mm; margin-top: 5mm; color: #222; }

        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-bottom: 8mm;
        }

        .qr-placeholder {
            width: 21mm;
            height: 21mm;
            border: 1px solid #1a3a6b;
            padding: 2mm;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 7px;
            color: #999;
             text-align: center;
        }

        .signature { text-align: center; width: 88mm; }
        .sig-line { height: 0.4mm; background: #333; margin-bottom: 3mm; }
        .sig-name { font-size: 9mm; font-weight: 700; color: #1a3a6b; text-transform: uppercase; }
        .sig-title { font-size: 7mm; color: #222; }

        .bottom-bar {
            background: transparent;
            width: 100%;
            padding: 2.5mm 0;
            text-align: center;
            color: #222;
            font-size: 6.2mm;
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            border-top: 0.4mm solid #1e3a8a;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="watermark">
            ${Array(400).fill('COMAES ').join(' ')}
        </div>
        
        <div class="border-outer"></div>
        <div class="border-inner"></div>
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>

        <div class="layout">
            <div class="header">
                <div class="dots">................................................................................................</div>
                <div class="seal">
                  ${logoDataUri ? `<img src="${logoDataUri}" alt="COMAES" style="width:100%;height:100%;object-fit:contain;" />` : '🏆'}
                </div>
                <h1 class="title">CERTIFICADO DE RECONHECIMENTO ACADÉMICO</h1>
                <p class="subtitle">PLATAFORMA COMAES</p>
            </div>

            <div class="body">
                <p class="intro">A Plataforma COMAES certifica que, em Luanda,</p>
                <h2 class="userName">${userName}</h2>
                <p class="achievement">
                    Alcançou o <strong>${getRankText(position)}</strong> no Torneio Académico COMAES 2026.
                </p>
                
                <div class="divider"></div>
                
                <div class="metrics">
                    <p>Total de Participantes: <strong>${totalParticipants}</strong></p>
                    <p>Pontuação Final: <strong>${scorePercent}%</strong></p>
                    <p>Percentil: <strong>${percentile}%</strong></p>
                </div>
                
                <p class="date">Emitido aos ${date}.</p>
            </div>

            <div class="footer">
                <div class="qr-placeholder">
                    CÓDIGO QR<br>DE VALIDAÇÃO
                </div>
                
                <div class="signature">
                    <div class="sig-line"></div>
                    <p class="sig-name">PROF. DR. ANTÓNIO SILVA</p>
                    <p class="sig-title">Diretor de Avaliação e Desempenho</p>
                </div>
            </div>
        </div>

        <div class="bottom-bar">
            Código de Verificação: <span style="font-weight: bold;">${certificateCode}</span> | Validar em: <span style="font-style: italic;">plataformacomaes.com/validar</span>
        </div>
    </div>
</body>
</html>`;
};

// Função principal para gerar certificado
export const generateCertificate = async ({ userId, tournamentId, disciplina }) => {
  try {
    console.log('[TARGET] Iniciando geração de certificado:', { userId, tournamentId, disciplina });

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

    // GARANTIR QUE AS ASSOCIAÇÕES ESTEJAM CONFIGURADAS
    // Se por algum motivo o setupAssociations() não foi chamado ainda (ex: script standalone ou import prematuro)
    if (!ParticipanteTorneio.associations.usuario) {
      console.log('🔗 Configurando associações sob demanda para ParticipanteTorneio...');
      ParticipanteTorneio.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      Usuario.hasMany(ParticipanteTorneio, { foreignKey: 'usuario_id', as: 'torneios' });
    }

    // FORÇAR ATUALIZAÇÃO DO RANKING ANTES DE VERIFICAR POSIÇÃO
    console.log(`[CHART] Atualizando posições para Torneio ${tournamentId} e Disciplina ${disciplinaNormalizada}...`);
    try {
      await ParticipanteTorneio.atualizarPosicoes(tournamentId, disciplinaNormalizada);
    } catch (rankErr) {
      console.warn('[WARNING] Erro ao atualizar posições (não crítico):', rankErr.message);
    }

    let participation = await ParticipanteTorneio.findOne({
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

    // Fallback defensivo: aceita participação existente com outro status,
    // retornando erro mais claro caso não esteja confirmada.
    if (!participation) {
      const fallbackParticipation = await ParticipanteTorneio.findOne({
        where: {
          usuario_id: userId,
          torneio_id: tournamentId,
          disciplina_competida: disciplinaNormalizada,
        },
        include: [{ model: Usuario, as: 'usuario' }],
      });

      if (fallbackParticipation) {
        return {
          success: false,
          statusCode: 403,
          error: `Participacao encontrada, mas com status "${fallbackParticipation.status}". Necessario status "confirmado" para gerar certificado.`,
        };
      }
    }

    if (!participation) {
      console.warn('[ERROR] Participação não encontrada:', { userId, tournamentId, disciplinaNormalizada });
      return { success: false, statusCode: 404, error: 'Participação não encontrada para este torneio/disciplina.' };
    }

    console.log('[SUCCESS] Participação encontrada:', { posicao: participation.posicao, pontuacao: participation.pontuacao });

    // Verificar se está no top 3
    if (Number(participation.posicao) > 3) {
      console.warn('[ERROR] Posição fora do top 3:', participation.posicao);
      return {
        success: false,
        statusCode: 403,
        error: `Certificado disponível apenas para os 3 primeiros colocados. Sua posição: ${participation.posicao}`,
      };
    }

    const totalParticipants = await ParticipanteTorneio.count({
      where: {
        torneio_id: tournamentId,
        disciplina_competida: disciplinaNormalizada,
        status: 'confirmado',
      },
    });

    const safeTotalParticipants = Math.max(1, Number(totalParticipants) || 1);
    const safePosition = Math.max(1, Number(participation.posicao) || 1);
    const percentile = Number(((1 - (safePosition - 1) / safeTotalParticipants) * 100).toFixed(1));
    const scoreRaw = Number(participation.pontuacao) || 0;
    const scorePercent = Number(Math.max(0, Math.min(100, scoreRaw)).toFixed(1));

    // Criar/Atualizar registro do certificado
    const certificateCode = `CERT-${uuidv4().substring(0, 8).toUpperCase()}`;
    let certificate = await Certificate.findOne({
      where: {
        usuario_id: userId,  // ← Corrigido para usar o nome da coluna no banco
        torneio_id: tournamentId,  // ← Corrigido para usar o nome da coluna no banco
        disciplina: disciplinaNormalizada
      }
    });

    if (!certificate) {
      certificate = await Certificate.create({
        usuario_id: userId,  // ← Corrigido para usar o nome da coluna no banco
        torneio_id: tournamentId,  // ← Corrigido para usar o nome da coluna no banco
        pontuacao: participation.pontuacao,  // ← Corrigido
        posicao: participation.posicao,  // ← Corrigido
        codigo_verificacao: certificateCode,  // ← Corrigido
        url_certificado: '',  // ← Corrigido
        disciplina: disciplinaNormalizada
      });
      console.log('[SUCCESS] Novo certificado criado:', certificate.id);
    } else {
      console.log('[SUCCESS] Certificado existente encontrado:', certificate.id);
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
      return { success: false, statusCode: 500, error: 'Certificado não encontrado após criação' };
    }

    const logoCandidates = [
      path.join(__dirname, '../../../FrontEnd/src/assets/vite1.png'),
      path.join(__dirname, '../../../frontend/src/assets/vite1.png'),
    ];
    let logoDataUri = '';
    for (const candidate of logoCandidates) {
      if (fs.existsSync(candidate)) {
        const logoBuffer = fs.readFileSync(candidate);
        logoDataUri = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        break;
      }
    }

    // Preparar dados para o template
    const certificateData = {
      userName: certificate.user?.nome || 'Participante',
      tournamentName: certificate.tournament?.titulo || 'Torneio COMAES',
      position: certificate.posicao,  // ← Corrigido
      scorePercent,
      scoreRaw,
      disciplina: certificate.disciplina,
      certificateCode: certificate.codigo_verificacao,  // ← Corrigido
      totalParticipants: safeTotalParticipants,
      percentile,
      logoDataUri,
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
      console.log('  Iniciando Puppeteer...');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
      });

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(120000);
      page.setDefaultTimeout(120000);
      console.log('📄 Página criada, carregando conteúdo HTML...');
      
      // Evita timeout em produção quando recursos externos atrasam.
      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      });
      
      // Configurar página para formato A4 Landscape
      await page.setViewport({ width: 1123, height: 794 });

      const fileName = `certificado-${certificate.id}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      console.log('📝 Gerando PDF em:', filePath);
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        landscape: true,
        printBackground: true,
      });

      await browser.close();
      console.log('[SUCCESS] PDF gerado com sucesso');

      // Verificar se arquivo foi criado
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo PDF não foi criado em: ${filePath}`);
      }

      // Atualizar URL do certificado no banco
      const certificateURL = `/uploads/certificates/${fileName}`;
      await certificate.update({ url_certificado: certificateURL });  // ← Corrigido

      console.log('[SUCCESS] Certificado gerado com sucesso:', filePath);

      return {
        success: true,
        certificateURL,
        certificateCode: certificate.codigo_verificacao,  // ← Corrigido
        fileName,
        position: certificate.posicao,  // ← Corrigido
        totalParticipants: safeTotalParticipants,
        percentile,
        scoreRaw,
        scorePercent,
        disciplina: disciplinaNormalizada,
      };
    } catch (pdfError) {
      console.error('[ERROR] Erro ao gerar PDF:', pdfError.message);
      if (browser) {
        await browser.close().catch(() => {});
      }
      throw pdfError;
    }
  } catch (error) {
    console.error('[ERROR] Erro ao gerar certificado:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return { success: false, statusCode: 500, error: error.message || 'Erro ao gerar certificado' };
  }
};
export const generateCertificateRoute = async (req, res) => {
  try {
    // Verificar se usuário está autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const userId = req.user.id;
    const { tournamentId, disciplina } = req.body;

    if (!tournamentId || !disciplina) {
      return res.status(400).json({
        success: false,
        error: 'Tournament ID e disciplina são obrigatórios'
      });
    }

    const result = await generateCertificate({ userId, tournamentId, disciplina });

    if (result.success) {
      res.json({
        success: true,
        certificateURL: result.certificateURL,
        certificateCode: result.certificateCode,
        position: result.position,
        totalParticipants: result.totalParticipants,
        percentile: result.percentile,
        scoreRaw: result.scoreRaw,
        scorePercent: result.scorePercent,
        disciplina: result.disciplina,
      });
    } else {
      res.status(result.statusCode || 400).json({
        success: false,
        error: result.error || 'Erro ao gerar certificado',
      });
    }

  } catch (error) {
    console.error('Erro na rota de geração de certificado:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
};