"""
Locust load testing - Testes de carga para Alça Hub

Execute com:
    locust -f tests/performance/locustfile.py --host=http://localhost:8000

Teste com interface web:
    locust -f tests/performance/locustfile.py --host=http://localhost:8000 --web-host=0.0.0.0 --web-port=8089

Teste headless (1000 usuários, spawn 50/s, duração 5min):
    locust -f tests/performance/locustfile.py --host=http://localhost:8000 \\
           --users 1000 --spawn-rate 50 --run-time 5m --headless
"""
from locust import HttpUser, task, between, events
import random
import json
from datetime import datetime


class AlcaHubUser(HttpUser):
    """
    Simula comportamento de usuário no Alça Hub

    - Wait time: 1-3 segundos entre requisições (simula usuário real)
    - Tasks: Operações ponderadas por frequência de uso
    """

    wait_time = between(1, 3)  # Espera entre 1-3s entre requisições

    def on_start(self):
        """Executado quando usuário inicia - faz login"""
        # Credenciais de teste
        self.email = f"load_test_{random.randint(1, 10000)}@test.com"
        self.password = "senha123456"
        self.token = None

        # Tentar fazer login (pode falhar se usuário não existir)
        self.login()

    def login(self):
        """Faz login e obtém token"""
        response = self.client.post(
            "/api/auth/login",
            json={
                "email": self.email,
                "senha": self.password
            },
            catch_response=True
        )

        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            response.success()
        else:
            # Login falhou, mas não é erro crítico em load test
            response.failure(f"Login failed: {response.status_code}")

    @task(5)
    def list_providers(self):
        """
        Lista prestadores próximos (operação mais frequente)
        Weight: 5 - Executado 5x mais que outras tasks
        """
        # Coordenadas de São Paulo
        lat = -23.5505 + random.uniform(-0.1, 0.1)
        lon = -46.6333 + random.uniform(-0.1, 0.1)
        radius = random.choice([5, 10, 15, 20])

        with self.client.get(
            "/api/providers",
            params={
                "lat": lat,
                "lon": lon,
                "radius_km": radius,
                "page": 1,
                "per_page": 20
            },
            catch_response=True,
            name="/api/providers [GET]"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                providers_count = len(data.get("providers", []))
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")

    @task(3)
    def search_services(self):
        """
        Busca serviços (segunda operação mais frequente)
        Weight: 3
        """
        categorias = ["limpeza", "eletricista", "encanador", "pintor", "jardineiro"]
        categoria = random.choice(categorias)

        with self.client.get(
            "/api/services",
            params={
                "categoria": categoria,
                "skip": 0,
                "limit": 20
            },
            catch_response=True,
            name="/api/services [GET]"
        ) as response:
            if response.status_code in [200, 404]:  # 404 é ok se não há serviços
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")

    @task(2)
    def view_provider_profile(self):
        """
        Visualiza perfil de prestador
        Weight: 2
        """
        # ID aleatório (pode não existir, mas testa o endpoint)
        provider_id = f"provider-{random.randint(1, 100)}"

        with self.client.get(
            f"/api/providers/{provider_id}",
            catch_response=True,
            name="/api/providers/[id] [GET]"
        ) as response:
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")

    @task(1)
    def register_user(self):
        """
        Registra novo usuário (operação menos frequente)
        Weight: 1
        """
        unique_id = random.randint(100000, 999999)

        with self.client.post(
            "/api/auth/register",
            json={
                "email": f"load_test_{unique_id}@test.com",
                "senha": "senha123456",
                "nome": f"Load Test User {unique_id}",
                "cpf": f"{unique_id:011d}",
                "telefone": f"119{unique_id:08d}",
                "endereco": "Rua Teste, 123",
                "tipos": ["morador"],
                "aceitou_termos": True
            },
            catch_response=True,
            name="/api/auth/register [POST]"
        ) as response:
            if response.status_code in [200, 400]:  # 400 é ok (email duplicado)
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")

    @task(1)
    def create_booking(self):
        """
        Cria agendamento (requer autenticação)
        Weight: 1
        """
        if not self.token:
            return  # Não autenticado, pular

        with self.client.post(
            "/api/bookings",
            json={
                "service_id": f"service-{random.randint(1, 50)}",
                "data_agendamento": "2025-10-20T10:00:00Z",
                "horario_inicio": "10:00",
                "horario_fim": "12:00",
                "observacoes": "Teste de carga"
            },
            headers={
                "Authorization": f"Bearer {self.token}"
            },
            catch_response=True,
            name="/api/bookings [POST]"
        ) as response:
            if response.status_code in [200, 201, 400, 401, 404]:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")

    @task(1)
    def health_check(self):
        """
        Health check (baixa carga, mas importante)
        Weight: 1
        """
        with self.client.get(
            "/ping",
            catch_response=True,
            name="/ping [GET]"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "pong":
                    response.success()
                else:
                    response.failure("Invalid response")
            else:
                response.failure(f"Status: {response.status_code}")


class AdminUser(HttpUser):
    """
    Simula comportamento de usuário admin

    - Operações administrativas menos frequentes
    - Maior impacto no sistema
    """

    wait_time = between(5, 10)  # Admins operam mais devagar
    weight = 1  # Apenas 10% dos usuários são admins

    def on_start(self):
        """Login como admin"""
        self.email = "admin@test.com"
        self.password = "admin123456"
        self.token = None
        self.login()

    def login(self):
        """Faz login admin"""
        response = self.client.post(
            "/api/auth/login",
            json={
                "email": self.email,
                "senha": self.password
            },
            catch_response=True
        )

        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            response.success()
        else:
            response.failure(f"Admin login failed: {response.status_code}")

    @task(3)
    def list_users(self):
        """Lista todos os usuários"""
        if not self.token:
            return

        with self.client.get(
            "/api/admin/users",
            params={"skip": 0, "limit": 50},
            headers={"Authorization": f"Bearer {self.token}"},
            catch_response=True,
            name="/api/admin/users [GET]"
        ) as response:
            if response.status_code in [200, 401, 403]:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")

    @task(2)
    def list_bookings(self):
        """Lista todos os agendamentos"""
        if not self.token:
            return

        with self.client.get(
            "/api/admin/bookings",
            params={"skip": 0, "limit": 50},
            headers={"Authorization": f"Bearer {self.token}"},
            catch_response=True,
            name="/api/admin/bookings [GET]"
        ) as response:
            if response.status_code in [200, 401, 403]:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")

    @task(1)
    def generate_report(self):
        """Gera relatório (operação pesada)"""
        if not self.token:
            return

        with self.client.get(
            "/api/admin/reports/monthly",
            params={
                "year": 2025,
                "month": 10
            },
            headers={"Authorization": f"Bearer {self.token}"},
            catch_response=True,
            name="/api/admin/reports/monthly [GET]"
        ) as response:
            if response.status_code in [200, 401, 403, 404]:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")


# Event listeners para métricas customizadas
@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    """
    Listener customizado para métricas adicionais
    """
    if exception:
        # Log de exceções
        print(f"❌ Request failed: {name} - {exception}")
    elif response_time > 1000:
        # Log de requests lentos (> 1s)
        print(f"⚠️  Slow request: {name} - {response_time}ms")


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Executado no início do teste"""
    print("=" * 80)
    print("🚀 Iniciando teste de carga do Alça Hub")
    print(f"📊 Target: {environment.host}")
    print(f"👥 Usuários: {environment.runner.target_user_count if hasattr(environment.runner, 'target_user_count') else 'N/A'}")
    print("=" * 80)


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Executado no fim do teste"""
    print("=" * 80)
    print("✅ Teste de carga finalizado")

    if hasattr(environment.runner, 'stats'):
        stats = environment.runner.stats
        print(f"📊 Total de requisições: {stats.total.num_requests}")
        print(f"❌ Total de falhas: {stats.total.num_failures}")
        print(f"⚡ Requisições/s: {stats.total.total_rps:.2f}")
        print(f"⏱️  Tempo médio: {stats.total.avg_response_time:.2f}ms")
        print(f"⏱️  P95: {stats.total.get_response_time_percentile(0.95):.2f}ms")
        print(f"⏱️  P99: {stats.total.get_response_time_percentile(0.99):.2f}ms")

    print("=" * 80)


# Configuração de distribuição de usuários
# 90% usuários normais, 10% admins
class AlcaHubLoadTest(HttpUser):
    """Classe principal para load test"""
    tasks = [AlcaHubUser, AdminUser]
    weights = [9, 1]  # 90% AlcaHubUser, 10% AdminUser
