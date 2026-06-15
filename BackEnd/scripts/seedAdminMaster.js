import bcrypt from 'bcryptjs';
import Usuario from '../models/User.js';
import sequelize from '../config/db.js';

async function seedAdminMaster() {
  try {
    console.log('🌱 Criando Admin Master...');
    
    await sequelize.authenticate();
    
    const existingAdmin = await Usuario.findByPk(1);
    if (existingAdmin) {
      console.log('✅ Admin Master já existe');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await Usuario.create({
      id: 1,
      nome: 'Administrador Master',
      email: 'admin@comaes.com',
      password: hashedPassword,
      isAdmin: true,
      ativo: true,
      role: 'admin',
      telefone: '+351-000-000-000',
      nascimento: '1990-01-01',
      sexo: 'M'
    });
    
    console.log('✅ Admin Master criado com sucesso!');
    console.log('Email: admin@comaes.com');
    console.log('Senha: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar Admin Master:', error);
    process.exit(1);
  }
}

seedAdminMaster();
