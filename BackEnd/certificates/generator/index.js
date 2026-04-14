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
          color: '#FFD700',
          text: 'OURO',
          positionText: '1ª posição',
          message: 'Por ser CAMPEÃO absoluto deste torneio',
          congratulationMessage: 'Parabéns ao nosso grande campeão!'
        };
      case 2:
        return {
          medal: '🥈',
          color: '#C0C0C0',
          text: 'PRATA',
          positionText: '2ª posição',
          message: 'Por ser VICE-CAMPEÃO deste torneio',
          congratulationMessage: 'Excelente desempenho, chegou muito perto da vitória!'
        };
      case 3:
        return {
          medal: '🥉',
          color: '#CD7F32',
          text: 'BRONZE',
          positionText: '3ª posição',
          message: 'Por estar entre os três MELHORES deste torneio',
          congratulationMessage: 'Fantástico terceiro lugar, você foi extraordinário!'
        };
      default:
        return {
          medal: '🏅',
          color: '#4A90E2',
          text: 'PARTICIPAÇÃO',
          positionText: `${pos}ª posição`,
          message: 'Por participar neste torneio',
          congratulationMessage: 'Obrigado por participar!'
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
    <title>Certificado COMAES</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .certificate-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 60px;
            max-width: 800px;
            width: 100%;
            position: relative;
            overflow: hidden;
        }

        .certificate-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #4A90E2, #667eea, #764ba2);
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
        }

        .logo {
            font-size: 48px;
            margin-bottom: 20px;
        }

        .title {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .subtitle {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 30px;
        }

        .medal {
            font-size: 64px;
            margin: 30px 0;
        }

        .content {
            text-align: center;
            margin: 40px 0;
        }

        .recipient {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        .achievement {
            font-size: 20px;
            color: #34495e;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .congratulation {
            font-size: 18px;
            font-weight: bold;
            color: ${medalInfo.color};
            margin-bottom: 20px;
            padding: 15px;
            background: linear-gradient(135deg, rgba(${medalInfo.color === '#FFD700' ? '255,215,0' : medalInfo.color === '#C0C0C0' ? '192,192,192' : '205,127,50'},0.1), rgba(${medalInfo.color === '#FFD700' ? '255,215,0' : medalInfo.color === '#C0C0C0' ? '192,192,192' : '205,127,50'},0.05));
            border-radius: 10px;
        }

        .details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
        }

        .detail-item {
            text-align: center;
        }

        .detail-label {
            font-size: 14px;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .detail-value {
            font-size: 18px;
            font-weight: bold;

        .medal {
            font-size: 64px;
            margin: 30px 0;
        }

        .content {
            text-align: center;
            margin: 40px 0;
        }

        .recipient {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        .achievement {
            font-size: 20px;
            color: #34495e;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
        }

        .detail-item {
            text-align: center;
        }

        .detail-label {
            font-size: 14px;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .detail-value {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
        }

        .signature-section {
            margin-top: 60px;
            padding-top: 40px;
            border-top: 2px solid #ecf0f1;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .signature-left {
            flex: 1;
            text-align: center;
        }

        .signature-right {
            flex: 1;
            text-align: center;
        }

        .signature-line {
            width: 200px;
            height: 2px;
            background: #2c3e50;
            margin: 0 auto 10px;
        }

        .signature-title {
            font-size: 14px;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .signature-name {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin-top: 5px;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #95a5a6;
        }

        .certificate-code {
            margin-top: 20px;
            padding: 10px 20px;
            background: #ecf0f1;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
            color: #2c3e50;
            display: inline-block;
        }

        @media (max-width: 768px) {
            .certificate-container {
                padding: 30px;
                margin: 10px;
            }

            .title {
                font-size: 28px;
            }

            .recipient {
                font-size: 24px;
            }

            .achievement {
                font-size: 18px;
            }

            .signature-section {
                flex-direction: column;
                gap: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="header">
            <div class="logo">🎯</div>
            <h1 class="title">Certificado Oficial</h1>
            <h2 class="subtitle">Plataforma COMAES</h2>
            <div class="medal">${medalInfo.medal}</div>
        </div>

        <div class="content">
            <div class="recipient">${userName}</div>
            
            <div class="congratulation">
                ${medalInfo.congratulationMessage}
            </div>

            <div class="achievement">
                Participou do torneio <strong>"${tournamentName}"</strong> na disciplina de
                <strong>${disciplina}</strong> ${medalInfo.message}
                <span style="color: ${medalInfo.color}; font-weight: bold;">${medalInfo.positionText}</span>
                com <strong>${score} pontos</strong>.
            </div>
        </div>

        <div class="details">
            <div class="detail-item">
                <div class="detail-label">Disciplina</div>
                <div class="detail-value">${disciplina}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Pontuação</div>
                <div class="detail-value">${score} pts</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Posição</div>
                <div class="detail-value">${position}º lugar</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Data</div>
                <div class="detail-value">${date}</div>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-left">
                <div class="signature-line"></div>
                <div class="signature-title">Diretor Executivo</div>
                <div class="signature-name">Prof. Dr. João Silva</div>
            </div>
            <div class="signature-right">
                <div class="signature-line"></div>
                <div class="signature-title">Coordenador de Projetos</div>
                <div class="signature-name">Dra. Maria Santos</div>
            </div>
        </div>

        <div class="footer">
            <p>Este certificado foi emitido automaticamente pela plataforma COMAES e é válido em todo território nacional.</p>
            <div class="certificate-code">Código: ${certificateCode}</div>
        </div>
    </div>
</body>
</html>`;
};

// Função principal para gerar certificado
export const generateCertificate = async ({ userId, tournamentId, disciplina }) => {
  try {
    console.log('🎯 Iniciando geração de certificado:', { userId, tournamentId, disciplina });

    // Verificar se usuário tem direito ao certificado (apenas top 3)
    const userParticipation = await Certificate.findOne({
      where: {
        user_id: userId,
        tournament_id: tournamentId,
        disciplina: disciplina
      }
    });

    // Se não encontrou participação, verificar ranking
    if (!userParticipation) {
      // Buscar participação no torneio
      const ParticipanteTorneio = (await import('../../models/ParticipanteTorneio.js')).default;
      const participation = await ParticipanteTorneio.findOne({
        where: {
          usuario_id: userId,
          torneio_id: tournamentId,
          disciplina_competida: disciplina,
          status: 'confirmado'
        },
        include: [
          { model: Usuario, as: 'usuario' },
          { model: Torneio, as: 'torneio' }
        ]
      });

      if (!participation) {
        return { success: false, error: 'Participação não encontrada' };
      }

      // Verificar se está no top 3
      if (participation.posicao > 3) {
        return { success: false, error: 'Certificado disponível apenas para os 3 primeiros colocados' };
      }

      // Buscar ranking para confirmar posição
      const allParticipations = await ParticipanteTorneio.findAll({
        where: {
          torneio_id: tournamentId,
          disciplina_competida: disciplina,
          status: 'confirmado'
        },
        order: [['pontuacao', 'DESC'], ['tempo_total', 'ASC']]
      });

      const userPosition = allParticipations.findIndex(p => p.usuario_id === userId) + 1;

      if (userPosition > 3 || userPosition === 0) {
        return { success: false, error: 'Certificado disponível apenas para os 3 primeiros colocados' };
      }

      // Criar registro do certificado
      const certificateCode = `CERT-${uuidv4().substring(0, 8).toUpperCase()}`;
      const certificate = await Certificate.create({
        user_id: userId,
        tournament_id: tournamentId,
        score: participation.pontuacao,
        ranking_position: userPosition,
        certificate_code: certificateCode,
        certificate_url: '', // será preenchido após gerar PDF
        disciplina: disciplina
      });

      console.log('✅ Certificado registrado no banco:', certificate.id);
    } else {
      // Verificar se posição permite certificado
      if (userParticipation.ranking_position > 3) {
        return { success: false, error: 'Certificado disponível apenas para os 3 primeiros colocados' };
      }
    }

    // Buscar dados completos
    const certificate = await Certificate.findOne({
      where: {
        user_id: userId,
        tournament_id: tournamentId,
        disciplina: disciplina
      },
      include: [
        { model: Usuario, as: 'user' },
        { model: Torneio, as: 'tournament' }
      ]
    });

    if (!certificate) {
      return { success: false, error: 'Certificado não encontrado' };
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
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Configurar página para formato A4
    await page.setViewport({ width: 794, height: 1123 }); // A4 em pixels (72 DPI)

    const fileName = `certificado-${certificate.id}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

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

  } catch (error) {
    console.error('❌ Erro ao gerar certificado:', error);
    return { success: false, error: error.message };
  }
};

// Rota handler para geração de certificado
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