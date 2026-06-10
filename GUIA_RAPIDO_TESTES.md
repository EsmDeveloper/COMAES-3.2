# ⚡ GUIA RÁPIDO - Testes em 5 Minutos

## 🎯 Objetivo
Verificar que:
1. ✅ Torneios específicos salvam corretamente
2. ✅ Interface mostra 3 disciplinas com a correta ativa
3. ✅ Admin panel exibe tipo correto

---

## 📋 Pré-requisitos
- [ ] Backend iniciado: `npm run dev` (em `/BackEnd`)
- [ ] Frontend compilado: `npm run build` (já feito)
- [ ] Browser aberto: http://localhost:5173
- [ ] Autenticado como Admin

---

## ⏱️ Teste 1: Criar Torneio Específico (2 min)

### Passo a Passo
1. Vá para: **Admin Panel** → **Gerenciar Torneios** → **Criar Torneio**
2. Preencha:
   ```
   Título:           "Teste Matemática 2026"
   Descrição:        "Torneio teste"
   Tipo:             Clique no radio button "Específico"
   Disciplina:       Selecione "Matemática"
   Data Início:      (amanhã às 14:00)
   Data Término:     (amanhã às 16:00)
   Status:           "Ativo"
   ```
3. Clique: **Criar Torneio**

### Verificações
- [ ] Torneio criado sem erro
- [ ] Aparece na tabela
- [ ] Badge mostra: **"Específico (Matemática)"** ← IMPORTANTE

---

## ⏱️ Teste 2: Ver Interface (2 min)

### Passo a Passo
1. Vá para: **Entrar no Torneio** (página principal)
2. Aguarde carregar

### Verificações
- [ ] Vê a seção "Escolha Sua Disciplina"
- [ ] Vê **3 cards** (não 1):
  - [ ] Matemática (ativa)
  - [ ] Programação (inativa)
  - [ ] Inglês (inativa)

---

## ⏱️ Teste 3: Card Ativo (1 min)

### Card "Matemática" (Deve estar ATIVO)
- [ ] Opacidade: 100% (claro, não translúcido)
- [ ] Tem badge verde no canto superior esquerdo: **"✓ Ativa"**
- [ ] Botão: **"Ver Torneio"** (azul, clicável)
- [ ] Sem sobreposição preta
- [ ] Ao passar mouse: amplia e sobe

---

## ⏱️ Teste 4: Cards Inativos (1 min)

### Card "Programação" (Deve estar INATIVO)
- [ ] Opacidade: 70% (mais escuro/translúcido)
- [ ] Sem badge "✓ Ativa"
- [ ] Botão: **"Indisponível"** (cinza, desabilitado)
- [ ] Sobreposição preta com texto: **"Disciplina Indisponível"**
- [ ] Clique não funciona
- [ ] Sem efeito hover

### Card "Inglês" (Deve estar INATIVO)
- [ ] Mesmos estados que Programação

---

## ⏱️ Teste 5: Clicar em Disciplina Ativa (1 min)

### Passo a Passo
1. Clique no card "Matemática"
2. Modal deve aparecer com:
   - [ ] Imagem de Matemática
   - [ ] Título: "Matemática"
   - [ ] Informações do torneio
   - [ ] Botão: "Entrar no Torneio"

---

## 📱 Testes Rápidos no Console (F12)

### Verificar se dados foram salvos
1. Abra: DevTools (F12) → Console
2. Execute:
```javascript
// Verificar dados do último torneio criado
fetch('http://localhost:3000/api/admin/torneos', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(data => {
  const ultimo = data[data.length - 1];
  console.log('Último torneio:', {
    titulo: ultimo.titulo,
    tipo_torneio: ultimo.tipo_torneio,
    disciplina_especifica: ultimo.disciplina_especifica
  });
});
```

### Esperado
```javascript
Último torneio: {
  titulo: "Teste Matemática 2026",
  tipo_torneio: "especifico",      ← ✅ Correto
  disciplina_especifica: "Matemática" ← ✅ Correto
}
```

---

## ✅ Checklist Final

| Verificação | ✓ | Resultado |
|------------|---|----------|
| Backend captura tipo | [ ] | |
| Backend captura disciplina | [ ] | |
| Admin mostra tipo correto | [ ] | "Específico (Matemática)" |
| Interface mostra 3 disciplinas | [ ] | Todas as 3 aparecem |
| Matemática está ativa | [ ] | Badge "✓ Ativa" |
| Programação está inativa | [ ] | Opaca, sobreposição |
| Inglês está inativo | [ ] | Opaca, sobreposição |
| Clicar em Matemática funciona | [ ] | Abre modal |
| Clicar em Programação não funciona | [ ] | Nada acontece |
| Clicar em Inglês não funciona | [ ] | Nada acontece |
| Banco salva corretamente | [ ] | tipo_torneio + disciplina |

---

## 🚨 Se Algo Não Funcionar

### Problema: Cards mostram "Torneio Indisponível"
**Solução**: Recarregue a página (F5). Pode ser problema de cache

### Problema: Mostram apenas 1 card
**Solução**: 
1. Verifique se modificação foi salva: `grep -n "allDisciplinas" FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx`
2. Recompile: `npm run build`
3. Recarregue página

### Problema: Torneio salva como "Genérico"
**Solução**:
1. Verifique backend: `grep -n "tipo_torneio.*req\.body" BackEnd/controllers/TorneoController.js`
2. Reinicie backend: `Ctrl+C` e `npm run dev`

### Problema: Admin mostra "Genérico"
**Solução**:
1. Verifique banco de dados:
```sql
SELECT id, titulo, tipo_torneio, disciplina_especifica 
FROM Torneios 
ORDER BY id DESC LIMIT 1;
```
2. Se tipo_torneio = "generico", refaça o teste

---

## 🎓 Resumo Rápido

### Torneio Genérico
```
- Criado: Tipo "Genérico"
- Admin vê: "Genérico"
- Usuário vê: Apenas disciplinas com blocos
- Todas ativas (clicáveis)
```

### Torneio Específico
```
- Criado: Tipo "Específico", Disciplina "Matemática"
- Admin vê: "Específico (Matemática)"
- Usuário vê: 3 disciplinas
  - Matemática: ✓ Ativa (clicável, badge verde)
  - Programação: ✗ Inativa (opaca, "Indisponível")
  - Inglês: ✗ Inativa (opaca, "Indisponível")
```

---

## 📞 Resultado Esperado

Se tudo funcionar:
- ✅ Backend salva corretamente
- ✅ Admin mostra tipo correto
- ✅ Usuário vê interface clara e intuitiva
- ✅ UX melhorada

**Status**: 🎉 **TUDO FUNCIONANDO COMO ESPERADO**

---

**Tempo Total**: ~5 minutos
**Dificuldade**: ⭐ Fácil
**Importância**: 🔴 Crítica

Boa sorte nos testes! 🚀
