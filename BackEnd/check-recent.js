import sequelize from './config/db.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected\n');
    
    // Get last 20 users (most recent)
    const [recent] = await sequelize.query(
      "SELECT id, nome, email, telefone, role, createdAt FROM usuarios ORDER BY createdAt DESC LIMIT 20"
    );
    
    console.log('📋 Most Recent 20 Users:\n');
    recent.forEach(u => {
      console.log(`[${u.id}] ${u.nome}`);
      console.log(`    Email: ${u.email}`);
      console.log(`    Created: ${u.createdAt}\n`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
