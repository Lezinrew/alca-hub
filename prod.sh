#!/bin/bash

# Script de Produção - Alça Hub
# Deploy otimizado para VPS

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker não está rodando. Inicie o Docker primeiro."
        exit 1
    fi
    success "Docker está rodando"
}

# Função para verificar arquivo .env
check_env() {
    if [ ! -f .env ]; then
        error "Arquivo .env não encontrado. Configure as variáveis de ambiente primeiro."
        exit 1
    fi
    
    # Verificar variáveis obrigatórias
    required_vars=("SECRET_KEY" "MONGO_ROOT_USERNAME" "MONGO_ROOT_PASSWORD" "MONGO_DATABASE")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            error "Variável ${var} não encontrada no arquivo .env"
            exit 1
        fi
    done
    
    success "Arquivo .env configurado corretamente"
}

# Função para limpar containers antigos
cleanup() {
    log "Limpando containers antigos..."
    docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    success "Containers antigos removidos"
}

# Função para construir imagens
build_images() {
    log "Construindo imagens de produção..."
    docker compose -f docker-compose.prod.yml build --no-cache
    success "Imagens construídas com sucesso"
}

# Função para iniciar serviços
start_services() {
    log "Iniciando serviços de produção..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Aguardar serviços ficarem saudáveis
    log "Aguardando serviços ficarem prontos..."
    sleep 15
    
    # Verificar saúde dos serviços
    check_health
}

# Função para verificar saúde dos serviços
check_health() {
    log "Verificando saúde dos serviços..."
    
    # Verificar MongoDB
    if docker exec alca-hub-mongo-prod mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        success "MongoDB está saudável"
    else
        error "MongoDB não está respondendo"
        return 1
    fi
    
    # Verificar Backend
    if curl -f http://localhost:8000/ping > /dev/null 2>&1; then
        success "Backend está saudável"
    else
        error "Backend não está respondendo"
        return 1
    fi
    
    # Verificar Frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend está saudável"
    else
        error "Frontend não está respondendo"
        return 1
    fi
}

# Função para mostrar status
show_status() {
    echo ""
    echo "🚀 Alça Hub - Produção"
    echo "======================"
    echo "📊 Status dos Serviços:"
    docker compose -f docker-compose.prod.yml ps
    echo ""
    echo "🌐 URLs de Acesso:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  MongoDB:  mongodb://localhost:27017"
    echo ""
    echo "📝 Logs em tempo real:"
    echo "  docker compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "🔄 Para reiniciar um serviço:"
    echo "  docker compose -f docker-compose.prod.yml restart [service]"
    echo ""
    echo "🛑 Para parar tudo:"
    echo "  docker compose -f docker-compose.prod.yml down"
    echo ""
    echo "📊 Monitoramento:"
    echo "  htop                    # Recursos do sistema"
    echo "  docker stats            # Recursos dos containers"
    echo "  docker compose logs -f  # Logs da aplicação"
    echo ""
}

# Função para configurar auto-start
setup_autostart() {
    log "Configurando auto-start..."
    
    # Criar serviço systemd
    cat > /etc/systemd/system/alca-hub.service << EOF
[Unit]
Description=Alca Hub Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    # Recarregar systemd
    systemctl daemon-reload
    systemctl enable alca-hub.service
    
    success "Auto-start configurado"
}

# Função para configurar backup
setup_backup() {
    log "Configurando backup automático..."
    
    # Criar diretório de backup
    mkdir -p /backup/alca-hub
    
    # Criar script de backup
    cat > /usr/local/bin/backup-alca-hub.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/alca-hub"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup do MongoDB
docker exec alca-hub-mongo-prod mongodump --out /data/backup
docker cp alca-hub-mongo-prod:/data/backup $BACKUP_DIR/mongodb_$DATE

# Backup do código
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /root/alca-hub

# Backup das configurações
cp /root/alca-hub/.env $BACKUP_DIR/env_$DATE

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;

echo "Backup concluído: $BACKUP_DIR"
EOF

    chmod +x /usr/local/bin/backup-alca-hub.sh
    
    # Agendar backup diário
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-alca-hub.sh") | crontab -
    
    success "Backup automático configurado"
}

# Função para configurar monitoramento
setup_monitoring() {
    log "Configurando monitoramento..."
    
    # Criar script de monitoramento
    cat > /usr/local/bin/monitor-alca-hub.sh << 'EOF'
#!/bin/bash
echo "=== Status do Alça Hub ==="
echo "Data: $(date)"
echo ""

# Status dos containers
echo "Containers:"
docker compose -f docker-compose.prod.yml ps
echo ""

# Uso de recursos
echo "Recursos:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Disco: $(df -h / | awk 'NR==2{print $5}')"
echo ""

# Logs de erro
echo "Últimos erros:"
docker compose -f docker-compose.prod.yml logs --tail=10 2>&1 | grep -i error
EOF

    chmod +x /usr/local/bin/monitor-alca-hub.sh
    
    success "Monitoramento configurado"
}

# Função para mostrar ajuda
show_help() {
    echo "🚀 Script de Produção - Alça Hub"
    echo "================================="
    echo ""
    echo "USO:"
    echo "  ./prod.sh                    # Deploy completo"
    echo "  ./prod.sh --setup            # Apenas configuração"
    echo "  ./prod.sh --status           # Status dos serviços"
    echo "  ./prod.sh --logs             # Ver logs"
    echo "  ./prod.sh --restart          # Reiniciar serviços"
    echo "  ./prod.sh --stop             # Parar serviços"
    echo "  ./prod.sh --help             # Mostrar esta ajuda"
    echo ""
    echo "FUNCIONALIDADES:"
    echo "  • Deploy otimizado para produção"
    echo "  • Configuração automática de auto-start"
    echo "  • Backup automático diário"
    echo "  • Monitoramento de recursos"
    echo "  • Verificação de saúde dos serviços"
    echo ""
}

# Função para mostrar status
show_status_only() {
    echo "📊 Status dos Serviços:"
    docker compose -f docker-compose.prod.yml ps
    echo ""
    echo "📈 Recursos do Sistema:"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "RAM: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
    echo "Disco: $(df -h / | awk 'NR==2{print $5}')"
    echo ""
}

# Função para mostrar logs
show_logs() {
    echo "📝 Logs da Aplicação:"
    docker compose -f docker-compose.prod.yml logs -f
}

# Função para reiniciar serviços
restart_services() {
    log "Reiniciando serviços..."
    docker compose -f docker-compose.prod.yml restart
    success "Serviços reiniciados"
}

# Função para parar serviços
stop_services() {
    log "Parando serviços..."
    docker compose -f docker-compose.prod.yml down
    success "Serviços parados"
}

# Função principal
main() {
    case "${1:-}" in
        "--setup")
            log "Configurando apenas setup..."
            check_docker
            check_env
            setup_autostart
            setup_backup
            setup_monitoring
            success "Setup concluído"
            ;;
        "--status")
            show_status_only
            ;;
        "--logs")
            show_logs
            ;;
        "--restart")
            restart_services
            ;;
        "--stop")
            stop_services
            ;;
        "--help"|"-h")
            show_help
            ;;
        "")
            echo "🚀 Deploy Alça Hub - Produção"
            echo "============================="
            
            # Verificações iniciais
            check_docker
            check_env
            
            # Deploy
            cleanup
            build_images
            start_services
            
            # Configuração
            setup_autostart
            setup_backup
            setup_monitoring
            
            # Mostrar status
            show_status
            
            success "Deploy concluído com sucesso!"
            ;;
        *)
            error "Opção inválida: $1"
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
