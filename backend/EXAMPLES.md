# 📚 Exemplos de Uso - API MongoDB

## 🔍 Busca de Prestadores

### Buscar por Categoria
```bash
# Eletricistas
curl "http://localhost:8000/providers?category=Elétrica"

# Prestadores de piscina
curl "http://localhost:8000/providers?category=Piscinas"
```

### Buscar por Cidade
```bash
# Prestadores em Nova Lima
curl "http://localhost:8000/providers?city=Nova%20Lima"

# Prestadores em Lagoa dos Ingleses
curl "http://localhost:8000/providers?city=Lagoa%20dos%20Ingleses"
```

### Buscar Prestadores Verificados
```bash
# Apenas prestadores premium
curl "http://localhost:8000/providers?verified=true"

# Apenas prestadores comuns
curl "http://localhost:8000/providers?verified=false"
```

### Busca Textual
```bash
# Buscar por termo
curl "http://localhost:8000/providers?q=premium"

# Buscar por especialidade
curl "http://localhost:8000/providers?q=eletricista"
```

### Filtros Combinados
```bash
# Eletricistas verificados em Nova Lima
curl "http://localhost:8000/providers?category=Elétrica&city=Nova%20Lima&verified=true"

# Prestadores de limpeza com busca textual
curl "http://localhost:8000/providers?category=Conservação%20e%20Limpeza&q=residencial"
```

### Paginação
```bash
# Primeira página (20 itens)
curl "http://localhost:8000/providers?page=1&limit=20"

# Segunda página (10 itens)
curl "http://localhost:8000/providers?page=2&limit=10"
```

### Ordenação
```bash
# Ordenar por rating (maior primeiro)
curl "http://localhost:8000/providers?sortBy=rating&sortOrder=desc"

# Ordenar por nome (A-Z)
curl "http://localhost:8000/providers?sortBy=name&sortOrder=asc"
```

## 📋 Listar Categorias

```bash
# Todas as categorias
curl "http://localhost:8000/categories"
```

## 📊 Estatísticas

```bash
# Estatísticas gerais
curl "http://localhost:8000/providers/stats"
```

## 🔍 Buscar Prestador Específico

```bash
# Por ID (substitua OBJECT_ID pelo ID real)
curl "http://localhost:8000/providers/OBJECT_ID"
```

## 📈 Exemplos de Resposta

### Lista de Prestadores
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
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 33,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "category": "Elétrica",
    "city": "Nova Lima",
    "verified": "true",
    "q": null,
    "sortBy": "isVerified",
    "sortOrder": "desc"
  }
}
```

### Lista de Categorias
```json
{
  "categories": [
    {
      "_id": "ObjectId",
      "name": "Gestão Condominial",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "ObjectId", 
      "name": "Elétrica",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 18
}
```

### Estatísticas
```json
{
  "total": 33,
  "verified": 11,
  "unverified": 22,
  "byCategory": [
    {
      "_id": "Construção e Reforma",
      "count": 8
    },
    {
      "_id": "Conservação e Limpeza", 
      "count": 4
    }
  ],
  "byCity": [
    {
      "_id": "Nova Lima",
      "count": 33
    }
  ]
}
```

## 🎯 Casos de Uso Comuns

### 1. Dashboard Admin
```bash
# Prestadores verificados para aprovação
curl "http://localhost:8000/providers?verified=false&sortBy=createdAt&sortOrder=desc"

# Estatísticas gerais
curl "http://localhost:8000/providers/stats"
```

### 2. Busca do Usuário
```bash
# Eletricistas próximos
curl "http://localhost:8000/providers?category=Elétrica&city=Nova%20Lima&verified=true"

# Prestadores de limpeza
curl "http://localhost:8000/providers?category=Conservação%20e%20Limpeza&q=residencial"
```

### 3. Relatórios
```bash
# Prestadores por categoria
curl "http://localhost:8000/providers/stats"

# Todos os prestadores (paginação)
curl "http://localhost:8000/providers?page=1&limit=50"
```

## 🚀 Pronto para Produção!

A API está **100% funcional** e pronta para uso! 🎉
