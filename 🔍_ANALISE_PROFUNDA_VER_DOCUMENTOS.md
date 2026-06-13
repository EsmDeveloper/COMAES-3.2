# 🔍 ANÁLISE PROFUNDA - Problema "Ver Documentos"

**Data**: 12 de Junho de 2026  
**Problema**: Documentos não aparecem quando clica em "Ver documentos enviados"  
**Status**: Investigação em Progresso

---

## 📊 FLUXO COMPLETO MAPEADO

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: ColaboradoresTab.jsx                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Admin clica "Ver documentos"                                │
│     ↓                                                            │
│  2. carregarDocs() chamado                                       │
│     const res = await svc.colaboradores.getDocumentos(id)      │
│     ↓                                                            │
│  3. adminService.js → createApiClient.get()                     │
│     baseURL = '/api/admin/'                                     │
│     URL final = '/api/admin/colaboradores/{id}/documentos'      │
│     ↓                                                            │
│  4. axios faz GET /api/admin/colaboradores/:id/documentos       │
│     Header: Authorization: Bearer {token}                       │
│     ↓                                                            │
│  5. res = { success: true, data: [...] }                        │
│     ↓                                                            │
│  6. setDocs(res.data || [])                                     │
│     showDocs = true                                             │
│     ↓                                                            │
│  7. Renderizar lista de documentos                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: BackEnd/index.js                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Express rota: GET /api/admin/colaboradores/:id/documentos  │
│     Middlewares: [isAdmin, getDocumentosColaborador]           │
│     ↓                                                            │
│  2. isAdmin verifica token e papel                              │
│     ↓                                                            │
│  3. getDocumentosColaborador(req, res):                         │
│     const { id } = req.params                                   │
│     const user = await Usuario.unscoped().findByPk(id, {       │
│       attributes: ['id', 'nome', 'email', documentos_colaborador']
│     })                                                          │
│     ↓                                                            │
│  4. if (!user) → 404                                            │
│     ↓                                                            │
│  5. res.json({                                                  │
│       success: true,                                            │
│       data: user.documentos_colaborador || []                   │
│     })                                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 CHECKPOINTS DE DEBUG

### Checkpoint 1: Dados no Backend
```bash
# Verificar se colaborador tem documentos no BD
mysql> SELECT id, nome, documentos_colaborador FROM usuarios 
        WHERE role = 'colaborador' AND documentos_colaborador IS NOT NULL;

# Se nada retorna → Problema: Documentos não foram salvos no registro
# Se retorna dados → Problema está no frontend/API
```

### Checkpoint 2: Resposta da API (DevTools → Network)
```
GET /api/admin/colaboradores/[id]/documentos
Status: 200 OK

Resposta esperada:
{
  "success": true,
  "data": [
    {
      "nome_original": "CV.pdf",
      "nome_ficheiro": "docs_..._cv.pdf",
      "caminho": "/uploads/colaborador-docs/docs_..._cv.pdf",
      "url": "http://localhost:3000/uploads/colaborador-docs/...",
      "tipo": "application/pdf",
      "tamanho": 123456,
      "data_upload": "2024-06-12T10:30:00.000Z"
    }
  ]
}
```

### Checkpoint 3: Console Browser (DevTools → Console)
```javascript
// Deveria ver:
// Se sucesso: Silent (sem erros)
// Se erro: "Erro ao carregar documentos: [detalhes]"

// Testar manualmente:
const token = localStorage.getItem('comaes_token');
fetch('/api/admin/colaboradores/123/documentos', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Resposta:', d))
.catch(e => console.error('Erro:', e));
```

---

## 🎯 POSSÍVEIS CAUSAS

### Causa 1: Documentos não foram salvos
```javascript
// Problema: No registro de colaborador, formatarDocumentos retorna null
// Verificar: colaboradorRegistroController.js linha 97
const documentos = files.length > 0 ? formatarDocumentos(files, baseUrl) : null;
// Se files.length === 0 → documentos = null ❌
```

**Teste**:
```sql
SELECT id, nome, documentos_colaborador 
FROM usuarios 
WHERE id = [colaborador_id_com_docs];

-- Verificar se documentos_colaborador é:
-- NULL → Não foi salvo ❌
-- [] → Array vazio ❌
-- [...] → Tem dados ✅
```

---

### Causa 2: API retorna 404
```
GET /api/admin/colaboradores/[id]/documentos
Status: 404

Razão: Colaborador não encontrado
```

**Verificação**:
- [ ] ID do colaborador está correto?
- [ ] Usuário existe no BD?
- [ ] Admin está logado?

---

### Causa 3: API retorna 401/403
```
GET /api/admin/colaboradores/[id]/documentos
Status: 401 Unauthorized
Status: 403 Forbidden

Razão: Admin não autenticado ou sem permissão
```

**Verificação**:
- [ ] Token é válido?
- [ ] User tem isAdmin = 1?
- [ ] Token não expirou?

---

### Causa 4: Frontend recebe dados mas não renderiza
```javascript
// setDocs() recebeu [], não null
// showDocs = true
// Mas renderização mostra mensagem vazia em vez de lista

// Problema possível: docs && docs.length === 0 check está falhando
```

**Verificação**:
```javascript
// DevTools → React DevTools
// Procurar ModalDetalhes component
// Ver state: docs = ?, showDocs = ?
```

---

## 🧪 TESTE MANUAL PASSO A PASSO

### Passo 1: Verificar Dados no BD
```bash
# Terminal do PC
mysql -u root -p

use comaes_db;  # ou DB name correto

SELECT id, nome, documentos_colaborador 
FROM usuarios 
WHERE role = 'colaborador' AND status_colaborador = 'pendente'
LIMIT 1;

# Resultado esperado:
# id | nome | documentos_colaborador
# 42 | João | [{"nome_original":"CV.pdf",...}]
```

### Passo 2: Abrir Painel Admin
1. Login como admin
2. Navegar para Colaboradores
3. Selecionar um colaborador com status "Pendente"

### Passo 3: Abrir DevTools
1. Pressionar F12
2. Ir a "Network"
3. Filter: "documentos"

### Passo 4: Clicar "Ver documentos enviados"
1. Observar Network tab
2. Deve aparecer: GET /api/admin/colaboradores/[id]/documentos
3. Status: 200 OK
4. Resposta: { success: true, data: [...] }

### Passo 5: Verificar Console
1. Ir a Console tab
2. Deve estar vazio (sem erros)
3. Se houver erro: "Erro ao carregar documentos: ..."

### Passo 6: Verificar Renderização
1. Deve ver lista de documentos
2. Ou mensagem: "📄 Nenhum documento foi enviado..."
3. Se branco → Problema na renderização

---

## 📝 DADOS ESPERADOS

**Estrutura do objeto documento**:
```javascript
{
  "nome_original": "Curriculum_Vitae.pdf",        // Nome original do ficheiro
  "nome_ficheiro": "docs_16857394_cv.pdf",       // Nome salvo no servidor
  "caminho": "/uploads/colaborador-docs/docs_...", // Path para acesso
  "url": "http://localhost:3000/uploads/...",    // URL completa
  "tipo": "application/pdf",                      // MIME type
  "tamanho": 2048576,                            // Bytes
  "data_upload": "2024-06-12T10:30:00.000Z"      // ISO string
}
```

**Renderização esperada**:
```
┌─────────────────────────────────────────────────────────────┐
│ 📄 Curriculum_Vitae.pdf   2.0 MB   12 Jun 2024  [👁] [⬇]  │
│ 📋 Certificado.pdf         1.5 MB   12 Jun 2024  [👁] [⬇]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 SE AINDA NÃO FUNCIONAR

### Opção 1: Adicionar logs de debug

**Frontend - ColaboradoresTab.jsx linha 93**:
```javascript
const carregarDocs = async () => {
  if (showDocs) { setShowDocs(false); return; }
  setLoadingDocs(true);
  try {
    console.log('🔍 Carregando documentos para ID:', colaborador.id);
    const res = await svc.colaboradores.getDocumentos(colaborador.id);
    console.log('✅ Resposta da API:', res);
    console.log('📄 Documentos:', res.data);
    setDocs(res.data || []);
  } catch (err) { 
    console.error('❌ Erro ao carregar documentos:', err);
    console.error('Detalhes:', err.response?.data);
    setDocs([]); 
  }
  finally { setLoadingDocs(false); setShowDocs(true); }
};
```

**Backend - colaboradorRegistroController.js linha 176**:
```javascript
export const getDocumentosColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 [GET /documentos] ID:', id);
    
    const user = await Usuario.unscoped().findByPk(id, {
      attributes: ['id', 'nome', 'email', 'documentos_colaborador'],
    });
    
    console.log('👤 User encontrado:', !!user);
    if (user) {
      console.log('📄 Documentos:', user.documentos_colaborador);
    }
    
    if (!user) return res.status(404).json({ message: 'Colaborador não encontrado.' });
    
    const resposta = { success: true, data: user.documentos_colaborador || [] };
    console.log('📤 Resposta:', resposta);
    res.json(resposta);
  } catch (e) {
    console.error('❌ Erro:', e);
    res.status(500).json({ message: 'Erro ao obter documentos.' });
  }
};
```

Depois, ver Console (DevTools) e Backend logs para identificar onde falha.

---

## 📞 PRÓXIMOS PASSOS

1. [ ] Executar Checkpoint 1 (verificar BD)
2. [ ] Executar Checkpoint 2 (verificar resposta API)
3. [ ] Executar Checkpoint 3 (verificar console)
4. Se problema persiste:
   - [ ] Adicionar logs de debug (Opção 1)
   - [ ] Executar test manual passo a passo
   - [ ] Partilhar screenshot ou logs

---

**Status**: Aguardando feedback do utilizador com dados dos checkpoints
