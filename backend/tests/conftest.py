# Configuração global de testes para Alça Hub
import pytest
import pytest_asyncio
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.testclient import TestClient
from httpx import AsyncClient
import os
from unittest.mock import AsyncMock, MagicMock
from faker import Faker
from beanie import init_beanie

os.environ.setdefault("SECRET_KEY", "test-secret")

# Importar a aplicação
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from server import app, get_database

fake = Faker("pt_BR")

# Configurações de teste
TEST_DATABASE_URL = "mongodb://localhost:27017"
TEST_DATABASE_NAME = "alca_hub_test"

# Flag para garantir que Beanie é inicializado apenas uma vez
_beanie_initialized = False


@pytest.fixture(scope="session")
def event_loop():
    """Criar event loop para toda a sessão de testes."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="module")
async def test_db():
    """Criar conexão com banco de teste."""
    client = AsyncIOMotorClient(TEST_DATABASE_URL)
    db = client[TEST_DATABASE_NAME]
    yield db
    # Limpar banco após os testes
    await client.drop_database(TEST_DATABASE_NAME)
    client.close()


# Beanie initialization is done in individual test modules to avoid event loop issues
# @pytest_asyncio.fixture(scope="module", autouse=True)
# async def init_test_beanie():
#     """Initialize Beanie for tests (runs once per module)"""
#     from models.user import User
#     from models.service import Service
#     from models.booking import Booking
#     from models.payment import Payment
#
#     client = AsyncIOMotorClient(TEST_DATABASE_URL)
#     db = client[TEST_DATABASE_NAME]
#
#     await init_beanie(
#         database=db,
#         document_models=[User, Service, Booking, Payment]
#     )
#     yield
#     client.close()


@pytest.fixture
def client():
    """Cliente de teste síncrono para FastAPI."""
    return TestClient(app)


@pytest_asyncio.fixture
async def async_client():
    """Cliente de teste assíncrono para FastAPI."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_database():
    """Mock do banco de dados para testes unitários."""
    mock_db = AsyncMock()
    mock_db.users = AsyncMock()
    mock_db.services = AsyncMock()
    mock_db.bookings = AsyncMock()
    mock_db.reviews = AsyncMock()
    mock_db.payments = AsyncMock()
    mock_db.chats = AsyncMock()
    return mock_db


@pytest.fixture
def sample_user_data():
    """Dados de exemplo para usuário."""
    return {
        "nome": fake.name(),
        "email": fake.email(),
        "senha": "teste123456",
        "telefone": fake.phone_number(),
        "tipo": "morador",
        "apartamento": fake.building_number(),
        "bloco": fake.building_number(),
    }


@pytest.fixture
def sample_service_data():
    """Dados de exemplo para serviço."""
    return {
        "nome": fake.job(),
        "descricao": fake.text(max_nb_chars=200),
        "categoria": fake.random_element(
            elements=("limpeza", "manutencao", "jardinagem", "seguranca")
        ),
        "preco_base": fake.random_number(digits=2),
        "prestador_id": fake.uuid4(),
        "disponivel": True,
    }


@pytest.fixture
def sample_booking_data():
    """Dados de exemplo para agendamento."""
    return {
        "servico_id": fake.uuid4(),
        "morador_id": fake.uuid4(),
        "data_agendamento": fake.future_datetime(),
        "observacoes": fake.text(max_nb_chars=100),
        "status": "pendente",
    }


@pytest.fixture
def auth_headers():
    """Headers de autenticação para testes."""
    return {"Authorization": "Bearer test_token_123"}


@pytest.fixture
def mock_jwt_token():
    """Mock de token JWT para testes."""
    return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTg4MDB9.test_signature"


# Fixtures para diferentes tipos de usuários
@pytest.fixture
def morador_user():
    """Usuário do tipo morador."""
    return {
        "id": fake.uuid4(),
        "nome": fake.name(),
        "email": fake.email(),
        "tipo": "morador",
        "apartamento": fake.building_number(),
        "bloco": fake.building_number(),
        "ativo": True,
    }


@pytest.fixture
def prestador_user():
    """Usuário do tipo prestador."""
    return {
        "id": fake.uuid4(),
        "nome": fake.name(),
        "email": fake.email(),
        "tipo": "prestador",
        "especialidades": [fake.job() for _ in range(3)],
        "ativo": True,
    }


@pytest.fixture
def admin_user():
    """Usuário do tipo administrador."""
    return {
        "id": fake.uuid4(),
        "nome": fake.name(),
        "email": fake.email(),
        "tipo": "admin",
        "ativo": True,
    }


# Configurações de ambiente para testes
@pytest.fixture(autouse=True)
def setup_test_env():
    """Configurar variáveis de ambiente para testes."""
    os.environ["TESTING"] = "1"
    os.environ["MONGO_URL"] = TEST_DATABASE_URL
    os.environ["DB_NAME"] = TEST_DATABASE_NAME
    yield
    # Limpar variáveis após teste
    os.environ.pop("TESTING", None)
    os.environ.pop("MONGO_URL", None)
    os.environ.pop("DB_NAME", None)
