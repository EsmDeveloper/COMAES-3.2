# 🧪 Guia de Teste - Sistema de Certificados

## Pré-requisitos
- Backend rodando na porta 3000
- Frontend rodando (Vite)
- Banco de dados com torneios e participantes

---

## 📋 Checklist de Testes

### ✅ Teste 1: Finalização de Torneio (Admin)

**Passos:**
1. Logar como administrador
2. Ir para **Painel Admin** > **Gerenciar Torneios**
3. Localizar um torneio com status **Ativo**
4. Clicar no botão verde **✓** (Finalizar Torneio)
5. Confirmar a ação no popup

**Resultado Esperado:**
- Toast verde: "Torneio finalizado! X certificados gerados."
- Status do torneio muda para **Finalizado**
- Certificados criados no banco de dados

**Verificação no Banco:**
```sql
SELECT * FROM certificados 
WHERE torneio_id = [ID_DO_TORNEIO] 
ORDER BY disciplina, posicao;
```

---

### ✅ Teste 2: Visualizar Certificados (Admin)

**Passos:**
1. No painel admin, clicar em **Gerenciar Certificados**
2. Verificar estatísticas no topo:
   - Total de Certificados
   - Gerados
   - Validados
   - Cancelados

**Resultado Esperado:**
- Tabela carregada com todos os certificados
- Estatísticas corretas
- Cada linha mostra: usuário, torneio, disciplina, posição, pontuação, status, data

**Teste de Filtros:**
- Buscar por nome de usuário
- Filtrar por disciplina (Matemática/Programação/Inglês)
- Filtrar por status (Gerado/Validado/Cancelado)
- Filtrar por posição (1º/2º/3º)

**Teste de Ações:**
- Clicar em **📄** (Copiar Código) → Toast: "Código copiado!"
- Clicar em **⬇** (Download) → PDF baixado

---

### ✅ Teste 3: Meus Certificados (Usuário)

**Passos:**
1. Logar como usuário que ganhou certificado
2. Ir para **Perfil**
3. Clicar na aba **Meus Certificados**

**Resultado Esperado:**
- Lista de certificados do usuário
- Cards coloridos por posição:
  - 🥇 Ouro (fundo amarelo)
  - 🥈 Prata (fundo cinza)
  - 🥉 Bronze (fundo laranja)
- Informações visíveis: torneio, disciplina, posição, pontos, código, data

**Teste de Ações:**
- Clicar em **Download** → PDF baixado
- Clicar em **Copiar Código** → Toast: "Código copiado!"

**Teste Estado Vazio:**
- Logar com usuário sem certificados
- Verificar mensagem: "Nenhum certificado ainda"

---

### ✅ Teste 4: Lógica de Vencedores (Crítico)

**Cenário de Teste:**
Criar torneio com participantes:
- Usuário A: 100 pontos
- Usuário B: 50 pontos
- Usuário C: 25 pontos
- Usuário D: 0 pontos (participou mas não pontuou)

**Passos:**
1. Finalizar o torneio
2. Verificar certificados gerados

**Resultado Esperado:**
- ✅ Certificados gerados: A (1º), B (2º), C (3º)
- ❌ Certificado NÃO gerado: D (0 pontos)

**Verificação:**
```sql
SELECT u.nome, c.posicao, c.pontuacao 
FROM certificados c
JOIN usuarios u ON c.usuario_id = u.id
WHERE c.torneio_id = [ID_DO_TORNEIO]
ORDER BY c.posicao;
```

---

### ✅ Teste 5: Segurança

**Teste 5.1: Endpoint Admin sem Token**
```bash
curl http://localhost:3000/api/certificados/admin/todos
```
**Esperado:** 401 Unauthorized

**Teste 5.2: SQL Injection**
Buscar no admin: `'; DROP TABLE certificados; --`
**Esperado:** Busca retorna vazio, tabela intacta

**Teste 5.3: Código Único**
```sql
SELECT codigo_certificado, COUNT(*) 
FROM certificados 
GROUP BY codigo_certificado 
HAVING COUNT(*) > 1;
```
**Esperado:** 0 resultados (todos únicos)

---

### ✅ Teste 6: Download de Certificado

**Passos:**
1. Copiar código de um certificado
2. Acessar: `http://localhost:3000/api/certificados/download/[CODIGO]`

