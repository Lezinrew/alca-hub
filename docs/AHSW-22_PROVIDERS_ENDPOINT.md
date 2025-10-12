# ✅ AHSW-22 - Endpoint GET /providers

## 📋 Resumo da Implementação

**Status**: ✅ **CONCLUÍDO**  
**Endpoint**: `GET /api/providers`  
**Funcionalidade**: Lista de prestadores por coordenadas com paginação e distância calculada  

### 🎯 Objetivos Alcançados

- ✅ **Rota REST**: Endpoint GET /providers com parâmetros lat/lon
- ✅ **Paginação**: Suporte completo a paginação (page, per_page)
- ✅ **Distância**: Cálculo de distância usando fórmula de Haversine
- ✅ **Filtros**: Filtro por categoria de serviço
- ✅ **Ordenação**: Ordenação por distância, rating ou nome
- ✅ **Validação**: Validação de coordenadas e parâmetros
- ✅ **Testes**: Testes unitários e de integração

## 🚀 Endpoint Implementado

### URL
```
GET /api/providers
```

### Parâmetros de Query

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `lat` | float | ✅ | - | Latitude do ponto de referência (-90 a 90) |
| `lon` | float | ✅ | - | Longitude do ponto de referência (-180 a 180) |
| `radius_km` | float | ❌ | 10.0 | Raio de busca em quilômetros (0.1 a 100) |
| `categoria` | string | ❌ | null | Filtrar por categoria de serviço |
| `page` | int | ❌ | 1 | Número da página (≥ 1) |
| `per_page` | int | ❌ | 20 | Itens por página (1 a 100) |
| `sort_by` | string | ❌ | "distance" | Ordenar por: distance, rating, name |
| `sort_order` | string | ❌ | "asc" | Ordem: asc, desc |

### Exemplo de Requisição

```bash
curl "http://localhost:8000/api/providers?lat=-23.5505&lon=-46.6333&radius_km=5&page=1&per_page=10&categoria=limpeza&sort_by=distance&sort_order=asc"
```

### Resposta de Sucesso (200)

```json
{
  "providers": [
    {
      "provider_id": "prestador_123",
      "nome": "João Silva",
      "telefone": "11999999999",
      "email": "joao@exemplo.com",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "distance_km": 0.5,
      "estimated_time_min": 8,
      "rating": 4.5,
      "total_avaliacoes": 10,
      "foto_url": "https://exemplo.com/foto.jpg",
      "endereco": "Rua A, 123 - São Paulo",
      "disponivel": true,
      "especialidades": ["limpeza", "manutenção"],
      "services": [
        {
          "id": "servico_123",
          "nome": "Limpeza Residencial",
          "categoria": "limpeza",
          "preco_por_hora": 50.0,
          "media_avaliacoes": 4.5,
          "total_avaliacoes": 8,
          "descricao": "Limpeza completa da residência",
          "disponivel": true
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 25,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false,
    "next_page": 2,
    "prev_page": null
  },
  "filters": {
    "latitude": -23.5505,
    "longitude": -46.6333,
    "radius_km": 5.0,
    "categoria": "limpeza",
    "sort_by": "distance",
    "sort_order": "asc"
  },
  "summary": {
    "total_found": 25,
    "showing": 10,
    "search_radius": "5.0km"
  }
}
```

## 🔧 Funcionalidades Implementadas

### 1. Cálculo de Distância
- **Fórmula**: Haversine para cálculo preciso de distância
- **Unidade**: Quilômetros (km)
- **Precisão**: 2 casas decimais
- **Tempo estimado**: Heurística baseada na distância (5 min base + 3 min/km)

### 2. Paginação
- **Página atual**: `page` (≥ 1)
- **Itens por página**: `per_page` (1-100)
- **Metadados**: Total de itens, páginas, navegação
- **Navegação**: `has_next`, `has_prev`, `next_page`, `prev_page`

### 3. Filtros
- **Coordenadas**: Validação de latitude (-90 a 90) e longitude (-180 a 180)
- **Raio**: Filtro por distância máxima (0.1 a 100 km)
- **Categoria**: Filtro por categoria de serviço
- **Status**: Apenas prestadores ativos e disponíveis

### 4. Ordenação
- **Por distância**: `sort_by=distance` (padrão)
- **Por rating**: `sort_by=rating`
- **Por nome**: `sort_by=name`
- **Ordem**: `sort_order=asc|desc`

