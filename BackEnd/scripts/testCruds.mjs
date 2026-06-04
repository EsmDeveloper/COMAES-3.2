/**
 * testCruds.mjs — Testa todos os CRUDs do painel administrativo
 * Executa: listar, criar, actualizar, apagar para users e noticias
 */
import sequelize from '../config/db.js';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const BASE = 'http://localhost:3000';
const SECRET = process.env.JWT_SECRET || 'secret';
console.log('JWT_SECRET:', SECRET.substring(0,8) + '...');

// Buscar admin do banco
const [admins] = await sequelize.query(
  'SELECT id,email,isAdmin,role FROM usuarios WHERE isAdmin=1 LIMIT 1'
);
const admin = admins[0];
if (!admin) { console.error('❌ Nenhum admin encontrado'); process.exit(1); }

const TOKEN = jwt.sign(
  { id: admin.id, email: admin.email, isAdmin: admin.isAdmin, role: admin.role },
  SECRET,
  { expiresIn: '1h' }
);

const H = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` };
const api = (path) => `${BASE}/api/admin${path}`;

let passed = 0, failed = 0;

async function test(name, fn) {
  try {
    const result = await fn();
    console.log(`  ✅ ${name}`, result ? `(${result})` : '');
    passed++;
  } catch(e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: H,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json).substring(0,120)}`);
  return json;
}

// ═══════════════════════════════════════
console.log('\n=== CRUD UTILIZADORES ===');
// ═══════════════════════════════════════

let createdUserId = null;

await test('GET /api/admin/users — listar todos', async () => {
  const res = await req('GET', api('/users'));
  const count = Array.isArray(res) ? res.length : res.data?.length;
  return `${count} utilizadores`;
});

await test('POST /api/admin/users — criar utilizador estudante', async () => {
  const ts = Date.now();
  const body = {
    nome: 'Utilizador Teste',
    email: `teste.crud.${ts}@comaes.ao`,
    telefone: `9${String(ts).slice(-8)}`,
    nascimento: '2000-01-15',
    sexo: 'Masculino',
    escola: null,
    password: 'Teste@12345',
    confirmPassword: 'Teste@12345',
    role: 'estudante',
  };
  const res = await req('POST', api('/users'), body);
  createdUserId = res.data?.id;
  return `id=${createdUserId}`;
});

await test('PUT /api/admin/users/:id — actualizar biografia', async () => {
  if (!createdUserId) throw new Error('Sem ID para actualizar');
  const res = await req('PUT', api(`/users/${createdUserId}`), { biografia: 'Bio de teste CRUD' });
  return `nome=${res.data?.nome}`;
});

await test('DELETE /api/admin/users/:id — eliminar utilizador criado', async () => {
  if (!createdUserId) throw new Error('Sem ID para eliminar');
  await req('DELETE', api(`/users/${createdUserId}`));
  return 'eliminado';
});

// ═══════════════════════════════════════
console.log('\n=== CRUD NOTÍCIAS ===');
// ═══════════════════════════════════════

let createdNoticiaId = null;

// A rota de notícias pode ser genérica /api/admin/noticia ou específica
const noticiaBase = `${BASE}/api/admin/noticia`;

await test('GET notícias — listar', async () => {
  const res = await req('GET', noticiaBase);
  const items = Array.isArray(res) ? res : (res.data || []);
  return `${items.length} notícias`;
});

await test('POST notícias — criar', async () => {
  const body = {
    titulo: `Notícia de Teste CRUD ${Date.now()}`,
    resumo: 'Resumo de teste',
    conteudo: 'Conteúdo completo da notícia de teste para verificação do CRUD.',
    publicado: false,
    tags: 'teste,crud',
    autor_id: admin.id,
  };
  const res = await req('POST', noticiaBase, body);
  createdNoticiaId = res.id || res.data?.id || res.data?.[0]?.id;
  return `id=${createdNoticiaId}`;
});

await test('PUT notícias/:id — actualizar', async () => {
  if (!createdNoticiaId) throw new Error('Sem ID de notícia');
  const res = await req('PUT', `${noticiaBase}/${createdNoticiaId}`, { titulo: 'Título actualizado CRUD' });
  return `actualizado`;
});

await test('DELETE notícias/:id — eliminar', async () => {
  if (!createdNoticiaId) throw new Error('Sem ID de notícia');
  await req('DELETE', `${noticiaBase}/${createdNoticiaId}`);
  return 'eliminada';
});

// ═══════════════════════════════════════
console.log('\n=== CRUD NOTIFICAÇÕES ===');
// ═══════════════════════════════════════

let createdNotifId = null;
const notifBase = `${BASE}/api/admin/notificacao`;

await test('GET notificações — listar', async () => {
  const res = await req('GET', notifBase);
  const items = Array.isArray(res) ? res : (res.data || []);
  return `${items.length} notificações`;
});

await test('POST notificações — criar', async () => {
  const body = {
    usuario_id: admin.id,
    tipo: 'geral',
    conteudo: JSON.stringify({ titulo: 'Teste CRUD', mensagem: 'Notificação de teste' }),
    lido: false,
  };
  const res = await req('POST', notifBase, body);
  createdNotifId = res.id || res.data?.id;
  return `id=${createdNotifId}`;
});

await test('DELETE notificações/:id — eliminar', async () => {
  if (!createdNotifId) throw new Error('Sem ID de notificação');
  await req('DELETE', `${notifBase}/${createdNotifId}`);
  return 'eliminada';
});

// ═══════════════════════════════════════
console.log('\n=== OPERAÇÕES ESPECIAIS DE UTILIZADORES ===');
// ═══════════════════════════════════════

await test('GET /api/admin/colaboradores — listar colaboradores', async () => {
  const res = await req('GET', api('/colaboradores'));
  return `${(res.data || []).length} colaboradores`;
});

await test('GET /api/admin/colaboradores-pendentes — listar pendentes', async () => {
  const res = await req('GET', api('/colaboradores-pendentes'));
  return `${(res.data || []).length} pendentes`;
});

// ═══════════════════════════════════════
console.log(`\n${'='.repeat(45)}`);
console.log(`RESULTADO: ${passed} ✅ passou | ${failed} ❌ falhou`);
if (failed === 0) {
  console.log('🎉 Todos os CRUDs estão funcionais!');
} else {
  console.log('⚠️  Alguns CRUDs precisam de atenção.');
}
console.log('='.repeat(45));

process.exit(failed > 0 ? 1 : 0);
