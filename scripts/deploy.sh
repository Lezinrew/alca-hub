#!/bin/bash

# Script de Deploy para Produção - Alça Hub
# ===========================================

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    error "Execute este script no diretório raiz do projeto"
    exit 1
fi

log "🚀 Iniciando deploy do Alça Hub para produção..."

# 1. Verificar dependências
log "📋 Verificando dependências..."

if ! command -v docker &> /dev/null; then
    error "Docker não está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado"
    exit 1
fi

success "Dependências verificadas"

# 2. Verificar arquivo de configuração
log "🔧 Verificando configurações..."

if [ ! -f "env.production" ]; then
    warning "Arquivo env.production não encontrado, usando .env"
    if [ ! -f ".env" ]; then
        error "Nenhum arquivo de configuração encontrado"
        exit 1
    fi
    ENV_FILE=".env"
else
    ENV_FILE="env.production"
fi

success "Configurações verificadas"

# 3. Backup do banco de dados (se existir)
log "💾 Fazendo backup do banco de dados..."

if docker-compose ps mongo | grep -q "Up"; then
    log "Criando backup do MongoDB..."
    docker-compose exec mongo mongodump --out /backup/$(date +%Y%m%d_%H%M%S)
    success "Backup criado"
else
    warning "MongoDB não está rodando, pulando backup"
fi

# 4. Parar serviços atuais
log "🛑 Parando serviços atuais..."

docker-compose down
success "Serviços parados"

# 5. Limpar containers e imagens antigas
log "🧹 Limpando containers e imagens antigas..."

docker system prune -f
docker image prune -f
success "Limpeza concluída"

# 6. Construir novas imagens
log "🔨 Construindo novas imagens..."

docker-compose build --no-cache
success "Imagens construídas"

# 7. Iniciar serviços
log "🚀 Iniciando serviços..."

if [ "$ENV_FILE" = "env.production" ]; then
    docker-compose --env-file env.production up -d
else
    docker-compose up -d
fi

success "Serviços iniciados"

# 8. Aguardar serviços ficarem prontos
log "⏳ Aguardando serviços ficarem prontos..."

# Aguardar MongoDB
log "Aguardando MongoDB..."
timeout 60 bash -c 'until docker-compose exec mongo mongosh --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; do sleep 2; done'
success "MongoDB pronto"

# Aguardar Backend
log "Aguardando Backend..."
timeout 60 bash -c 'until curl -f http://localhost:8000/health > /dev/null 2>&1; do sleep 2; done'
success "Backend pronto"

# Aguardar Frontend
log "Aguardando Frontend..."
timeout 60 bash -c 'until curl -f http://localhost:3000 > /dev/null 2>&1; do sleep 2; done'
success "Frontend pronto"

# 9. Verificar saúde dos serviços
log "🏥 Verificando saúde dos serviços..."

# Verificar MongoDB
if docker-compose exec mongo mongosh --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; then
    success "MongoDB: OK"
else
    error "MongoDB: FALHA"
    exit 1
fi

# Verificar Backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    success "Backend: OK"
else
    error "Backend: FALHA"
    exit 1
fi

# Verificar Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    success "Frontend: OK"
else
    error "Frontend: FALHA"
    exit 1
fi

# 10. Executar testes (opcional)
if [ "$1" = "--test" ]; then
    log "🧪 Executando testes..."
    
    # Testes do backend
    log "Executando testes do backend..."
    docker-compose exec backend python -m pytest tests/ -v
    
    # Testes do frontend
    log "Executando testes do frontend..."
    docker-compose exec frontend npm test -- --run
    
    success "Testes concluídos"
fi

# 11. Mostrar status final
log "📊 Status dos serviços:"
docker-compose ps

log "🌐 URLs dos serviços:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  MongoDB:  mongodb://localhost:27017"
echo "  API Docs: http://localhost:8000/docs"

# 12. Mostrar logs recentes
log "📝 Logs recentes:"
docker-compose logs --tail=10

success "🎉 Deploy concluído com sucesso!"

log "📋 Próximos passos:"
echo "  1. Configure o domínio e SSL"
echo "  2. Configure o backup automático"
echo "  3. Configure o monitoramento"
echo "  4. Configure as notificações"
echo "  5. Teste todas as funcionalidades"

log "🔗 Para verificar o status: ./scripts/status.sh"
log "📊 Para ver logs: ./scripts/logs.sh"
log "🔄 Para restart: ./scripts/restart.sh"
