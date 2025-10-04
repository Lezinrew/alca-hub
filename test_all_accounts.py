#!/usr/bin/env python3
"""
Script para testar todas as contas de login
"""

import requests
import json
import time

def test_login_account(email, password, account_type):
    """Testa login de uma conta"""
    
    login_data = {
        "email": email,
        "senha": password
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {account_type}: {email}")
            print(f"   👤 Nome: {data.get('user', {}).get('nome', 'N/A')}")
            print(f"   🏷️  Tipo: {data.get('user', {}).get('tipo', 'N/A')}")
            print(f"   🎫 Token: {data.get('access_token', 'N/A')[:30]}...")
            return True
        else:
            print(f"❌ {account_type}: {email}")
            print(f"   Status: {response.status_code}")
            print(f"   Erro: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ {account_type}: {email}")
        print(f"   Erro: {e}")
        return False

def test_all_accounts():
    """Testa todas as contas de login"""
    
    print("🧪 TESTANDO TODAS AS CONTAS DE LOGIN")
    print("=" * 60)
    
    # Contas de teste
    test_accounts = [
        {
            "email": "lezinrew@gmail.com",
            "password": "123456",
            "type": "👤 Morador Principal"
        },
        {
            "email": "maria.limpeza@alca.com",
            "password": "limpeza123",
            "type": "👷‍♀️ Prestador"
        },
        {
            "email": "psicologa@alca.com",
            "password": "psicologa123",
            "type": "👩‍⚕️ Usuário Dual"
        },
        {
            "email": "joao.limpeza@demo.com",
            "password": "demo123",
            "type": "👷‍♂️ Demo - Limpeza"
        },
        {
            "email": "maria.eletrica@demo.com",
            "password": "demo123",
            "type": "👷‍♀️ Demo - Elétrica"
        },
        {
            "email": "carlos.jardinagem@demo.com",
            "password": "demo123",
            "type": "👷‍♂️ Demo - Jardim"
        },
        {
            "email": "ana.pintura@demo.com",
            "password": "demo123",
            "type": "👷‍♀️ Demo - Pintura"
        },
        {
            "email": "pedro.encanamento@demo.com",
            "password": "demo123",
            "type": "👷‍♂️ Demo - Encanamento"
        }
    ]
    
    successful_logins = 0
    total_accounts = len(test_accounts)
    
    print(f"📊 Testando {total_accounts} contas...")
    print()
    
    for account in test_accounts:
        success = test_login_account(
            account["email"],
            account["password"],
            account["type"]
        )
        
        if success:
            successful_logins += 1
        
        print()  # Linha em branco entre testes
        time.sleep(0.5)  # Pequena pausa entre testes
    
    # Resultado final
    print("=" * 60)
    print("📊 RESULTADO DOS TESTES")
    print("=" * 60)
    print(f"✅ Logins bem-sucedidos: {successful_logins}/{total_accounts}")
    print(f"❌ Logins falharam: {total_accounts - successful_logins}/{total_accounts}")
    
    if successful_logins == total_accounts:
        print("🎉 TODAS AS CONTAS ESTÃO FUNCIONAIS!")
        print("✅ Critério de aceite: APROVADO")
    else:
        print("⚠️  ALGUMAS CONTAS NÃO ESTÃO FUNCIONANDO")
        print("❌ Critério de aceite: REPROVADO")
    
    print()
    print("🌐 Para testar no frontend:")
    print("   URL: http://localhost:5173/login")
    print("   Use qualquer uma das contas listadas acima")

if __name__ == "__main__":
    test_all_accounts()

