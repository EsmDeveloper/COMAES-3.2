import express from 'express';
import { generateCertificate, generateCertificateRoute } from '../certificates/generator/index.js';

const router = express.Router();

router.post('/generate', generateCertificateRoute);

// Rota para download de certificado
router.get('/download/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { userId, disciplina } = req.query;

    if (!userId || !disciplina) {
      return res.status(400).json({ success: false, error: 'User ID and disciplina are required' });
    }

    const result = await generateCertificate({ userId, tournamentId, disciplina });

    if (result.success) {
      const filePath = result.certificateURL.replace('/uploads/certificates/', 'uploads/certificates/');
      res.download(filePath, result.fileName);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para preview de certificado
router.get('/preview/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { userId, disciplina } = req.query;

    console.log('📥 Requisição de preview recebida:', { tournamentId, userId, disciplina });

    if (!userId || !disciplina) {
      console.warn('❌ Parâmetros faltando:', { userId, disciplina });
      return res.status(400).json({ success: false, error: 'User ID and disciplina are required' });
    }

    console.log('🔄 Chamando generateCertificate...');
    const result = await generateCertificate({ userId, tournamentId, disciplina });

    console.log('📊 Resultado:', result);

    if (result.success) {
      console.log('✅ Certificado gerado com sucesso');
      res.json({
        success: true,
        certificateURL: result.certificateURL,
        certificateCode: result.certificateCode,
        tournamentId,
        disciplina
      });
    } else {
      console.warn('⚠️  Falha ao gerar certificado:', result.error);
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Erro na rota preview:', error.message, error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
