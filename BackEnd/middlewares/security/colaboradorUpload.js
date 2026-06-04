/**
 * colaboradorUpload.js
 * Middleware de upload de documentos para colaboradores.
 * Aceita: PDF, DOC, DOCX, JPG, JPEG, PNG — máximo 10MB por ficheiro, até 5 ficheiros.
 * Bloqueia executáveis, ZIP, scripts e extensões perigosas.
 */

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '../../uploads/colaborador-docs/');
if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',                                                   // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']);

const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.sh', '.cmd', '.msi', '.dll', '.zip', '.rar', '.tar', '.gz',
  '.js', '.ts', '.py', '.rb', '.php', '.pl', '.cgi', '.jsp', '.asp', '.aspx',
  '.svg', '.html', '.htm', '.xml', '.json', '.csv',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DOCS_DIR),
  filename: (_req, file, cb) => {
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Extensão '${ext}' não permitida por razões de segurança.`), false);
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Tipo de ficheiro não suportado. Use: PDF, DOC, DOCX, JPG, PNG.`), false);
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error(`Tipo MIME '${file.mimetype}' não permitido.`), false);
  }

  cb(null, true);
};

export const uploadColaboradorDocs = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter,
});

export const handleColaboradorUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(413).json({ error: 'Ficheiro demasiado grande. O limite máximo é 10MB por ficheiro.' });
    if (err.code === 'LIMIT_FILE_COUNT')
      return res.status(400).json({ error: `Máximo de ${MAX_FILES} ficheiros por submissão.` });
    return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(415).json({ error: err.message });
  next();
};

/**
 * Formatar informações dos ficheiros carregados para persistência
 */
export function formatarDocumentos(files = [], baseUrl = '') {
  return files.map(file => ({
    nome_original: file.originalname,
    nome_ficheiro: file.filename,
    caminho: `/uploads/colaborador-docs/${file.filename}`,
    url: `${baseUrl}/uploads/colaborador-docs/${file.filename}`,
    tipo: file.mimetype,
    tamanho: file.size,
    data_upload: new Date().toISOString(),
  }));
}
