# 🧪 Guia de Testes - Alça Hub Backend

Este documento explica como executar e entender os testes do backend do Alça Hub.

## 📋 Pré-requisitos

- Python 3.9+
- Ambiente virtual ativado
- MongoDB rodando (para testes de integração)
- Dependências instaladas

## 🚀 Início Rápido

### 1. Ativar ambiente virtual
```bash
cd backend
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Executar testes
```bash
# Todos os testes
./run_tests.sh all

# Apenas testes unitários
./run_tests.sh unit

# Apenas testes de integração
./run_tests.sh integration
```

## 🏗️ Estrutura de Testes

```
backend/tests/
├── __init__.py
├── conftest.py              # Configuração global
├── unit/                    # Testes unitários
│   ├── test_auth.py        # Testes de autenticação
│   └── test_users.py       # Testes de usuários
├── integration/            # Testes de integração
│   └── test_auth_integration.py
├── fixtures/                # Fixtures específicas
├── utils/                   # Utilitários de teste
│   └── test_helpers.py     # Helpers e factories
└── run_tests.sh            # Script de execução
```

## 🎯 Tipos de Testes

### Testes Unitários
- **Localização:** `tests/unit/`
- **Foco:** Funções e classes isoladas
- **Mock:** Banco de dados e dependências externas
- **Execução:** Rápida (< 1 segundo por teste)

### Testes de Integração
- **Localização:** `tests/integration/`
- **Foco:** Fluxos completos de API
- **Mock:** Apenas serviços externos (Mercado Pago, etc.)
- **Execução:** Mais lenta (1-5 segundos por teste)

## 🔧 Comandos Disponíveis

### Script de Testes
```bash
# Todos os testes
./run_tests.sh all

# Testes unitários
./run_tests.sh unit

# Testes de integração
./run_tests.sh integration

# Testes de autenticação
./run_tests.sh auth

# Testes de usuários
./run_tests.sh user

# Com cobertura
./run_tests.sh coverage

# Modo verbose
./run_tests.sh verbose

# Teste específico
./run_tests.sh specific tests/unit/test_auth.py

# Limpar cache
./run_tests.sh clean

# Linting
./run_tests.sh lint

# Formatação
./run_tests.sh format

# Verificação de tipos
./run_tests.sh types

# Todos os checks
./run_tests.sh checks
```

### Pytest Direto
```bash
# Executar todos os testes
pytest tests/ -v

# Executar com cobertura
pytest tests/ --cov=. --cov-report=html

# Executar testes específicos
pytest tests/unit/test_auth.py -v

# Executar com marcadores
pytest tests/ -m "auth" -v
pytest tests/ -m "unit" -v
pytest tests/ -m "integration" -v
```

## 📊 Cobertura de Testes

### Metas de Cobertura
- **Geral:** 80%+
- **Autenticação:** 90%+
- **Usuários:** 85%+
- **API Endpoints:** 80%+

### Relatórios
```bash
# Gerar relatório HTML
pytest tests/ --cov=. --cov-report=html:htmlcov

# Abrir relatório
open htmlcov/index.html
```

## 🧪 Fixtures Disponíveis

### Fixtures Globais (conftest.py)
- `client` - Cliente de teste síncrono
- `async_client` - Cliente de teste assíncrono
- `test_db` - Conexão com banco de teste
- `mock_database` - Mock do banco de dados
- `sample_user_data` - Dados de usuário de exemplo
- `sample_service_data` - Dados de serviço de exemplo
- `sample_booking_data` - Dados de agendamento de exemplo
- `auth_headers` - Headers de autenticação
- `morador_user` - Usuário morador
- `prestador_user` - Usuário prestador
- `admin_user` - Usuário administrador

### Fixtures Específicas
- `test_data_factory` - Factory para dados de teste
- `db_helper` - Helper para banco de dados
- `auth_helper` - Helper para autenticação
- `api_helper` - Helper para API
- `mock_helper` - Helper para mocks

## 🎭 Mocks e Stubs

### Banco de Dados
```python
# Mock do banco
mock_database.users.find_one.return_value = user_data
mock_database.users.insert_one.return_value = AsyncMock(inserted_id="123")
```

### Mercado Pago
```python
# Mock do Mercado Pago
mock_mp = MagicMock()
mock_mp.payment.create.return_value = payment_response
```

### Autenticação
```python
# Mock de usuário autenticado
with patch('server.get_current_user') as mock_get_user:
    mock_get_user.return_value = user_data
```

## 📝 Escrevendo Testes

### Estrutura de Teste
```python
class TestFeature:
    """Testes para funcionalidade X."""
    
    def test_success_case(self, fixture):
        """Testar caso de sucesso."""
        # Arrange
        data = {"key": "value"}
        
        # Act
        result = function_under_test(data)
        
        # Assert
        assert result is not None
        assert result["key"] == "value"
    
    def test_error_case(self, fixture):
        """Testar caso de erro."""
        # Arrange
        invalid_data = {"key": ""}
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            function_under_test(invalid_data)
        
        assert exc_info.value.status_code == 400
```

### Marcadores
```python
@pytest.mark.unit
def test_unit_function():
    """Teste unitário."""
    pass

@pytest.mark.integration
def test_integration_flow():
    """Teste de integração."""
    pass

@pytest.mark.auth
def test_authentication():
    """Teste de autenticação."""
    pass
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de importação**
   ```bash
   # Verificar se está no diretório correto
   cd backend
   
   # Verificar se o ambiente virtual está ativo
   which python
   ```

2. **Erro de conexão com MongoDB**
   ```bash
   # Verificar se MongoDB está rodando
   mongosh --eval "db.adminCommand('ping')"
   
   # Para testes, usar mock
   pytest tests/unit/ -v
   ```

3. **Erro de dependências**
   ```bash
   # Reinstalar dependências
   pip install -r requirements.txt --force-reinstall
   ```

4. **Cache de testes**
   ```bash
   # Limpar cache
   ./run_tests.sh clean
   pytest --cache-clear
   ```

### Logs de Debug
```bash
# Executar com logs detalhados
pytest tests/ -v -s --log-cli-level=DEBUG

# Executar teste específico com debug
pytest tests/unit/test_auth.py::TestPasswordHashing::test_password_hashing -v -s
```

## 📈 Métricas de Qualidade

### Cobertura por Módulo
- `server.py`: 80%+
- `auth.py`: 90%+
- `users.py`: 85%+
- `services.py`: 80%+

### Testes por Funcionalidade
- **Autenticação:** 15+ testes
- **Usuários:** 20+ testes
- **Serviços:** 10+ testes
- **Agendamentos:** 10+ testes

### Tempo de Execução
- **Testes unitários:** < 30 segundos
- **Testes de integração:** < 2 minutos
- **Todos os testes:** < 3 minutos

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    cd backend
    ./run_tests.sh all
```

### Docker
```bash
# Executar testes no container
docker-compose exec backend ./run_tests.sh all
```

## 📚 Recursos Adicionais

- [Documentação Pytest](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Motor Testing](https://motor.readthedocs.io/en/stable/tutorial-testing.html)
- [Pytest Async](https://pytest-asyncio.readthedocs.io/)

## 🤝 Contribuição

1. Escreva testes para novas funcionalidades
2. Mantenha cobertura acima de 80%
3. Use fixtures apropriadas
4. Documente casos de teste complexos
5. Execute todos os testes antes do commit

## 📞 Suporte

- Issues no GitHub
- Documentação: [Link para docs]
- Email: suporte@alcahub.com
