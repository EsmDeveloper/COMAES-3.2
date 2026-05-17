/**
 * Middleware para Segurança de Uploads de Ficheiros.
 * Assegura restrições pesadas em tamanho e mime types para prevenir execução remota de código (RCE).
 * 
 * NOTA: Para utilizar este ficheiro, certifique-se de que o `multer` está instalado:
 * `npm install multer`
 */

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Configurar limite de tamanho
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// 2. Definir MIME Types Permitidos (Whitelist)
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf'
];

// 3. Configuração de Armazenamento Seguro
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Armazenar fora do diretório público, se possível, ou garantir
        // que o servidor web (Nginx/Apache) não executa scripts na pasta de uploads.
        cb(null, path.join(__dirname, '../../uploads/')); 
    },
    filename: (req, file, cb) => {
        // Renomear o ficheiro utilizando um UUID/Hash para evitar travessia de diretório (Directory Traversal)
        // e ocultar o nome original do ficheiro que poderia expor informações.
        const randomName = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomName}${ext}`);
    }
});

// 4. Filtro Rigoroso (Validação do Mimetype)
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Rejeita o ficheiro e passa um erro ao Express
        cb(new Error(`Tipo de ficheiro não permitido. Apenas imagens (JPEG/PNG) e PDFs são aceites.`), false);
    }
};

// 5. Instanciar o Multer com as configurações de segurança
const uploadSecurityMiddleware = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE, // Limite rígido
    },
    fileFilter
});

/**
 * Tratamento de erros personalizados do Multer para o cliente
 */
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'Ficheiro demasiado grande. O limite máximo é de 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(415).json({ error: err.message });
    }
    next();
};

export {
    uploadSecurityMiddleware as uploadSecure,
    handleUploadErrors
};
