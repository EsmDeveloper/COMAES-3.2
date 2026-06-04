import sequelize from '../config/db.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET = process.env.JWT_SECRET || 'secret';
console.log('SECRET usado:', SECRET.substring(0,10) + '...');

const [admins] = await sequelize.query(
  'SELECT id,email,isAdmin,role FROM usuarios WHERE isAdmin=1 LIMIT 1'
);
const admin = admins[0];
console.log('Admin:', admin);

// Gerar token exatamente como o login faz
const token = jwt.sign(
  { id: admin.id, email: admin.email, isAdmin: admin.isAdmin, role: admin.role },
  SECRET,
  { expiresIn: '7d' }
);
console.log('\nToken gerado:', token.substring(0,50) + '...');

// Verificar o token
const decoded = jwt.verify(token, SECRET);
console.log('Decoded:', decoded);

// Testar contra o endpoint
const res = await fetch('http://localhost:3000/api/admin/users', {
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
});
console.log('\nStatus HTTP:', res.status);
const body = await res.text();
console.log('Response:', body.substring(0, 200));

process.exit(0);
