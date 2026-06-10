# 🎯 GUIA PRÁTICO - TESTES END-TO-END DO SISTEMA DE TORNEIOS

**Versão**: 3.2  
**Data**: 9 de junho de 2026  
**Objetivo**: Validar todos os cenários de uso do sistema de torneios

---

## 📋 PRÉ-REQUISITOS

- ✅ Backend iniciado: `npm start` em `BackEnd/`
- ✅ Frontend iniciado: `npm run dev` em `FrontEnd/`
- ✅ Banco de dados: Conectado e funcionando
- ✅ Blocos de questões criados em pelo menos uma disciplina

---

## 🧪 CENÁRIO 1: TORNEIO GENÉRICO COM MÚLTIPLAS DISCIPLINAS

### Passo 1: Verificar Torneio Ativo

**Endpoint**: `GET http://localhost:3001/api/torneios/ativo`

**Esperado**:
```json
{
  "success": true,
  "ativo": true,
  "dentroDoPeriodo": true,
  "torneio": {
    "tipo_torneio": "generico",
    "disciplina_especifica": null
  }
}
```

**Comando PowerShell**:
```powershell
$ProgressPreference = 'SilentlyContinue'
$res = Invoke-WebRequest -Uri "http://localhost:3001/api/torneios/ativo" -UseBasicParsing
$res.Content | ConvertFrom-Json | ConvertTo-Json
```

**✅ Verificação**: JSON válido, `tipo_torneio === "generico"`

---

### Passo 2: Verificar Disciplinas Disponíveis

**Endpoint**: `GET http://localhost:3001/api/torneios/ativo/disciplinas`

**Esperado**:
```json
{
  "success": true,
  "tipo_torneio": "generico",
  "disciplina_especifica": null,
  "disciplinas": ["Matemática", "Inglês"],
  "message": "2 disciplina(s) disponível(eis)"
}
```

**Nota**: Apenas disciplinas com blocos publicados aparecem

**✅ Verificação**: Múltiplas disciplinas, nenhuma está filtrada por tipo

---

### Passo 3: Acessar Frontend - Página de Entrada

**URL**: `http://localhost:5173/entrar-no-torneio` (ou sua porta frontend)

**Verificações**:
- [ ] Página carrega sem erros
- [ ] Mensagem "Torneio Ativo!" aparece em verde
- [ ] Todas as disciplinas com blocos são exibidas em cards
- [ ] Cards são clicáveis

**❌ Se erro "Erro ao conectar com o servidor"**:
```
→ Verificar console do navegador
→ Verificar se backend está rodando
→ Verificar logs do backend para erros de serialização
```

---

### Passo 4: Entrar em uma Disciplina

**Ação**: Clique em um card de disciplina (ex: Matemática)

**Modal deve aparecer com**:
- [ ] Imagem da disciplina
- [ ] Nome da disciplina
- [ ] Título do torneio
- [ ] Botão "Entrar no Torneio"
- [ ] Datas do torneio

**Clique em "Entrar no Torneio"**

**Esperado**:
- [ ] Loading spinner apareça
- [ ] Redirecionado para `/matematica-original/[seu-nome]`
- [ ] Sem erros JSON

---

### Passo 5: Verificar Impedimento de Participação Simultânea

**Ação**: Tente entrar em outra disciplina enquanto já está em uma

**Esperado**:
- [ ] Erro apareça
- [ ] Mensagem: "Você já está participando de outro torneio..."
- [ ] Não é permitido participar simultaneamente

---

## 🧪 CENÁRIO 2: TORNEIO ESPECÍFICO

### Passo 1: Ativar Torneio Específico

**Via Admin** ou **via banco de dados**:

```sql
UPDATE torneios 
SET status = 'finalizado' 
WHERE tipo_torneio = 'generico' AND status = 'ativo';

UPDATE torneios 
SET status = 'ativo' 
WHERE tipo_torneio = 'especifico' AND tipo_torneio = 'especifico';
```

Ou use o script de teste:
```bash
node BackEnd/test-specific-torneio.js
```

