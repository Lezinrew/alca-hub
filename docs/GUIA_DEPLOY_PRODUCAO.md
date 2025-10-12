# 🚀 Guia de Deploy para Produção - Alca Hub

Este guia fornece instruções completas para fazer deploy do Alca Hub em ambiente de produção.

## 📋 Pré-requisitos

### **Servidor de Produção**
- **OS**: Ubuntu 20.04+ ou CentOS 8+
- **RAM**: Mínimo 4GB (Recomendado 8GB+)
- **CPU**: Mínimo 2 cores (Recomendado 4+ cores)
- **Disco**: Mínimo 50GB (Recomendado 100GB+)
- **Rede**: IP público e domínio configurado

### **Software Necessário**
- Docker 20.10+
- Docker Compose 2.0+
- Nginx (opcional, para proxy reverso)
- Certificado SSL (Let's Encrypt recomendado)

## 🔧 Configuração do Servidor

### **1. Instalar Docker e Docker Compose**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### **2. Configurar Firewall**

```bash
# Configurar UFW
sudo ufw allow 22      # SSH
sudo ufw allow 80       # HTTP
sudo ufw allow 443      # HTTPS
sudo ufw allow 8000     # Backend (opcional, se exposto)
sudo ufw enable
```

## 📁 Preparação do Projeto

### **1. Clone do Repositório**

```bash
# Clonar repositório
git clone https://github.com/Lezinrew/alca-hub.git
cd alca-hub

# Verificar branch
git checkout main
```

### **2. Configurar Variáveis de Ambiente**

```bash
# Criar arquivo .env para produção
cp env.example .env.prod

# Editar variáveis
nano .env.prod
```

**Conteúdo do .env.prod:**
```env
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=senha_super_segura_aqui
MONGO_DATABASE=alca_hub_prod

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_token_de_producao
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_de_producao
WEBHOOK_SECRET=seu_webhook_secret_super_seguro

# CORS
CORS_ORIGINS=https://seudominio.com,https://www.seudominio.com

# Frontend
REACT_APP_BACKEND_URL=https://api.seudominio.com

# Redis
REDIS_PASSWORD=senha_redis_super_segura

# SSL
SSL_EMAIL=seu@email.com
```

## 🐳 Deploy com Docker

### **1. Deploy Básico**

```bash
# Usar docker-compose de produção
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### **2. Deploy com Nginx (Recomendado)**

```bash
# Criar configuração Nginx
mkdir -p nginx/ssl

# Configurar Nginx
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }
    
    upstream frontend {
        server frontend:80;
    }
    
    server {
        listen 80;
        server_name seudominio.com www.seudominio.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name seudominio.com www.seudominio.com;
        
        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;
        
        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # API Backend
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Frontend
        location / {
            proxy_pass http://frontend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health Check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Deploy com Nginx
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## 🔒 Configuração SSL

### **1. Let's Encrypt (Recomendado)**

```bash
# Instalar Certbot
sudo apt install certbot

# Obter certificado
sudo certbot certonly --standalone -d seudominio.com -d www.seudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/seudominio.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/seudominio.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*.pem

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### **2. Certificado Próprio**

```bash
# Gerar certificado auto-assinado (apenas para teste)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/C=BR/ST=SP/L=SaoPaulo/O=AlcaHub/CN=seudominio.com"
```

## 📊 Monitoramento

### **1. Health Checks**

```bash
# Verificar saúde dos serviços
curl -f http://localhost/health
curl -f http://localhost/api/ping

# Verificar logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs mongo
```

### **2. Métricas de Performance**

```bash
# Uso de recursos
docker stats

# Espaço em disco
df -h

# Uso de memória
free -h
```

## 🔄 Backup e Restore

### **1. Backup do MongoDB**

```bash
# Backup completo
docker-compose -f docker-compose.prod.yml exec mongo mongodump --out /data/backup

# Backup específico
docker-compose -f docker-compose.prod.yml exec mongo mongodump --db alca_hub_prod --out /data/backup

# Copiar backup para host
docker cp alca-hub-mongo-prod:/data/backup ./backup-$(date +%Y%m%d)
```

### **2. Restore do MongoDB**

```bash
# Restore completo
docker-compose -f docker-compose.prod.yml exec mongo mongorestore /data/backup

# Restore específico
docker-compose -f docker-compose.prod.yml exec mongo mongorestore --db alca_hub_prod /data/backup/alca_hub_prod
```

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **1. Serviços não iniciam**
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs

# Verificar recursos
docker system df
docker system prune -f
```

#### **2. Erro de conexão com MongoDB**
```bash
# Verificar se MongoDB está rodando
docker-compose -f docker-compose.prod.yml exec mongo mongosh --eval "db.adminCommand('ping')"

# Verificar logs do MongoDB
docker-compose -f docker-compose.prod.yml logs mongo
```

#### **3. Erro de CORS**
```bash
# Verificar variável CORS_ORIGINS
docker-compose -f docker-compose.prod.yml exec backend env | grep CORS

# Reiniciar backend
docker-compose -f docker-compose.prod.yml restart backend
```

## 📈 Otimizações de Produção

### **1. Configurações do MongoDB**

```bash
# Otimizar MongoDB para produção
docker-compose -f docker-compose.prod.yml exec mongo mongosh --eval "
db.adminCommand({
  setParameter: 1,
  logLevel: 1,
  slowOpThresholdMs: 100
})"
```

### **2. Configurações do Nginx**

```bash
# Otimizar Nginx
cat >> nginx/nginx.conf << 'EOF'
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache Headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
EOF
```

## 🔐 Segurança

### **1. Firewall Avançado**

```bash
# Configurar iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### **2. Monitoramento de Segurança**

```bash
# Instalar fail2ban
sudo apt install fail2ban

# Configurar fail2ban
sudo nano /etc/fail2ban/jail.local
```

## 📞 Suporte

### **Canais de Suporte**
- 📧 **Email**: suporte@alcahub.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Lezinrew/alca-hub/issues)
- 💬 **Discord**: [Servidor da Comunidade](https://discord.gg/alcahub)

### **Recursos Úteis**
- 📚 **Documentação**: [docs/](docs/)
- 🎥 **Vídeos**: [Canal do YouTube](https://youtube.com/alcahub)
- 📖 **Blog**: [Blog Técnico](https://blog.alcahub.com)

---

**Desenvolvido com ❤️ pela equipe Alca Hub**  
**Última atualização**: Outubro 2025
