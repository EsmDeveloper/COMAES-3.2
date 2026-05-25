# Reconstrução do Módulo de Torneios - Guia de Uso

## 🚀 Como Usar o Novo Módulo

### 1. Importar no AdminDashboard

O módulo já está integrado. Apenas certifique-se de que está importado:

```javascript
import TorneiosTab from './TorneiosTab';

// No JSX
<TorneiosTab />
```

### 2. Criar Torneio

**Passo a passo**:
1. Clique no botão "Criar Torneio" (azul, canto superior direito)
2. Preencha os campos obrigatórios:
   - **Título**: Mínimo 3 caracteres
   - **Descrição**: Mínimo 10 caracteres
   - **Data de Início**: Não pode ser no passado
   - **Data de Término**: Deve ser após o início
   - **Status**: Selecione um status
3. Opcionalmente:
   - Edite o slug (gerado automaticamente)
   - Marque/desmarque "Público"
4. Clique "Criar Torneio"
5. Veja a notificação de sucesso
6. Torneio aparece no topo da lista

**Validações**:
- ❌ Título vazio → "Título é obrigatório"
- ❌ Título < 3 caracteres → "Mínimo 3 caracteres"
- ❌ Descrição vazia → "Descrição é obrigatória"
- ❌ Descrição < 10 caracteres → "Mínimo 10 caracteres"
- ❌ Data início vazia → "Data de início é obrigatória"
- ❌ Data término vazia → "Data de término é obrigatória"
- ❌ Data término <= início → "Deve ser após o início"

### 3. Editar Torneio

**Passo a passo**:
1. Encontre o torneio na lista
2. Clique no ícone de lápis (laranja)
3. Modal abre com dados preenchidos
4. Altere os campos desejados
5. Clique "Guardar Alterações"
6. Veja a notificação de sucesso
7. Lista atualiza com novos dados

**Observações**:
- Slug não pode ser editado em modo edição
- Todos os campos podem ser alterados
- Validações são as mesmas da criação

### 4. Visualizar Detalhes

**Passo a passo**:
1. Encontre o torneio na lista
2. Clique no ícone de olho (azul)
3. Modal abre com informações completas
4. Veja:
   - Título
   - Disciplina
   - Descrição
   - Datas (formatadas)
   - Status (com cor)
   - Visibilidade (Público/Privado)
5. Clique X ou fora do modal para fechar

### 5. Deletar Torneio

**Passo a passo**:
1. Encontre o torneio na lista
2. Clique no ícone de lixeira (vermelho)
3. Modal de confirmação aparece
4. Leia a mensagem de aviso
5. Clique "Sim, Excluir" para confirmar
6. Veja a notificação de sucesso
7. Torneio desaparece da lista

**Aviso**:
- ⚠️ Ação não pode ser desfeita
- ⚠️ Todos os rankings associados serão removidos
- ⚠️ Se houver dependências, verá mensagem de erro

### 6. Buscar Torneios

**Passo a passo**:
1. Use a barra de busca no topo
2. Digite parte do título ou disciplina
3. Lista filtra em tempo real
4. Limpe a busca para ver todos

**Exemplos**:
- Buscar "Matemática" → Mostra torneios com "Matemática" no título
- Buscar "2026" → Mostra torneios com "2026" no título
- Buscar "Inglês" → Mostra torneios da disciplina Inglês

---

## 🎯 Casos de Uso Comuns

### Caso 1: Criar Torneio de Matemática

1. Clique "Criar Torneio"
2. Preencha:
   - Título: "Torneio de Matemática 2026"
   - Descrição: "Competição de matemática para alunos do ensino médio"
   - Data início: 01/06/2026 às 09:00
   - Data término: 01/06/2026 às 17:00
   - Status: "Agendado"
   - Público: ✓ Marcado
3. Clique "Criar Torneio"
4. ✅ Torneio criado com sucesso

### Caso 2: Adiar Torneio

1. Clique no ícone editar do torneio
2. Altere a data de início para data posterior
3. Altere a data de término para data posterior
4. Clique "Guardar Alterações"
5. ✅ Datas atualizadas

### Caso 3: Finalizar Torneio

1. Clique no ícone editar do torneio
2. Altere o status para "Finalizado"
3. Clique "Guardar Alterações"
4. ✅ Status atualizado

### Caso 4: Tornar Privado

1. Clique no ícone editar do torneio
2. Desmarque "Torneio Público"
3. Clique "Guardar Alterações"
4. ✅ Torneio agora é privado

### Caso 5: Cancelar Torneio

1. Clique no ícone editar do torneio
2. Altere o status para "Cancelado"
3. Clique "Guardar Alterações"
4. ✅ Torneio cancelado

---

## ⚙️ Configurações

### Variáveis de Ambiente

**`.env`** (FrontEnd):
```
VITE_API_BASE_URL=http://localhost:3000
```

