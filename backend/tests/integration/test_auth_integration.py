# Testes de integração de autenticação - Alça Hub
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
import json

class TestAuthEndpoints:
    """Testes de integração para endpoints de autenticação."""
    
    def test_register_endpoint_success(self, client, sample_user_data):
        """Testar endpoint de registro com sucesso."""
        # Dados de registro
        register_data = sample_user_data.copy()
        
        # Fazer requisição
        response = client.post("/api/auth/register", json=register_data)
        
        # Verificar resposta
        assert response.status_code == 201
        data = response.json()
        assert "message" in data
        assert "user" in data
        assert data["user"]["email"] == register_data["email"]
        assert data["user"]["tipo"] == register_data["tipo"]
    
    def test_register_endpoint_duplicate_email(self, client, sample_user_data):
        """Testar endpoint de registro com email duplicado."""
        # Primeiro registro
        response1 = client.post("/api/auth/register", json=sample_user_data)
        assert response1.status_code == 201
        
        # Segundo registro com mesmo email
        response2 = client.post("/api/auth/register", json=sample_user_data)
        assert response2.status_code == 400
        data = response2.json()
        assert "Email já cadastrado" in data["detail"]
    
    def test_register_endpoint_invalid_data(self, client):
        """Testar endpoint de registro com dados inválidos."""
        invalid_data = {
            "nome": "",  # Nome vazio
            "email": "email_invalido",  # Email inválido
            "senha": "123",  # Senha muito curta
            "tipo": "tipo_invalido"  # Tipo inválido
        }
        
        response = client.post("/api/auth/register", json=invalid_data)
        assert response.status_code == 400
    
    def test_login_endpoint_success(self, client, sample_user_data):
        """Testar endpoint de login com sucesso."""
        # Primeiro registrar usuário
        register_response = client.post("/api/auth/register", json=sample_user_data)
        assert register_response.status_code == 201
        
        # Fazer login
        login_data = {
            "email": sample_user_data["email"],
            "senha": sample_user_data["senha"]
        }
        
        response = client.post("/api/auth/login", json=login_data)
        
        # Verificar resposta
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == sample_user_data["email"]
    
    def test_login_endpoint_invalid_credentials(self, client):
        """Testar endpoint de login com credenciais inválidas."""
        login_data = {
            "email": "inexistente@exemplo.com",
            "senha": "senha_errada"
        }
        
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        data = response.json()
        assert "Credenciais inválidas" in data["detail"]
    
    def test_login_endpoint_missing_fields(self, client):
        """Testar endpoint de login com campos obrigatórios ausentes."""
        # Sem email
        response1 = client.post("/api/auth/login", json={"senha": "senha123"})
        assert response1.status_code == 422
        
        # Sem senha
        response2 = client.post("/api/auth/login", json={"email": "teste@exemplo.com"})
        assert response2.status_code == 422
    
    def test_logout_endpoint_success(self, client, auth_headers):
        """Testar endpoint de logout com sucesso."""
        response = client.post("/api/auth/logout", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "Logout realizado com sucesso" in data["message"]
    
    def test_logout_endpoint_without_token(self, client):
        """Testar endpoint de logout sem token."""
        response = client.post("/api/auth/logout")
        assert response.status_code == 401

class TestProtectedEndpoints:
    """Testes de integração para endpoints protegidos."""
    
    def test_protected_endpoint_with_valid_token(self, client, auth_headers):
        """Testar endpoint protegido com token válido."""
        response = client.get("/api/profile", headers=auth_headers)
        # O endpoint pode retornar 200 (dados encontrados) ou 404 (dados não encontrados)
        assert response.status_code in [200, 404]
    
    def test_protected_endpoint_without_token(self, client):
        """Testar endpoint protegido sem token."""
        response = client.get("/api/profile")
        assert response.status_code == 401
    
    def test_protected_endpoint_with_invalid_token(self, client):
        """Testar endpoint protegido com token inválido."""
        invalid_headers = {"Authorization": "Bearer token_invalido"}
        response = client.get("/api/profile", headers=invalid_headers)
        assert response.status_code == 401
    
    def test_protected_endpoint_with_expired_token(self, client):
        """Testar endpoint protegido com token expirado."""
        expired_headers = {"Authorization": "Bearer expired_token"}
        response = client.get("/api/profile", headers=expired_headers)
        assert response.status_code == 401

class TestUserEndpoints:
    """Testes de integração para endpoints de usuários."""
    
    def test_get_user_profile_success(self, client, auth_headers, morador_user):
        """Testar busca de perfil de usuário com sucesso."""
        # Mock do usuário no banco
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = morador_user
            
            response = client.get("/api/profile", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == morador_user["email"]
            assert data["tipo"] == morador_user["tipo"]
    
    def test_update_user_profile_success(self, client, auth_headers, morador_user):
        """Testar atualização de perfil de usuário com sucesso."""
        update_data = {
            "nome": "Novo Nome",
            "telefone": "11999999999"
        }
        
        # Mock do usuário no banco
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = morador_user
            
            response = client.put("/api/profile", json=update_data, headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert "Perfil atualizado com sucesso" in data["message"]
    
    def test_update_user_profile_invalid_data(self, client, auth_headers, morador_user):
        """Testar atualização de perfil com dados inválidos."""
        invalid_data = {
            "email": "email_invalido",  # Email inválido
            "telefone": "123"  # Telefone muito curto
        }
        
        # Mock do usuário no banco
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = morador_user
            
            response = client.put("/api/profile", json=invalid_data, headers=auth_headers)
            assert response.status_code == 400
    
    def test_change_password_success(self, client, auth_headers, morador_user):
        """Testar alteração de senha com sucesso."""
        password_data = {
            "senha_atual": "senha_atual_123",
            "nova_senha": "nova_senha_123"
        }
        
        # Mock do usuário no banco
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = morador_user
            
            response = client.put("/api/profile/password", json=password_data, headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert "Senha alterada com sucesso" in data["message"]
    
    def test_change_password_wrong_current(self, client, auth_headers, morador_user):
        """Testar alteração de senha com senha atual incorreta."""
        password_data = {
            "senha_atual": "senha_errada",
            "nova_senha": "nova_senha_123"
        }
        
        # Mock do usuário no banco
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = morador_user
            
            response = client.put("/api/profile/password", json=password_data, headers=auth_headers)
            assert response.status_code == 400
            data = response.json()
            assert "Senha atual incorreta" in data["detail"]

class TestAdminEndpoints:
    """Testes de integração para endpoints administrativos."""
    
    def test_admin_get_users_list(self, client, auth_headers, admin_user):
        """Testar listagem de usuários por admin."""
        # Mock do usuário admin
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = admin_user
            
            response = client.get("/api/admin/users", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert "users" in data
            assert "total" in data
    
    def test_admin_get_users_list_unauthorized(self, client, auth_headers, morador_user):
        """Testar listagem de usuários sem permissão de admin."""
        # Mock do usuário morador (sem permissão de admin)
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = morador_user
            
            response = client.get("/api/admin/users", headers=auth_headers)
            assert response.status_code == 403
    
    def test_admin_create_user(self, client, auth_headers, admin_user, sample_user_data):
        """Testar criação de usuário por admin."""
        # Mock do usuário admin
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = admin_user
            
            response = client.post("/api/admin/users", json=sample_user_data, headers=auth_headers)
            assert response.status_code == 201
            data = response.json()
            assert "Usuário criado com sucesso" in data["message"]
    
    def test_admin_update_user(self, client, auth_headers, admin_user):
        """Testar atualização de usuário por admin."""
        user_id = "123"
        update_data = {"nome": "Nome Atualizado"}
        
        # Mock do usuário admin
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = admin_user
            
            response = client.put(f"/api/admin/users/{user_id}", json=update_data, headers=auth_headers)
            # Pode retornar 200 (sucesso) ou 404 (usuário não encontrado)
            assert response.status_code in [200, 404]
    
    def test_admin_delete_user(self, client, auth_headers, admin_user):
        """Testar exclusão de usuário por admin."""
        user_id = "123"
        
        # Mock do usuário admin
        with patch('server.get_current_user') as mock_get_user:
            mock_get_user.return_value = admin_user
            
            response = client.delete(f"/api/admin/users/{user_id}", headers=auth_headers)
            # Pode retornar 200 (sucesso) ou 404 (usuário não encontrado)
            assert response.status_code in [200, 404]

class TestErrorHandling:
    """Testes de integração para tratamento de erros."""
    
    def test_internal_server_error(self, client):
        """Testar tratamento de erro interno do servidor."""
        # Simular erro interno
        with patch('server.get_database') as mock_get_db:
            mock_get_db.side_effect = Exception("Erro interno")
            
            response = client.get("/api/profile")
            assert response.status_code == 500
    
    def test_validation_error(self, client):
        """Testar tratamento de erro de validação."""
        invalid_data = {
            "email": "email_invalido",
            "senha": "123"
        }
        
        response = client.post("/api/auth/register", json=invalid_data)
        assert response.status_code == 400
    
    def test_not_found_error(self, client, auth_headers):
        """Testar tratamento de erro 404."""
        response = client.get("/api/endpoint_inexistente", headers=auth_headers)
        assert response.status_code == 404
    
    def test_method_not_allowed(self, client):
        """Testar tratamento de erro 405."""
        response = client.patch("/api/auth/login")  # Método não permitido
        assert response.status_code == 405

class TestCORS:
    """Testes de integração para CORS."""
    
    def test_cors_headers(self, client):
        """Testar headers CORS."""
        response = client.options("/api/auth/login")
        assert response.status_code == 200
        assert "Access-Control-Allow-Origin" in response.headers
        assert "Access-Control-Allow-Methods" in response.headers
        assert "Access-Control-Allow-Headers" in response.headers
    
    def test_cors_preflight(self, client):
        """Testar requisição preflight CORS."""
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
        
        response = client.options("/api/auth/login", headers=headers)
        assert response.status_code == 200

# Fixtures específicas para testes de integração
@pytest.fixture
def integration_test_data():
    """Dados para testes de integração."""
    return {
        "valid_login": {
            "email": "teste@exemplo.com",
            "senha": "senha123456"
        },
        "invalid_login": {
            "email": "inexistente@exemplo.com",
            "senha": "senha_errada"
        },
        "profile_update": {
            "nome": "Nome Atualizado",
            "telefone": "11999999999"
        }
    }
