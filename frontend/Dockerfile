# Dockerfile para Frontend (React) - Alça Hub
# Estágio 1: Build da aplicação
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json yarn.lock ./

# Instalar dependências
RUN yarn install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação para produção
RUN yarn build

# Estágio 2: Servir aplicação com Nginx
FROM nginx:alpine

# Instalar curl para health check
RUN apk add --no-cache curl

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Criar diretório para logs
RUN mkdir -p /var/log/nginx

# Expor porta 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
