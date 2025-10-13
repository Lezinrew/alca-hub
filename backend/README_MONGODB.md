# 🚀 Alça Hub - Migração MongoDB

## 📋 Resumo

Migração completa da base de **Prestadores de Serviço** para **MongoDB** com Mongoose, incluindo models, seeds, script de importação e endpoints de busca.

## 🏗️ Estrutura Implementada

### Models (Mongoose + TypeScript)
- ✅ `models/Category.ts` - Categorias de serviços
- ✅ `models/Provider.ts` - Prestadores de serviço  
- ✅ `models/ProviderMedia.ts` - Mídias dos prestadores

### Seeds (JSON)
- ✅ `seeds/seed_categories.json` - 18 categorias obrigatórias
- ✅ `seeds/seed_providers.json` - 33 prestadores (premium + comuns)

### Scripts
- ✅ `scripts/import_providers.ts` - Importação idempotente
- ✅ `routes/providers.ts` - Endpoints de busca

## 🚀 Instalação e Uso

### 1. Dependências
```bash
cd backend
npm install
```

### 2. Configuração
```bash
# Copiar arquivo de ambiente
cp env.example .env

# Editar .env com sua configuração MongoDB
MONGODB_URI=mongodb://localhost:27017/alcahub
```

### 3. Importação dos Dados
```bash
# Executar importação
npm run import:providers
```

### 4. Verificar Importação
```bash
# Conectar ao MongoDB e verificar
mongosh
use alcahub
db.providers.countDocuments()
db.categories.countDocuments()
```

## 📊 Dados de Seed

### Categorias (18)
- Gestão Condominial
- Conservação e Limpeza  
- Portaria e Segurança
- Jardinagem e Paisagismo
- Piscinas
- Elétrica
- Hidráulica
- Climatização
- Construção e Reforma
- Automação Residencial
- TI / Câmeras
- Mecânico
- Chaveiro
- Dedetização
- Concierge & Lifestyle
- Pet
- Aulas & Bem-estar

### Prestadores (33)
**Premium (isVerified=true) - 11 prestadores:**
- Mercader (Gestão Condominial)
- Anglo Norte (Gestão Condominial)
- BHZ Administradora (Gestão Condominial)
- JB Conservadora (Conservação e Limpeza; Portaria e Segurança)
- 3D Terceirização (Conservação e Limpeza; Jardinagem e Paisagismo)
- Grupo CMS Serviços (Portaria e Segurança; Conservação e Limpeza)
- i9 Automação (Automação Residencial; TI / Câmeras)
- Protec Segurança (Portaria e Segurança; TI / Câmeras)
- Pool Master (Piscinas)
- Verdejar Paisagismo (Jardinagem e Paisagismo)
- Condomínio Premium Services (Construção e Reforma)

**Comuns (isVerified=false) - 22 prestadores:**
- Faxina Elegance (Conservação e Limpeza)
- Eletric Nova Lima (Elétrica)
- Hidráulica Premium (Hidráulica)
- Piscineiro Expert (Piscinas)
- Mecânico Auto Luxo (Mecânico)
- Jardineiro Master (Jardinagem e Paisagismo)
- Dedetização Total (Dedetização)
- Chaveiro 24h Premium (Chaveiro)
- Ar Condicionado Pro (Climatização)
- Pedreiro Master (Construção e Reforma)
- Pintor Premium (Construção e Reforma)
- Gesseiro Expert (Construção e Reforma)
- Serralheiro Pro (Construção e Reforma)
- Vidraceiro Master (Construção e Reforma)
- Marceneiro Premium (Construção e Reforma)
- TI Residencial Pro (TI / Câmeras)
- Personal Trainer Elite (Aulas & Bem-estar)
- Esteticista Premium (Aulas & Bem-estar)
- Professor Particular Elite (Aulas & Bem-estar)
- Concierge Premium (Concierge & Lifestyle)
- Pet Sitter Premium (Pet)
- Banho & Tosa Elite (Pet)

## 🔍 Endpoints de Busca

### GET /providers
**Filtros disponíveis:**
- `category` - Filtrar por categoria
- `city` - Filtrar por cidade
- `verified` - Filtrar por verificação (true/false)
- `q` - Busca textual (nome, descrição, área de cobertura)
- `page` - Página (padrão: 1)
- `limit` - Itens por página (padrão: 20)
- `sortBy` - Ordenar por (isVerified, rating, name)
- `sortOrder` - Ordem (asc, desc)

**Exemplos:**
```bash
# Buscar eletricistas em Nova Lima
GET /providers?category=Elétrica&city=Nova%20Lima

# Buscar prestadores verificados
GET /providers?verified=true

# Buscar por termo
GET /providers?q=piscina

# Buscar com paginação
GET /providers?page=2&limit=10
```

### GET /categories
Lista todas as categorias disponíveis.

### GET /providers/:id
Busca prestador específico por ID.

### GET /providers/stats
Estatísticas dos prestadores (total, verificados, por categoria, por cidade).

## 🗂️ Índices MongoDB

### Provider
- `{ document: 1 }` **unique**
- `{ addressCity: 1 }`
- `{ isVerified: 1 }`
- `{ categoryIds: 1 }`

### Category
- `{ name: 1 }` **unique**

### ProviderMedia
- `{ providerId: 1 }`

## 🔧 Funcionalidades

### Validações
- ✅ `name` obrigatório (trim)
- ✅ `rating` entre 0 e 5
- ✅ `document` único e normalizado (apenas dígitos)
- ✅ Hooks para normalização automática

### Idempotência
- ✅ Importação pode ser executada múltiplas vezes
- ✅ Upsert por `document` (prestadores)
- ✅ Upsert por `name` (categorias)
- ✅ Não duplica dados

### Performance
- ✅ Índices otimizados para consultas
- ✅ Paginação eficiente
- ✅ Agregações para estatísticas

## 📈 Exemplo de Resposta

```json
{
  "providers": [
    {
      "_id": "ObjectId",
      "name": "Mercader",
      "legalName": "Mercader Gestão Executiva LTDA",
      "documentType": "CNPJ",
      "document": "11222333000199",
      "description": "Gestão condominial executiva...",
      "phone": "+55 31 0000-0000",
      "whatsapp": "+55 31 0000-0000",
      "email": "contato@mercader.com.br",
      "website": "https://www.mercader.com.br",
      "rating": 4.9,
      "isVerified": true,
      "coverageArea": "Nova Lima, Lagoa dos Ingleses...",
      "addressCity": "Nova Lima",
      "addressState": "MG",
      "categoryIds": [
        {
          "_id": "ObjectId",
          "name": "Gestão Condominial"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 33,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🎉 Status: **CONCLUÍDO**

A migração para MongoDB foi **CONCLUÍDA COM SUCESSO**:

- ✅ **Models**: 3 models com validação e índices
- ✅ **Seeds**: 18 categorias + 33 prestadores
- ✅ **Importação**: Script idempotente funcional
- ✅ **Endpoints**: API completa de busca
- ✅ **Documentação**: README detalhado
- ✅ **Qualidade**: Validações, índices, hooks

**Pronto para produção!** 🚀