**Resultado Esperado:**
- Download automático do PDF
- Nome do arquivo: `Certificado_[CODIGO].pdf`

**Teste de Código Inválido:**
- Acessar: `http://localhost:3000/api/certificados/download/CODIGO_FALSO`
- **Esperado:** 404 - Certificado não encontrado

---

### ✅ Teste 7: Validação de Certificado

**Passos:**
1. Acessar: `http://localhost:3000/api/certificados/verificar/[CODIGO]`

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "valido": true,
    "usuario": "Nome do Usuário",
    "torneio": "Nome do Torneio",
    "disciplina": "Matemática",
    "posicao": 1,
    "pontuacao": "100.00",
    "dataGeracao": "2026-05-28T...",
    "status": "gerado"
  }
}
```

**Teste com Código Inválido:**
```json
{
  "success": false,
  "error": "Certificado inválido ou não encontrado"
}
```

---

## 🐛 Problemas Conhecidos e Soluções

### Problema: Certificados não aparecem no perfil
**Causa:** Endpoint retorna array vazio
**Solução:** Verificar se `torneio_id` e `usuario_id` estão corretos na tabela

### Problema: Download retorna 404
**Causa:** Arquivo PDF não foi gerado
**Solução:** Verificar logs do backend ao finalizar torneio

### Problema: Estatísticas admin mostram 0
**Causa:** Endpoint `/admin/todos` não está retornando dados
**Solução:** Verificar token de autenticação e permissões

---

## 📊 Queries Úteis para Debug

### Ver todos os certificados
```sql
SELECT 
  c.id,
  u.nome as usuario,
  t.titulo as torneio,
  c.disciplina,
  c.posicao,
  c.pontuacao,
  c.status,
  c.codigo_certificado,
  c.data_geracao
FROM certificados c
JOIN usuarios u ON c.usuario_id = u.id
JOIN torneios t ON c.torneio_id = t.id
ORDER BY c.data_geracao DESC;
```

### Certificados por usuário
```sql
SELECT * FROM certificados 
WHERE usuario_id = [ID_USUARIO]
ORDER BY data_geracao DESC;
```

### Certificados por torneio
```sql
SELECT 
  u.nome,
  c.disciplina,
  c.posicao,
  c.pontuacao
FROM certificados c
JOIN usuarios u ON c.usuario_id = u.id
WHERE c.torneio_id = [ID_TORNEIO]
ORDER BY c.disciplina, c.posicao;
```

### Verificar participantes com 0 pontos
```sql
SELECT 
  u.nome,
  pt.pontuacao,
  pt.disciplina_competida
FROM participante_torneio pt
JOIN usuarios u ON pt.usuario_id = u.id
WHERE pt.torneio_id = [ID_TORNEIO]
  AND pt.pontuacao = 0;
```

---

## ✅ Checklist Final

- [ ] Torneio pode ser finalizado pelo admin
- [ ] Certificados gerados automaticamente (top 3 por disciplina)
- [ ] Apenas participantes com pontuação > 0 recebem certificados
- [ ] Admin pode visualizar todos os certificados
- [ ] Filtros funcionam corretamente
- [ ] Usuário vê seus certificados no perfil
- [ ] Download de PDF funciona
- [ ] Código único pode ser copiado
- [ ] Validação de certificado funciona
- [ ] Estatísticas admin corretas
- [ ] Segurança: endpoints protegidos
- [ ] Segurança: queries parametrizadas
- [ ] UI responsiva (mobile + desktop)
- [ ] Toasts de feedback funcionam

---

## 🎯 Critérios de Sucesso

✅ **Sistema está funcionando** se:
1. Admin consegue finalizar torneio e ver toast de sucesso
2. Certificados aparecem na aba admin
3. Usuários vencedores veem seus certificados no perfil
4. Download de PDF funciona
5. Apenas top 3 com pontuação > 0 recebem certificados

❌ **Sistema tem problemas** se:
1. Erro ao finalizar torneio
2. Certificados não aparecem
3. Download retorna 404
4. Participantes com 0 pontos recebem certificados
5. Endpoints retornam 500

---

**Última Atualização:** 28 de Maio de 2026  
**Versão:** 1.0  
**Status:** Pronto para Testes
