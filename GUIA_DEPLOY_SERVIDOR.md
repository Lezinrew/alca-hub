# 🚀 Guia de Deploy para Servidor - Alça Hub

Este guia completo explica como fazer deploy da aplicação Alça Hub em um servidor de produção.

## 📋 **Pré-requisitos do Servidor**

### **🔧 Requisitos Mínimos:**
- **Sistema Operacional**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: 4GB mínimo (8GB recomendado)
- **CPU**: 2 cores mínimo (4 cores recomendado)
- **Disco**: 20GB espaço livre
- **Rede**: Acesso à internet para downloads

### **📦 Software Necessário:**
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Para clonar o repositório
- **Nginx**: Para proxy reverso (opcional)
- **Certbot**: Para SSL (opcional)

## 🛠️ **Instalação no Servidor**

### **1. Preparar o Servidor**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl wget git unzip

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalações
docker --version
docker-compose --version
```

### **2. Clonar o Repositório**

```bash
# Clonar o projeto
git clone https://github.com/Lezinrew/alca-hub.git
cd alca-hub

# Verificar estrutura
ls -la
```

### **3. Configurar Variáveis de Ambiente**

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar configurações
nano .env
```

**Configurações importantes para produção:**

```bash
# ===========================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ===========================================
MONGO_URL=mongodb://mongo:27017
MONGO_DATABASE=alca_hub
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=senha_forte_producao_2025

# ===========================================
# CONFIGURAÇÕES DO MERCADO PAGO
# ===========================================
MERCADO_PAGO_ACCESS_TOKEN=seu_token_producao
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica
WEBHOOK_SECRET=seu_webhook_secret_forte

# ===========================================
# CONFIGURAÇÕES DE AMBIENTE
# ===========================================
DEBUG=0
ENV=production
CORS_ORIGINS=https://seudominio.com,https://www.seudominio.com

# ===========================================
# CONFIGURAÇÕES DO FRONTEND
# ===========================================
REACT_APP_BACKEND_URL=https://seudominio.com/api
NODE_ENV=production

# ===========================================
# CONFIGURAÇÕES DE SEGURANÇA
# ===========================================
SECRET_KEY=chave_secreta_forte_producao_2025
JWT_SECRET=jwt_secret_forte_producao_2025
ENCRYPTION_KEY=chave_criptografia_forte_2025

# ===========================================
# CONFIGURAÇÕES DE LOG
# ===========================================
LOG_LEVEL=INFO
LOG_FILE=/app/logs/app.log

# ===========================================
# CONFIGURAÇÕES DE REDE
# ===========================================
BACKEND_PORT=8000
FRONTEND_PORT=3000
MONGO_PORT=27017
```

## 🚀 **Deploy da Aplicação**

### **1. Deploy Básico (Docker Compose)**

```bash
# Dar permissão ao script
chmod +x start.sh

# Executar deploy
./start.sh prod

# Verificar status
docker-compose ps
```

### **2. Deploy com Nginx (Recomendado)**

**Instalar Nginx:**

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

**Configurar Nginx:**

```bash
# Criar configuração
sudo nano /etc/nginx/sites-available/alca-hub
```

