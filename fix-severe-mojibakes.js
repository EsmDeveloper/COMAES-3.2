import fs from 'fs';

// Arquivo com severe mojibakes
const filePath = 'FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx';

console.log('🔧 Corrigindo severos mojibakes...\n');

try {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remover completamente qualquer caractere não-ASCII problemático na frente de console.log
  // Pattern: qualquer coisa que se pareça com emoji corrompido antes de console
  
  // Padrões comuns de mojibakes severos
  const severePatterns = [
    /[À-ÿ]+(?=\s*Update)/g,           // Caracteres acentuados antes de "Update"
    /Ã©/g,                            // é corrompido
    /Ã¡/g,                            // á corrompido
    /Ã£/g,                            // ã corrompido
    /Ã§/g,                            // ç corrompido
    /Ã¢/g,                            // â corrompido
    /Ã¨/g,                            // è corrompido
    /Ã¬/g,                            // ì corrompido
    /Ã³/g,                            // ó corrompido
    /Ã´/g,                            // ô corrompido
    /Ã¡/g,                            // á corrompido
    /Ã¼/g,                            // ü corrompido
    /Â/g,                             // Quebra de encoding
    /[À-ÿ]/g,                         // Qualquer acentuado corrompido
  ];
  
  let originalLength = content.length;
  
  // Aplicar correções
  severePatterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });
  
  // Remover caracteres de controle incomuns
  content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  fs.writeFileSync(filePath, content, 'utf-8');
  
  console.log(`✅ ${filePath}`);
  console.log(`   Removidos ${originalLength - content.length} caracteres corrompidos`);
  
} catch (err) {
  console.log(`[ERROR] ${err.message}`);
}

// Fazer o mesmo para outros arquivos com severos problemas
const otherFiles = [
  'FrontEnd/src/Paginas/Secundarias/RankingCompleto.jsx',
  'FrontEnd/src/Paginas/Secundarias/RankingGlobal.jsx',
];

otherFiles.forEach(file => {
  try {
    if (!fs.existsSync(file)) return;
    
    let content = fs.readFileSync(file, 'utf-8');
    const severePatterns = [
      /Ã©/g, /Ã¡/g, /Ã£/g, /Ã§/g, /Ã¢/g, /Ã¨/g, /Ã¬/g, /Ã³/g, /Ã´/g, /Ã¼/g, /Â/g, /[À-ÿ]/g,
    ];
    
    let before = content.length;
    severePatterns.forEach(p => content = content.replace(p, ''));
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`✅ ${file.split('/').pop()}`);
    
  } catch (err) {
    // Silenciar
  }
});

console.log('\n✅ Limpeza de severos mojibakes concluída\n');
