# Alça Hub 🏠

Sistema completo de gestão de serviços para condomínios, conectando moradores e prestadores de serviços através de uma plataforma moderna e intuitiva.

## 📋 Visão Geral

O **Alça Hub** é uma plataforma web que facilita a contratação de serviços domésticos e profissionais dentro de condomínios. A aplicação permite que moradores encontrem e contratem prestadores de serviços próximos, enquanto prestadores podem oferecer seus serviços e gerenciar seus agendamentos.

### 🎯 Principais Funcionalidades

- **Para Moradores:**
  - Busca de serviços por categoria
  - Visualização de prestadores no mapa
  - Agendamento de serviços
  - Sistema de pagamento integrado (PIX)
  - Avaliação de serviços
  - Chat com prestadores

- **Para Prestadores:**
  - Cadastro e gestão de serviços
  - Controle de disponibilidade
  - Gestão de agendamentos
  - Dashboard de faturamento
  - Geolocalização para maior visibilidade

- **Para Administradores:**
  - Painel de controle completo
  - Gestão de usuários e serviços
  - Relatórios e estatísticas
  - Exportação de dados

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e rápido
- **MongoDB** - Banco de dados NoSQL
- **Motor** - Driver assíncrono para MongoDB
- **JWT** - Autenticação e autorização
- **Mercado Pago** - Gateway de pagamento
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 19** - Biblioteca para interfaces de usuário
- **React Router** - Roteamento
- **Tailwind CSS** - Framework CSS
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações
- **Axios** - Cliente HTTP
- **Leaflet** - Mapas interativos
- **QRCode** - Geração de códigos QR

## 🚀 Instalação e Configuração

### Pré-requisitos
- Python 3.9+
- Node.js 16+
- MongoDB
- Yarn ou npm

### Backend

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd alca-hub/backend
```

2. **Crie um ambiente virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente:**
```bash
# Crie um arquivo .env na pasta backend
MONGO_URL=mongodb://localhost:27017
DB_NAME=alca_hub
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_aqui
WEBHOOK_SECRET=seu_webhook_secret_aqui
CORS_ORIGINS=http://localhost:3000
```

5. **Execute o servidor:**
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

1. **Navegue para a pasta frontend:**
```bash
cd ../frontend
```

2. **Instale as dependências:**
```bash
yarn install
# ou
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
# Crie um arquivo .env na pasta frontend
REACT_APP_BACKEND_URL=http://localhost:8000
```

4. **Execute o servidor de desenvolvimento:**
```bash
yarn start
# ou
npm start
```

## 📱 Como Usar

### Para Moradores
1. **Cadastre-se** como morador
2. **Explore serviços** disponíveis na sua região
3. **Use o mapa** para encontrar prestadores próximos
4. **Agende serviços** com data e horário
5. **Pague via PIX** de forma segura
6. **Avalie** os serviços contratados

### Para Prestadores
1. **Cadastre-se** como prestador
2. **Crie seus serviços** com preços e horários
3. **Ative a geolocalização** para aparecer no mapa
4. **Gerencie agendamentos** recebidos
5. **Acompanhe seu faturamento** no dashboard

### Para Administradores
1. **Acesse o painel administrativo**
2. **Gerencie usuários** e serviços
3. **Visualize estatísticas** da plataforma
4. **Exporte relatórios** em CSV

## 🔧 API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário atual

### Serviços
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço
- `GET /api/services/{id}` - Detalhes do serviço

### Agendamentos
- `POST /api/bookings` - Criar agendamento
- `GET /api/bookings` - Listar agendamentos
- `PATCH /api/bookings/{id}` - Atualizar status

### Pagamentos
- `POST /api/payments/pix` - Criar pagamento PIX
- `GET /api/payments/{id}/status` - Status do pagamento

### Mapa
- `GET /api/map/providers-nearby` - Prestadores próximos

## 🗂️ Estrutura do Projeto

```
alca-hub/
├── backend/
│   ├── server.py              # Servidor FastAPI principal
│   ├── requirements.txt       # Dependências Python
│   └── venv/                  # Ambiente virtual
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── hooks/            # Hooks customizados
│   │   └── lib/              # Utilitários
│   ├── public/               # Arquivos estáticos
│   └── package.json          # Dependências Node.js
└── README.md                 # Este arquivo
```

## 🔒 Segurança

- Autenticação JWT com tokens seguros
- Validação de dados com Pydantic
- Criptografia de senhas com bcrypt
- CORS configurado adequadamente
- Validação de webhooks do Mercado Pago

## 🚀 Deploy

### Backend (Produção)
```bash
# Instalar dependências
pip install -r requirements.txt

# Executar com Gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Produção)
```bash
# Build da aplicação
yarn build

# Servir arquivos estáticos
# Use nginx, Apache ou serviço de hospedagem
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através de:
- Email: suporte@alcahub.com
- Issues no GitHub

## 🎉 Agradecimentos

- Equipe de desenvolvimento
- Comunidade open source
- Usuários beta testers

---

**Alça Hub** - Conectando pessoas, facilitando serviços! 🏠✨
