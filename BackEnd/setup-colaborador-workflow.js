/**
 * Setup script to ensure database schema is correct for colaborador workflow
 * Handles both new and existing databases
 */

import sequelize from './config/db.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';
import Questao from './models/Questao.js';
import { setupAssociations } from './models/associations.js';

async function setupColaboradorWorkflow() {
  try {
    console.log('🔧 Setting up Colaborador Workflow...');
    
    // Ensure associations are set up
    setupAssociations();
    
    // Sync the models
    console.log('📊 Syncing database models...');
    await sequelize.sync({ alter: true });
    
    console.log('✅ BlocoQuestoes model synced');
    console.log('   - Status ENUM: pendente, aprovado, rejeitado');
    console.log('   - Approval fields: aprovado_por_id, data_aprovacao, motivo_rejeicao, observacoes_admin');
    
    console.log('✅ Questao model synced');
    console.log('   - Status: pending approval from admin');
    
    console.log('\n✅ Colaborador Workflow setup complete!');
    console.log('\n📝 API Endpoints Ready:');
    console.log('   COLABORADOR BLOCOS:');
    console.log('   - POST   /api/colaborador/blocos');
    console.log('   - GET    /api/colaborador/blocos');
    console.log('   - GET    /api/colaborador/blocos/:id');
    console.log('   - PUT    /api/colaborador/blocos/:id');
    console.log('   - DELETE /api/colaborador/blocos/:id');
    console.log('\n   COLABORADOR QUESTÕES:');
    console.log('   - POST   /api/colaborador/questoes');
    console.log('   - GET    /api/colaborador/questoes');
    console.log('   - GET    /api/colaborador/questoes/:id');
    console.log('   - PUT    /api/colaborador/questoes/:id');
    console.log('   - DELETE /api/colaborador/questoes/:id');
    console.log('\n   ADMIN APPROVAL:');
    console.log('   - GET    /api/admin/blocos-colaboradores-pendentes');
    console.log('   - POST   /api/admin/blocos/:id/aprovar');
    console.log('   - POST   /api/admin/blocos/:id/rejeitar');
    console.log('   - GET    /api/admin/questoes-colaborador-pendentes');
    console.log('   - POST   /api/admin/questoes/:id/aprovar');
    console.log('   - POST   /api/admin/questoes/:id/rejeitar');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up Colaborador Workflow:', error);
    process.exit(1);
  }
}

setupColaboradorWorkflow();