### 5. Validação
- **Coordenadas**: Latitude e longitude dentro dos limites
- **Parâmetros**: Validação de tipos e ranges
- **Erros**: Mensagens claras para parâmetros inválidos

## 📊 Estrutura de Resposta

### Providers Array
Cada prestador contém:
- **Identificação**: `provider_id`, `nome`, `telefone`, `email`
- **Localização**: `latitude`, `longitude`, `endereco`
- **Distância**: `distance_km`, `estimated_time_min`
- **Avaliações**: `rating`, `total_avaliacoes`
- **Perfil**: `foto_url`, `disponivel`, `especialidades`
- **Serviços**: Array de serviços disponíveis

### Pagination Object
- **Navegação**: `page`, `per_page`, `total`, `total_pages`
- **Controles**: `has_next`, `has_prev`, `next_page`, `prev_page`

### Filters Object
- **Parâmetros aplicados**: Todos os filtros da requisição
- **Auditoria**: Rastreamento dos filtros utilizados

### Summary Object
- **Estatísticas**: `total_found`, `showing`, `search_radius`
- **Resumo**: Informações sobre a busca realizada

## 🧪 Testes Implementados

### Testes Unitários
- **Validação**: Coordenadas, parâmetros, tipos
- **Cálculo**: Distância, tempo estimado, ordenação
- **Paginação**: Lógica de paginação, metadados
- **Filtros**: Categoria, raio, status
- **Erros**: Tratamento de exceções, mensagens

### Testes de Integração
- **Fluxo completo**: Busca, filtros, paginação, ordenação
- **Cenários reais**: Dados realistas, múltiplos prestadores
- **Performance**: Busca eficiente, otimizações
- **Edge cases**: Coordenadas extremas, dados vazios

### Script de Teste
```bash
cd backend
python test_providers_endpoint.py
```

## 🚀 Como Usar

### 1. Busca Básica
```bash
curl "http://localhost:8000/api/providers?lat=-23.5505&lon=-46.6333"
```

### 2. Com Filtros
```bash
curl "http://localhost:8000/api/providers?lat=-23.5505&lon=-46.6333&radius_km=5&categoria=limpeza"
```

### 3. Com Paginação
```bash
curl "http://localhost:8000/api/providers?lat=-23.5505&lon=-46.6333&page=2&per_page=10"
```

### 4. Com Ordenação
```bash
curl "http://localhost:8000/api/providers?lat=-23.5505&lon=-46.6333&sort_by=rating&sort_order=desc"
```

## 📈 Performance

### Otimizações Implementadas
- **Índices**: Busca eficiente por tipo e status
- **Filtros**: Aplicação de filtros no banco
- **Paginação**: Limite de resultados por página
- **Cache**: Reutilização de consultas de serviços

### Limites
- **Prestadores**: Máximo 1000 por consulta
- **Serviços**: Máximo 50 por prestador
- **Página**: Máximo 100 itens por página
- **Raio**: Máximo 100 km

## 🔍 Códigos de Erro

| Código | Descrição | Exemplo |
|--------|-----------|---------|
| 400 | Coordenadas inválidas | `lat=91` ou `lon=181` |
| 422 | Parâmetros inválidos | `page=0` ou `per_page=101` |
| 500 | Erro interno | Falha no banco de dados |

## 📁 Arquivos Implementados

- `backend/server.py` - Endpoint principal
- `backend/tests/unit/test_providers_endpoint.py` - Testes unitários
- `backend/tests/integration/test_providers_integration.py` - Testes de integração
- `backend/test_providers_endpoint.py` - Script de teste manual

## 🎉 Conclusão

A implementação da AHSW-22 foi **CONCLUÍDA COM SUCESSO**:

- ✅ **Endpoint REST**: GET /providers com parâmetros lat/lon
- ✅ **Paginação**: Suporte completo a paginação
- ✅ **Distância**: Cálculo preciso usando Haversine
- ✅ **Filtros**: Categoria, raio, status
- ✅ **Ordenação**: Distância, rating, nome
- ✅ **Validação**: Coordenadas e parâmetros
- ✅ **Testes**: Cobertura completa
- ✅ **Documentação**: API bem documentada

**Pronto para produção!** 🚀
