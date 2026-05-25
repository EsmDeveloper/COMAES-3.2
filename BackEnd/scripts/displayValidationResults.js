import fs from 'fs';

const results = JSON.parse(fs.readFileSync('./scripts/production-validation-results.json', 'utf-8'));

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║           PRODUCTION LOCK - RESULTADOS DETALHADOS             ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('📊 RESUMO GERAL');
console.log('─────────────────────────────────────────────────────────────────');
console.log('Timestamp:        ' + results.timestamp);
console.log('Total de Testes:  ' + results.summary.total_tests);
console.log('Testes Passados:  ' + results.summary.passed + ' ✅');
console.log('Testes Falhados:  ' + results.summary.failed + ' ❌');
console.log('Taxa de Sucesso:  ' + ((results.summary.passed / results.summary.total_tests) * 100).toFixed(1) + '%');
console.log('Riscos:           ' + results.summary.risks_found);
console.log('Status:           ' + (results.summary.status === 'OK' ? '✅ OK' : '❌ FALHA'));

console.log('\n📋 TESTES EXECUTADOS');
console.log('─────────────────────────────────────────────────────────────────');

results.tests.forEach((test, i) => {
  const status = test.status === 'OK' ? '✅' : '❌';
  console.log(`${i + 1}. ${status} ${test.name}`);
});

if (results.risks.length > 0) {
  console.log('\n⚠️  RISCOS ENCONTRADOS');
  console.log('─────────────────────────────────────────────────────────────────');
  results.risks.forEach((risk, i) => {
    console.log(`${i + 1}. ${risk}`);
  });
} else {
  console.log('\n✅ NENHUM RISCO ENCONTRADO');
  console.log('─────────────────────────────────────────────────────────────────');
}

console.log('\n╔════════════════════════════════════════════════════════════════╗');
if (results.summary.status === 'OK') {
  console.log('║                  ✅ SISTEMA PRONTO PARA PRODUÇÃO              ║');
} else {
  console.log('║                  ❌ FALHAS DETECTADAS                         ║');
}
console.log('╚════════════════════════════════════════════════════════════════╝\n');
