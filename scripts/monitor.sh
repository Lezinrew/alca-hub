#!/bin/bash

# Script de Monitoramento - Alca Hub
# Monitora saúde dos serviços e performance

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
LOG_FILE="monitor.log"

# Função para log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Função para verificar saúde do serviço
check_service_health() {
    local service=$1
    local url=$2
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service: OK${NC}"
        log "HEALTH CHECK: $service - OK"
        return 0
    else
        echo -e "${RED}❌ $service: FAILED${NC}"
        log "HEALTH CHECK: $service - FAILED"
        return 1
    fi
}

# Função para verificar uso de recursos
check_resources() {
    echo -e "${BLUE}📊 Recursos do Sistema:${NC}"
    
    # CPU
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    echo "CPU Usage: ${cpu_usage}%"
    
    # Memória
    memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    echo "Memory Usage: ${memory_usage}%"
    
    # Disco
    disk_usage=$(df -h / | awk 'NR==2{printf "%s", $5}')
    echo "Disk Usage: $disk_usage"
    
    # Docker stats
    echo -e "${BLUE}🐳 Containers:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Função para verificar logs de erro
check_error_logs() {
    echo -e "${BLUE}🔍 Verificando Logs de Erro:${NC}"
    
    # Verificar logs do backend
    backend_errors=$(docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs backend 2>&1 | grep -i error | wc -l)
    if [ "$backend_errors" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Backend: $backend_errors erros encontrados${NC}"
        log "ERRORS: Backend - $backend_errors errors"
    else
        echo -e "${GREEN}✅ Backend: Sem erros${NC}"
    fi
    
    # Verificar logs do frontend
    frontend_errors=$(docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs frontend 2>&1 | grep -i error | wc -l)
    if [ "$frontend_errors" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Frontend: $frontend_errors erros encontrados${NC}"
        log "ERRORS: Frontend - $frontend_errors errors"
    else
        echo -e "${GREEN}✅ Frontend: Sem erros${NC}"
    fi
    
    # Verificar logs do MongoDB
    mongo_errors=$(docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs mongo 2>&1 | grep -i error | wc -l)
    if [ "$mongo_errors" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  MongoDB: $mongo_errors erros encontrados${NC}"
        log "ERRORS: MongoDB - $mongo_errors errors"
    else
        echo -e "${GREEN}✅ MongoDB: Sem erros${NC}"
    fi
}

# Função para verificar conectividade
check_connectivity() {
    echo -e "${BLUE}🌐 Teste de Conectividade:${NC}"
    
    # Verificar se os serviços estão rodando
    services=("mongo" "backend" "frontend" "nginx")
    for service in "${services[@]}"; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps "$service" | grep -q "Up"; then
            echo -e "${GREEN}✅ $service: Rodando${NC}"
        else
            echo -e "${RED}❌ $service: Parado${NC}"
            log "SERVICE DOWN: $service"
        fi
    done
}

# Função para backup automático
backup_database() {
    echo -e "${BLUE}💾 Backup do Banco de Dados:${NC}"
    
    backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup do MongoDB
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T mongo mongodump --db alca_hub_prod --archive > "$backup_dir/mongodb_backup.archive"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup criado: $backup_dir/mongodb_backup.archive${NC}"
        log "BACKUP: Database backup created successfully"
    else
        echo -e "${RED}❌ Falha no backup${NC}"
        log "BACKUP: Database backup failed"
    fi
}

# Função para limpeza de logs antigos
cleanup_logs() {
    echo -e "${BLUE}🧹 Limpeza de Logs:${NC}"
    
    # Limpar logs antigos (mais de 7 dias)
    find . -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    # Limpar logs do Docker
    docker system prune -f --volumes
    
    echo -e "${GREEN}✅ Limpeza concluída${NC}"
    log "CLEANUP: Old logs cleaned"
}

# Função para relatório de status
generate_report() {
    echo -e "${BLUE}📋 Relatório de Status:${NC}"
    echo "=================================="
    echo "Data: $(date)"
    echo "Hostname: $(hostname)"
    echo "Uptime: $(uptime)"
    echo "=================================="
    
    # Status dos serviços
    echo -e "\n${BLUE}🔧 Status dos Serviços:${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
    
    # Recursos
    echo -e "\n${BLUE}📊 Recursos:${NC}"
    check_resources
    
    # Conectividade
    echo -e "\n${BLUE}🌐 Conectividade:${NC}"
    check_connectivity
    
    # Logs de erro
    echo -e "\n${BLUE}🔍 Logs de Erro:${NC}"
    check_error_logs
}

# Função principal
main() {
    echo -e "${BLUE}🚀 Monitor Alca Hub - $(date)${NC}"
    echo "=================================="
    
    # Verificar se o arquivo de configuração existe
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${RED}❌ Arquivo $COMPOSE_FILE não encontrado${NC}"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}❌ Arquivo $ENV_FILE não encontrado${NC}"
        exit 1
    fi
    
    # Executar verificações
    check_resources
    echo ""
    check_connectivity
    echo ""
    check_error_logs
    echo ""
    
    # Health checks
    echo -e "${BLUE}🏥 Health Checks:${NC}"
    check_service_health "Frontend" "http://localhost/health"
    check_service_health "Backend API" "http://localhost/api/ping"
    
    # Backup (se solicitado)
    if [ "$1" = "--backup" ]; then
        echo ""
        backup_database
    fi
    
    # Limpeza (se solicitado)
    if [ "$1" = "--cleanup" ]; then
        echo ""
        cleanup_logs
    fi
    
    # Relatório completo (se solicitado)
    if [ "$1" = "--report" ]; then
        echo ""
        generate_report
    fi
    
    echo -e "\n${GREEN}✅ Monitoramento concluído${NC}"
    log "MONITOR: Health check completed"
}

# Verificar argumentos
case "$1" in
    --backup)
        main --backup
        ;;
    --cleanup)
        main --cleanup
        ;;
    --report)
        main --report
        ;;
    --help)
        echo "Uso: $0 [opção]"
        echo "Opções:"
        echo "  --backup    Executar backup do banco de dados"
        echo "  --cleanup   Limpar logs antigos"
        echo "  --report    Gerar relatório completo"
        echo "  --help      Mostrar esta ajuda"
        ;;
    *)
        main
        ;;
esac
