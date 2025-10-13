# Testes de integração de autenticação - Alça Hub
import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException
from datetime import datetime, timedelta
import jwt
from server import create_access_token, verify_token, get_password_hash, verify_password

class TestAuthIntegration:
    """Testes de integração para fluxos completos de autenticação."""
    
    @pytest.mark.asyncio
    async def test_complete_login_flow(self, client, mock_database):
        """Testar fluxo completo de login com todas as validações."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {
            "_id": "123",
            "id": "123",
            "email": "teste@exemplo.com",
            "senha": get_password_hash("senha123456"),
            "cpf": "00000000000",
            "nome": "Usuário Teste",
            "telefone": "11999999999",
            "endereco": "Endereço Teste",
            "tipos": ["morador"],
            "tipo_ativo": "morador",
            "ativo": True
        }
        mock_database.login_attempts.find_one.return_value = None  # Sem tentativas anteriores
        mock_database.login_attempts.delete_one.return_value = AsyncMock(deleted_count=0)
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Dados de login
        login_data = {
            "email": "teste@exemplo.com",
            "senha": "senha123456"
        }
        
        # Fazer requisição
        response = client.post("/api/auth/login", json=login_data)
        
        # Verificar resposta
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "teste@exemplo.com"
        assert data["user"]["tipo"] == "morador"
        
        # Verificar se o token é válido
        token = data["access_token"]
        decoded = verify_token(token)
        assert decoded["id"] == "123"
        assert decoded["email"] == "teste@exemplo.com"
    
    @pytest.mark.asyncio
    async def test_complete_register_flow(self, client, mock_database):
        """Testar fluxo completo de registro com todas as validações."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = None  # Email não existe
        mock_database.users.insert_one.return_value = AsyncMock(inserted_id="123")
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Dados de registro
        register_data = {
            "nome": "Usuário Teste",
            "email": "novo@exemplo.com",
            "senha": "senha123456",
            "cpf": "12345678901",
            "telefone": "11999999999",
            "endereco": "Endereço Teste",
            "tipos": ["morador"],
            "aceitou_termos": True,
            "data_aceite_termos": datetime.utcnow().isoformat()
        }
        
        # Fazer requisição
        response = client.post("/api/auth/register", json=register_data)
        
        # Verificar resposta
        assert response.status_code == 200
        data = response.json()
        assert "Usuário criado com sucesso" in data["message"]
        assert "user" in data
        assert data["user"]["email"] == "novo@exemplo.com"
        assert data["user"]["tipo"] == "morador"
    
    @pytest.mark.asyncio
    async def test_complete_password_recovery_flow(self, client, mock_database):
        """Testar fluxo completo de recuperação de senha."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {
            "_id": "123",
            "id": "123",
            "email": "teste@exemplo.com",
            "ativo": True
        }
        mock_database.password_reset_attempts.find_one.return_value = None  # Sem tentativas recentes
        mock_database.password_reset_attempts.insert_one.return_value = AsyncMock(inserted_id="token123")
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # 1. Solicitar recuperação de senha
        forgot_data = {"email": "teste@exemplo.com"}
        response = client.post("/api/auth/forgot-password", json=forgot_data)
        assert response.status_code == 200
        data = response.json()
        assert "Código enviado" in data["message"]
        
        # 2. Redefinir senha
        mock_database.password_reset_attempts.find_one.return_value = {
            "email": "teste@exemplo.com",
            "token": "valid_token_123",
            "created_at": datetime.utcnow(),
            "used": False
        }
        mock_database.users.update_one.return_value = AsyncMock(modified_count=1)
        mock_database.password_reset_attempts.update_one.return_value = AsyncMock(modified_count=1)
        
        reset_data = {
            "token": "valid_token_123",
            "new_password": "nova_senha123456"
        }
        response = client.post("/api/auth/reset-password", json=reset_data)
        assert response.status_code == 200
        data = response.json()
        assert "Senha redefinida" in data["message"]
        
        # 3. Fazer login com nova senha
        mock_database.users.find_one.return_value = {
            "_id": "123",
            "id": "123",
            "email": "teste@exemplo.com",
            "senha": get_password_hash("nova_senha123456"),
            "ativo": True
        }
        
        login_data = {
            "email": "teste@exemplo.com",
            "senha": "nova_senha123456"
        }
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    @pytest.mark.asyncio
    async def test_oauth2_complete_flow(self, client, mock_database):
        """Testar fluxo completo OAuth2."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {
            "_id": "123",
            "id": "123",
            "email": "teste@exemplo.com",
            "senha": get_password_hash("senha123456"),
            "ativo": True
        }
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # 1. Obter token OAuth2
        form_data = {
            "username": "teste@exemplo.com",
            "password": "senha123456"
        }
        response = client.post("/api/auth/token", data=form_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        
        # 2. Usar token para acessar endpoint protegido
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Mock para endpoint protegido
        mock_database.users.find_one.return_value = {
            "_id": "123",
            "id": "123",
            "email": "teste@exemplo.com",
            "tipo": "morador",
            "ativo": True
        }
        
        response = client.get("/api/profile", headers=headers)
        assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_rate_limiting_integration(self, client, mock_database):
        """Testar integração de rate limiting com fluxo de login."""
        # Simular 5 tentativas falhadas
        mock_database.login_attempts.find_one.return_value = {
            "email": "teste@exemplo.com",
            "attempts": 5,
            "last_attempt": datetime.utcnow(),
            "blocked_until": datetime.utcnow() + timedelta(minutes=5)
        }
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Tentar fazer login
        login_data = {
            "email": "teste@exemplo.com",
            "senha": "senha_errada"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        # Verificar bloqueio
        assert response.status_code == 429
        data = response.json()
        assert "bloqueado por 5 minutos" in data["detail"]
    
    @pytest.mark.asyncio
    async def test_password_strength_validation_integration(self, client, mock_database):
        """Testar validação de força de senha em registro e reset."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = None  # Email não existe
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # 1. Tentar registro com senha fraca
        register_data = {
            "nome": "Usuário Teste",
            "email": "novo@exemplo.com",
            "senha": "123",  # Senha muito fraca
            "cpf": "12345678901",
            "telefone": "11999999999",
            "endereco": "Endereço Teste",
            "tipos": ["morador"],
            "aceitou_termos": True,
            "data_aceite_termos": datetime.utcnow().isoformat()
        }
        
        response = client.post("/api/auth/register", json=register_data)
        assert response.status_code == 400
        data = response.json()
        assert "Senha muito fraca" in data["detail"]
        
        # 2. Tentar reset com senha fraca
        mock_database.password_reset_attempts.find_one.return_value = {
            "email": "teste@exemplo.com",
            "token": "valid_token_123",
            "created_at": datetime.utcnow(),
            "used": False
        }
        
        reset_data = {
            "token": "valid_token_123",
            "new_password": "123"  # Senha muito fraca
        }
        
        response = client.post("/api/auth/reset-password", json=reset_data)
        assert response.status_code == 400
        data = response.json()
        assert "Senha muito fraca" in data["detail"]
    
    @pytest.mark.asyncio
    async def test_terms_acceptance_validation(self, client, mock_database):
        """Testar validação de aceite de termos no registro."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = None  # Email não existe
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Tentar registro sem aceitar termos
        register_data = {
            "nome": "Usuário Teste",
            "email": "novo@exemplo.com",
            "senha": "senha123456",
            "cpf": "12345678901",
            "telefone": "11999999999",
            "endereco": "Endereço Teste",
            "tipos": ["morador"],
            "aceitou_termos": False  # Não aceitou termos
        }
        
        response = client.post("/api/auth/register", json=register_data)
        assert response.status_code == 400
        data = response.json()
        assert "aceitar os Termos de Uso" in data["detail"]
    
    @pytest.mark.asyncio
    async def test_duplicate_email_validation(self, client, mock_database):
        """Testar validação de email duplicado no registro."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {"_id": "123"}  # Email já existe
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Tentar registro com email existente
        register_data = {
            "nome": "Usuário Teste",
            "email": "existente@exemplo.com",
            "senha": "senha123456",
            "cpf": "12345678901",
            "telefone": "11999999999",
            "endereco": "Endereço Teste",
            "tipos": ["morador"],
            "aceitou_termos": True,
            "data_aceite_termos": datetime.utcnow().isoformat()
        }
        
        response = client.post("/api/auth/register", json=register_data)
        assert response.status_code == 400
        data = response.json()
        assert "Email já cadastrado" in data["detail"]
    
    @pytest.mark.asyncio
    async def test_inactive_user_login_block(self, client, mock_database):
        """Testar bloqueio de login para usuário inativo."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {
            "_id": "123",
            "id": "123",
            "email": "teste@exemplo.com",
            "senha": get_password_hash("senha123456"),
            "ativo": False  # Usuário inativo
        }
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Tentar fazer login
        login_data = {
            "email": "teste@exemplo.com",
            "senha": "senha123456"
        }
        
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        data = response.json()
        assert "Email ou senha incorretos" in data["detail"]

class TestAuthErrorHandling:
    """Testes para tratamento de erros em autenticação."""
    
    @pytest.mark.asyncio
    async def test_database_connection_error(self, client):
        """Testar tratamento de erro de conexão com banco."""
        # Simular erro de conexão
        with patch('server.get_database') as mock_get_db:
            mock_get_db.side_effect = Exception("Database connection failed")
            
            login_data = {
                "email": "teste@exemplo.com",
                "senha": "senha123456"
            }
            
            response = client.post("/api/auth/login", json=login_data)
            assert response.status_code == 500
    
    @pytest.mark.asyncio
    async def test_invalid_json_request(self, client):
        """Testar tratamento de JSON inválido."""
        response = client.post("/api/auth/login", data="invalid json")
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_missing_required_fields(self, client):
        """Testar tratamento de campos obrigatórios ausentes."""
        # Login sem senha
        login_data = {"email": "teste@exemplo.com"}
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 422
        
        # Registro sem email
        register_data = {
            "nome": "Usuário Teste",
            "senha": "senha123456"
        }
        response = client.post("/api/auth/register", json=register_data)
        assert response.status_code == 422

# Fixtures específicas para testes de integração
@pytest.fixture
def auth_integration_data():
    """Dados para testes de integração de autenticação."""
    return {
        "valid_login": {
            "email": "teste@exemplo.com",
            "senha": "senha123456"
        },
        "valid_register": {
            "nome": "Usuário Teste",
            "email": "novo@exemplo.com",
            "senha": "senha123456",
            "cpf": "12345678901",
            "telefone": "11999999999",
            "endereco": "Endereço Teste",
            "tipos": ["morador"],
            "aceitou_termos": True,
            "data_aceite_termos": datetime.utcnow().isoformat()
        },
        "valid_forgot_password": {
            "email": "teste@exemplo.com"
        },
        "valid_reset_password": {
            "token": "valid_token_123",
            "new_password": "nova_senha123456"
        }
    }