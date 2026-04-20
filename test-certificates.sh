#!/bin/bash

# Script de Teste - Sistema de Certificados COMAES

echo "🎓 TESTE DO SISTEMA DE CERTIFICADOS"
echo "===================================="
echo ""

BASE_URL="http://localhost:3000"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}1️⃣  Verificando saúde do servidor...${NC}"
HEALTH=$(curl -s "$BASE_URL/health" | jq -r '.status')
if [ "$HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✅ Servidor OK${NC}"
else
    echo -e "${RED}❌ Servidor offline${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}2️⃣  Testando endpoint de finalização de torneio...${NC}"
FINALIZE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/torneios/1/finalizar" \
    -H "Content-Type: application/json" \
    -d '{"disciplinas": ["Matemática"]}')

echo "Resposta:"
echo "$FINALIZE_RESPONSE" | jq '.'

echo ""
echo -e "${BLUE}3️⃣  Listando certificados de um usuário...${NC}"
CERTS=$(curl -s "$BASE_URL/api/certificados/meus-certificados/1")
echo "Certificados do Usuário 1:"
echo "$CERTS" | jq '.'

echo ""
echo -e "${BLUE}4️⃣  Obtendo certificado específico...${NC}"
CERT=$(curl -s "$BASE_URL/api/certificados/1/1/Matemática")
echo "Certificado (1º lugar, Torneio 1, Matemática):"
echo "$CERT" | jq '.data | {id, posicao, tipo_medalha, codigo_certificado, status}'

echo ""
echo -e "${BLUE}5️⃣  Verificando autenticidade de certificado...${NC}"
# Extrai o código do passo anterior
CODIGO=$(echo "$CERT" | jq -r '.data.codigo_certificado')
if [ ! -z "$CODIGO" ] && [ "$CODIGO" != "null" ]; then
    VERIFY=$(curl -s "$BASE_URL/api/certificados/verificar/$CODIGO")
    echo "Verificação:"
    echo "$VERIFY" | jq '.data'
else
    echo -e "${YELLOW}⚠️  Nenhum código encontrado para verificar${NC}"
fi

echo ""
echo -e "${BLUE}6️⃣  Testando obtenção de certificado com posição...${NC}"
CERT_1=$(curl -s "$BASE_URL/api/certificados/1/1/Matemática")
POSICAO=$(echo "$CERT_1" | jq -r '.data.posicao // "N/A"')
echo "Posição: $POSICAO"

echo ""
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo -e "${YELLOW}📝 Notas:${NC}"
echo "- Certifique-se de que o servidor está executando em http://localhost:3000"
echo "- Banco de dados deve estar conectado"
echo "- Deve haver pelo menos 1 torneio e 1 participante na base de dados"
echo ""
echo -e "${BLUE}📊 Endpoints Disponíveis:${NC}"
echo "  POST   /api/torneios/:id/finalizar                    - Finalizar torneio"
echo "  GET    /api/certificados/:usuarioId/:torneioId/:disc  - Obter certificado"
echo "  GET    /api/certificados/meus-certificados/:id        - Listar meus certs"
echo "  GET    /api/certificados/verificar/:codigo            - Verificar cert"
echo "  GET    /api/certificados/download/:codigo             - Download PDF"
echo "  DELETE /api/certificados/:id                          - Cancelar cert"
