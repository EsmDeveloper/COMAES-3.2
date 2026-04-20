import express from 'express';
import { generateCertificate, generateCertificateRoute } from '../certificates/generator/index.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

router.post('/generate', generateCertificateRoute);

// Rota para download de certificado
router.get('/download/:tournamentId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const { tournamentId } = req.params;
    const { disciplina } = req.query;

    if (!disciplina) {
      return res.status(400).json({ success: false, error: 'Disciplina é obrigatória' });
    }

    const result = await generateCertificate({ userId: req.user.id, tournamentId, disciplina });

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
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const { tournamentId } = req.params;
    const { disciplina } = req.query;

    console.log('📥 Requisição de preview recebida:', { tournamentId, userId: req.user.id, disciplina });

    if (!disciplina) {
      console.warn('❌ Parâmetro disciplina faltando');
      return res.status(400).json({ success: false, error: 'Disciplina é obrigatória' });
    }

    console.log('🔄 Chamando generateCertificate...');
    const result = await generateCertificate({ userId: req.user.id, tournamentId, disciplina });

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
