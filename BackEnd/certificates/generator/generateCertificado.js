// BackEnd/certificates/generator/generateCertificado.js
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Certificado from '../../models/Certificado.js';
import Usuario from '../../models/User.js';
import Torneio from '../../models/Torneio.js';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para gerar QR Code
async function generateQRCode(text) {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error('Erro ao gerar QR code:', err);
    return null;
  }
}

// Função para retornar dados de medalha baseado na posição
function getMedalData(position) {
  const medals = {
    1: {
      tipo: 'Ouro',
      medal: '🥇',
      titleColor: '#FFD700',
      borderColor: '#DAA520',
      bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      ringColor: '#FFD700',
      description: 'CAMPEÃO',
      messageTitle: 'Conquistou',
      message: 'O jogador demonstrou desempenho excepcional, estratégia e domínio das competências avaliadas, alcançando classificação oficial no torneio COMAES.',
      ranking: '#1',
      rankingStyle: 'S'
    },
    2: {
      tipo: 'Prata',
      medal: '🥈',
      titleColor: '#C0C0C0',
      borderColor: '#A8A9AD',
      bgGradient: 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)',
      ringColor: '#C0C0C0',
      description: 'VICE-CAMPEÃO',
      messageTitle: 'Conquistou',
      message: 'O jogador demonstrou desempenho excepcional, estratégia e domínio das competências avaliadas, alcançando classificação oficial no torneio COMAES.',
      ranking: '#2',
      rankingStyle: 'A'
    },
    3: {
      tipo: 'Bronze',
      medal: '🥉',
      titleColor: '#CD7F32',
      borderColor: '#B87333',
      bgGradient: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
      ringColor: '#CD7F32',
      description: 'TERCEIRO LUGAR',
      messageTitle: 'Conquistou',
      message: 'O jogador demonstrou desempenho excepcional, estratégia e domínio das competências avaliadas, alcançando classificação oficial no torneio COMAES.',
      ranking: '#3',
      rankingStyle: 'B'
    }
  };
  return medals[position] || medals[1];
}

