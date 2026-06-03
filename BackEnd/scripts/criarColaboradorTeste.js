/**
 * criarColaboradorTeste.js
 * Script para criar um utilizador colaborador de teste já aprovado
 *
 * Executar com:
 *   node BackEnd/scripts/criarColaboradorTeste.js
 *
 * Cria 3 colaboradores (um por disciplina) prontos para login imediato.
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Carregar .env do BackEnd
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import sequelize from '../config/db.js';
import Usuario from '../models/User.js';

const COLABORADORES = [
  {
    nome: 'Ana Colaboradora',
    email: 'colaborador.mat@comaes.ao',
    telefone: '921000001',
    nascimento: '1995-06-15',
    sexo: 'Feminino',
    escola: 'Universidade Agostinho Neto',
    role: 'colaborador',
    disciplina_colaborador: 'matematica',
    status_colaborador: 'aprovado',
    isAdmin: false,
    biografia: 'Colaboradora de teste para a disciplina de Matemática.',
    password_plain: 'Comaes@2026',
  },
  {
    nome: 'Bruno Colaborador',
    email: 'colaborador.prog@comaes.ao',
    telefone: '921000002',
    nascimento: '1993-03-22',
    sexo: 'Masculino',
    escola: 'Instituto Superior Politécnico de Angola',
    role: 'colaborador',
    disciplina_colaborador: 'programacao',
    status_colaborador: 'aprovado',
    isAdmin: false,
    biografia: 'Colaborador de teste para a disciplina de Programação.',
    password_plain: 'Comaes@2026',
  },
  {
    nome: 'Clara Colaboradora',
    email: 'colaborador.ing@comaes.ao',
    telefone: '921000003',
    nascimento: '1997-11-08',
    sexo: 'Feminino',
    escola: 'Instituto Médio Politécnico de Luanda',
    role: 'colaborador',
    disciplina_colaborador: 'ingles',
    status_colaborador: 'aprovado',
    isAdmin: false,
    biografia: 'Colaboradora de teste para a disciplina de Inglês.',
    password_plain: 'Comaes@2026',
  },
  {
    nome: 'David Pendente',
    email: 'colaborador.pendente@comaes.ao',
    telefone: '921000004',
    nascimento: '1999-07-30',
    sexo: 'Masculino',
    escola: 'Escola Técnica Comercial',
    role: 'colaborador',
    disciplina_colaborador: 'matematica',
    status_colaborador: 'pendente',   // pendente — para testar bloqueio de login
    isAdmin: false,
    biografia: 'Colaborador de teste com conta pendente.',
    password_plain: 'Comaes@2026',
  },
];

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Ligação à base de dados estabelecida.\n');

    for (const dados of COLABORADORES) {
      const { password_plain, ...campos } = dados;

      // Verificar se já existe
      const existente = await Usuario.unscoped().findOne({
        where: { email: campos.email }
      });

      if (existente) {
        console.log(`⚠️  Já existe: ${campos.email} — a ignorar.`);
        continue;
      }

      // Fazer hash da password
      const password = await bcrypt.hash(password_plain, 12);

      // Criar utilizador (ignora validações do modelo para o script)
      await Usuario.unscoped().create({ ...campos, password });

      const statusLabel = campos.status_colaborador === 'aprovado'
        ? '✅ APROVADO'
        : '⏳ PENDENTE';

      console.log(`✅ Criado: ${campos.nome}`);
      console.log(`   Email:      ${campos.email}`);
      console.log(`   Password:   ${password_plain}`);
      console.log(`   Disciplina: ${campos.disciplina_colaborador}`);
      console.log(`   Status:     ${statusLabel}`);
      console.log('');
    }

    console.log('─'.repeat(50));
    console.log('RESUMO DE CREDENCIAIS DE TESTE');
    console.log('─'.repeat(50));
    console.log('Password comum para todos: Comaes@2026');
    console.log('');
    console.log('LOGIN FUNCIONAL (aprovados):');
    console.log('  colaborador.mat@comaes.ao  → Matemática');
    console.log('  colaborador.prog@comaes.ao → Programação');
    console.log('  colaborador.ing@comaes.ao  → Inglês');
    console.log('');
    console.log('LOGIN BLOQUEADO (pendente):');
    console.log('  colaborador.pendente@comaes.ao → deve retornar 403');
    console.log('─'.repeat(50));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.errors) {
      error.errors.forEach(e => console.error('   •', e.message));
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