---

### Passo 2: Verificar Resposta do Endpoint

**GET** `http://localhost:3001/api/torneios/ativo`

**Esperado**:
```json
{
  "torneio": {
    "tipo_torneio": "especifico",
    "disciplina_especifica": "Matemática"
  }
}
```

**✅ Verificação**: `tipo_torneio === "especifico"`

---

### Passo 3: Verificar Filtragem de Disciplinas

**GET** `http://localhost:3001/api/torneios/ativo/disciplinas`

**Esperado**:
```json
{
  "tipo_torneio": "especifico",
  "disciplina_especifica": "Matemática",
  "disciplinas": ["Matemática"]
}
```

**✅ Verificação**: Apenas Matemática retornada, mesmo que outras tivessem blocos

---

### Passo 4: Frontend - Verificar Filtragem

**URL**: `http://localhost:5173/entrar-no-torneio`

**Verificações**:
- [ ] Apenas 1 card é exibido (Matemática)
- [ ] Outros cards não aparecem
- [ ] Card está clicável
- [ ] Tooltip ou mensagem indica "Torneio específico de Matemática"

**❌ Se múltiplos cards aparecem**:
```
→ Frontend não filtrou corretamente
→ Verificar EntrarTorneio.jsx linhas 120-145
→ Verificar console para erros
```

---

### Passo 5: Tentar Entrar em Disciplina Errada

**Teste via API** (simular tentativa):

```bash
POST http://localhost:3001/api/participantes/inscrever
{
  "torneio_id": 47,
  "usuario_id": 1,
  "disciplina_competida": "Inglês"  # ❌ Errado!
}
```

**Esperado**:
```json
{
  "success": false,
  "message": "Este torneio é específico apenas para Matemática"
}
```

**✅ Verificação**: Rejeição correta

---

## 🧪 CENÁRIO 3: EXPIRAÇÃO AUTOMÁTICA

### Passo 1: Criar Torneio com Tempo Curto

Use o script:
```bash
node BackEnd/test-fresh-torneios.js
```

Cria torneio que expira em 15 minutos

---

### Passo 2: Verificar Antes de Expirar

**GET** `http://localhost:3001/api/torneios/ativo`

**Esperado**:
```json
{
  "ativo": true,
  "dentroDoPeriodo": true
}
```

---

### Passo 3: Aguardar Expiração

**Ação**: Espere termina_em passar

**Backends logs**:
```
[2026-06-09T13:15:00] ⏰ Torneio expirou automaticamente. Finalizando...
```

---

### Passo 4: Verificar Após Expiração

**GET** `http://localhost:3001/api/torneios/ativo`

**Esperado**:
```json
{
  "ativo": false,
  "expirou_automaticamente": true,
  "message": "Torneio expirou e foi finalizado automaticamente"
}
```

**✅ Verificação**: Auto-expiration funcionando

---

### Passo 5: Frontend - Verificar Estado

**URL**: `http://localhost:5173/entrar-no-torneio`

**Esperado**:
- [ ] Mensagem muda de "Torneio Ativo" para mensagem de status
- [ ] Cards ficam desabilitados (opacidade reduzida)
- [ ] Botões mostram "Indisponível"
- [ ] Não é possível clicar

---

## 🧪 CENÁRIO 4: BLOQUEIO DE PARTICIPAÇÃO SIMULTÂNEA

### Passo 1: Entrar em Torneio 1

**Ação**:
1. Acesse `/entrar-no-torneio`
2. Escolha disciplina
3. Clique "Entrar no Torneio"
4. Será redirecionado para a página de resolução

---

### Passo 2: Voltar para Entrada de Torneio

**Ação**: Navegue de volta para `/entrar-no-torneio`

---

### Passo 3: Verificar Impedimento

**Esperado**:
- [ ] Mensagem de erro aparece
- [ ] Texto: "Você já está participando de outro torneio"
- [ ] Modal não abre
- [ ] Não permite entrada

