#!/usr/bin/env python3
# Script de Teste de Segurança - Alça Hub
import asyncio
import httpx
import json
import time
from datetime import datetime
import sys
import os

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurações de teste
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "teste@exemplo.com"
TEST_PASSWORD = "senha123456"
TEST_NAME = "Usuário Teste"
TEST_PHONE = "11999999999"

class SecurityTester:
    """Testador de funcionalidades de segurança."""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.client = httpx.AsyncClient()
        self.access_token = None
        self.refresh_token = None
        self.test_results = []
    
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
    
    async def test_server_health(self):
        """Testar se o servidor está rodando."""
        try:
            response = await self.client.get(f"{self.base_url}/ping")
            if response.status_code == 200:
                self.log_test("Server Health", True, "Servidor respondendo")
                return True
            else:
                self.log_test("Server Health", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Server Health", False, f"Erro: {str(e)}")
            return False
    
    async def test_rate_limiting(self):
        """Testar rate limiting."""
        print("\n🧪 Testando Rate Limiting...")
        
        # Testar rate limiting geral
        try:
            responses = []
            for i in range(5):
                response = await self.client.get(f"{self.base_url}/api/auth/rate-limit-info")
                responses.append(response.status_code)
                await asyncio.sleep(0.1)
            
            # Verificar se todas as requisições foram bem-sucedidas
            success = all(status == 200 for status in responses)
            self.log_test("Rate Limiting - General", success, f"Status codes: {responses}")
            
        except Exception as e:
            self.log_test("Rate Limiting - General", False, f"Erro: {str(e)}")
        
        # Testar rate limiting de login
        try:
            login_data = {
                "email": "rate_limit_test@exemplo.com",
                "senha": "senha123456"
            }
            
            responses = []
            for i in range(10):  # Tentar 10 logins rapidamente
                response = await self.client.post(f"{self.base_url}/api/auth/login", json=login_data)
                responses.append(response.status_code)
                await asyncio.sleep(0.1)
            
            # Verificar se algumas requisições foram bloqueadas
            blocked_count = sum(1 for status in responses if status == 429)
            success = blocked_count > 0
            self.log_test("Rate Limiting - Login", success, f"Bloqueios: {blocked_count}/10")
            
        except Exception as e:
            self.log_test("Rate Limiting - Login", False, f"Erro: {str(e)}")
    
    async def test_user_registration(self):
        """Testar registro de usuário."""
        print("\n🧪 Testando Registro de Usuário...")
        
        try:
            register_data = {
                "nome": TEST_NAME,
                "email": TEST_EMAIL,
                "senha": TEST_PASSWORD,
                "telefone": TEST_PHONE,
                "tipo": "morador",
                "apartamento": "101",
                "bloco": "A"
            }
            
            response = await self.client.post(f"{self.base_url}/api/auth/register", json=register_data)
            
            if response.status_code == 201:
                self.log_test("User Registration", True, "Usuário registrado com sucesso")
                return True
            elif response.status_code == 400 and "já cadastrado" in response.text:
                self.log_test("User Registration", True, "Usuário já existe (esperado)")
                return True
            else:
                self.log_test("User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Registration", False, f"Erro: {str(e)}")
            return False
    
    async def test_user_login(self):
        """Testar login de usuário."""
        print("\n🧪 Testando Login de Usuário...")
        
        try:
            login_data = {
                "email": TEST_EMAIL,
                "senha": TEST_PASSWORD
            }
            
            response = await self.client.post(f"{self.base_url}/api/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                self.refresh_token = data.get("refresh_token")
                
                if self.access_token and self.refresh_token:
                    self.log_test("User Login", True, "Login bem-sucedido com tokens")
                    return True
                else:
                    self.log_test("User Login", False, "Tokens não retornados")
                    return False
            else:
                self.log_test("User Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Erro: {str(e)}")
            return False
    
    async def test_protected_endpoints(self):
        """Testar endpoints protegidos."""
        print("\n🧪 Testando Endpoints Protegidos...")
        
        if not self.access_token:
            self.log_test("Protected Endpoints", False, "Token de acesso não disponível")
            return False
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        try:
            # Testar endpoint protegido
            response = await self.client.get(f"{self.base_url}/api/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Protected Endpoints", True, f"Dados do usuário: {data.get('email')}")
                return True
            else:
                self.log_test("Protected Endpoints", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Protected Endpoints", False, f"Erro: {str(e)}")
            return False
    
    async def test_token_refresh(self):
        """Testar renovação de token."""
        print("\n🧪 Testando Renovação de Token...")
        
        if not self.refresh_token:
            self.log_test("Token Refresh", False, "Refresh token não disponível")
            return False
        
        try:
            refresh_data = {"refresh_token": self.refresh_token}
            response = await self.client.post(f"{self.base_url}/api/auth/refresh", json=refresh_data)
            
            if response.status_code == 200:
                data = response.json()
                new_access_token = data.get("access_token")
                new_refresh_token = data.get("refresh_token")
                
                if new_access_token and new_refresh_token:
                    self.log_test("Token Refresh", True, "Tokens renovados com sucesso")
                    self.access_token = new_access_token
                    self.refresh_token = new_refresh_token
                    return True
                else:
                    self.log_test("Token Refresh", False, "Novos tokens não retornados")
                    return False
            else:
                self.log_test("Token Refresh", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Token Refresh", False, f"Erro: {str(e)}")
            return False
    
    async def test_invalid_token(self):
        """Testar token inválido."""
        print("\n🧪 Testando Token Inválido...")
        
        try:
            headers = {"Authorization": "Bearer token_invalido"}
            response = await self.client.get(f"{self.base_url}/api/auth/me", headers=headers)
            
            if response.status_code == 401:
                self.log_test("Invalid Token", True, "Token inválido rejeitado corretamente")
                return True
            else:
                self.log_test("Invalid Token", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Invalid Token", False, f"Erro: {str(e)}")
            return False
    
    async def test_password_validation(self):
        """Testar validação de senha."""
        print("\n🧪 Testando Validação de Senha...")
        
        # Testar senha fraca
        try:
            weak_password_data = {
                "nome": "Teste",
                "email": "teste_senha@exemplo.com",
                "senha": "123",  # Senha muito fraca
                "telefone": "11999999999",
                "tipo": "morador"
            }
            
            response = await self.client.post(f"{self.base_url}/api/auth/register", json=weak_password_data)
            
            if response.status_code == 400 and "Senha inválida" in response.text:
                self.log_test("Password Validation", True, "Senha fraca rejeitada corretamente")
                return True
            else:
                self.log_test("Password Validation", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Password Validation", False, f"Erro: {str(e)}")
            return False
    
    async def test_security_headers(self):
        """Testar headers de segurança."""
        print("\n🧪 Testando Headers de Segurança...")
        
        try:
            response = await self.client.get(f"{self.base_url}/ping")
            headers = response.headers
            
            security_headers = [
                "X-Content-Type-Options",
                "X-Frame-Options",
                "X-XSS-Protection",
                "Strict-Transport-Security"
            ]
            
            present_headers = [h for h in security_headers if h in headers]
            
            if len(present_headers) >= 2:
                self.log_test("Security Headers", True, f"Headers presentes: {present_headers}")
                return True
            else:
                self.log_test("Security Headers", False, f"Poucos headers de segurança: {present_headers}")
                return False
                
        except Exception as e:
            self.log_test("Security Headers", False, f"Erro: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Executar todos os testes."""
        print("🔒 Iniciando Testes de Segurança - Alça Hub")
        print("=" * 50)
        
        # Verificar se servidor está rodando
        if not await self.test_server_health():
            print("❌ Servidor não está rodando. Execute o servidor primeiro.")
            return
        
        # Executar testes
        await self.test_rate_limiting()
        await self.test_user_registration()
        await self.test_user_login()
        await self.test_protected_endpoints()
        await self.test_token_refresh()
        await self.test_invalid_token()
        await self.test_password_validation()
        await self.test_security_headers()
        
        # Resumo dos resultados
        print("\n" + "=" * 50)
        print("📊 RESUMO DOS TESTES")
        print("=" * 50)
        
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
        
        print("\n🎯 Testes de segurança concluídos!")

async def main():
    """Função principal."""
    async with SecurityTester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
