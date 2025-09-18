# Utilitários de teste para Alça Hub
import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock
from faker import Faker
import json

fake = Faker('pt_BR')

class TestDataFactory:
    """Factory para criar dados de teste."""
    
    @staticmethod
    def create_user_data(user_type="morador", **kwargs):
        """Criar dados de usuário para teste."""
        base_data = {
            "nome": fake.name(),
            "email": fake.email(),
            "senha": "teste123456",
            "telefone": fake.phone_number(),
            "tipo": user_type,
            "ativo": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        if user_type == "morador":
            base_data.update({
                "apartamento": fake.building_number(),
                "bloco": fake.building_number()
            })
        elif user_type == "prestador":
            base_data.update({
                "especialidades": [fake.job() for _ in range(3)],
                "avaliacao_media": fake.random_number(digits=1) / 10
            })
        elif user_type == "admin":
            base_data.update({
                "nivel_acesso": "admin"
            })
        
        base_data.update(kwargs)
        return base_data
    
    @staticmethod
    def create_service_data(**kwargs):
        """Criar dados de serviço para teste."""
        return {
            "nome": fake.job(),
            "descricao": fake.text(max_nb_chars=200),
            "categoria": fake.random_element(elements=("limpeza", "manutencao", "jardinagem", "seguranca")),
            "preco_base": fake.random_number(digits=2),
            "prestador_id": fake.uuid4(),
            "disponivel": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def create_booking_data(**kwargs):
        """Criar dados de agendamento para teste."""
        return {
            "servico_id": fake.uuid4(),
            "morador_id": fake.uuid4(),
            "prestador_id": fake.uuid4(),
            "data_agendamento": fake.future_datetime(),
            "observacoes": fake.text(max_nb_chars=100),
            "status": "pendente",
            "preco_total": fake.random_number(digits=2),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

class DatabaseTestHelper:
    """Utilitários para testes de banco de dados."""
    
    @staticmethod
    async def clear_collection(db, collection_name):
        """Limpar uma coleção do banco."""
        await db[collection_name].delete_many({})
    
    @staticmethod
    async def insert_test_data(db, collection_name, data):
        """Inserir dados de teste no banco."""
        if isinstance(data, list):
            result = await db[collection_name].insert_many(data)
            return result.inserted_ids
        else:
            result = await db[collection_name].insert_one(data)
            return result.inserted_id
    
    @staticmethod
    async def get_collection_count(db, collection_name):
        """Contar documentos em uma coleção."""
        return await db[collection_name].count_documents({})

class AuthTestHelper:
    """Utilitários para testes de autenticação."""
    
    @staticmethod
    def create_auth_headers(token="test_token"):
        """Criar headers de autenticação."""
        return {"Authorization": f"Bearer {token}"}
    
    @staticmethod
    def create_mock_user(user_type="morador"):
        """Criar mock de usuário autenticado."""
        user_data = TestDataFactory.create_user_data(user_type)
        user_data["id"] = fake.uuid4()
        return user_data

class APITestHelper:
    """Utilitários para testes de API."""
    
    @staticmethod
    def assert_response_success(response, expected_status=200):
        """Verificar se resposta foi bem-sucedida."""
        assert response.status_code == expected_status
    
    @staticmethod
    def assert_response_error(response, expected_status=400):
        """Verificar se resposta foi de erro."""
        assert response.status_code == expected_status
    
    @staticmethod
    def assert_json_response(response):
        """Verificar se resposta é JSON válido."""
        assert response.headers["content-type"] == "application/json"
        return response.json()
    
    @staticmethod
    def assert_response_contains(response, key):
        """Verificar se resposta contém uma chave."""
        data = response.json()
        assert key in data
        return data[key]

class MockHelper:
    """Utilitários para mocks."""
    
    @staticmethod
    def create_mock_database():
        """Criar mock do banco de dados."""
        mock_db = AsyncMock()
        mock_db.users = AsyncMock()
        mock_db.services = AsyncMock()
        mock_db.bookings = AsyncMock()
        mock_db.reviews = AsyncMock()
        mock_db.payments = AsyncMock()
        mock_db.chats = AsyncMock()
        return mock_db
    
    @staticmethod
    def create_mock_mercado_pago():
        """Criar mock do Mercado Pago."""
        mock_mp = MagicMock()
        mock_mp.payment.create.return_value = {
            "id": "123456789",
            "status": "pending",
            "qr_code": "test_qr_code",
            "qr_code_base64": "test_base64"
        }
        return mock_mp

class TimeHelper:
    """Utilitários para manipulação de tempo."""
    
    @staticmethod
    def get_future_datetime(days=1):
        """Obter data futura."""
        return datetime.utcnow() + timedelta(days=days)
    
    @staticmethod
    def get_past_datetime(days=1):
        """Obter data passada."""
        return datetime.utcnow() - timedelta(days=days)
    
    @staticmethod
    def get_current_datetime():
        """Obter data atual."""
        return datetime.utcnow()

# Fixtures globais para uso em testes
@pytest.fixture
def test_data_factory():
    """Factory para dados de teste."""
    return TestDataFactory

@pytest.fixture
def db_helper():
    """Helper para banco de dados."""
    return DatabaseTestHelper

@pytest.fixture
def auth_helper():
    """Helper para autenticação."""
    return AuthTestHelper

@pytest.fixture
def api_helper():
    """Helper para API."""
    return APITestHelper

@pytest.fixture
def mock_helper():
    """Helper para mocks."""
    return MockHelper

@pytest.fixture
def time_helper():
    """Helper para tempo."""
    return TimeHelper
