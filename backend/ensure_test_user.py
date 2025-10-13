#!/usr/bin/env python3
"""
Script para garantir que o usuário lezinrew@gmail.com existe
"""

import requests
import json

def create_test_user():
    """Criar usuário via API"""
    url = "http://localhost:8000/api/auth/register"
    
    user_data = {
        "email": "lezinrew@gmail.com",
        "senha": "123456",
        "nome": "Lezin Rew",
        "cpf": "12345678901",
        "telefone": "(11) 99999-0000",
        "endereco": "São Paulo, SP",
        "tipos": ["morador"],
        "aceitou_termos": True
    }
    
    try:
        response = requests.post(url, json=user_data, timeout=10)
        
        if response.status_code == 200:
            print("✅ Usuário criado com sucesso!")
            print(f"   Email: lezinrew@gmail.com")
            print(f"   Senha: 123456")
        elif response.status_code == 422:
            print("⚠️  Usuário já existe ou dados inválidos")
            print(f"   Resposta: {response.text}")
        else:
            print(f"❌ Erro ao criar usuário: {response.status_code}")
            print(f"   Resposta: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Servidor não está rodando")
        print("   Execute: cd backend && python server.py")
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    print("🚀 Criando usuário de teste...")
    create_test_user()
