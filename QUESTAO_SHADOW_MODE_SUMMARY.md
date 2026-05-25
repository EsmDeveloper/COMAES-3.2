# SHADOW MODE - RESUMO EXECUTIVO

**Data**: 22 de Maio de 2026  
**Status**: Pronto para Implementação  
**Versão**: 1.0

---

## 🎯 EM 30 SEGUNDOS

**O que**: Testar novo modelo Questao em produção sem risco  
**Como**: Duplicar escrita em ambos os modelos  
**Leitura**: Continua no sistema antigo  
**Frontend**: Sem mudanças  
**Downtime**: NÃO  
**Rollback**: Imediato (desativar flag)  

---

## 📊 ARQUITETURA

```
ESCRITA
├─ Modelo Antigo (QuestaoMatematica, etc) ✅
└─ Modelo Novo (Questao) ✅ [SHADOW]

LEITURA
└─ Modelo Antigo (QuestaoMatematica, etc) ✅
```

---

## 🚀 FLUXO

```
1. Admin cria questão
   ↓
2. Salva em modelo antigo
   ↓
3. SE SHADOW_MODE_ATIVO:
   └─ Copia para modelo novo
   ↓
4. Retorna resposta (sem mudanças)
```

---

## ✅ BENEFÍCIOS

| Benefício | Descrição |
|-----------|-----------|
| **Segurança** | Testa novo modelo sem risco |
| **Validação** | Compara dados antes de migrar |
| **Confiança** | 100% de consistência verificada |
| **Rollback** | Desativar flag = rollback imediato |
| **Sem Downtime** | Sistema continua 100% funcional |
| **Sem Impacto** | Frontend não vê mudanças |

---

## 📁 ARQUIVOS A CRIAR

```
BackEnd/
├── migrations/
│   └── 20260522000001-create-questoes-shadow.js
├── models/
│   └── Questao.js
├── helpers/
│   └── shadowModeHelper.js
└── scripts/
    ├── syncShadowMode.js
    └── validateShadowMode.js
```

---

## 🔧 IMPLEMENTAÇÃO (5 PASSOS)

### 1. Criar Arquivos
```bash
# Migration, modelo, helper, scripts
```

### 2. Executar Migration
```bash
npm run migrate
```

### 3. Ativar Shadow Mode
```bash
# .env: SHADOW_MODE_ENABLED=true
npm run dev
```

### 4. Sincronizar Dados Existentes
```bash
npm run sync:shadow-mode
```

### 5. Validar
```bash
npm run validate:shadow-mode
```

---

## 📊 CAMPOS EXTRAS

```javascript
{
  // Campos normais
  id, torneio_id, titulo, descricao,
  disciplina, tipo, dificuldade,
  opcoes, resposta_correta, explicacao,
  pontos, linguagem, midia,
  
  // Campos de rastreamento (NOVOS)
  origem: 'legacy',           // De onde veio
  migrated: false,            // Já foi migrada?
  legacy_id: 1,               // ID no modelo antigo
  legacy_model: 'QuestaoMatematica',
  sync_error: null,           // Erro na sincronização
  last_sync: '2026-05-22...'  // Última sincronização
}
```

---

## 🔄 SINCRONIZAÇÃO

### Sincronizar Dados Existentes
```bash
npm run sync:shadow-mode
```

Copia todas as questões existentes para o novo modelo.

### Validar Consistência
```bash
npm run validate:shadow-mode
```

Compara dados e detecta divergências.

---

## 🔙 ROLLBACK

### Desativar Shadow Mode
```bash
# .env: SHADOW_MODE_ENABLED=false
npm run dev
```

Imediato. Sistema volta a funcionar normalmente.

### Remover Dados Shadow (Opcional)
```bash
mysql comaes_db -e "DROP TABLE questoes;"
```

---

## ✅ CHECKLIST

### Antes
- [ ] Backup do banco
- [ ] Backup do código
- [ ] Equipe notificada

### Implementação
- [ ] Criar arquivos
- [ ] Executar migration
- [ ] Ativar shadow mode
- [ ] Sincronizar dados
- [ ] Validar

### Depois
- [ ] Monitorar logs
- [ ] Verificar consistência
- [ ] Documentar resultados

---

## 📈 PRÓXIMOS PASSOS

### Fase 1: Preparação (Hoje)
1. ✅ Ler este documento
2. ✅ Ler QUESTAO_SHADOW_MODE_IMPLEMENTATION.md
3. ✅ Ler QUESTAO_SHADOW_MODE_FILES.md

### Fase 2: Implementação (Próxima Semana)
1. ⏳ Criar arquivos
2. ⏳ Executar migration
3. ⏳ Ativar shadow mode
4. ⏳ Sincronizar dados

### Fase 3: Validação (Próximas 2 Semanas)
1. ⏳ Executar validação
2. ⏳ Monitorar logs
3. ⏳ Documentar resultados

### Fase 4: Consolidação (Após Validação)
1. ⏳ Remover campos de rastreamento
2. ⏳ Remover modelos antigos
3. ⏳ Migração completa

---

## 🎯 CONCLUSÃO

Shadow Mode permite:
✅ Testar novo modelo em produção  
✅ Validar consistência de dados  
✅ Ganhar confiança antes de migrar  
✅ Rollback imediato se necessário  
✅ Zero impacto no sistema atual  

**Status**: Pronto para Implementação  
**Próximo Passo**: Ler QUESTAO_SHADOW_MODE_IMPLEMENTATION.md

---

## 📞 DOCUMENTAÇÃO

- **QUESTAO_SHADOW_MODE_IMPLEMENTATION.md** - Plano completo
- **QUESTAO_SHADOW_MODE_FILES.md** - Código pronto
- **QUESTAO_SHADOW_MODE_SUMMARY.md** - Este documento

---

**Criado em**: 22 de Maio de 2026  
**Versão**: 1.0  
**Status**: ✅ PRONTO PARA IMPLEMENTAÇÃO
