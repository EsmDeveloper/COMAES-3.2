#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_BASE="http://192.168.0.150:3001"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST: Admin Access to /api/admin/stats${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Step 1: Login
echo -e "${YELLOW}Step 1: Logging in as admin...${NC}\n"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "admin@comaes.com",
    "senha": "Senha123!"
  }')

echo "Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Login failed - no token received${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token received:${NC}"
echo "$TOKEN" | head -c 50
echo "...\n"

# Decode and show JWT payload
echo -e "${YELLOW}Step 2: Decoding JWT payload...${NC}\n"
PAYLOAD=$(echo "$TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null)
echo "Payload:"
echo "$PAYLOAD" | jq '.' 2>/dev/null || echo "$PAYLOAD"
echo ""

# Step 3: Test /api/admin/stats
echo -e "${YELLOW}Step 3: Testing /api/admin/stats...${NC}\n"
STATS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$API_BASE/api/admin/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

HTTP_STATUS=$(echo "$STATS_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$STATS_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ SUCCESS - Admin can access /api/admin/stats${NC}"
else
  echo -e "${RED}❌ FAILED - HTTP $HTTP_STATUS${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
