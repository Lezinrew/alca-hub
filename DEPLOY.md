# 🚀 Guia de Deploy - Alça Hub

> Guia completo passo a passo para fazer deploy do Alça Hub em uma VPS

## 📋 Índice

- [🎯 VPS Recomendadas](#-vps-recomendadas)
- [⚙️ Configuração Inicial](#️-configuração-inicial)
- [🔧 Instalação da Aplicação](#-instalação-da-aplicação)
- [🌐 Configuração de Domínio](#-configuração-de-domínio)
- [🔒 Configuração de Segurança](#-configuração-de-segurança)
- [📊 Monitoramento](#-monitoramento)
- [🔄 Backup e Restore](#-backup-e-restore)

## 🎯 VPS Recomendadas

### 1. **DigitalOcean** (⭐ Recomendado)
- **Droplet**: $6/mês
- **Especificações**: 1GB RAM, 1 CPU, 25GB SSD
- **Região**: São Paulo (menor latência para Brasil)
- **Link**: [digitalocean.com](https://digitalocean.com)

### 2. **Linode**
- **Nanode**: $5/mês
- **Especificações**: 1GB RAM, 1 CPU, 25GB SSD
- **Região**: São Paulo
- **Link**: [linode.com](https://linode.com)

### 3. **Vultr**
- **Regular Performance**: $6/mês
- **Especificações**: 1GB RAM, 1 CPU, 25GB SSD
- **Região**: São Paulo
- **Link**: [vultr.com](https://vultr.com)

### 4. **AWS EC2**
- **t3.micro**: $8.50/mês
- **Especificações**: 1GB RAM, 1 CPU, 8GB SSD
- **Região**: São Paulo
- **Link**: [aws.amazon.com](https://aws.amazon.com)

## ⚙️ Configuração Inicial

### Passo 1: Criar VPS

1. **Escolha uma VPS** (recomendamos DigitalOcean)
2. **Selecione Ubuntu 22.04 LTS**
3. **Escolha o plano básico** (1GB RAM, 1 CPU)
4. **Selecione a região** mais próxima (São Paulo)
5. **Configure SSH Key** (recomendado) ou senha
6. **Crie a VPS**

### Passo 2: Conectar via SSH

```bash
# Conectar à VPS
ssh root@SEU_IP_VPS

# Ou se usar chave SSH
ssh -i sua-chave.pem root@SEU_IP_VPS
```

### Passo 3: Configurar Sistema

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git nano htop unzip

# Configurar timezone (opcional)
timedatectl set-timezone America/Sao_Paulo

# Configurar swap (recomendado para 1GB RAM)
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 🔧 Instalação da Aplicação

### Passo 1: Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### Passo 2: Clonar Aplicação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/alca-hub.git
cd alca-hub

# Dar permissão aos scripts
chmod +x *.sh
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

**Conteúdo do arquivo `.env` para produção:**

```env
# Configurações de Produção
SECRET_KEY=sua-chave-super-segura-aqui-gerada-aleatoriamente
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=senha-super-segura-para-mongodb
MONGO_DATABASE=alca_hub_prod
DEBUG=0
ENV=production

# Mercado Pago (Configurar com suas credenciais)
MERCADO_PAGO_ACCESS_TOKEN=seu-token-de-producao
MERCADO_PAGO_PUBLIC_KEY=sua-chave-publica-de-producao
WEBHOOK_SECRET=seu-webhook-secret-super-seguro

# CORS (Configurar com seu domínio)
CORS_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com

# URLs da aplicação
REACT_APP_BACKEND_URL=https://api.seu-dominio.com
```

### Passo 4: Gerar Chaves Seguras

```bash
# Gerar SECRET_KEY segura
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Gerar senha segura para MongoDB
openssl rand -base64 32

# Gerar WEBHOOK_SECRET
openssl rand -hex 32
```

### Passo 5: Iniciar Aplicação

```bash
# Iniciar aplicação
./start.sh

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

## 🌐 Configuração de Domínio

### Passo 1: Configurar DNS

1. **Acesse seu provedor de DNS** (Cloudflare, GoDaddy, etc.)
2. **Crie um registro A** apontando para o IP da VPS:
   ```
   Tipo: A
   Nome: @
   Valor: IP_DA_SUA_VPS
   TTL: 300
   ```
3. **Crie um registro CNAME** para www:
   ```
   Tipo: CNAME
   Nome: www
   Valor: seu-dominio.com
   TTL: 300
   ```

### Passo 2: Instalar Nginx

```bash
# Instalar Nginx
apt install nginx -y

# Iniciar e habilitar Nginx
systemctl start nginx
systemctl enable nginx

# Verificar status
systemctl status nginx
```

### Passo 3: Configurar Nginx

```bash
# Criar configuração do site
nano /etc/nginx/sites-available/alca-hub
```

**Conteúdo do arquivo:**

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket para chat
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar site
ln -s /etc/nginx/sites-available/alca-hub /etc/nginx/sites-enabled/

# Remover site padrão
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

### Passo 4: Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Testar renovação automática
certbot renew --dry-run
```

## 🔒 Configuração de Segurança

### Passo 1: Configurar Firewall

```bash
# Instalar UFW
apt install ufw -y

# Configurar regras básicas
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH
ufw allow ssh

# Permitir HTTP e HTTPS
ufw allow 80
ufw allow 443

# Ativar firewall
ufw enable

# Verificar status
ufw status
```

### Passo 2: Configurar SSH

```bash
# Editar configuração SSH
nano /etc/ssh/sshd_config
```

**Configurações recomendadas:**

```
Port 22
PermitRootLogin yes
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

```bash
# Recarregar SSH
systemctl restart ssh
```

### Passo 3: Configurar Fail2Ban

```bash
# Instalar Fail2Ban
apt install fail2ban -y

# Configurar
nano /etc/fail2ban/jail.local
```

**Conteúdo:**

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
```

```bash
# Iniciar Fail2Ban
systemctl start fail2ban
systemctl enable fail2ban
```

## 📊 Monitoramento

### Passo 1: Instalar Ferramentas de Monitoramento

```bash
# Instalar htop e iotop
apt install htop iotop -y

# Instalar netstat
apt install net-tools -y
```

### Passo 2: Configurar Logs

```bash
# Criar diretório de logs
mkdir -p /var/log/alca-hub

# Configurar rotação de logs
nano /etc/logrotate.d/alca-hub
```

**Conteúdo:**

```
/var/log/alca-hub/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

### Passo 3: Script de Monitoramento

```bash
# Criar script de monitoramento
nano /usr/local/bin/monitor-alca-hub.sh
```

**Conteúdo:**

```bash
#!/bin/bash

# Monitor do Alça Hub
echo "=== Status do Alça Hub ==="
echo "Data: $(date)"
echo ""

# Status dos containers
echo "Containers:"
docker compose ps
echo ""

# Uso de recursos
echo "Recursos:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Disco: $(df -h / | awk 'NR==2{print $5}')"
echo ""

# Logs de erro
echo "Últimos erros:"
docker compose logs --tail=10 2>&1 | grep -i error
```

```bash
# Dar permissão
chmod +x /usr/local/bin/monitor-alca-hub.sh

# Executar
/usr/local/bin/monitor-alca-hub.sh
```

## 🔄 Backup e Restore

### Passo 1: Script de Backup

```bash
# Criar script de backup
nano /usr/local/bin/backup-alca-hub.sh
```

**Conteúdo:**

```bash
#!/bin/bash

# Backup do Alça Hub
BACKUP_DIR="/backup/alca-hub"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do MongoDB
docker exec alca-hub-mongo mongodump --out /data/backup
docker cp alca-hub-mongo:/data/backup $BACKUP_DIR/mongodb_$DATE

# Backup do código
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /root/alca-hub

# Backup das configurações
cp /root/alca-hub/.env $BACKUP_DIR/env_$DATE

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;

echo "Backup concluído: $BACKUP_DIR"
```

```bash
# Dar permissão
chmod +x /usr/local/bin/backup-alca-hub.sh

# Executar backup
/usr/local/bin/backup-alca-hub.sh
```

### Passo 2: Agendar Backup Automático

```bash
# Editar crontab
crontab -e
```

**Adicionar linha:**

```
# Backup diário às 2h da manhã
0 2 * * * /usr/local/bin/backup-alca-hub.sh
```

### Passo 3: Script de Restore

```bash
# Criar script de restore
nano /usr/local/bin/restore-alca-hub.sh
```

**Conteúdo:**

```bash
#!/bin/bash

# Restore do Alça Hub
BACKUP_DIR="/backup/alca-hub"
DATE=$1

if [ -z "$DATE" ]; then
    echo "Uso: $0 YYYYMMDD_HHMMSS"
    exit 1
fi

# Parar aplicação
cd /root/alca-hub
docker compose down

# Restore do MongoDB
docker compose up -d mongo
sleep 10
docker cp $BACKUP_DIR/mongodb_$DATE alca-hub-mongo:/data/restore
docker exec alca-hub-mongo mongorestore /data/restore

# Restore do código
tar -xzf $BACKUP_DIR/code_$DATE.tar.gz -C /

# Restore das configurações
cp $BACKUP_DIR/env_$DATE /root/alca-hub/.env

# Iniciar aplicação
docker compose up -d

echo "Restore concluído"
```

```bash
# Dar permissão
chmod +x /usr/local/bin/restore-alca-hub.sh
```

## 🚀 Comandos Úteis

### Gerenciamento da Aplicação

```bash
# Iniciar aplicação
cd /root/alca-hub && ./start.sh

# Parar aplicação
docker compose down

# Reiniciar aplicação
docker compose restart

# Ver logs
docker compose logs -f

# Status dos serviços
docker compose ps

# Atualizar aplicação
git pull
docker compose build --no-cache
docker compose up -d
```

### Monitoramento

```bash
# Ver uso de recursos
htop

# Ver uso de disco
df -h

# Ver conexões de rede
netstat -tulpn

# Ver logs do sistema
journalctl -f

# Ver logs da aplicação
docker compose logs -f
```

### Backup e Restore

```bash
# Fazer backup
/usr/local/bin/backup-alca-hub.sh

# Restore de backup específico
/usr/local/bin/restore-alca-hub.sh 20240101_120000

# Listar backups
ls -la /backup/alca-hub/
```

## 🆘 Solução de Problemas

### Problema 1: Aplicação não inicia

```bash
# Verificar logs
docker compose logs

# Verificar status
docker compose ps

# Reiniciar tudo
docker compose down
docker compose up -d
```

### Problema 2: Erro de permissão

```bash
# Dar permissão aos scripts
chmod +x /root/alca-hub/*.sh

# Verificar proprietário
ls -la /root/alca-hub/
```

### Problema 3: Porta já em uso

```bash
# Verificar processos
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Parar processos
kill -9 PID
```

### Problema 4: Erro de memória

```bash
# Verificar uso de memória
free -h

# Limpar containers antigos
docker system prune -a

# Reiniciar aplicação
docker compose restart
```

## 📞 Suporte

### Logs Importantes

```bash
# Logs da aplicação
docker compose logs -f

# Logs do sistema
journalctl -f

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Comandos de Diagnóstico

```bash
# Status geral
/usr/local/bin/monitor-alca-hub.sh

# Teste de conectividade
curl -I http://localhost:3000
curl -I http://localhost:8000

# Teste de SSL
curl -I https://seu-dominio.com
```

---

**🎉 Parabéns! Seu Alça Hub está rodando em produção!**

**URLs de acesso:**
- **Frontend**: https://seu-dominio.com
- **API**: https://seu-dominio.com/api
- **Documentação**: https://seu-dominio.com/api/docs
