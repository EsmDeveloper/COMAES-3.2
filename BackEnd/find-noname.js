import sequelize from './config/db.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    // Search for noname
    const [results] = await sequelize.query(
      "SELECT id, nome, email, telefone, role, status_colaborador FROM usuarios WHERE email LIKE '%noname%' OR telefone LIKE '%noname%'"
    );
    
    if (results.length > 0) {
      console.log('✅ Found user(s) matching "noname":');
      results.forEach(u => {
        console.log(`   [${u.id}] ${u.nome}`);
        console.log(`       Email: ${u.email}`);
        console.log(`       Telefone: ${u.telefone}`);
        console.log(`       Role: ${u.role}`);
        console.log(`       Status: ${u.status_colaborador}\n`);
      });
    } else {
      console.log('❌ No user found with "noname" in email or phone');
      
      // List all emails to see what's there
      console.log('\n📋 All emails in database:');
      const [allUsers] = await sequelize.query('SELECT email FROM usuarios ORDER BY id');
      allUsers.forEach((u, idx) => {
        console.log(`   ${idx + 1}. ${u.email}`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
