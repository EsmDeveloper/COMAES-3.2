/**
 * seed-colaboradores.js
 * Script para limpar e criar 20 novos colaboradores em status pendente
 */

import sequelize from '../config/db.js';
import Usuario from '../models/User.js';
import bcrypt from 'bcryptjs';

const PASSWORD = '928837792Esm.';
const DISCIPLINAS = ['matematica', 'ingles', 'programacao'];
const NIVEIS = ['estudante_universitario', 'tecnico', 'licenciado', 'mestre', 'doutor', 'professor'];
const SEXOS = ['Masculino', 'Feminino', 'Outro'];

async function seedColaboradores() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // 1. Limpar colaboradores existentes (com força máxima)
    console.log('\n🗑️  Limpando colaboradores existentes...');
    
    // Primeiro, desabilitar FK constraints
    await sequelize.query('SET FOREIGN_KEY_CHECKS=0');
    
    const deletados = await Usuario.destroy({
      where: { role: 'colaborador' },
      force: true
    });
    console.log(`✅ ${deletados} colaboradores deletados`);
    
    // Reabilitar FK constraints
    await sequelize.query('SET FOREIGN_KEY_CHECKS=1');

    // 2. Hash da password
    const passwordHash = bcrypt.hashSync(PASSWORD, 10);

    // 3. Dados dos 20 colaboradores
    const nomes = [
      'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira',
      'Marta Gomes', 'Ricardo Martins', 'Joana Pereira', 'Paulo Rodrigues', 'Cristina Alves',
      'António Neves', 'Sandra Lima', 'Fernando Rocha', 'Patrícia Tavares', 'Miguel Sousa',
      'Lúcia Barbosa', 'Rui Dias', 'Conceição Mendes', 'Duarte Brites', 'Filipa Pires'
    ];

    const colaboradores = nomes.map((nome, index) => {
      const email = `colab${index + 1}@comaes.pt`;
      const username = `colaborador_${index + 1}`;
      const disciplina = DISCIPLINAS[index % DISCIPLINAS.length];
      const nivel = NIVEIS[index % NIVEIS.length];
      const sexo = SEXOS[index % SEXOS.length];
      const telefone = `9${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`;
      const nascimento = new Date(1990 + (index % 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

      return {
        nome,
        email,
        username,
        password: passwordHash,
        role: 'colaborador',
        status_colaborador: 'pendente',
        disciplina_colaborador: disciplina,
        nivel_academico: nivel,
        sexo,
        telefone,
        nascimento: nascimento.toISOString().split('T')[0],
        biografia: `Sou um colaborador experiente em ${disciplina.replace('_', ' ')} com ${nivel.replace('_', ' ')}.`,
        documentos_colaborador: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // 4. Criar colaboradores
    console.log('\n📝 Criando 20 novos colaboradores...');
    const criados = await Usuario.bulkCreate(colaboradores, { validate: true });
    console.log(`✅ ${criados.length} colaboradores criados com sucesso`);

    // 5. Listar os criados
    console.log('\n📋 Colaboradores criados:');
    criados.forEach((c, i) => {
      console.log(`${i + 1}. ${c.nome} (${c.email}) - ${c.status_colaborador}`);
    });

    console.log('\n✅ Script completado com sucesso!');
    console.log(`\n🔐 Password comum: ${PASSWORD}`);
    console.log('📧 Emails: colab1@comaes.pt até colab20@comaes.pt');
    console.log('👤 Usernames: colaborador_1 até colaborador_20');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar
seedColaboradores();
