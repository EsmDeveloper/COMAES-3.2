# 🚀 Instruções Para Ativar a Correção

## ⚡ Opção Rápida (Mais Fácil)

### 1. Feche o Kiro Completamente
- Clique em File → Close Workspace
- OU fecha a janela do Kiro completamente

### 2. Aguarde 5 Segundos
```
Isto garante que todos os processos Node.js terminam
```

### 3. Reabra o Kiro
- Abra a pasta do projeto novamente

### 4. Pronto! ✅
- O erro desaparecerá
- O backend carregará com o código corrigido
- As questões aparecerão normalmente

---

## 🖥️ Opção Alternativa (Se Acima Não Funcionar)

### 1. Abra PowerShell como Administrador
- Pressione `Win + X`
- Escolha "Windows PowerShell (Admin)"
- OU "Terminal (Admin)"

### 2. Execute o Comando
```powershell
taskkill /PID 31992 /F /T
```

### 3. Reinicie o Kiro
- Abre o projeto novamente
- O backend iniciará fresco

---

## 💻 Opção Mais Agressiva (Nuclear)

Se as opções acima não funcionarem:

### 1. Reinicia o Windows
```powershell
shutdown /r /t 60  # Reinicia em 1 minuto
```

### 2. Depois de Reiniciar
- Abre o Kiro novamente
- Todos os processos estarão limpos

---

## ✅ Como Confirmar Que Funcionou

### Teste 1: No Terminal do Backend
Deve aparecer:
```
🚀 Servidor rodando: http://0.0.0.0:3000
✅ Socket.IO inicializado
✅ Cron jobs do sistema de rankings iniciados
✅ Hooks automáticos de ranking configurados
```
**Sem erros!**

### Teste 2: Na Interface Web
1. Vai ao painel do Colaborador
2. Abre a aba "Minhas Questões"
3. As questões aparecem (ou mensagem "Nenhuma questão")
4. **Não aparece mais erro 500**

### Teste 3: Criar Uma Questão
1. Na aba "Criar Questão"
2. Preenche os campos
3. Clica em "Enviar"
4. **Não aparece mais erro**

---

## 🐛 Debugging Se Ainda Tiver Problemas

### Abra DevTools (F12) → Network Tab
1. Filtra por `questoes`
2. Faz uma ação que usa questões
3. Clica no request
4. Vai a "Response"

**Deve mostrar:**
```json
{
  "sucesso": true,
  "dados": {
    "questoes": [...]
  }
}
```

**Não deve mostrar:**
```json
{
  "sucesso": false,
  "erros": {
    "detalhes": "Unknown column 'Questao.createdAt'"
  }
}
```

---

## 📋 Checklist Final

- [ ] Verifiquei que o código foi alterado (ficheiros do backend modificados)
- [ ] Tentei pelo menos uma das opções de reinicialização
- [ ] O backend reiniciou (vejo novas mensagens no console)
- [ ] Testo a funcionalidade no navegador
- [ ] Agora funciona! ✅

---

## 🆘 Se Nada Funcionar

Isto NÃO deveria acontecer, mas se acontecer:

1. **Copia este ficheiro:**
   - `BackEnd/controllers/ColaboradorController.js`
   - Linha 263 deve ter: `order: [['created_at', 'DESC']]`

2. **Abre um Terminal no BackEnd**
   - Executa: `npm run dev`
   - Se der erro diferente, copia o erro novo

3. **Reporta** com:
   - O erro exato que recebe
   - O output completo do terminal
   - Ficheiro `test_minhasQuestoes_query.js` executado

---

## 📞 Resumo Rápido

| O Que Fazer | Tempo | Dificuldade |
|------------|-------|------------|
| Fechar e reabrir Kiro | 1 min | ⭐ Muito Fácil |
| taskkill do processo | 2 min | ⭐⭐ Fácil |
| Reiniciar Windows | 10 min | ⭐⭐ Fácil |

**Recomendação:** Tente a primeira opção primeiro!

---

## 🎯 Próximos Passos Após Correção

Assim que o erro desaparecer:

1. **Colaborador:** Pode ver suas questões
2. **Colaborador:** Pode criar novas questões
3. **Colaborador:** Questões são enviadas com status "pendente"
4. **Admin:** Pode revisar e aprovar questões
5. **Sistema:** Tudo funciona em conjunto

---

**Versão:** 1.0
**Data:** 2026-06-07
**Status:** ✅ PRONTO PARA USAR
