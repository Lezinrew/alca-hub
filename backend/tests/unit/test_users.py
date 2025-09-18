# Testes unitários de CRUD de usuários - Alça Hub
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from datetime import datetime
from bson import ObjectId

class TestUserCreation:
    """Testes para criação de usuários."""
    
    @pytest.mark.asyncio
    async def test_create_user_success(self, mock_database, sample_user_data):
        """Testar criação de usuário com sucesso."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = None  # Email não existe
        mock_database.users.insert_one.return_value = AsyncMock(inserted_id="123")
        
        # Simular criação de usuário
        from server import create_user
        result = await create_user(sample_user_data, mock_database)
        
        # Verificar resultado
        assert result is not None
        assert "id" in result
        assert result["email"] == sample_user_data["email"]
        assert result["tipo"] == sample_user_data["tipo"]
        
        # Verificar se insert_one foi chamado
        mock_database.users.insert_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(self, mock_database, sample_user_data):
        """Testar criação de usuário com email duplicado."""
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {"_id": "123"}  # Email já existe
        
        # Simular criação de usuário
        from server import create_user
        
        with pytest.raises(HTTPException) as exc_info:
            await create_user(sample_user_data, mock_database)
        
        assert exc_info.value.status_code == 400
        assert "Email já cadastrado" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_create_user_invalid_data(self, mock_database):
        """Testar criação de usuário com dados inválidos."""
        invalid_data = {
            "nome": "",  # Nome vazio
            "email": "email_invalido",  # Email inválido
            "senha": "123",  # Senha muito curta
            "tipo": "tipo_invalido"  # Tipo inválido
        }
        
        # Simular criação de usuário
        from server import create_user
        
        with pytest.raises(HTTPException) as exc_info:
            await create_user(invalid_data, mock_database)
        
        assert exc_info.value.status_code == 400

class TestUserRetrieval:
    """Testes para busca de usuários."""
    
    @pytest.mark.asyncio
    async def test_get_user_by_id_success(self, mock_database):
        """Testar busca de usuário por ID com sucesso."""
        user_id = "123"
        user_data = {
            "_id": user_id,
            "nome": "João Silva",
            "email": "joao@exemplo.com",
            "tipo": "morador",
            "ativo": True
        }
        
        # Mock do banco de dados
        mock_database.users.find_one.return_value = user_data
        
        # Simular busca de usuário
        from server import get_user_by_id
        result = await get_user_by_id(user_id, mock_database)
        
        # Verificar resultado
        assert result is not None
        assert result["_id"] == user_id
        assert result["nome"] == "João Silva"
        
        # Verificar se find_one foi chamado com o ID correto
        mock_database.users.find_one.assert_called_once_with({"_id": user_id})
    
    @pytest.mark.asyncio
    async def test_get_user_by_id_not_found(self, mock_database):
        """Testar busca de usuário por ID inexistente."""
        user_id = "inexistente"
        
        # Mock do banco de dados
        mock_database.users.find_one.return_value = None
        
        # Simular busca de usuário
        from server import get_user_by_id
        
        with pytest.raises(HTTPException) as exc_info:
            await get_user_by_id(user_id, mock_database)
        
        assert exc_info.value.status_code == 404
        assert "Usuário não encontrado" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_get_user_by_email_success(self, mock_database):
        """Testar busca de usuário por email com sucesso."""
        email = "joao@exemplo.com"
        user_data = {
            "_id": "123",
            "nome": "João Silva",
            "email": email,
            "tipo": "morador",
            "ativo": True
        }
        
        # Mock do banco de dados
        mock_database.users.find_one.return_value = user_data
        
        # Simular busca de usuário
        from server import get_user_by_email
        result = await get_user_by_email(email, mock_database)
        
        # Verificar resultado
        assert result is not None
        assert result["email"] == email
        
        # Verificar se find_one foi chamado com o email correto
        mock_database.users.find_one.assert_called_once_with({"email": email})
    
    @pytest.mark.asyncio
    async def test_get_users_list_success(self, mock_database):
        """Testar listagem de usuários com sucesso."""
        users_data = [
            {"_id": "1", "nome": "João", "email": "joao@exemplo.com", "tipo": "morador"},
            {"_id": "2", "nome": "Maria", "email": "maria@exemplo.com", "tipo": "prestador"}
        ]
        
        # Mock do banco de dados
        mock_database.users.find.return_value.to_list.return_value = users_data
        mock_database.users.count_documents.return_value = 2
        
        # Simular listagem de usuários
        from server import get_users_list
        result = await get_users_list(skip=0, limit=10, mock_database)
        
        # Verificar resultado
        assert result is not None
        assert "users" in result
        assert "total" in result
        assert len(result["users"]) == 2
        assert result["total"] == 2

class TestUserUpdate:
    """Testes para atualização de usuários."""
    
    @pytest.mark.asyncio
    async def test_update_user_success(self, mock_database):
        """Testar atualização de usuário com sucesso."""
        user_id = "123"
        update_data = {
            "nome": "João Silva Atualizado",
            "telefone": "11999999999"
        }
        
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {"_id": user_id, "ativo": True}
        mock_database.users.update_one.return_value = AsyncMock(modified_count=1)
        
        # Simular atualização de usuário
        from server import update_user
        result = await update_user(user_id, update_data, mock_database)
        
        # Verificar resultado
        assert result is not None
        assert result["modified_count"] == 1
        
        # Verificar se update_one foi chamado
        mock_database.users.update_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_update_user_not_found(self, mock_database):
        """Testar atualização de usuário inexistente."""
        user_id = "inexistente"
        update_data = {"nome": "Novo Nome"}
        
        # Mock do banco de dados
        mock_database.users.find_one.return_value = None
        
        # Simular atualização de usuário
        from server import update_user
        
        with pytest.raises(HTTPException) as exc_info:
            await update_user(user_id, update_data, mock_database)
        
        assert exc_info.value.status_code == 404
        assert "Usuário não encontrado" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_update_user_inactive(self, mock_database):
        """Testar atualização de usuário inativo."""
        user_id = "123"
        update_data = {"nome": "Novo Nome"}
        
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {"_id": user_id, "ativo": False}
        
        # Simular atualização de usuário
        from server import update_user
        
        with pytest.raises(HTTPException) as exc_info:
            await update_user(user_id, update_data, mock_database)
        
        assert exc_info.value.status_code == 400
        assert "Usuário inativo" in str(exc_info.value.detail)

class TestUserDeletion:
    """Testes para exclusão de usuários."""
    
    @pytest.mark.asyncio
    async def test_delete_user_success(self, mock_database):
        """Testar exclusão de usuário com sucesso."""
        user_id = "123"
        
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {"_id": user_id, "ativo": True}
        mock_database.users.delete_one.return_value = AsyncMock(deleted_count=1)
        
        # Simular exclusão de usuário
        from server import delete_user
        result = await delete_user(user_id, mock_database)
        
        # Verificar resultado
        assert result is not None
        assert result["deleted_count"] == 1
        
        # Verificar se delete_one foi chamado
        mock_database.users.delete_one.assert_called_once_with({"_id": user_id})
    
    @pytest.mark.asyncio
    async def test_delete_user_not_found(self, mock_database):
        """Testar exclusão de usuário inexistente."""
        user_id = "inexistente"
        
        # Mock do banco de dados
        mock_database.users.find_one.return_value = None
        
        # Simular exclusão de usuário
        from server import delete_user
        
        with pytest.raises(HTTPException) as exc_info:
            await delete_user(user_id, mock_database)
        
        assert exc_info.value.status_code == 404
        assert "Usuário não encontrado" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_soft_delete_user_success(self, mock_database):
        """Testar exclusão lógica de usuário com sucesso."""
        user_id = "123"
        
        # Mock do banco de dados
        mock_database.users.find_one.return_value = {"_id": user_id, "ativo": True}
        mock_database.users.update_one.return_value = AsyncMock(modified_count=1)
        
        # Simular exclusão lógica de usuário
        from server import soft_delete_user
        result = await soft_delete_user(user_id, mock_database)
        
        # Verificar resultado
        assert result is not None
        assert result["modified_count"] == 1
        
        # Verificar se update_one foi chamado com ativo=False
        mock_database.users.update_one.assert_called_once()
        call_args = mock_database.users.update_one.call_args
        assert call_args[0][1]["ativo"] is False

class TestUserValidation:
    """Testes para validação de usuários."""
    
    def test_validate_user_data_success(self):
        """Testar validação de dados de usuário válidos."""
        from server import validate_user_data
        
        valid_data = {
            "nome": "João Silva",
            "email": "joao@exemplo.com",
            "senha": "senha123456",
            "telefone": "11999999999",
            "tipo": "morador"
        }
        
        result = validate_user_data(valid_data)
        assert result is True
    
    def test_validate_user_data_invalid_email(self):
        """Testar validação com email inválido."""
        from server import validate_user_data
        
        invalid_data = {
            "nome": "João Silva",
            "email": "email_invalido",
            "senha": "senha123456",
            "tipo": "morador"
        }
        
        with pytest.raises(HTTPException) as exc_info:
            validate_user_data(invalid_data)
        
        assert exc_info.value.status_code == 400
        assert "Email inválido" in str(exc_info.value.detail)
    
    def test_validate_user_data_weak_password(self):
        """Testar validação com senha fraca."""
        from server import validate_user_data
        
        invalid_data = {
            "nome": "João Silva",
            "email": "joao@exemplo.com",
            "senha": "123",  # Senha muito curta
            "tipo": "morador"
        }
        
        with pytest.raises(HTTPException) as exc_info:
            validate_user_data(invalid_data)
        
        assert exc_info.value.status_code == 400
        assert "Senha muito fraca" in str(exc_info.value.detail)
    
    def test_validate_user_data_invalid_type(self):
        """Testar validação com tipo inválido."""
        from server import validate_user_data
        
        invalid_data = {
            "nome": "João Silva",
            "email": "joao@exemplo.com",
            "senha": "senha123456",
            "tipo": "tipo_invalido"
        }
        
        with pytest.raises(HTTPException) as exc_info:
            validate_user_data(invalid_data)
        
        assert exc_info.value.status_code == 400
        assert "Tipo de usuário inválido" in str(exc_info.value.detail)

class TestUserPermissions:
    """Testes para permissões de usuários."""
    
    def test_check_user_permissions_success(self):
        """Testar verificação de permissões com sucesso."""
        from server import check_user_permissions
        
        user = {"tipo": "morador", "ativo": True}
        required_permission = "morador"
        
        result = check_user_permissions(user, required_permission)
        assert result is True
    
    def test_check_user_permissions_insufficient(self):
        """Testar verificação de permissões insuficientes."""
        from server import check_user_permissions
        
        user = {"tipo": "morador", "ativo": True}
        required_permission = "admin"
        
        result = check_user_permissions(user, required_permission)
        assert result is False
    
    def test_check_user_permissions_inactive_user(self):
        """Testar verificação de permissões com usuário inativo."""
        from server import check_user_permissions
        
        user = {"tipo": "morador", "ativo": False}
        required_permission = "morador"
        
        result = check_user_permissions(user, required_permission)
        assert result is False

# Fixtures específicas para testes de usuários
@pytest.fixture
def user_test_scenarios():
    """Cenários de teste para usuários."""
    return {
        "valid_morador": {
            "nome": "João Silva",
            "email": "joao@exemplo.com",
            "senha": "senha123456",
            "telefone": "11999999999",
            "tipo": "morador",
            "apartamento": "101",
            "bloco": "A"
        },
        "valid_prestador": {
            "nome": "Maria Santos",
            "email": "maria@exemplo.com",
            "senha": "senha123456",
            "telefone": "11888888888",
            "tipo": "prestador",
            "especialidades": ["limpeza", "manutenção"]
        },
        "valid_admin": {
            "nome": "Admin Sistema",
            "email": "admin@exemplo.com",
            "senha": "senha123456",
            "telefone": "11777777777",
            "tipo": "admin"
        }
    }
