import fs from 'fs';
import path from 'path';

const mojibakePatterns = [
  /Ã©/g, /Ã¡/g, /Ã£/g, /Ã§/g, /Ã¢/g, /Ã¨/g, /Ã¬/g, /Ã³/g, /Ã´/g, /Ã¼/g,
  /â€™/g, /â€œ/g, /â€•/g, /â€¢/g, /â€"/g, /â€"/g, /Â/g,
  /°¸/g, /¥/g, /┬/g, /├/g, /ð/g, /ï¸/g,
];

function scanDirectory(dir, ext) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && !item.includes('node_modules') && !item.includes('dist')) {
        files = files.concat(scanDirectory(fullPath, ext));
      }
    } else if (fullPath.endsWith(ext)) {
      files.push(fullPath);
    }
  });
  
  return files;
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    for (const pattern of mojibakePatterns) {
      if (pattern.test(content)) {
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
}

console.log('\n🔍 VARREDURA PROFUNDA DE ENCODING - PROJETO INTEIRO\n');

const frontendFiles = scanDirectory('FrontEnd/src', '.jsx').concat(scanDirectory('FrontEnd/src', '.js'));
const backendFiles = scanDirectory('BackEnd', '.js');

let frontendIssues = 0;
let backendIssues = 0;
const problemFiles = [];

frontendFiles.forEach(file => {
  if (checkFile(file)) {
    frontendIssues++;
    problemFiles.push(file);
  }
});

backendFiles.forEach(file => {
  if (checkFile(file)) {
    backendIssues++;
    problemFiles.push(file);
  }
});

console.log(`📊 RESULTADOS DA VARREDURA:\n`);
console.log(`Frontend (.jsx/.js): ${frontendIssues} arquivos com problemas`);
console.log(`Backend (.js): ${backendIssues} arquivos com problemas`);
console.log(`\nTotal: ${frontendIssues + backendIssues} arquivos com encoding inválido\n`);

if (problemFiles.length > 0) {
  console.log(`🔴 Arquivos com problemas (mostrando primeiros 20):\n`);
  problemFiles.slice(0, 20).forEach(file => {
    console.log(`   • ${file.replace(/\\/g, '/')}`);
  });
  
  if (problemFiles.length > 20) {
    console.log(`\n   ... e ${problemFiles.length - 20} mais arquivos`);
  }
}

console.log('\n');
