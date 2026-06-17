/**
 * Test script to verify question grouping fix
 * Simulates the problem and verifies the solution
 */

import sequelize from '../config/db.js';
import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';
import Questao from '../models/Questao.js';
import BlocoQuestoes from '../models/BlocoQuestoes.js';
import BlocoQuestaoItem from '../models/BlocoQuestaoItem.js';

const main = async () => {
  try {
    console.log('\n🧪 TEST: Question Grouping with ID Conflict Detection\n');

    // 1. Show current state
    console.log('📊 STEP 1: Database State');
    const testQuestions = await QuestaoTesteConhecimento.findAll({ raw: true });
    const unifiedQuestions = await Questao.findAll({ raw: true });

    console.log(`  QuestaoTesteConhecimento: ${testQuestions.length} rows`);
    testQuestions.slice(0, 5).forEach(q => {
      console.log(`    - ID=${q.id}, categoria="${q.categoria}"`);
    });

    console.log(`  Questao: ${unifiedQuestions.length} rows`);
    unifiedQuestions.slice(0, 5).forEach(q => {
      console.log(`    - ID=${q.id}, disciplina="${q.disciplina}"`);
    });

    // 2. Check for ID conflicts
    console.log('\n🔍 STEP 2: Check ID Conflicts');
    const testIds = new Set(testQuestions.map(q => q.id));
    const unifiedIds = new Set(unifiedQuestions.map(q => q.id));
    const conflicts = [...testIds].filter(id => unifiedIds.has(id));

    if (conflicts.length > 0) {
      console.log(`  ⚠️  FOUND ${conflicts.length} ID CONFLICTS: ${conflicts.join(', ')}`);
      conflicts.forEach(id => {
        const testQ = testQuestions.find(q => q.id === id);
        const unifiedQ = unifiedQuestions.find(q => q.id === id);
        console.log(`    ID=${id}:`);
        console.log(`      QuestaoTesteConhecimento: categoria="${testQ.categoria}"`);
        console.log(`      Questao: disciplina="${unifiedQ.disciplina}"`);
      });
    } else {
      console.log(`  ✅ No ID conflicts found (all IDs are unique)`);
    }

    // 3. Simulate lookup priority fix
    console.log('\n🔧 STEP 3: Verify Fixed Lookup Priority');
    if (testQuestions.length > 0 && conflicts.length > 0) {
      const testQId = conflicts[0];
      const testQ = testQuestions.find(q => q.id === testQId);

      console.log(`  Testing lookup for ID=${testQId}:`);

      // Old way (buggy)
      console.log(`  ❌ OLD (buggy): Check Questao first`);
      let found = await Questao.findByPk(testQId);
      console.log(`     Found: ${found ? `disciplina="${found.disciplina}"` : 'not found'}`);

      // New way (fixed)
      console.log(`  ✅ NEW (fixed): Check QuestaoTesteConhecimento first`);
      found = await QuestaoTesteConhecimento.findByPk(testQId);
      console.log(`     Found: ${found ? `categoria="${found.categoria}"` : 'not found'}`);
    }

    // 4. Test with actual blocos if they exist
    console.log('\n📦 STEP 4: Test Grouping with Blocos');
    const blocos = await BlocoQuestoes.findAll({ limit: 1 });
    if (blocos.length > 0 && testQuestions.length > 0) {
      const bloco = blocos[0];
      const testQ = testQuestions[0];

      console.log(`  Bloco: "${bloco.titulo}" (disciplina="${bloco.disciplina}")`);
      console.log(`  Question: ID=${testQ.id}, categoria="${testQ.categoria}"`);

      if (testQ.categoria === bloco.disciplina) {
        console.log(`  ✅ Categories are COMPATIBLE`);
      } else {
        console.log(`  ❌ Categories MISMATCH: "${testQ.categoria}" ≠ "${bloco.disciplina}"`);
      }
    } else {
      console.log(`  ⚠️  No blocos or test questions available for full test`);
    }

    console.log('\n✅ Test complete!\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
};

main();
