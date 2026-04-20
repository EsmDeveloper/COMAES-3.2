#!/bin/bash

# 🧪 SCRIPT DE TESTE RÁPIDO - Sistema de Avaliação v2.0
# Uso: bash quick-test.sh

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     TESTE RÁPIDO - SISTEMA DE AVALIAÇÃO COM IA v2.0           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# 1. Verificar ficheiros
echo "📁 1. Verificando ficheiros modificados/criados..."
echo ""

FILES=(
  "BackEnd/services/iaEvaluators.js"
  "BackEnd/services/EVALUATION_CRITERIA.md"
  "BackEnd/services/test-evaluation.js"
  "EVALUATION_CHANGES_SUMMARY.md"
  "DEPLOYMENT_GUIDE.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (FALTANDO)"
    ((ERRORS++))
  fi
done

echo ""
echo "📊 Resultado: ${#FILES[@]} ficheiros esperados"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ Todos os ficheiros presentes!${NC}"
else
  echo -e "${RED}✗ Faltam $ERRORS ficheiros!${NC}"
fi

# 2. Verificar variáveis de ambiente
echo ""
echo "⚙️  2. Verificando configuração..."
echo ""

if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  OPENAI_API_KEY não configurada${NC}"
  echo "    Adicione ao .env ou variáveis de sistema"
  ((ERRORS++))
else
  echo -e "${GREEN}✓${NC} OPENAI_API_KEY configurada"
  echo "   (Primeiros 5 caracteres: ${OPENAI_API_KEY:0:5}...)"
fi

# 3. Verificar sintaxe do Node.js
echo ""
echo "🔍 3. Verificando sintaxe do iaEvaluators.js..."
echo ""

if node -c BackEnd/services/iaEvaluators.js 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Sintaxe válida"
else
  echo -e "${RED}✗${NC} Erro de sintaxe detectado"
  node -c BackEnd/services/iaEvaluators.js
  ((ERRORS++))
fi

# 4. Teste de importação
echo ""
echo "📦 4. Verificando importações..."
echo ""

cd BackEnd
if node -e "import('./services/iaEvaluators.js').then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Módulo iaEvaluators.js importa corretamente"
else
  echo -e "${RED}✗${NC} Erro ao importar iaEvaluators.js"
  ((ERRORS++))
fi
cd ..

# 5. Resumo
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ TUDO OK! Sistema pronto para teste.${NC}"
  echo ""
  echo "Próximos passos:"
  echo "1. Abra BackEnd/.env e adicione OPENAI_API_KEY (se não estiver)"
  echo "2. Execute: npm run dev"
  echo "3. Teste o endpoint /api/avaliar com respostas de teste"
  echo ""
else
  echo -e "${RED}❌ ENCONTRADOS $ERRORS PROBLEMA(S)${NC}"
  echo ""
  echo "Verifique:"
  echo "1. Todos os ficheiros foram criados?"
  echo "2. OPENAI_API_KEY está configurada?"
  echo "3. Sintaxe está válida?"
  echo ""
fi

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     FIM DO TESTE RÁPIDO                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

exit $ERRORS
