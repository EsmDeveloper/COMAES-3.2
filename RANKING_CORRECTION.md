# Correção: Ranking de Torneios - Participantes não Aparecem

## Problema Identificado

Os participantes dos torneios não estavam sendo exibidos no ranking, mesmo quando já estavam registrados no sistema.

## Raiz do Problema

1. **Rotas de Ranking Faltando**: O frontend tentava acessar rotas (`/api/tournaments/:id/ranking`) que não existiam no backend
2. **Filtro de Status**: Os participantes podem ter status diferentes ('pendente', 'confirmado', 'removido', 'desclassificado'), mas apenas 'confirmado' deveria ser exibido no ranking
3. **Falta de Ordenação**: Os participantes não estavam sendo ordenados corretamente por pontuação

## Soluções Implementadas

### 1. **Criação de Novas Rotas** (`BackEnd/routes/tournamentsRoutes.js`)

Arquivo criado com as seguintes rotas:

- **GET `/api/tournaments`**: Lista todos os torneios
- **GET `/api/tournaments/:tournamentId/ranking`**: Obtém ranking completo de um torneio
- **GET `/api/tournaments/:tournamentId/ranking/:disciplina`**: Obtém ranking filtrado por disciplina

### 2. **Integração de Rotas** (`BackEnd/index.js`)

- Importado o novo arquivo de rotas: `import tournamentsRoutes from './routes/tournamentsRoutes.js'`
- Registrado em `app.use('/api/tournaments', tournamentsRoutes)`

### 3. **Correção do Controlador** (`BackEnd/controllers/TorneoController.js`)

Atualizadas as seguintes funcionalidades:

#### Método `getParticipantes`:

```javascript
// Antes: Buscava todos os participantes sem filtro
const participantes = await ParticipanteTorneio.findAll({
  where: { torneio_id: id, disciplina_competida: disciplina },
  include: [
    { model: Usuario, as: "usuario", attributes: ["id", "nome", "imagem"] },
  ],
  order: [["pontuacao", "DESC"]],
});

// Depois: Filtra por status e ordena corretamente
const where = { torneio_id: id };
if (disciplina) where.disciplina_competida = disciplina;
if (includeInactive !== "true") {
  where.status = "confirmado"; // Apenas participantes confirmados
}

const participantes = await ParticipanteTorneio.findAll({
  where,
  include: [
    {
      model: Usuario,
      as: "usuario",
      attributes: ["id", "nome", "imagem", "email"],
    },
  ],
  order: [
    ["pontuacao", "DESC"], // Ordenação principal por pontuação
    ["tempo_total", "ASC"], // Desempate por tempo
    ["entrou_em", "ASC"], // Desempate por ordem de entrada
  ],
});

// Adiciona posição (rank) a cada participante
const comPosicao = participantes.map((p, index) => ({
  ...p.toJSON(),
  posicao: index + 1,
}));
```

### 4. **Endpoints Novos/Melhorados**

#### GET `/api/tournaments`

Retorna lista de todos os torneios com informações básicas:

```json
{
  "success": true,
  "tournaments": [
    {
      "id": 1,
      "titulo": "Torneio de Programação 2024",
      "descricao": "...",
      "inicia_em": "2024-05-15T10:00:00Z",
      "termina_em": "2024-05-20T18:00:00Z",
      "status": "ativo",
      "criado_em": "2024-05-15T09:00:00Z"
    }
  ]
}
```

#### GET `/api/tournaments/:id/ranking`

Retorna ranking completo com posições:

```json
{
  "success": true,
  "tournament": {
    /* dados do torneio */
  },
  "totalParticipants": 45,
  "ranking": [
    {
      "id": 1,
      "posicao": 1,
      "usuario_id": 5,
      "torneio_id": 1,
      "pontuacao": 950,
      "tempo_total": 3600,
      "disciplina_competida": "Programação",
      "status": "confirmado",
      "usuario": {
        "id": 5,
        "nome": "João Silva",
        "imagem": "http://...",
        "email": "joao@example.com"
      }
    }
  ]
}
```

#### GET `/api/tournaments/:id/ranking/:disciplina`

Retorna ranking filtrado por disciplina:

```json
{
  "success": true,
  "tournament": {
    /* dados do torneio */
  },
  "disciplina": "Programação",
  "totalParticipants": 15,
  "ranking": [
    /* ... */
  ]
}
```

## Parâmetro Opcional

Ambas as rotas de ranking suportam o parâmetro query `includeInactive=true` para incluir participantes com status diferente de 'confirmado':

```bash
GET /api/tournaments/1/ranking?includeInactive=true
GET /api/tournaments/1/ranking/programacao?includeInactive=true
```

## Ordenação do Ranking

O ranking agora é ordenado por:

1. **Pontuação** (DESC): Maior pontuação vem primeiro
2. **Tempo Total** (ASC): Em caso de empate, quem levou menos tempo vem primeiro
3. **Data de Entrada** (ASC): Em caso de duplo empate, quem entrou primeiro no torneio vem primeiro

## Componentes Frontend Beneficiados

As seguintes páginas agora funcionarão corretamente:

1. **Ranking.jsx** - Exibe o ranking geral com seletor de torneios
2. **InglesOriginal.jsx** - Sidebar com ranking em tempo real
3. **MeusCertificados.jsx** - Mostra posição do participante no ranking
4. **EntrarTorneio.jsx** - Estatísticas de participantes

## Teste

Um script de teste foi criado em `test-ranking.sh` para validar:

```bash
bash test-ranking.sh
```

Este script testa:

1. Listagem de todos os torneios
2. Ranking completo
3. Ranking por disciplina (Matemática, Inglês, Programação)

## Status das Correções

✅ Rotas de ranking criadas
✅ Filtro de status adicionado
✅ Ordenação corrigida
✅ Posições (ranks) calculadas corretamente
✅ Integração com frontend testada
✅ Documentação atualizada

## Próximas Melhorias (Opcional)

- [ ] Cache de rankings para melhor performance
- [ ] WebSocket em tempo real para atualizações de ranking
- [ ] Histórico de mudanças de posição
- [ ] Medals/badges para top 3 participantes
- [ ] Export de ranking em PDF/Excel
