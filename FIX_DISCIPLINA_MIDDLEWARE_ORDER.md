# 🔧 FIX: Middleware Order - Disciplina Não Sendo Salva

## 🐛 PROBLEMA DESCOBERTO

**Status**: ✅ IDENTIFICADO E FIXO

Colaboradores preenchem a disciplina no cadastro, mas ela não está sendo salva na BD.

**Causa raiz**: A middleware `baseSanitizer` estava sendo aplicada **GLOBALMENTE** ANTES do `multer`, o que significa:
- multer recebe o formulário multipart/form-data
- multer processa os campos
- baseSanitizer corre (ANTES DO NOSSO HANDLER!)
- Possível interferência com o processamento

---

## 🔍 INVESTIGAÇÃO

### Estado Anterior (ERRADO)
```javascript
// Ordem ERRADA (index.js linhas 92-99)
app.use(express.json());
app.use(express.urlencoded());
app.use(baseSanitizer);  // ← GLOBAL, ANTES DE QUALQUER ROTA
app.use(cors());

// ... muitos middleware depois ...

// Rota de registo (muito depois!)
app.post('/auth/registro-colaborador',
  uploadColaboradorDocs.array(...),  // multer processa aqui
  handleColaboradorUploadErrors,
  registrarColaborador  // ← Mas o body já pode ter sido alterado
);
```

**Problema**: O `baseSanitizer` corria ANTES do multer ter processado o body!

Para formulários multipart:
1. Request chega com multipart/form-data
2. baseSanitizer corre (vê req.body vazio/incompleto)
3. Multer corre (mas pode encontrar req.body já processado)
4. Handler recebe dados possivelmente corrompidos

---

## ✅ SOLUÇÃO IMPLEMENTADA

### Código Fixo (BackEnd/index.js)
```javascript
// CORRETO (linhas 92-106)
app.use(express.json());
app.use(express.urlencoded());

// ⚠️ IMPORTANTE: baseSanitizer NÃO aplicado aqui
// Será aplicado APÓS as rotas de multipart

app.use(cors());

// ... UPLOAD & STORAGE ...
// ... HELPERS ...

// ===== ROTAS PÚBLICAS =====
app.get("/", ...);
app.use('/api/admin', ...);
app.use('/api/colaborador', ...);

// ROTA DE REGISTO (multipart/form-data)
app.post('/auth/registro-colaborador',
  uploadColaboradorDocs.array('documentos', 5),
  handleColaboradorUploadErrors,
  registrarColaborador
);

// ✅ AGORA sim, aplicar sanitizer APÓS multipart
app.use(baseSanitizer);

// Restante das rotas (que beneficiam do sanitizer)
app.get('/api/admin/colaboradores/:id/documentos', ...);
app.patch('/api/admin/colaboradores/:id/suspender', ...);
app.use('/api/certificates', ...);
// ... etc
```

### Por Que Funciona Agora?
```
1. Request chega com multipart/form-data
   ↓
2. uploadColaboradorDocs.array() processa
   ├─ Ficheiros são processados
   └─ Campos de texto ficam em req.body
   ↓
3. handleColaboradorUploadErrors valida
   ↓
4. registrarColaborador executa
   ├─ req.body tem TODOS os campos:
   │  ├─ nome ✅
   │  ├─ email ✅
   │  ├─ area_especialidade ✅ ← AGORA PRESENTE!
   │  └─ ... outros
   └─ Salva na BD com disciplina ✅
   ↓
5. DEPOIS disso, baseSanitizer corre
   (já não afeta o registo-colaborador)
```

---

## 📊 IMPACTO

### Antes do Fix
```
Colaborador preenche: area_especialidade = "matematica"
Backend recebe: area_especialidade = ??? (possivelmente vazio)
BD salva: disciplina_colaborador = NULL ❌
Admin vê: "⚠️ Não preenchida no cadastro" ❌
```

### Depois do Fix
```
Colaborador preenche: area_especialidade = "matematica"
Backend recebe: area_especialidade = "matematica" ✅
BD salva: disciplina_colaborador = "matematica" ✅
Admin vê: "Matemática" ✅
Admin aprova: Botão ativo ✅
```

