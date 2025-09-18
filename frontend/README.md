# Alça Hub - Frontend 🎨

Interface moderna e responsiva para o sistema Alça Hub, desenvolvida com React 19 e tecnologias de ponta.

## 🚀 Tecnologias

- **React 19** - Biblioteca principal
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações
- **Axios** - Cliente HTTP
- **Leaflet** - Mapas interativos
- **QRCode** - Geração de códigos QR

## 📦 Scripts Disponíveis

### `yarn start` ou `npm start`

Executa a aplicação em modo de desenvolvimento.\
Abra [http://localhost:3000](http://localhost:3000) para visualizar no navegador.

A página recarregará automaticamente quando você fizer alterações.\
Você também verá erros de lint no console.

### `yarn build` ou `npm run build`

Constrói a aplicação para produção na pasta `build`.\
O React é empacotado corretamente em modo de produção e otimizado para melhor performance.

O build é minificado e os nomes dos arquivos incluem hashes.\
Sua aplicação está pronta para deploy!

### `yarn test` ou `npm test`

Inicia o executor de testes no modo interativo.\
Veja a seção sobre [executando testes](https://facebook.github.io/create-react-app/docs/running-tests) para mais informações.

## 🏗️ Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── admin/           # Componentes administrativos
│   ├── ui/              # Componentes de interface
│   ├── SideMenu.jsx     # Menu lateral
│   └── ServiceCategories.jsx
├── pages/               # Páginas da aplicação
│   ├── AdminDashboard.jsx
│   └── Mapa.jsx
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
├── App.js              # Componente principal
└── index.js            # Ponto de entrada
```

## 🎨 Componentes Principais

### Dashboard
- Interface responsiva com navegação por abas
- Diferentes visualizações para moradores, prestadores e admins
- Estatísticas em tempo real

### Sistema de Pagamento
- Integração com PIX via Mercado Pago
- Geração de QR codes
- Status de pagamento em tempo real

### Mapa Interativo
- Visualização de prestadores próximos
- Geolocalização automática
- Filtros por categoria

### Chat
- Sistema de mensagens em tempo real
- Negociação de preços
- Histórico de conversas

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto frontend:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Dependências

```bash
# Instalar dependências
yarn install

# ou
npm install
```

## 🎯 Funcionalidades por Tipo de Usuário

### 👤 Moradores
- Busca de serviços
- Visualização no mapa
- Agendamento
- Pagamento via PIX
- Avaliação de serviços

### 🔧 Prestadores
- Cadastro de serviços
- Gestão de agendamentos
- Dashboard de faturamento
- Controle de disponibilidade

### 👑 Administradores
- Painel de controle completo
- Gestão de usuários
- Relatórios e estatísticas
- Exportação de dados

## 🎨 Design System

### Cores
- **Primária**: Indigo (#6366F1)
- **Secundária**: Purple (#8B5CF6)
- **Sucesso**: Green (#10B981)
- **Aviso**: Orange (#F59E0B)
- **Erro**: Red (#EF4444)

### Componentes
- Cards responsivos
- Botões com estados
- Formulários validados
- Modais e diálogos
- Navegação intuitiva

## 📱 Responsividade

A aplicação é totalmente responsiva e otimizada para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🚀 Deploy

### Build de Produção
```bash
yarn build
```

### Servir Arquivos Estáticos
Use nginx, Apache ou serviços como:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

## 🔍 Desenvolvimento

### Estrutura de Componentes
- Componentes funcionais com hooks
- Props tipadas (quando possível)
- Estado local com useState
- Efeitos com useEffect

### Roteamento
- Rotas protegidas por autenticação
- Navegação por tipo de usuário
- Redirecionamentos automáticos

### Estado Global
- Context API para autenticação
- LocalStorage para persistência
- Axios interceptors para tokens

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - Verifique se o backend está rodando
   - Confirme as variáveis de ambiente

2. **Erro de Autenticação**
   - Verifique se o token está sendo enviado
   - Confirme as rotas protegidas

3. **Problemas de Build**
   - Limpe o cache: `yarn cache clean`
   - Delete node_modules e reinstale

## 📚 Documentação Adicional

- [React Documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

**Alça Hub Frontend** - Interface moderna para conectar pessoas! 🎨✨