// Template HTML do novo certificado
async function getCertificateHTML(data) {
  const {
    userName,
    tournamentName,
    position,
    score,
    disciplina,
    certificateCode,
    date,
    qrCode
  } = data;

  const medalData = getMedalData(position);

  return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado COMAES - ${userName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@400;700;900&family=Cinzel:wght@700;900&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Roboto', sans-serif;
            background: #1a1a2e;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }

        .certificate {
            width: 1200px;
            height: 675px;
            background: linear-gradient(135deg, #0f3460 0%, #16213e 50%, #0f3460 100%);
            position: relative;
            border: 3px solid #1dd1a1;
            box-shadow: 
                0 0 60px rgba(29, 209, 161, 0.4),
                0 0 120px rgba(29, 209, 161, 0.2),
                inset 0 0 60px rgba(29, 209, 161, 0.1);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 40px;
        }

        /* Efeito de fundo animado */
        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, rgba(29, 209, 161, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(74, 144, 226, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }

        /* Bordas decorativas */
        .corner-decoration {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 3px solid #1dd1a1;
        }

        .corner-top-left {
            top: 15px;
            left: 15px;
            border-right: none;
            border-bottom: none;
        }

        .corner-top-right {
            top: 15px;
            right: 15px;
            border-left: none;
            border-bottom: none;
        }

        .corner-bottom-left {
            bottom: 15px;
            left: 15px;
            border-right: none;
            border-top: none;
        }

        .corner-bottom-right {
            bottom: 15px;
            right: 15px;
            border-left: none;
            border-top: none;
        }

        /* Container principal */
        .main-container {
            position: relative;
            z-index: 2;
            display: flex;
            gap: 40px;
            align-items: center;
            width: 100%;
        }

        /* Lado esquerdo - Medalha e Informações */
        .left-section {
            flex: 0 0 25%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        .medal-container {
            width: 120px;
            height: 120px;
            background: ${medalData.bgGradient};
            border: 4px solid ${medalData.ringColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 70px;
            box-shadow: 
                0 0 30px ${medalData.titleColor},
                inset 0 0 20px rgba(0, 0, 0, 0.3);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 30px ${medalData.titleColor}, inset 0 0 20px rgba(0, 0, 0, 0.3); }
            50% { box-shadow: 0 0 50px ${medalData.titleColor}, inset 0 0 20px rgba(0, 0, 0, 0.3); }
        }

        .ranking-badge {
            background: linear-gradient(135deg, ${medalData.titleColor} 0%, ${medalData.borderColor} 100%);
            color: #000;
            font-weight: 900;
            font-size: 32px;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px ${medalData.titleColor};
            font-family: 'Orbitron', sans-serif;
            border: 3px solid #fff;
        }

        .medal-label {
            color: ${medalData.titleColor};
            font-family: 'Cinzel', serif;
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 0 10px ${medalData.titleColor}40;
        }

        /* Lado central - Conteúdo principal */
        .center-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 15px;
            justify-content: center;
        }

        .logo-container {
            display: flex;
            align-items: center;
            gap: 15px;
            justify-content: center;
        }

        .logo {
            width: 45px;
            height: 45px;
            background: #1dd1a1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 900;
            color: #0f3460;
            box-shadow: 0 0 15px #1dd1a1;
        }

        .logo-text {
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            font-weight: 700;
            color: #1dd1a1;
            letter-spacing: 3px;
            text-shadow: 0 0 10px #1dd1a1;
        }

        .subtitle {
            font-size: 12px;
            color: #b0bec5;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-align: center;
        }

        .title {
            font-family: 'Cinzel', serif;
            font-size: 42px;
            font-weight: 900;
            color: #1dd1a1;
            text-align: center;
            letter-spacing: 2px;
            text-transform: uppercase;
            text-shadow: 0 0 20px ${medalData.titleColor}60;
            margin: 5px 0;
        }

        .subtitle-medal {
            font-size: 18px;
            font-weight: 700;
            color: ${medalData.titleColor};
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .player-name {
            font-family: 'Cinzel', serif;
            font-size: 32px;
            font-weight: 900;
            color: #fff;
            text-align: center;
            text-shadow: 0 0 15px ${medalData.titleColor}40;
            border: 2px solid #1dd1a1;
            border-radius: 8px;
            padding: 10px 20px;
            margin: 10px 0;
        }

        .tournament-info {
            display: flex;
            gap: 15px;
            justify-content: center;
            font-size: 12px;
            color: #b0bec5;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .message-box {
            background: rgba(29, 209, 161, 0.1);
            border: 1px solid #1dd1a1;
            border-radius: 6px;
            padding: 12px;
            font-size: 11px;
            color: #cfd8dc;
            line-height: 1.5;
            text-align: center;
        }

        /* Lado direito - QR Code e Informações */
        .right-section {
            flex: 0 0 20%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }

        .performance-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            border: 1px solid #1dd1a1;
            overflow: hidden;
        }

        .performance-fill {
            height: 100%;
            background: linear-gradient(90deg, #1dd1a1 0%, ${medalData.titleColor} 100%);
            width: \${Math.min(score / 100 * 100, 100)}%;
        }

        .score-display {
            text-align: center;
            color: #fff;
        }

        .score-value {
            font-family: 'Orbitron', sans-serif;
            font-size: 28px;
            font-weight: 900;
            color: #1dd1a1;
            text-shadow: 0 0 10px #1dd1a1;
        }

        .score-label {
            font-size: 10px;
            color: #90a4ae;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .qr-container {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid #1dd1a1;
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 0 15px #1dd1a1;
        }

        .qr-code {
            width: 100px;
            height: 100px;
        }

        .certificate-code {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            color: #90a4ae;
            text-align: center;
            word-break: break-all;
            background: rgba(0, 0, 0, 0.3);
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #1dd1a1;
        }

        .footer {
            position: absolute;
            bottom: 20px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #90a4ae;
        }

        .signature {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .ai-badge {
            background: rgba(29, 209, 161, 0.2);
            border: 1px solid #1dd1a1;
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 9px;
            color: #1dd1a1;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .date-info {
            text-align: right;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
                background: white;
            }
            .certificate {
                width: 100%;
                height: auto;
                aspect-ratio: 16 / 9;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="corner-decoration corner-top-left"></div>
        <div class="corner-decoration corner-top-right"></div>
        <div class="corner-decoration corner-bottom-left"></div>
        <div class="corner-decoration corner-bottom-right"></div>

        <div class="main-container">
            <!-- Seção Esquerda -->
            <div class="left-section">
                <div class="medal-container">${medalData.medal}</div>
                <div class="ranking-badge">${medalData.ranking}</div>
                <div class="medal-label">${medalData.description}</div>
            </div>

            <!-- Seção Central -->
            <div class="center-section">
                <div class="logo-container">
                    <div class="logo">🦉</div>
                    <div class="logo-text">COMAES</div>
                </div>
                <div class="subtitle">Competições Educativas Online</div>

                <div class="title">CERTIFICADO DE VITÓRIA</div>
                <div class="subtitle-medal">CERTIFICADO DE RANKING OFICIAL</div>

                <div class="player-name">${userName}</div>

                <div class="tournament-info">
                    <div class="info-item">📋 ${tournamentName}</div>
                    <div class="info-item">📚 ${disciplina}</div>
                </div>

                <div class="message-box">
                    ${medalData.messageTitle}: ${medalData.message}
                </div>
            </div>

            <!-- Seção Direita -->
            <div class="right-section">
                <div style="width: 100%; text-align: center;">
                    <div class="score-display">
                        <div class="score-value">${score}</div>
                        <div class="score-label">Pontuação</div>
                    </div>
                    <div style="margin-top: 8px;">
                        <div class="performance-bar">
                            <div class="performance-fill"></div>
                        </div>
                    </div>
                </div>

                <div class="qr-container">
                    <img src="${qrCode}" alt="QR Code" class="qr-code" />
                </div>

                <div class="certificate-code">${certificateCode}</div>
            </div>
        </div>

        <div class="footer">
            <div class="signature">
                <span>Coordenação COMAES</span>
            </div>
            <div class="ai-badge">
                🤖 Sistema de Avaliação Automática
            </div>
            <div class="date-info">
                <div>Emitido em ${date}</div>
                <div>ID: ${certificateCode.substring(0, 8)}</div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Gera um certificado para um participante
 */
export async function generateCertificate(torneioId, usuarioId, disciplina, posicao, pontuacao) {
  try {
    console.log(`[CERTIFICADO] Iniciando geração para: ${usuarioId}, Posição: ${posicao}`);

    // Buscar dados
    const usuario = await Usuario.findByPk(usuarioId);
    const torneio = await Torneio.findByPk(torneioId);

    if (!usuario || !torneio) {
      throw new Error('Utilizador ou torneio não encontrado');
    }

    // Gerar código único
    const codigoCertificado = 'CERT-' + torneioId + '-' + usuarioId + '-' + Date.now() + '-' + uuidv4().substring(0, 8);

    // Gerar QR code com link de validação
    const qrData = 'https://comaes.pt/validar-certificado/' + codigoCertificado;
    const qrCode = await generateQRCode(qrData);

    // Preparar dados
    const medalData = getMedalData(posicao);
    const dataFormatada = new Date().toLocaleDateString('pt-PT');

    const htmlData = {
      userName: usuario.nome || 'Participante',
      tournamentName: torneio.titulo || 'Torneio COMAES',
      position: posicao,
      score: Math.round(pontuacao),
      disciplina: disciplina,
      certificateCode: codigoCertificado,
      date: dataFormatada,
      qrCode: qrCode
    };

    // Gerar HTML
    const htmlContent = await getCertificateHTML(htmlData);

    // Criar pasta se não existir
    const uploadsDir = path.join(__dirname, '../../uploads/certificados');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Gerar PDF com Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.setViewport({ width: 1200, height: 675 });

    const fileName = \`certificado_\${usuarioId}_\${posicao}_\${Date.now()}.pdf\`;
    const filePath = path.join(uploadsDir, fileName);

    await page.pdf({
      path: filePath,
      format: 'A4',
      landscape: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    // Salvar no banco de dados
    const certificado = await Certificado.create({
      torneio_id: torneioId,
      usuario_id: usuarioId,
      disciplina: disciplina,
      posicao: posicao,
      pontuacao: pontuacao,
      codigo_certificado: codigoCertificado,
      url_certificado: \`/uploads/certificados/\${fileName}\`,
      tipo_medalha: medalData.tipo,
      status: 'gerado',
      metadata: {
        qrData: qrData,
        generatedAt: new Date().toISOString()
      }
    });

    console.log(\`[CERTIFICADO] ✅ Certificado gerado com sucesso: \${codigoCertificado}\`);

    return {
      success: true,
      certificado: certificado.toJSON(),
      url: \`/uploads/certificados/\${fileName}\`,
      code: codigoCertificado
    };

  } catch (error) {
    console.error('[CERTIFICADO] ❌ Erro ao gerar certificado:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gera certificados para os 3 primeiros colocados de um torneio
 */
export async function generateCertificatesForTournament(torneioId, disciplina) {
  try {
    console.log(\`[CERTIFICADOS] Gerando certificados para torneio \${torneioId}, disciplina: \${disciplina}\`);

    // Buscar os 3 primeiros colocados
    const topParticipants = await sequelize.query(\`
      SELECT pt.id, pt.usuario_id, pt.pontuacao, pt.casos_resolvidos
      FROM participante_torneios pt
      WHERE pt.torneio_id = \${torneioId}
        AND pt.disciplina_competida = '\${disciplina}'
        AND pt.status = 'confirmado'
      ORDER BY pt.pontuacao DESC
      LIMIT 3
    \`, { type: sequelize.QueryTypes.SELECT });

    if (topParticipants.length === 0) {
      console.warn('[CERTIFICADOS] ⚠️ Nenhum participante encontrado');
      return { success: false, message: 'Nenhum participante encontrado' };
    }

    const results = [];
    for (let i = 0; i < topParticipants.length; i++) {
      const participant = topParticipants[i];
      const position = i + 1;

      const result = await generateCertificate(
        torneioId,
        participant.usuario_id,
        disciplina,
        position,
        participant.pontuacao
      );

      results.push(result);
    }

    console.log(\`[CERTIFICADOS] ✅ Gerados \${results.length} certificados com sucesso\`);

    return {
      success: true,
      certificatesGenerated: results.length,
      details: results
    };

  } catch (error) {
    console.error('[CERTIFICADOS] ❌ Erro ao gerar certificados:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  generateCertificate,
  generateCertificatesForTournament,
  getCertificateHTML
};