Se não definida, usa:
```javascript
`http://${window.location.hostname}:3000`
```

### Autenticação

O módulo usa o token do contexto `AuthContext`:
```javascript
const { token, user } = useAuth();
```

Certifique-se de que:
- ✅ Token está disponível
- ✅ Token é válido
- ✅ Usuário tem permissão de admin

---

## 🐛 Troubleshooting

### Problema: Modal não abre

**Solução**:
1. Verifique se o token está disponível
2. Verifique se não há erro no console
3. Recarregue a página
4. Limpe o cache do navegador

### Problema: Inputs não aceitam digitação

**Solução**:
1. Verifique se o modal está em foco
2. Verifique se não há outro modal aberto
3. Recarregue a página

### Problema: Modal salta para o topo

**Solução**:
1. Isso não deve acontecer na nova versão
2. Se acontecer, reporte como bug
3. Limpe o cache do navegador

### Problema: Calendário não funciona

**Solução**:
1. Use o calendário nativo do navegador
2. Verifique se o navegador suporta datetime-local
3. Tente outro navegador

### Problema: Erro ao salvar

**Solução**:
1. Verifique a validação (erros aparecem em vermelho)
2. Verifique se o token é válido
3. Verifique se há conexão com a API
4. Veja o erro no console

### Problema: Erro ao deletar

**Solução**:
1. Verifique se o torneio tem dependências
2. Leia a mensagem de erro
3. Se necessário, remova as dependências primeiro
4. Tente novamente

### Problema: Busca não funciona

**Solução**:
1. Verifique se digitou corretamente
2. Busca é case-insensitive
3. Limpe a busca e tente novamente

---

## 📱 Responsividade

### Desktop (1920x1080)
- ✅ Layout perfeito
- ✅ Todos os botões visíveis
- ✅ Sem cortes

### Laptop (1600x900)
- ✅ Layout perfeito
- ✅ Todos os botões visíveis
- ✅ Sem cortes

### Tablet (1366x768)
- ✅ Layout responsivo
- ✅ Botões em coluna
- ✅ Sem cortes

### Mobile (1280x720)
- ✅ Layout responsivo
- ✅ Botões empilhados
- ✅ Sem cortes

---

## 🎨 Padrão Visual

### Cores
- **Primária**: Azul (#4F6EF7)
- **Sucesso**: Verde (#10B981)
- **Erro**: Vermelho (#EF4444)
- **Aviso**: Laranja (#F97316)
- **Fundo**: Cinza claro (#F7F8FC)

### Botões
- **Primário**: Azul com sombra
- **Secundário**: Branco com borda
- **Perigo**: Vermelho com sombra
- **Ícone**: Cinza com hover

### Modais
- **Overlay**: Preto 60% com blur
- **Container**: Branco com sombra
- **Header**: Cinza claro
- **Footer**: Cinza claro

---

## 🔄 Fluxo de Trabalho Recomendado

### Preparação
1. ✅ Verifique se está logado como admin
2. ✅ Verifique se tem permissão
3. ✅ Verifique se a API está online

### Criação
1. ✅ Clique "Criar Torneio"
2. ✅ Preencha todos os campos
3. ✅ Revise os dados
4. ✅ Clique "Criar Torneio"
5. ✅ Confirme a notificação

### Edição
1. ✅ Encontre o torneio
2. ✅ Clique editar
3. ✅ Altere os campos
4. ✅ Revise os dados
5. ✅ Clique "Guardar Alterações"
6. ✅ Confirme a notificação

### Exclusão
1. ✅ Encontre o torneio
2. ✅ Clique deletar
3. ✅ Leia o aviso
4. ✅ Confirme a exclusão
5. ✅ Confirme a notificação

---

## 📊 Dados Esperados

### Estrutura de Torneio
```javascript
{
  id: 1,
  titulo: "Torneio de Matemática 2026",
  descricao: "Competição de matemática para alunos",
  disciplina: "Matemática",
  inicia_em: "2026-06-01T09:00:00Z",
  termina_em: "2026-06-01T17:00:00Z",
  status: "agendado", // rascunho, agendado, ativo, finalizado, cancelado
  publico: true,
  slug: "torneio-de-matematica-2026",
  criado_por: 1,
  criado_em: "2026-05-23T14:30:00Z",
  atualizado_em: "2026-05-23T14:30:00Z"
}
```

### Status Possíveis
- `rascunho`: Torneio em rascunho
- `agendado`: Torneio agendado para o futuro
- `ativo`: Torneio em andamento
- `finalizado`: Torneio finalizado
- `cancelado`: Torneio cancelado

---

## 🔐 Permissões

### Requerido
- ✅ Estar logado
- ✅ Ser administrador
- ✅ Token válido

### Operações
- **Criar**: Requer admin
- **Editar**: Requer admin
- **Visualizar**: Requer admin
- **Deletar**: Requer admin

---

## 📞 Suporte

### Se encontrar um bug:
1. Anote o erro exato
2. Verifique o console (F12)
3. Tente reproduzir
4. Reporte com detalhes

### Se tiver dúvida:
1. Consulte este guia
2. Verifique a documentação técnica
3. Teste em outro navegador
4. Limpe o cache

---

## ✅ Checklist de Uso

- [ ] Consegui criar um torneio
- [ ] Consegui editar um torneio
- [ ] Consegui visualizar detalhes
- [ ] Consegui deletar um torneio
- [ ] Consegui buscar torneios
- [ ] Modal não salta para o topo
- [ ] Inputs aceitam digitação contínua
- [ ] Calendário funciona
- [ ] Validações funcionam
- [ ] Notificações aparecem
- [ ] Layout é responsivo
- [ ] Botões sempre visíveis
- [ ] Sem barras brancas
- [ ] Sem lag

---

**Última atualização**: 23 de Maio de 2026
**Versão**: 1.0.0
**Status**: ✅ Pronto para Uso
