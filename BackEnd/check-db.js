import sequelize from './config/db.js';
import Usuario from './models/User.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('[SUCCESS] Connected to database');
    
    // Check if table exists
    const [tables] = await sequelize.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'"
    );
    
    if (tables.length === 0) {
      console.log('[ERROR] Table "usuarios" does not exist!');
      console.log('🔨 Creating/Syncing table...');
      await Usuario.sync({ alter: true });
      console.log('[SUCCESS] Table created');
    } else {
      console.log('[SUCCESS] Table "usuarios" exists');
      
      // Count rows
      const [count] = await sequelize.query('SELECT COUNT(*) as total FROM usuarios');
      console.log('[CHART] Total records:', count[0].total);
      
      if (count[0].total > 0) {
        const [users] = await sequelize.query('SELECT id, nome, email, telefone, role FROM usuarios LIMIT 10');
        console.log('\n[LIST] First 10 users:');
        users.forEach(u => {
          console.log(`   [${u.id}] ${u.nome} | ${u.email} | ${u.telefone} | Role: ${u.role}`);
        });
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Error:', err.message);
    process.exit(1);
  }
})();