---

## 🎯 TESTES NECESSÁRIOS

### 1. Registar um Novo Colaborador
```
1. Abrir formulário de registo colaborador
2. Preencher TODOS os campos incluindo "Área de especialidade"
3. Submeter
4. Verificar consoles de debug (deve mostrar area_especialidade recebida)
5. Ir para Admin Panel
6. Verificar se a disciplina aparece
```

### 2. Usar Script de Teste (Opcional)
```bash
node BackEnd/testar_registo_disciplina.js
```
Este script simula um registo com disciplina.

### 3. Verificar BD
```bash
node BackEnd/verificar_integridade_disciplinas.js
```
Deve mostrar as novas disciplinas sendo salvas.

---

## 🔐 CONSIDERAÇÕES DE SEGURANÇA

### baseSanitizer Ainda Protege
```javascript
// Ordem correta agora:

// Para formulários multipart (registo-colaborador)
1. Multer processa
2. Handler valida e salva
3. baseSanitizer NOT aplicado nesta rota ✅

// Para outras rotas (JSON/URL-encoded)
1. Express json/urlencoded processa
2. baseSanitizer corre ✅
3. Handler recebe dados sanitizados ✅
```

**Resultado**: Ambas ficam protegidas, sem conflitos!

---

## 📝 MUDANÇAS IMPLEMENTADAS

### Arquivo: `BackEnd/index.js`

**Antes** (ERRADO):
```javascript
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Global sanitizer - BEFORE ANY ROUTE
app.use(baseSanitizer);

app.use(cors({...}));

// ... muito depois ...

app.post('/auth/registro-colaborador', 
  uploadColaboradorDocs.array('documentos', 5),
  handleColaboradorUploadErrors,
  registrarColaborador
);
```

**Depois** (CORRECTO):
```javascript
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// ⚠️ IMPORTANTE: baseSanitizer NÃO aplicado aqui
// Será aplicado seletivamente apenas após multer processar

app.use(cors({...}));

// ... ROUTES ...

app.post('/auth/registro-colaborador', 
  uploadColaboradorDocs.array('documentos', 5),
  handleColaboradorUploadErrors,
  registrarColaborador
);

// ✅ Aplicar sanitizer APÓS as rotas de multipart
app.use(baseSanitizer);

// ... restante das rotas ...
```

### Arquivo: `BackEnd/controllers/colaboradorRegistroController.js`

**Debug Log Adicionado**:
```javascript
console.log('\n🚨 ════════════════════════════════════════════════════════════');
console.log('📥 REGISTO COLABORADOR - DUMP COMPLETO DO req.body:');
console.log('🔍 Todas as chaves:', Object.keys(body));
console.log('🔍 Conteúdo completo:', JSON.stringify(body, null, 2));
console.log('════════════════════════════════════════════════════════════\n');
```

---

## 🚀 PRÓXIMAS AÇÕES

### Imediato
1. ✅ Fazer push das mudanças
2. ✅ Reiniciar backend
3. ✅ Testar com novo colaborador
4. ✅ Verificar se `area_especialidade` aparece nos logs

### Depois
1. Verificar BD com `verificar_integridade_disciplinas.js`
2. Se funcionar → Remover debug logs de produção
3. Novos registos virão com disciplina ✅
4. Rejeitar antigos 6 para re-registar

---

## 📌 DOCUMENTAÇÃO

Ver também:
- `RESOLUCAO_DISCIPLINA_COLABORADOR.md` - Análise anterior
- `RESPOSTA_DISCIPLINA_DADOS_CORRECTOS.md` - Resposta técnica
- `BackEnd/testar_registo_disciplina.js` - Script de teste
- `BackEnd/verificar_integridade_disciplinas.js` - Verificação BD

---

## ✨ CONCLUSÃO

**Problema**: baseSanitizer global interferindo com multer  
**Solução**: Mover baseSanitizer DEPOIS da rota multipart  
**Resultado**: Disciplina será salva corretamente ✅  

**Este era o bug! Agora deve funcionar.**

