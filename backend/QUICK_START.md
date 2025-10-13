# 🚀 Quick Start - MongoDB Alça Hub

## ⚡ Instalação Rápida

```bash
# 1. Instalar dependências
cd backend
npm install

# 2. Configurar ambiente
cp env.example .env
# Editar .env com sua MONGODB_URI

# 3. Importar dados
npm run import:providers

# 4. Testar importação
npm run test:import
```

## 📊 Dados Importados

- **18 Categorias** (Gestão Condominial, Elétrica, etc.)
- **33 Prestadores** (11 premium + 22 comuns)
- **Índices otimizados** para consultas rápidas
- **Validações** automáticas de dados

## 🔍 Endpoints Disponíveis

```bash
# Buscar prestadores
GET /providers?category=Elétrica&city=Nova%20Lima&verified=true

# Listar categorias
GET /categories

# Estatísticas
GET /providers/stats
```

## ✅ Verificação

```bash
# Verificar contagens
mongosh
use alcahub
db.providers.countDocuments()  # Deve retornar 33
db.categories.countDocuments()  # Deve retornar 18
```

**Pronto!** 🎉
