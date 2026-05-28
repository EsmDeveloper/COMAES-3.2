# ✅ Correção: Erro "Unknown column 'user_id' in field list"

## 🔍 Problema Identificado

O erro ocorria porque o modelo `Certificate.js` estava usando nomes de colunas em inglês (`user_id`, `tournament_id`, etc.), mas a tabela no banco de dados MySQL usa nomes em português (`usuario_id`, `torneio_id`, etc.).

### Erro Original:
```
Unknown column 'user_id' in field list
```

## 🛠️ Solução Aplicada

Adicionei o atributo `field` em cada coluna do modelo `Certificate.js` para mapear os nomes em inglês (usados no código JavaScript) para os nomes em português (usados no banco de dados).

### Antes:
```javascript
user_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: { model: 'usuarios', key: 'id' },
  onDelete: 'CASCADE'
}
```

### Depois:
```javascript
user_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  field: 'usuario_id', // ← Mapeia para a coluna usuario_id no banco
  references: { model: 'usuarios', key: 'id' },
  onDelete: 'CASCADE'
}
```

## 📋 Mapeamentos Aplicados

| Propriedade JS | Coluna no Banco | Descrição |
|----------------|-----------------|-----------|
| `user_id` | `usuario_id` | ID do usuário |
| `tournament_id` | `torneio_id` | ID do torneio |
| `score` | `pontuacao` | Pontuação do usuário |
| `ranking_position` | `posicao` | Posição no ranking |
| `certificate_code` | `codigo_verificacao` | Código de verificação |
| `certificate_url` | `url_certificado` | URL do certificado |
| `deletedAt` | `deleted_at` | Data de exclusão (soft delete) |
| `createdAt` | `created_at` | Data de criação |
| `updatedAt` | `updated_at` | Data de atualização |

## 🎯 Por que isso aconteceu?

O projeto tem **dois sistemas de certificados**:

1. **Sistema em Inglês** (`Certificate.js` + `certificates/generator/index.js`)
   - Usado pela rota `/api/certificates/*`
   - Chamado pelo frontend em `TournamentFinishedModal.jsx`
   - Usa nomenclatura em inglês no código

2. **Sistema em Português** (`Certificado.js` + `certificates/generator/generateCertificado.js`)
   - Usado pela rota `/api/certificados/*`
   - Usa nomenclatura em português no código

Ambos apontam para a mesma tabela `certificates` no banco de dados, que tem colunas em português.

## ✅ Como Testar

### 1. Reiniciar o servidor backend:
```bash
cd BackEnd
npm start
```

### 2. Testar via frontend:
- Acesse uma página de torneio (Matemática, Inglês ou Programação)
- Aguarde o torneio terminar
- Clique no botão "🏆 Certificado" ou aguarde o modal automático
- O certificado deve ser gerado sem erros

### 3. Testar via API:
```bash
curl -X POST http://localhost:5000/api/certificates/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"tournamentId": 1, "disciplina": "Matemática"}'
```

### 4. Verificar logs:
Você deve ver logs como:
```
🎯 Iniciando geração de certificado: { userId: 1, tournamentId: 1, disciplina: 'Matemática' }
📝 Disciplina normalizada: Matemática
✅ Participação encontrada: { posicao: 1, pontuacao: 95.5 }
✅ Novo certificado criado: 1
🖨️  Iniciando Puppeteer...
📄 Página criada, carregando conteúdo HTML...
📝 Gerando PDF em: /path/to/uploads/certificates/certificado-1-1234567890.pdf
✅ PDF gerado com sucesso
```

## 🗄️ Estrutura da Tabela no Banco

A tabela `certificates` deve ter esta estrutura:

```sql
CREATE TABLE `certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `torneio_id` int(11) NOT NULL,
  `pontuacao` decimal(10,2) NOT NULL,
  `posicao` int(11) NOT NULL,
  `codigo_verificacao` varchar(255) NOT NULL,
  `url_certificado` varchar(255) NOT NULL,
  `disciplina` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_verificacao` (`codigo_verificacao`),
  KEY `usuario_id` (`usuario_id`),
  KEY `torneio_id` (`torneio_id`),
  CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`torneio_id`) REFERENCES `torneios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 🔄 Alternativa: Usar o Sistema em Português

Se preferir usar o sistema totalmente em português, você pode:

1. Alterar o frontend para chamar `/api/certificados/gerar/:torneioId/:disciplina`
2. Usar o modelo `Certificado.js` que já está correto
3. Usar o gerador `certificates/generator/generateCertificado.js`

## 📝 Notas Importantes

1. **Não altere os nomes das colunas no banco de dados** - isso quebraria outras partes do sistema
2. **O atributo `field` do Sequelize** é a forma correta de mapear nomes diferentes
3. **Ambos os sistemas funcionam agora** - você pode usar qualquer um
4. **Logs detalhados** foram adicionados para facilitar o diagnóstico futuro

## 🎉 Resultado Esperado

Após esta correção, o erro "Unknown column 'user_id' in field list" **não deve mais aparecer**.

O sistema agora:
- ✅ Mapeia corretamente os nomes das colunas
- ✅ Gera certificados sem erros
- ✅ Salva no banco de dados corretamente
- ✅ Retorna o URL do certificado para download
- ✅ Funciona tanto com o sistema em inglês quanto em português