**Backend valida**:
```javascript
const participacaoAtiva = await ParticipanteTorneio.findOne({
  where: {
    usuario_id,
    status: 'confirmado',
    posicao_congelada: false
  }
});

if (participacaoAtiva) {
  return res.status(409).json({
    message: "Usuario já está participando de outro torneio..."
  });
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Backend
- [ ] GET /api/torneios/ativo retorna JSON válido
- [ ] GET /api/torneios/ativo/disciplinas retorna JSON válido
- [ ] Genérico mostra múltiplas disciplinas
- [ ] Específico mostra apenas 1 disciplina
- [ ] Expiração automática funciona
- [ ] Validação de tipo funciona
- [ ] Participação simultânea é bloqueada
- [ ] Transações são atômicas

### Frontend
- [ ] Página carrega sem "Erro ao conectar"
- [ ] Disciplinas são exibidas corretamente
- [ ] Estado de `disciplinasDisponiveis` muda com dados do backend
- [ ] Build sem erros (`npm run build`)
- [ ] Modais funcionam
- [ ] Erros são exibidos corretamente
- [ ] Redirecionamento funciona

### Database
- [ ] Torneios com tipo_torneio válido
- [ ] Participantes com status correto
- [ ] Rankings congelados após expiração
- [ ] Transações completadas ou revertidas

---

## 🔧 TROUBLESHOOTING

### "Erro ao conectar com o servidor"

**Causa**: JSON inválido  
**Solução**:
```bash
# Verificar endpoint diretamente
curl http://localhost:3001/api/torneios/ativo

# Se retornar HTML, problema é serialização
# Verificar BackEnd/index.js linhas 920-932
```

---

### "Torneio mostra como ativo fora do período"

**Causa**: Data não está sendo comparada  
**Solução**:
```bash
# Verificar logs do backend
# Procure por: "📅 Período do torneio"
# Se agora > fim, deve finalizar

# Redeploy:
npm start
```

---

### "Torneio específico mostra todas disciplinas"

**Causa**: Filtragem não está funcionando  
**Solução**:
```javascript
// Verificar BackEnd/index.js linhas 1024-1028
if (torneio.tipo_torneio === 'especifico' && torneio.disciplina_especifica) {
  disciplinasParaVerificar = [torneio.disciplina_especifica];
}
```

---

### "Const error no frontend build"

**Causa**: useState não foi usado  
**Solução**:
```bash
# Verificar FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx
# Linha 25 deve usar useState
const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState([...]);

# Rebuild
npm run build
```

---

## 📊 TESTE DE STRESS

### Simular Múltiplos Usuários

```bash
# Terminal 1: Backend
cd BackEnd && npm start

# Terminal 2: Frontend
cd FrontEnd && npm run dev

# Terminal 3: Testes HTTP
for i in {1..10}; do
  curl -s http://localhost:3001/api/torneios/ativo &
done
wait
```

**Esperado**: Sem erro 500, sem deadlocks

---

## 📝 REGISTRO DE TESTES

**Data**: __________  
**Testador**: __________  

### Testes Executados
- [ ] Cenário 1 (Genérico)
- [ ] Cenário 2 (Específico)  
- [ ] Cenário 3 (Expiração)
- [ ] Cenário 4 (Simultaneidade)

### Erros Encontrados
```
_________________________________
_________________________________
_________________________________
```

### Status Final
- [ ] ✅ PASSOU - Tudo funcionando
- [ ] ⚠️ COM RESSALVAS - Alguns pontos para ajustar
- [ ] ❌ FALHOU - Problemas críticos

---

**Assinado**: _______________________  
**Data**: _______________________

---

## 🚀 PRÓXIMAS AÇÕES

1. ✅ Completar todos os cenários de teste
2. ✅ Documentar qualquer erro encontrado
3. ✅ Deploy em staging
4. ✅ Testes de carga (100+ usuários simultâneos)
5. ✅ Deploy em produção

---

**Sistema**: COMAES 3.2  
**Módulo**: Torneios  
**Versão**: 3.2 Final  
**Status**: Pronto para Produção ✅
