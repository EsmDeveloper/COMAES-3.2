import fs from 'fs';

const filePath = 'FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx';

console.log('🔧 Limpeza radical de caracteres corrompidos\n');

try {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remover ANY caractere que NÃO seja ASCII imprimível ou Unicode válido
  // Mantém: ASCII 32-126, e Unicode válido (maior que 127 mas bem-formado)
  
  // Abordagem 1: Converter para ASCII e reintroduzir apenas acentos válidos
  let cleaned = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const code = char.charCodeAt(0);
    
    // ASCII imprimível: OK
    if (code >= 32 && code <= 126) {
      cleaned += char;
      continue;
    }
    
    // Espaços, tabs, newlines: OK
    if (code === 9 || code === 10 || code === 13) {
      cleaned += char;
      continue;
    }
    
    // Acentos Latinos válidos em UTF-8
    if (char.match(/[à-ÿäöüáéíóúãõâêô]/i)) {
      cleaned += char;
      continue;
    }
    
    // Tudo mais: remover
  }
  
  // Remover sequências estranhas
  cleaned = cleaned.replace(/┬[a-z]┬[a-z]/g, '');
  cleaned = cleaned.replace(/[┬├┤└┘]/g, '');
  
  fs.writeFileSync(filePath, cleaned, 'utf-8');
  
  console.log(`✅ ${filePath}`);
  console.log(`   Caracteres antes: ${content.length}`);
  console.log(`   Caracteres depois: ${cleaned.length}`);
  console.log(`   Removidos: ${content.length - cleaned.length}`);
  
} catch (err) {
  console.log(`[ERROR] ${err.message}`);
}

console.log('\n✅ Limpeza concluída\n');
