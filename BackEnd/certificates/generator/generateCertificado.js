// BackEnd/certificates/generator/generateCertificado.js
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Certificado from '../../models/Certificado.js';
import Usuario from '../../models/User.js';
import Torneio from '../../models/Torneio.js';
import sequelize from '../../config/db.js';
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

/// Retorna sufixo para posição
function getRankSuffix(pos) {
  return pos + "º LUGAR";
}

// Template HTML do novo certificado
async function getCertificateHTML(data) {
  const {
    userName,
    position,
    score,
    disciplina,
    certificateCode,
    date,
    qrCode,
    totalParticipantes,
    percentil,
    tournamentName
  } = data;

  const rankText = getRankSuffix(position);
  // Repeating COMAES text for watermark
  const watermarkText = Array(400).fill('COMAES').join(' &nbsp; ');

  return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado COMAES - ${userName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page {
            size: A4 landscape;
            margin: 0;
        }

        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: #ffffff;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .certificate {
            font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
            background: #ffffff;
            position: relative;
            /* 1.415:1 ratio matches A4 landscape */
            width: 1123px;
            height: 794px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .cert-watermark {
            position: absolute;
            inset: 0;
            overflow: hidden;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            padding: 4px 8px;
            z-index: 0;
            pointer-events: none;
            user-select: none;
            color: #2055a8;
            opacity: 0.09;
            font-family: 'Playfair Display', Georgia, serif;
            font-weight: 600;
            font-size: 11px;
            letter-spacing: 0.2em;
            line-height: 2.0;
        }

        .cert-outer-border {
            position: absolute;
            inset: 0;
            border: 4px solid #1a3a6b;
            pointer-events: none;
            z-index: 5;
        }

        .cert-inner-border {
            position: absolute;
            inset: 10px;
            border: 1.5px solid #1a3a6b;
            pointer-events: none;
            z-index: 5;
        }

        .cert-corner {
            position: absolute;
            width: 60px;
            height: 60px;
            z-index: 6;
            pointer-events: none;
        }

        .cert-corner-tl { top: 0;    left: 0;   }
        .cert-corner-tr { top: 0;    right: 0;  }
        .cert-corner-bl { bottom: 0; left: 0;   }
        .cert-corner-br { bottom: 0; right: 0;  }

        .cert-corner-tl::before {
            content: '';
            position: absolute;
            inset: 0;
            background: #3a7dd9;
            clip-path: polygon(0 0, 100% 0, 100% 24%, 24% 24%, 24% 100%, 0 100%);
        }

        .cert-corner-tr::before {
            content: '';
            position: absolute;
            inset: 0;
            background: #3a7dd9;
            clip-path: polygon(0 0, 100% 0, 100% 100%, 76% 100%, 76% 24%, 0 24%);
        }

        .cert-corner-bl::before {
            content: '';
            position: absolute;
            inset: 0;
            background: #3a7dd9;
            clip-path: polygon(0 0, 24% 0, 24% 76%, 100% 76%, 100% 100%, 0 100%);
        }

        .cert-corner-br::before {
            content: '';
            position: absolute;
            inset: 0;
            background: #3a7dd9;
            clip-path: polygon(76% 0, 100% 0, 100% 100%, 0 100%, 0 76%, 76% 76%);
        }

        .cert-layout {
            position: absolute;
            inset: 0;
            z-index: 2;
            display: flex;
            flex-direction: column;
            padding: 14px 56px 0;
        }

        .cert-top-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            flex-shrink: 0;
        }

        .cert-top-dots {
            font-family: monospace;
            color: #a0b4cc;
            letter-spacing: 0.25em;
            font-size: 10px;
            margin-bottom: 6px;
            user-select: none;
        }

        .cert-seal {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 2px solid #1a3a6b;
            background: white;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            margin-bottom: 8px;
            box-shadow: 0 2px 6px rgba(26,58,107,0.15);
            font-size: 45px;
        }

        .cert-main-title {
            font-size: 21px;
            font-weight: 800;
            color: #1a3a6b;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            line-height: 1.2;
            margin-bottom: 3px;
        }

        .cert-subtitle {
            font-size: 13px;
            font-weight: 600;
            color: #1a3a6b;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            margin-bottom: 0;
        }

        .cert-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 5px;
            min-height: 0;
            padding: 2px 0;
        }

        .cert-intro {
            font-size: 14px;
            color: #222;
            margin-bottom: 2px;
        }

        .cert-name {
            font-size: 40px;
            font-weight: 800;
            color: #1a3a6b;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            line-height: 1.1;
            margin: 2px 0;
        }

        .cert-achievement {
            font-size: 14.5px;
            color: #222;
            line-height: 1.5;
            margin-bottom: 1px;
        }

        .cert-achievement strong {
            font-weight: 800;
            color: #111;
        }

        .cert-divider {
            width: 70%;
            height: 1.5px;
            background: #1a3a6b;
            margin: 4px auto;
        }

        .cert-stats {
            display: flex;
            flex-direction: column;
            gap: 0px;
            text-align: center;
        }

        .cert-stats p {
            font-size: 13px;
            color: #222;
            line-height: 1.65;
        }

        .cert-date {
            font-size: 13px;
            color: #222;
            font-style: italic;
            margin-top: 4px;
        }

        .cert-signature-block {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-shrink: 0;
            padding-bottom: 15px;
        }

        .cert-qr {
            width: 80px;
            height: 80px;
            border: 1px solid #1a3a6b;
            padding: 3px;
        }

        .cert-signature {
            text-align: center;
            min-width: 235px;
        }

        .cert-signature-line {
            height: 1.5px;
            background: #333;
            margin-bottom: 5px;
        }

        .cert-signer-name {
            font-size: 12.5px;
            font-weight: 700;
            color: #1a3a6b;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        .cert-signer-title {
            font-size: 11px;
            color: #444;
            font-style: italic;
            margin-top: 2px;
        }

        .cert-footer-bar {
            background: #1a3a6b;
            text-align: center;
            padding: 5px 20px;
            flex-shrink: 0;
        }

        .cert-footer-bar p {
            font-size: 9.5px;
            color: #ccdcf5;
            font-family: 'Inter', 'Segoe UI', sans-serif;
            letter-spacing: 0.02em;
        }

        .cert-footer-bar strong { color: white; font-weight: 700; }
        .cert-footer-bar em    { color: #9bbfed; font-style: italic; }

        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            body { background: white; margin: 0; padding: 0; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="cert-watermark">
            ${watermarkText}
        </div>

        <div class="cert-outer-border"></div>
        <div class="cert-inner-border"></div>
        <div class="cert-corner cert-corner-tl"></div>
        <div class="cert-corner cert-corner-tr"></div>
        <div class="cert-corner cert-corner-bl"></div>
        <div class="cert-corner cert-corner-br"></div>
        
        <div class="cert-layout">
            <div class="cert-top-section">
                <div class="cert-top-dots">....................................................................................</div>
                <div class="cert-seal">🦉</div>
                <div class="cert-main-title">CERTIFICADO DE RECONHECIMENTO ACADÊMICO</div>
                <div class="cert-subtitle">PLATAFORMA COMAES</div>
            </div>
            
            <div class="cert-body">
                <div class="cert-intro">A Plataforma COMAES certifica que, em Luanda,</div>
                <div class="cert-name">${userName}</div>
                <div class="cert-achievement">
                    Alcançou o <strong>${rankText}</strong> no ${tournamentName}.
                </div>
                
                <div class="cert-divider"></div>
                
                <div class="cert-stats">
                    <p>Total de Participantes: ${totalParticipantes}</p>
                    <p>Pontuação Final: ${score}%</p>
                    <p>Percentil: ${percentil}º (Melhor Desempenho)</p>
                </div>
                
                <div class="cert-date">Emitido aos ${date}.</div>
            </div>

            <div class="cert-signature-block">
                <img src="${qrCode}" alt="QR Code" class="cert-qr" />
                
                <div class="cert-signature">
                    <div class="cert-signature-line"></div>
                    <div class="cert-signer-name">PROF. DR. ANTÓNIO SILVA</div>
                    <div class="cert-signer-title">Diretor de Avaliação e Desempenho</div>
                </div>
            </div>
        </div>

        <div class="cert-footer-bar">
            <p>Código de Verificação: <strong>${certificateCode}</strong> | Validar em: <em>plataformacomaes.com/validar</em></p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Gera um certificado para um participante
 */
export async function generateCertificate(torneioId, usuarioId, disciplina, posicao, pontuacao, totalParticipantesProp = null) {
  let browser = null;
  
  try {
    console.log(`[CERTIFICADO] Iniciando geração para: ${usuarioId}, Posição: ${posicao}`);
    console.log(`[CERTIFICADO] Parâmetros: torneioId=${torneioId}, disciplina=${disciplina}, pontuacao=${pontuacao}`);

    // Buscar dados
    const usuario = await Usuario.findByPk(usuarioId);
    const torneio = await Torneio.findByPk(torneioId);

    if (!usuario) {
      console.error(`[CERTIFICADO] ❌ Usuário não encontrado: ${usuarioId}`);
      throw new Error('Utilizador não encontrado');
    }

    if (!torneio) {
      console.error(`[CERTIFICADO] ❌ Torneio não encontrado: ${torneioId}`);
      throw new Error('Torneio não encontrado');
    }

    console.log(`[CERTIFICADO] ✅ Usuário: ${usuario.nome}`);
    console.log(`[CERTIFICADO] ✅ Torneio: ${torneio.titulo}`);

    let totalParticipants = totalParticipantesProp;

    // Calcular o total de participantes se não for fornecido
    if (!totalParticipants) {
      if (typeof sequelize !== 'undefined' && sequelize.query) {
        try {
            console.log('[CERTIFICADO] Consultando total de participantes...');
            const [{ total }] = await sequelize.query(`
              SELECT COUNT(*) as total 
              FROM participantes_torneios 
              WHERE torneio_id = :torneioId 
              AND disciplina_competida = :disciplina 
              AND status = 'confirmado'
            `, { 
              replacements: { torneioId, disciplina },
              type: sequelize.QueryTypes.SELECT 
            });
            totalParticipants = total || 1;
            console.log(`[CERTIFICADO] Total de participantes: ${totalParticipants}`);
        } catch(e) {
            console.warn('[CERTIFICADO] ⚠️  Erro ao contar participantes:', e.message);
            totalParticipants = 1;
        }
      } else {
        totalParticipants = 1;
      }
    }

    // Calcular o percentil
    const numBetterOrEqual = posicao;
    const numLower = totalParticipants - numBetterOrEqual;
    let percentileCalc = 100;
    
    if (totalParticipants > 1) {
       percentileCalc = (numLower / (totalParticipants - 1)) * 100;
    }
    const percentilStr = percentileCalc.toLocaleString('pt-PT', { maximumFractionDigits: 1 });

    // Gerar código único
    const codigoCertificado = 'CERT-' + torneioId + '-' + usuarioId + '-' + Date.now().toString().slice(-4) + '-' + uuidv4().substring(0, 4).toUpperCase();
    console.log(`[CERTIFICADO] Código gerado: ${codigoCertificado}`);

    // Gerar QR code com link de validação
    const qrData = 'https://comaes.pt/validar-certificado/' + codigoCertificado;
    console.log('[CERTIFICADO] Gerando QR Code...');
    const qrCode = await generateQRCode(qrData);
    
    if (!qrCode) {
      console.warn('[CERTIFICADO] ⚠️  QR Code não gerado, usando placeholder');
    } else {
      console.log('[CERTIFICADO] ✅ QR Code gerado com sucesso');
    }

    // Preparar dados
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const d = new Date();
    const dataFormatada = `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;

    const htmlData = {
      userName: usuario.nome || 'Participante',
      tournamentName: torneio.titulo || 'Torneio COMAES',
      position: posicao,
      score: Math.round(pontuacao),
      disciplina: disciplina,
      certificateCode: codigoCertificado,
      date: dataFormatada,
      qrCode: qrCode,
      totalParticipantes: totalParticipants,
      percentil: percentilStr
    };

    // Gerar HTML
    console.log('[CERTIFICADO] Gerando HTML do certificado...');
    const htmlContent = await getCertificateHTML(htmlData);
    console.log(`[CERTIFICADO] HTML gerado (${htmlContent.length} caracteres)`);

    // Criar pasta se não existir
    const uploadsDir = path.join(__dirname, '../../uploads/certificados');
    if (!fs.existsSync(uploadsDir)) {
      console.log('[CERTIFICADO] Criando diretório de uploads...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`[CERTIFICADO] ✅ Diretório criado: ${uploadsDir}`);
    } else {
      console.log(`[CERTIFICADO] ✅ Diretório existe: ${uploadsDir}`);
    }

    // Gerar PDF com Puppeteer
    console.log('[CERTIFICADO] Iniciando Puppeteer...');
    
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
      console.log('[CERTIFICADO] ✅ Puppeteer iniciado');
    } catch (puppeteerError) {
      console.error('[CERTIFICADO] ❌ Erro ao iniciar Puppeteer:', puppeteerError.message);
      throw new Error(`Falha ao iniciar navegador: ${puppeteerError.message}`);
    }

    const page = await browser.newPage();
    console.log('[CERTIFICADO] Página criada');
    
    // Configurar timeouts
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);
    
    // Carregar conteúdo HTML
    console.log('[CERTIFICADO] Carregando conteúdo HTML...');
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 120000 });
    console.log('[CERTIFICADO] ✅ HTML carregado');
    
    await page.setViewport({ width: 1123, height: 794 });

    const fileName = 'certificado_' + usuarioId + '_' + posicao + '_' + Date.now() + '.pdf';
    const filePath = path.join(uploadsDir, fileName);

    console.log(`[CERTIFICADO] Gerando PDF: ${fileName}`);
    
    await page.pdf({
      path: filePath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    browser = null;
    console.log('[CERTIFICADO] ✅ PDF gerado e navegador fechado');

    // Verificar se o arquivo foi criado
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo PDF não foi criado em: ${filePath}`);
    }

    const fileStats = fs.statSync(filePath);
    console.log(`[CERTIFICADO] ✅ Arquivo criado: ${fileName} (${fileStats.size} bytes)`);

    // Salvar no banco de dados
    console.log('[CERTIFICADO] Salvando no banco de dados...');
    const medalTipo = posicao === 1 ? 'Ouro' : (posicao === 2 ? 'Prata' : 'Bronze');
    const certificado = await Certificado.create({
      torneio_id: torneioId,
      usuario_id: usuarioId,
      disciplina: disciplina,
      posicao: posicao,
      pontuacao: pontuacao,
      codigo_certificado: codigoCertificado,
      url_certificado: '/uploads/certificados/' + fileName,
      tipo_medalha: medalTipo,
      status: 'gerado',
      metadata: {
        qrData: qrData,
        generatedAt: new Date().toISOString(),
        totalParticipants: totalParticipants,
        percentil: percentilStr
      }
    });

    console.log('[CERTIFICADO] ✅ Certificado salvo no banco de dados (ID: ' + certificado.id + ')');
    console.log('[CERTIFICADO] ✅ ✅ ✅ Certificado gerado com sucesso: ' + codigoCertificado);

    return {
      success: true,
      certificado: certificado.toJSON(),
      url: '/uploads/certificados/' + fileName,
      code: codigoCertificado
    };

  } catch (error) {
    console.error('[CERTIFICADO] ❌ ❌ ❌ Erro ao gerar certificado:', error.message);
    console.error('[CERTIFICADO] Stack trace:', error.stack);
    
    // Fechar navegador se ainda estiver aberto
    if (browser) {
      try {
        await browser.close();
        console.log('[CERTIFICADO] Navegador fechado após erro');
      } catch (closeError) {
        console.error('[CERTIFICADO] Erro ao fechar navegador:', closeError.message);
      }
    }
    
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
    console.log('[CERTIFICADOS] Gerando certificados para torneio ' + torneioId + ', disciplina: ' + disciplina);

    // Buscar os 3 primeiros colocados com pontuação > 0 (apenas participantes que realmente pontuaram)
    const topParticipants = await sequelize.query(
      `SELECT pt.id, pt.usuario_id, pt.pontuacao, pt.casos_resolvidos
       FROM participantes_torneios pt
       WHERE pt.torneio_id = :torneioId
         AND pt.disciplina_competida = :disciplina
         AND pt.status = 'confirmado'
         AND pt.pontuacao > 0
       ORDER BY pt.pontuacao DESC
       LIMIT 3`,
      {
        replacements: { torneioId, disciplina },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (topParticipants.length === 0) {
      console.warn('[CERTIFICADOS] ⚠️ Nenhum participante encontrado');
      return { success: false, message: 'Nenhum participante encontrado' };
    }

    const [{ total }] = await sequelize.query(`
      SELECT COUNT(*) as total 
      FROM participantes_torneios 
      WHERE torneio_id = :torneioId 
      AND disciplina_competida = :disciplina 
      AND status = 'confirmado'
    `, { 
      replacements: { torneioId, disciplina },
      type: sequelize.QueryTypes.SELECT 
    });

    const results = [];
    for (let i = 0; i < topParticipants.length; i++) {
      const participant = topParticipants[i];
      const position = i + 1;

      const result = await generateCertificate(
        torneioId,
        participant.usuario_id,
        disciplina,
        position,
        participant.pontuacao,
        total // pass count
      );

      results.push(result);
    }

    console.log('[CERTIFICADOS] ✅ Gerados ' + results.length + ' certificados com sucesso');

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
