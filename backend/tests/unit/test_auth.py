# Testes unitários de autenticação - Alça Hub
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from datetime import datetime, timedelta
import jwt
from server import create_access_token, verify_token, get_password_hash, verify_password

class TestPasswordHashing:
    """Testes para hash e verificação de senhas."""
    
    def test_password_hashing(self):
        """Testar hash de senha."""
        password = "teste123456"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 0
        assert hashed.startswith("$2b$")
    
    def test_password_verification_success(self):
        """Testar verificação de senha correta."""
        password = "teste123456"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_password_verification_failure(self):
        """Testar verificação de senha incorreta."""
        password = "teste123456"
        wrong_password = "senha_errada"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_password_verification_empty_password(self):
        """Testar verificação com senha vazia."""
        password = "teste123456"
        hashed = get_password_hash(password)
        
        assert verify_password("", hashed) is False
        assert verify_password(None, hashed) is False

class TestTokenCreation:
    """Testes para criação de tokens JWT."""
    
    def test_create_access_token_success(self):
        """Testar criação de token de acesso."""
        user_data = {
            "id": "123",
            "email": "teste@exemplo.com",
            "tipo": "morador"
        }
        
        token = create_access_token(user_data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_create_access_token_with_expiration(self):
        """Testar criação de token com expiração personalizada."""
        user_data = {
            "id": "123",
            "email": "teste@exemplo.com",
            "tipo": "morador"
        }
        
        # Token com expiração de 1 hora
        token = create_access_token(user_data, expires_delta=timedelta(hours=1))
        
        assert token is not None
        
        # Decodificar token para verificar expiração
        decoded = jwt.decode(token, options={"verify_signature": False})
        exp_time = datetime.fromtimestamp(decoded["exp"])
        expected_time = datetime.utcnow() + timedelta(hours=1)
        
        # Verificar se a diferença é menor que 1 minuto
        assert abs((exp_time - expected_time).total_seconds()) < 60
    
    def test_create_access_token_minimal_data(self):
        """Testar criação de token com dados mínimos."""
        user_data = {"id": "123"}
        
        token = create_access_token(user_data)
        
        assert token is not None
        
        # Decodificar para verificar conteúdo
        decoded = jwt.decode(token, options={"verify_signature": False})
        assert decoded["sub"] == "123"
        assert "exp" in decoded
        assert "iat" in decoded

class TestTokenVerification:
    """Testes para verificação de tokens JWT."""
    
    def test_verify_token_success(self):
        """Testar verificação de token válido."""
        user_data = {
            "id": "123",
            "email": "teste@exemplo.com",
            "tipo": "morador"
        }
        
        token = create_access_token(user_data)
        decoded_data = verify_token(token)
        
        assert decoded_data is not None
        assert decoded_data["id"] == "123"
        assert decoded_data["email"] == "teste@exemplo.com"
        assert decoded_data["tipo"] == "morador"
    
    def test_verify_token_invalid_format(self):
        """Testar verificação de token com formato inválido."""
        invalid_tokens = [
            "invalid_token",
            "not.a.token",
            "",
            None,
            "Bearer invalid_token"
        ]
        
        for invalid_token in invalid_tokens:
            with pytest.raises(HTTPException) as exc_info:
                verify_token(invalid_token)
            
            assert exc_info.value.status_code == 401
            assert "Token inválido" in str(exc_info.value.detail)
    
    def test_verify_token_expired(self):
        """Testar verificação de token expirado."""
        user_data = {"id": "123"}
        
        # Criar token com expiração no passado
        with patch('server.datetime') as mock_datetime:
            mock_datetime.utcnow.return_value = datetime(2020, 1, 1)
            token = create_access_token(user_data, expires_delta=timedelta(seconds=1))
        
        # Simular tempo atual
        with patch('server.datetime') as mock_datetime:
            mock_datetime.utcnow.return_value = datetime(2020, 1, 2)
            
            with pytest.raises(HTTPException) as exc_info:
                verify_token(token)
            
            assert exc_info.value.status_code == 401
            assert "Token expirado" in str(exc_info.value.detail)
    
    def test_verify_token_malformed(self):
        """Testar verificação de token malformado."""
        malformed_tokens = [
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid",
            "not.a.valid.jwt.token",
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid"
        ]
        
        for malformed_token in malformed_tokens:
            with pytest.raises(HTTPException) as exc_info:
                verify_token(malformed_token)
            
            assert exc_info.value.status_code == 401

class TestAuthHelpers:
    """Testes para funções auxiliares de autenticação."""
    
    def test_extract_token_from_header_success(self):
        """Testar extração de token do header Authorization."""
        from server import extract_token_from_header
        
        # Teste com Bearer token
        header = "Bearer valid_token_123"
        token = extract_token_from_header(header)
        assert token == "valid_token_123"
        
        # Teste sem Bearer
        header = "valid_token_123"
        token = extract_token_from_header(header)
        assert token == "valid_token_123"
    
    def test_extract_token_from_header_failure(self):
        """Testar extração de token com header inválido."""
        from server import extract_token_from_header
        
        invalid_headers = [
            "",
            None,
            "InvalidFormat",
            "Basic token123",
            "Bearer",
            "Bearer "
        ]
        
        for header in invalid_headers:
            with pytest.raises(HTTPException) as exc_info:
                extract_token_from_header(header)
            
            assert exc_info.value.status_code == 401
    
    def test_validate_user_permissions(self):
        """Testar validação de permissões de usuário."""
        from server import validate_user_permissions
        
        # Usuário morador
        morador = {"tipo": "morador", "ativo": True}
        assert validate_user_permissions(morador, "morador") is True
        assert validate_user_permissions(morador, "prestador") is False
        
        # Usuário prestador
        prestador = {"tipo": "prestador", "ativo": True}
        assert validate_user_permissions(prestador, "prestador") is True
        assert validate_user_permissions(prestador, "admin") is False
        
        # Usuário admin
        admin = {"tipo": "admin", "ativo": True}
        assert validate_user_permissions(admin, "admin") is True
        assert validate_user_permissions(admin, "morador") is True  # Admin tem acesso a tudo
        
        # Usuário inativo
        inactive = {"tipo": "morador", "ativo": False}
        assert validate_user_permissions(inactive, "morador") is False

class TestAuthIntegration:
    """Testes de integração para autenticação."""
    
    @pytest.mark.asyncio
    async def test_login_flow_success(self, client, mock_database, sample_user_data):
        """Testar fluxo completo de login."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {
            "_id": "123",
            "id": "123",
            "email": sample_user_data["email"],
            "password": get_password_hash(sample_user_data["senha"]),
            "cpf": sample_user_data.get("cpf", "00000000000"),
            "nome": sample_user_data.get("nome", "Usuário"),
            "telefone": sample_user_data.get("telefone", "00000000000"),
            "endereco": sample_user_data.get("endereco", "Endereço não informado"),
            "tipos": [sample_user_data.get("tipo", "morador")],
            "tipo_ativo": sample_user_data.get("tipo", "morador"),
            "ativo": True
        }
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Dados de login
        login_data = {
            "email": sample_user_data["email"],
            "senha": sample_user_data["senha"]
        }
        
        # Fazer requisição de login
        response = client.post("/api/auth/login", json=login_data)
        
        # Verificar resposta
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == sample_user_data["email"]
    
    @pytest.mark.asyncio
    async def test_login_flow_invalid_credentials(self, client, mock_database):
        """Testar login com credenciais inválidas."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = None
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Dados de login inválidos
        login_data = {
            "email": "inexistente@exemplo.com",
            "senha": "senha_errada"
        }
        
        # Fazer requisição de login
        response = client.post("/api/auth/login", json=login_data)
        
        # Verificar resposta de erro
        assert response.status_code == 401
        data = response.json()
        assert "Email ou senha incorretos" in data["detail"]
    
    @pytest.mark.asyncio
    async def test_register_flow_success(self, client, mock_database, sample_user_data):
        """Testar fluxo completo de registro."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = None  # Usuário não existe
        mock_database.users.insert_one.return_value = AsyncMock(inserted_id="123")
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Dados de registro
        register_data = sample_user_data.copy()
        
        # Fazer requisição de registro
        response = client.post("/api/auth/register", json=register_data)
        
        # Verificar resposta
        assert response.status_code == 200
        data = response.json()
        assert "Usuário criado com sucesso" in data["message"]
        assert "user" in data
    
    @pytest.mark.asyncio
    async def test_register_flow_duplicate_email(self, client, mock_database, sample_user_data):
        """Testar registro com email duplicado."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {"_id": "123"}  # Usuário já existe
        
        # Garantir que o mock está disponível globalmente para o servidor
        import server
        server.mock_database = mock_database
        
        # Dados de registro
        register_data = sample_user_data.copy()
        
        # Fazer requisição de registro
        response = client.post("/api/auth/register", json=register_data)
        
        # Verificar resposta de erro
        assert response.status_code == 400
        data = response.json()
        assert "Email já cadastrado" in data["detail"]

# Fixtures específicas para testes de autenticação
@pytest.fixture
def auth_test_data():
    """Dados de teste para autenticação."""
    return {
        "valid_user": {
            "id": "123",
            "email": "teste@exemplo.com",
            "senha": "teste123456",
            "tipo": "morador",
            "ativo": True
        },
        "invalid_credentials": {
            "email": "inexistente@exemplo.com",
            "senha": "senha_errada"
        },
        "expired_token": "expired_token_123"
    }
