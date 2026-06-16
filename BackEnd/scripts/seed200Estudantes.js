import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';
import Usuario from '../models/User.js';
import fs from 'fs';
import path from 'path';

async function seed200Estudantes() {
  try {
    console.log('🌱 Criando 200 usuários estudantes...');
    
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');
    
    const escolas = [
      'Escola Básica Integrada',
      'Escola Secundária de Castro Daire',
      'Agrupamento de Escolas da Covilhã',
      'Escola Profissional de Aveiro',
      'Instituto de Educação Técnica do Porto',
      'Liceu Nacional Português',
      'Escola Técnica de Lisboa',
      'Colégio Militar',
      'Escola Privada Santo Agostinho',
      'Centro de Educação Técnica e Profissional'
    ];

    const nomesFemininos = [
      'Maria', 'Ana', 'Sofia', 'Clara', 'Beatriz', 'Francisca', 'Joana',
      'Madalena', 'Conceição', 'Matilde', 'Gabriela', 'Fernanda', 'Helena',
      'Irene', 'Joséfina', 'Eugénia', 'Esmeralda', 'Filipa', 'Petra', 'Sónia'
    ];

    const nomesValentim = [
      'João', 'José', 'Pedro', 'Paulo', 'Nunes', 'Carlos', 'Manuel', 'Duarte',
      'Afonso', 'Gonçalo', 'Rodrigo', 'Filipe', 'Rui', 'Tiago', 'Ricardo',
      'Sérgio', 'Cristóvão', 'Bartolomeu', 'Vicente', 'Estêvão'
    ];

    const apelidos = [
      'Silva', 'Santos', 'Oliveira', 'Sousa', 'Pereira', 'Costa', 'Teixeira',
      'Martins', 'Gomes', 'Ferreira', 'Dias', 'Ribeiro', 'Lopes', 'Alves',
      'Andrade', 'Carvalho', 'Correia', 'Barbosa', 'Vieira', 'Morais', 'Pinto'
    ];

    const usuariosExistentes = await Usuario.count();
    console.log(`📊 Usuários existentes: ${usuariosExistentes}`);

    const senhaPlana = '928837792Esm';
    const senhaHash = await bcrypt.hash(senhaPlana, 10);
    
    const usuariosAAdd = [];
    const usuariosData = [];

    for (let i = 0; i < 100; i++) {
      const isMale = Math.random() > 0.5;
      const primeiroNome = isMale 
        ? nomesValentim[Math.floor(Math.random() * nomesValentim.length)]
        : nomesFemininos[Math.floor(Math.random() * nomesFemininos.length)];
      
      const sobrenome1 = apelidos[Math.floor(Math.random() * apelidos.length)];
      const sobrenome2 = apelidos[Math.floor(Math.random() * apelidos.length)];
      const nome = `${primeiroNome} ${sobrenome1} ${sobrenome2}`;
      
      const email = `estudante${usuariosExistentes + i + 1}@comaes.com`;
      const telefone = `+351${String(Math.floor(Math.random() * 900000000) + 100000000).slice(0, 9)}`;
      
      const anoNascimento = Math.floor(Math.random() * (2010 - 2000 + 1)) + 2000;
      const meNascimento = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const diaNascimento = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const nascimento = `${anoNascimento}-${meNascimento}-${diaNascimento}`;
      
      const sexo = isMale ? 'Masculino' : 'Feminino';
      const escola = escolas[Math.floor(Math.random() * escolas.length)];

      usuariosAAdd.push({
        nome,
        email,
        telefone,
        password: senhaHash,
        nascimento,
        sexo,
        escola,
        role: 'estudante',
        isAdmin: 0,
        xp_total: 0,
        nivel_atual: 1,
        status_colaborador: 'pendente'
      });

      usuariosData.push({
        numero: usuariosExistentes + i + 1,
        nome,
        email,
        telefone,
        nascimento,
        sexo,
        escola,
        password: senhaPlana
      });

      if ((i + 1) % 50 === 0) {
        console.log(`   Preparados ${i + 1} usuários...`);
      }
    }

    const tamLote = 50;
    for (let i = 0; i < usuariosAAdd.length; i += tamLote) {
      const lote = usuariosAAdd.slice(i, i + tamLote);
      await Usuario.bulkCreate(lote, { validate: false });
      console.log(`✅ Inseridos usuários ${i + 1}-${Math.min(i + tamLote, usuariosAAdd.length)}`);
    }

    let mdContent = `# 📋 Lista de 200 Usuários Estudantes Criados\n\n`;
    mdContent += `**Data**: ${new Date().toLocaleString('pt-PT')}\n`;
    mdContent += `**Senha padrão**: \`${senhaPlana}\`\n`;
    mdContent += `**Role**: Estudante\n`;
    mdContent += `**Status inicial**: Pendente\n`;
    mdContent += `**XP inicial**: 0\n`;
    mdContent += `**Nível inicial**: 1\n\n`;
    mdContent += `| # | Nome | Email | Telefone | Nascimento | Sexo | Escola |\n`;
    mdContent += `|---|------|-------|----------|------------|------|--------|\n`;

    usuariosData.forEach((user) => {
      mdContent += `| ${user.numero} | ${user.nome} | ${user.email} | ${user.telefone} | ${user.nascimento} | ${user.sexo} | ${user.escola} |\n`;
    });

    mdContent += `\n## 📊 Resumo\n`;
    mdContent += `- **Total de usuários criados**: 100\n`;
    mdContent += `- **Todos compartilham a senha**: ${senhaPlana}\n`;
    mdContent += `- **IDs dos usuários**: ${usuariosExistentes + 1} até ${usuariosExistentes + 100}\n`;

    const filePath = path.join(process.cwd(), 'USUARIOS_CRIADOS.md');
    fs.writeFileSync(filePath, mdContent, 'utf-8');

    console.log('\n✅ 100 estudantes criados com sucesso!');
    console.log(`📄 Arquivo gerado: ${filePath}`);
    console.log(`📧 Emails: estudante${usuariosExistentes + 1}@comaes.com até estudante${usuariosExistentes + 100}@comaes.com`);
    console.log(`🔐 Senha para todos: ${senhaPlana}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

seed200Estudantes();
