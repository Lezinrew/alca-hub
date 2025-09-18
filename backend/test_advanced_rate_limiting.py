#!/usr/bin/env python3
# Testes Avançados de Rate Limiting - Alça Hub
import asyncio
import httpx
import time
import json
from datetime import datetime
import sys
import os

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurações de teste
BASE_URL = "http://localhost:8000"
REDIS_URL = "redis://localhost:6379"

class AdvancedRateLimitTester:
    """Testador avançado de rate limiting."""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.client = httpx.AsyncClient()
        self.test_results = []
        self.redis_client = None
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Registrar resultado de teste."""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
    
    async def test_redis_connection(self):
        """Testar conexão com Redis."""
        print("\n🧪 Testando Conexão com Redis...")
        
        try:
            import redis
            redis_client = redis.from_url(REDIS_URL)
            redis_client.ping()
            self.log_test("Redis Connection", True, "Conexão com Redis estabelecida")
            self.redis_client = redis_client
            return True
        except Exception as e:
            self.log_test("Redis Connection", False, f"Erro: {str(e)}")
            return False
    
    async def test_fixed_window_rate_limiting(self):
        """Testar rate limiting com janela fixa."""
        print("\n🧪 Testando Rate Limiting - Janela Fixa...")
        
        try:
            # Fazer múltiplas requisições rapidamente
            responses = []
            for i in range(10):
                response = await self.client.get(f"{self.base_url}/api/auth/rate-limit-info")
                responses.append(response.status_code)
                await asyncio.sleep(0.1)
            
            # Verificar se algumas requisições foram bloqueadas
            blocked_count = sum(1 for status in responses if status == 429)
            success = blocked_count > 0
            
            self.log_test("Fixed Window Rate Limiting", success, 
                         f"Bloqueios: {blocked_count}/10, Status: {responses}")
            return success
            
        except Exception as e:
            self.log_test("Fixed Window Rate Limiting", False, f"Erro: {str(e)}")
            return False
    
    async def test_sliding_window_rate_limiting(self):
        """Testar rate limiting com janela deslizante."""
        print("\n🧪 Testando Rate Limiting - Janela Deslizante...")
        
        try:
            # Fazer requisições em intervalos
            responses = []
            for i in range(5):
                response = await self.client.get(f"{self.base_url}/api/auth/rate-limit-info")
                responses.append(response.status_code)
                await asyncio.sleep(1)  # 1 segundo entre requisições
            
            # Verificar se todas as requisições foram bem-sucedidas
            success = all(status == 200 for status in responses)
            
            self.log_test("Sliding Window Rate Limiting", success, 
                         f"Status: {responses}")
            return success
            
        except Exception as e:
            self.log_test("Sliding Window Rate Limiting", False, f"Erro: {str(e)}")
            return False
    
    async def test_token_bucket_rate_limiting(self):
        """Testar rate limiting com token bucket."""
        print("\n🧪 Testando Rate Limiting - Token Bucket...")
        
        try:
            # Fazer requisições para endpoint que usa token bucket
            responses = []
            for i in range(20):
                response = await self.client.get(f"{self.base_url}/api/services")
                responses.append(response.status_code)
                await asyncio.sleep(0.1)
            
            # Verificar se algumas requisições foram bloqueadas
            blocked_count = sum(1 for status in responses if status == 429)
            success = blocked_count > 0
            
            self.log_test("Token Bucket Rate Limiting", success, 
                         f"Bloqueios: {blocked_count}/20, Status: {responses[:5]}...")
            return success
            
        except Exception as e:
            self.log_test("Token Bucket Rate Limiting", False, f"Erro: {str(e)}")
            return False
    
    async def test_adaptive_rate_limiting(self):
        """Testar rate limiting adaptativo."""
        print("\n🧪 Testando Rate Limiting Adaptativo...")
        
        try:
            # Simular comportamento normal
            responses = []
            for i in range(5):
                response = await self.client.get(f"{self.base_url}/api/auth/rate-limit-info")
                responses.append(response.status_code)
                await asyncio.sleep(1)
            
            # Verificar se todas as requisições foram bem-sucedidas
            success = all(status == 200 for status in responses)
            
            self.log_test("Adaptive Rate Limiting", success, 
                         f"Status: {responses}")
            return success
            
        except Exception as e:
            self.log_test("Adaptive Rate Limiting", False, f"Erro: {str(e)}")
            return False
    
    async def test_ip_whitelist(self):
        """Testar whitelist de IPs."""
        print("\n🧪 Testando Whitelist de IPs...")
        
        try:
            # Simular IP whitelisted
            headers = {"X-Forwarded-For": "192.168.1.100"}
            
            # Fazer muitas requisições
            responses = []
            for i in range(20):
                response = await self.client.get(
                    f"{self.base_url}/api/auth/rate-limit-info",
                    headers=headers
                )
                responses.append(response.status_code)
                await asyncio.sleep(0.1)
            
            # Verificar se todas as requisições foram bem-sucedidas
            success = all(status == 200 for status in responses)
            
            self.log_test("IP Whitelist", success, 
                         f"Status: {responses[:5]}...")
            return success
            
        except Exception as e:
            self.log_test("IP Whitelist", False, f"Erro: {str(e)}")
            return False
    
    async def test_ip_blacklist(self):
        """Testar blacklist de IPs."""
        print("\n🧪 Testando Blacklist de IPs...")
        
        try:
            # Simular IP blacklisted
            headers = {"X-Forwarded-For": "192.168.1.999"}
            
            response = await self.client.get(
                f"{self.base_url}/api/auth/rate-limit-info",
                headers=headers
            )
            
            # Verificar se requisição foi bloqueada
            success = response.status_code == 403
            
            self.log_test("IP Blacklist", success, 
                         f"Status: {response.status_code}")
            return success
            
        except Exception as e:
            self.log_test("IP Blacklist", False, f"Erro: {str(e)}")
            return False
    
    async def test_rate_limit_headers(self):
        """Testar headers de rate limiting."""
        print("\n🧪 Testando Headers de Rate Limiting...")
        
        try:
            response = await self.client.get(f"{self.base_url}/api/auth/rate-limit-info")
            
            # Verificar headers de rate limiting
            headers = response.headers
            rate_limit_headers = [
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining",
                "X-RateLimit-Reset",
                "X-RateLimit-Strategy"
            ]
            
            present_headers = [h for h in rate_limit_headers if h in headers]
            success = len(present_headers) >= 2
            
            self.log_test("Rate Limit Headers", success, 
                         f"Headers presentes: {present_headers}")
            return success
            
        except Exception as e:
            self.log_test("Rate Limit Headers", False, f"Erro: {str(e)}")
            return False
    
    async def test_dashboard_endpoints(self):
        """Testar endpoints do dashboard."""
        print("\n🧪 Testando Endpoints do Dashboard...")
        
        try:
            # Testar endpoint de estatísticas
            response = await self.client.get(f"{self.base_url}/api/admin/rate-limit/stats")
            
            if response.status_code == 200:
                data = response.json()
                success = data.get("success", False)
                
                self.log_test("Dashboard Stats", success, 
                             f"Dados: {data.get('data', {})}")
                return success
            else:
                self.log_test("Dashboard Stats", False, 
                             f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Erro: {str(e)}")
            return False
    
    async def test_cleanup_functionality(self):
        """Testar funcionalidade de limpeza."""
        print("\n🧪 Testando Funcionalidade de Limpeza...")
        
        try:
            # Testar endpoint de limpeza
            response = await self.client.post(f"{self.base_url}/api/admin/rate-limit/cleanup")
            
            if response.status_code == 200:
                data = response.json()
                success = data.get("success", False)
                
                self.log_test("Cleanup Functionality", success, 
                             f"Mensagem: {data.get('message', '')}")
                return success
            else:
                self.log_test("Cleanup Functionality", False, 
                             f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Cleanup Functionality", False, f"Erro: {str(e)}")
            return False
    
    async def test_redis_operations(self):
        """Testar operações Redis."""
        print("\n🧪 Testando Operações Redis...")
        
        if not self.redis_client:
            self.log_test("Redis Operations", False, "Cliente Redis não disponível")
            return False
        
        try:
            # Testar operações básicas
            test_key = "test_rate_limit_key"
            test_value = "test_value"
            
            # Set
            self.redis_client.set(test_key, test_value, ex=60)
            
            # Get
            retrieved_value = self.redis_client.get(test_key)
            
            # Delete
            self.redis_client.delete(test_key)
            
            success = retrieved_value == test_value
            
            self.log_test("Redis Operations", success, 
                         f"Valor recuperado: {retrieved_value}")
            return success
            
        except Exception as e:
            self.log_test("Redis Operations", False, f"Erro: {str(e)}")
            return False
    
    async def test_concurrent_requests(self):
        """Testar requisições concorrentes."""
        print("\n🧪 Testando Requisições Concorrentes...")
        
        try:
            # Criar múltiplas tarefas concorrentes
            async def make_request():
                response = await self.client.get(f"{self.base_url}/api/auth/rate-limit-info")
                return response.status_code
            
            # Executar 20 requisições concorrentes
            tasks = [make_request() for _ in range(20)]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Verificar resultados
            success_count = sum(1 for result in results if result == 200)
            blocked_count = sum(1 for result in results if result == 429)
            
            success = success_count > 0 and blocked_count > 0
            
            self.log_test("Concurrent Requests", success, 
                         f"Sucessos: {success_count}, Bloqueios: {blocked_count}")
            return success
            
        except Exception as e:
            self.log_test("Concurrent Requests", False, f"Erro: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Executar todos os testes."""
        print("🔒 Iniciando Testes Avançados de Rate Limiting - Alça Hub")
        print("=" * 60)
        
        # Verificar conexão com Redis
        if not await self.test_redis_connection():
            print("❌ Redis não está disponível. Instale e inicie o Redis primeiro.")
            return
        
        # Executar testes
        await self.test_fixed_window_rate_limiting()
        await self.test_sliding_window_rate_limiting()
        await self.test_token_bucket_rate_limiting()
        await self.test_adaptive_rate_limiting()
        await self.test_ip_whitelist()
        await self.test_ip_blacklist()
        await self.test_rate_limit_headers()
        await self.test_dashboard_endpoints()
        await self.test_cleanup_functionality()
        await self.test_redis_operations()
        await self.test_concurrent_requests()
        
        # Resumo dos resultados
        print("\n" + "=" * 60)
        print("📊 RESUMO DOS TESTES AVANÇADOS")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total de testes: {total_tests}")
        print(f"✅ Aprovados: {passed_tests}")
        print(f"❌ Falharam: {failed_tests}")
        print(f"Taxa de sucesso: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ TESTES QUE FALHARAM:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n🎯 Testes avançados de rate limiting concluídos!")

async def main():
    """Função principal."""
    async with AdvancedRateLimitTester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
