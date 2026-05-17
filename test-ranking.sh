#!/bin/bash
# Script para testar o ranking de torneios

API_BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Teste do Ranking de Torneios"
echo "=========================================="
echo ""

# 1. Listar todos os torneios
echo "1. Listando todos os torneios..."
curl -X GET "$API_BASE_URL/api/tournaments" \
  -H "Content-Type: application/json" \
  -s | jq '.'
echo ""
echo ""

# 2. Se houver torneios, pegar o ID do primeiro
echo "2. Buscando ranking do primeiro torneio ativo..."
TORNEIO_ID=$(curl -X GET "$API_BASE_URL/api/torneios/ativo" \
  -H "Content-Type: application/json" \
  -s | jq -r '.torneio.id' 2>/dev/null)

if [ "$TORNEIO_ID" != "null" ] && [ -n "$TORNEIO_ID" ]; then
  echo "Torneio ID encontrado: $TORNEIO_ID"
  echo ""
  
  # 3. Obter ranking completo
  echo "3. Ranking Completo do Torneio:"
  curl -X GET "$API_BASE_URL/api/tournaments/$TORNEIO_ID/ranking" \
    -H "Content-Type: application/json" \
    -s | jq '.'
  echo ""
  echo ""
  
  # 4. Obter ranking por disciplina (Matemática)
  echo "4. Ranking da Disciplina Matemática:"
  curl -X GET "$API_BASE_URL/api/tournaments/$TORNEIO_ID/ranking/matematica" \
    -H "Content-Type: application/json" \
    -s | jq '.'
  echo ""
  echo ""
  
  # 5. Obter ranking por disciplina (Inglês)
  echo "5. Ranking da Disciplina Inglês:"
  curl -X GET "$API_BASE_URL/api/tournaments/$TORNEIO_ID/ranking/ingles" \
    -H "Content-Type: application/json" \
    -s | jq '.'
  echo ""
  echo ""
  
  # 6. Obter ranking por disciplina (Programação)
  echo "6. Ranking da Disciplina Programação:"
  curl -X GET "$API_BASE_URL/api/tournaments/$TORNEIO_ID/ranking/programacao" \
    -H "Content-Type: application/json" \
    -s | jq '.'
  echo ""
  
else
  echo "Nenhum torneio ativo encontrado. Por favor, crie um torneio primeiro."
  echo ""
fi

echo "=========================================="
echo "Teste finalizado"
echo "=========================================="
