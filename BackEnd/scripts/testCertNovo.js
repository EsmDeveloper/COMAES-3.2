import { fileURLToPath } from 'url';
import path from 'path';
import { generateCertificate, default as gen } from '../certificates/generator/generateCertificado.js';
import sequelize from '../config/db.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  await sequelize.authenticate();
  console.log("DB connection OK");
  
  const htmlData = {
      userName: 'ESMÊNIO MANUEL',
      tournamentName: 'Torneio Académico COMAES 2026',
      position: 1,
      score: 96,
      disciplina: 'Matemática',
      certificateCode: 'CERT-7F3A-92D1-1234',
      date: '17 de abril de 2026',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      totalParticipantes: 187,
      percentil: '99,5'
  };

  const html = await gen.getCertificateHTML(htmlData);
  
  const testPath = path.join(__dirname, 'test_certificate.html');
  fs.writeFileSync(testPath, html);
  console.log('Saved mock HTML to', testPath);
  process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
