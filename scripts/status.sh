#!/bin/bash

# Script de Status dos Serviços - Alça Hub
# ===========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Status dos Serviços - Alça Hub${NC}"
echo "=================================="

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado${NC}"
    exit 1
fi

echo -e "${BLUE}🐳 Containers Docker:${NC}"
docker-compose ps

echo ""
echo -e "${BLUE}🌐 URLs dos Serviços:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  MongoDB:  mongodb://localhost:27017"
echo "  API Docs: http://localhost:8000/docs"

echo ""
echo -e "${BLUE}🏥 Health Checks:${NC}"

# Verificar MongoDB
if docker-compose exec mongo mongosh --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB: OK${NC}"
else
    echo -e "${RED}❌ MongoDB: FALHA${NC}"
fi

# Verificar Backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: OK${NC}"
else
    echo -e "${RED}❌ Backend: FALHA${NC}"
fi

# Verificar Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend: OK${NC}"
else
    echo -e "${RED}❌ Frontend: FALHA${NC}"
fi

echo ""
echo -e "${BLUE}📈 Métricas do Sistema:${NC}"

# Uso de CPU e Memória
echo "Uso de CPU:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep alca-hub

echo ""
echo "Uso de Disco:"
df -h | grep -E "(Filesystem|/dev/)"

echo ""
echo -e "${BLUE}📝 Logs Recentes:${NC}"
docker-compose logs --tail=5
