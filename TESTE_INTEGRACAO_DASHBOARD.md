# Testes de Integração - Dashboard de Gamificação

## 🧪 **Testes para Verificar a Implementação**

### **1. Teste de Rotas do Frontend**

```bash
# Verificar se a rota está configurada
grep -n "MinhaJornada" FrontEnd/src/App.jsx
# Deve mostrar: linha 29 (import) e linha 116 (rota)

# Verificar se o link está no menu
grep -n "Minha Jornada" FrontEnd/src/Paginas/Secundarias/Layout.jsx
# Deve mostrar: linha 21 (menu padrão) e linha 49 (desktop nav)
```

### **2. Teste do Endpoint Backend**

```javascript
// Testar manualmente no navegador (com autenticação)
fetch('/api/usuarios/me/dashboard-gamificacao', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_AQUI'
  }
})
.then(r => r.json())
.then(console.log)
```

### **3. Teste da Página Frontend**

```bash
# 1. Iniciar servidor frontend (se não estiver rodando)
cd FrontEnd && npm run dev

# 2. Acessar no navegador:
http://localhost:5173/minha-jornada

# 3. Fazer login com usuário estudante
```

### **4. Validação Visual dos Blocos**

Verificar se os 6 blocos estão visíveis:

1. ✅ **Card do Nível** - Com barra de progresso
2. ✅ **Sequência de Aprendizagem** - Com ícone de chama
3. ✅ **Conquistas Recentes** - Lista de 5 itens
4. ✅ **Rankings** - Global e por categoria
5. ✅ **Missões Ativas** - Máximo 3 com progresso
6. ✅ **Gráfico de XP** - Evolução dos últimos 30 dias

### **5. Testes de Responsividade**

```css
/* Verificar breakpoints */
sm: 640px  (mobile)
md: 768px  (tablet)
lg: 1024px (desktop)

/* Grid deve ser:
- Mobile: 1 coluna
- Desktop: 3 colunas (2+1)
*/
```

### **6. Testes de Dados**

```javascript
// Verificar estrutura de dados retornada
{
  success: true,
  data: {
    nivel: {
      numero: 3,
      info: { nome: "Coruja Aprendiz", ... },
      proximo: { nome: "Coruja Mestra", ... },
      xp_total: 720,
      progresso: 65
    },
    streak: {
      streak_atual: 5,
      streak_maximo: 12,
      ativa: true
    },
    conquistas: [
      { id: 1, nome: "Primeira Questão", ... }
    ],
    ranking: {
      melhor_posicao: 42,
      por_disciplina: { "Matemática": 15, ... }
    },
    xp_grafico: [
      { semana: "2024-W05", xp: 150 },
      { semana: "2024-W06", xp: 180 }
    ]
  }
}
```

### **7. Testes de Performance**

```bash
# Testar tempo de carregamento do endpoint
time curl -X GET "http://localhost:3000/api/usuarios/me/dashboard-gamificacao" \
  -H "Authorization: Bearer TOKEN"

# Deve retornar em < 500ms
```

### **8. Testes de Error Handling**

```javascript
// Testar cenários de erro:
1. Token inválido → 401 Unauthorized
2. Usuário não encontrado → 404 Not Found
3. Servidor offline → Connection Error
4. Dados incompletos → Fallback para dados mock
```

### **9. Checklist de Qualidade**

#### **Funcional:**
- [ ] Página acessível via `/minha-jornada`
- [ ] Menu contém link "Minha Jornada"
- [ ] 6 blocos visíveis sem sobreposição
- [ ] Dados carregados da API real
- [ ] Loading states funcionam
- [ ] Error handling funciona
- [ ] Links para páginas relacionadas funcionam

#### **Técnico:**
- [ ] Código sem erros de linting
- [ ] Responsividade funciona
- [ ] Performance aceitável
- [ ] Sem console errors
- [ ] Acessibilidade básica

#### **UI/UX:**
- [ ] Padrão visual COMAES aplicado
- [ ] Animações suaves
- [ ] Hierarquia visual clara
- [ ] Tipografia consistente
- [ ] Cores do tema aplicadas

### **10. Comandos Úteis para Depuração**

```bash
# Verificar erros no console
npm run dev  # Frontend
node index.js  # Backend

# Verificar estrutura de arquivos
tree FrontEnd/src/Paginas/Secundarias -I "*.jsx"

# Verificar dependências
npm ls react-router-dom

# Testar endpoint manualmente (PowerShell)
$token = "SEU_TOKEN"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/usuarios/me/dashboard-gamificacao" -Headers $headers
```

### **11. Cenários de Teste**

#### **Cenário 1: Primeiro Acesso**
- Usuário faz login pela primeira vez
- Deve ver nível 1 e streak 0
- Conquistas devem incluir "Primeira Questão"

#### **Cenário 2: Usuário Avançado**
- Usuário com 30+ dias de atividade
- Deve ver nível 5+, streak 7+
- Gráfico de XP com dados históricos

#### **Cenário 3: Sem Conexão**
- Simular offline
- Deve mostrar mensagem de erro
- Botão "Tentar novamente" funcional

#### **Cenário 4: Mobile**
- Acessar em dispositivo móvel
- Layout deve adaptar para 1 coluna
- Touch targets devem ser adequados

### **12. Métricas de Sucesso**

1. **Tempo de Carregamento**: < 2 segundos
2. **Taxa de Erro**: < 1%
3. **Engajamento**: > 60% dos usuários acessam semanalmente
4. **Satisfação**: Feedback positivo em testes de usabilidade

---

**Status do Teste**: 📋 **PRONTO PARA EXECUÇÃO**

Execute os testes acima para validar a implementação completa do Dashboard de Gamificação.