**Conteúdo do arquivo Nginx:**

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Documentação API
    location /docs/ {
        proxy_pass http://localhost:8000/docs/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Ativar configuração:**

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/alca-hub /etc/nginx/sites-enabled/

# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### **3. Configurar SSL (HTTPS)**

**Instalar Certbot:**

```bash
sudo apt install certbot python3-certbot-nginx -y
```

**Obter certificado SSL:**

```bash
# Obter certificado
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Verificar renovação automática
sudo certbot renew --dry-run
```

## 🔧 **Configurações Avançadas**

### **1. Configurar Firewall**

```bash
# Instalar UFW
sudo apt install ufw -y

# Configurar regras
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable
```

### **2. Configurar Backup Automático**

**Script de backup:**

```bash
# Criar script
sudo nano /usr/local/bin/backup-alca-hub.sh
```

**Conteúdo do script:**

```bash
#!/bin/bash

# Configurações
BACKUP_DIR="/backup/alca-hub"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="alca-hub-backup-$DATE.tar.gz"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Fazer backup dos volumes Docker
docker run --rm -v alca-hub_mongo_data:/data -v alca-hub_mongo_config:/config -v $BACKUP_DIR:/backup alpine tar czf /backup/mongo-$DATE.tar.gz -C /data . -C /config .

# Fazer backup dos logs
docker run --rm -v alca-hub_backend_logs:/logs -v $BACKUP_DIR:/backup alpine tar czf /backup/logs-$DATE.tar.gz -C /logs .

# Compactar tudo
cd $BACKUP_DIR
tar czf $BACKUP_FILE mongo-$DATE.tar.gz logs-$DATE.tar.gz
rm mongo-$DATE.tar.gz logs-$DATE.tar.gz

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "alca-hub-backup-*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $BACKUP_FILE"
```

**Configurar cron:**

```bash
# Editar crontab
sudo crontab -e

# Adicionar linha (backup diário às 2h)
0 2 * * * /usr/local/bin/backup-alca-hub.sh
```

### **3. Configurar Monitoramento**

**Instalar htop e netstat:**

```bash
sudo apt install htop net-tools -y
```

**Script de monitoramento:**

```bash
# Criar script
sudo nano /usr/local/bin/monitor-alca-hub.sh
```

**Conteúdo do script:**

```bash
#!/bin/bash

echo "=== Status dos Serviços ==="
docker-compose ps

echo -e "\n=== Uso de Recursos ==="
docker stats --no-stream

echo -e "\n=== Espaço em Disco ==="
df -h

echo -e "\n=== Uso de Memória ==="
free -h

echo -e "\n=== Portas em Uso ==="
netstat -tlnp | grep -E ':(3000|8000|27017)'
```

## 📊 **Verificação do Deploy**

### **1. Testes Básicos**

```bash
# Verificar containers
docker-compose ps

# Verificar logs
docker-compose logs -f

# Testar endpoints
curl http://localhost:3000
curl http://localhost:8000/ping
```

### **2. Testes de Funcionalidade**

```bash
# Testar frontend
curl -I http://seudominio.com

# Testar backend
curl -I http://seudominio.com/api/ping

# Testar documentação
curl -I http://seudominio.com/docs
```

### **3. Verificar SSL**

```bash
# Testar HTTPS
curl -I https://seudominio.com

# Verificar certificado
openssl s_client -connect seudominio.com:443 -servername seudominio.com
```

## 🔄 **Atualizações e Manutenção**

### **1. Atualizar Aplicação**

```bash
# Parar serviços
docker-compose down

# Atualizar código
git pull origin main

# Rebuild e iniciar
docker-compose up --build -d

# Verificar status
docker-compose ps
```

### **2. Backup e Restore**

**Backup:**

```bash
# Backup manual
./backup-alca-hub.sh

# Backup específico
docker-compose exec mongo mongodump --out /backup
```

**Restore:**

```bash
# Restore do banco
docker-compose exec mongo mongorestore /backup

# Restore de volumes
docker run --rm -v alca-hub_mongo_data:/data -v /backup:/backup alpine tar xzf /backup/mongo-backup.tar.gz -C /data
```

### **3. Limpeza do Sistema**

```bash
# Limpar containers parados
docker-compose down --remove-orphans

# Limpar imagens não utilizadas
docker image prune -f

# Limpar volumes não utilizados
docker volume prune -f

# Limpeza completa
docker system prune -a
```

## 🚨 **Troubleshooting**

### **Problemas Comuns:**

1. **Porta já em uso:**
   ```bash
   sudo lsof -i :3000
   sudo lsof -i :8000
   sudo lsof -i :27017
   ```

2. **Erro de permissão:**
   ```bash
   sudo chown -R $USER:$USER .
   chmod +x start.sh
   ```

3. **Containers não iniciam:**
   ```bash
   docker-compose logs -f
   docker-compose down --volumes
   docker-compose up --build
   ```

4. **Problemas de rede:**
   ```bash
   docker network ls
   docker network inspect alca-hub-network
   ```

### **Logs e Debug:**

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo

# Entrar nos containers
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec mongo mongosh
```

## 📈 **Otimizações de Produção**

### **1. Configurações do Docker**

**docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
    environment:
      - WORKERS=4
      - MAX_REQUESTS=1000
      - MAX_REQUESTS_JITTER=100

  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'
        reservations:
          memory: 256M
          cpus: '0.1'

  mongo:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

### **2. Configurações do Nginx**

**Otimizações de performance:**

```nginx
# Adicionar ao arquivo de configuração
client_max_body_size 10M;
client_body_timeout 60s;
client_header_timeout 60s;

# Cache estático
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Compressão
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## 🎯 **Checklist de Deploy**

### **✅ Pré-Deploy:**
- [ ] Servidor configurado
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] Arquivo .env configurado
- [ ] Domínio configurado
- [ ] Firewall configurado

### **✅ Deploy:**
- [ ] Aplicação iniciada
- [ ] Containers rodando
- [ ] Nginx configurado
- [ ] SSL configurado
- [ ] Backup configurado

### **✅ Pós-Deploy:**
- [ ] Testes de funcionalidade
- [ ] Monitoramento ativo
- [ ] Logs configurados
- [ ] Atualizações automáticas
- [ ] Documentação atualizada

## 📞 **Suporte**

- **GitHub Issues**: [Link para issues]
- **Documentação**: [Link para docs]
- **Email**: suporte@alcahub.com
- **Telegram**: @alcahub_suporte

---

**🎉 Parabéns! Sua aplicação Alça Hub está rodando em produção!**

**📱 Acesse:** https://seudominio.com
**🔧 API:** https://seudominio.com/api
**📚 Docs:** https://seudominio.com/docs
