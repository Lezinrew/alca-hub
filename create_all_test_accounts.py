#!/usr/bin/env python3
"""
Script para criar todas as contas de login de teste
"""

import asyncio
import motor.motor_asyncio
from datetime import datetime
import hashlib

# Configuração do MongoDB
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "alca_hub"

async def create_all_test_accounts():
    """Cria todas as contas de teste"""
    
    # Conectar ao MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Função de hash SHA256 (compatível com o backend)
    def hash_password(password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    # Todas as contas de teste
    test_accounts = [
        # Usuário Morador Principal
        {
            "nome": "Leandro Xavier",
            "email": "lezinrew@gmail.com",
            "senha": hash_password("123456"),
            "telefone": "(11) 99999-9999",
            "tipo": "morador",
            "ativo": True,
            "apartamento": "101",
            "bloco": "A",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Usuário Prestador
        {
            "nome": "Maria da Limpeza",
            "email": "maria.limpeza@alca.com",
            "senha": hash_password("limpeza123"),
            "telefone": "(11) 99999-7777",
            "tipo": "prestador",
            "ativo": True,
            "especialidades": ["limpeza", "organização"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Usuário Dual (Morador + Prestador)
        {
            "nome": "Psicóloga",
            "email": "psicologa@alca.com",
            "senha": hash_password("psicologa123"),
            "telefone": "(11) 99999-8888",
            "tipo": "morador",
            "ativo": True,
            "apartamento": "202",
            "bloco": "B",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Usuários Demo (Prestadores)
        {
            "nome": "João Silva - Limpeza",
            "email": "joao.limpeza@demo.com",
            "senha": hash_password("demo123"),
            "telefone": "(11) 99999-1111",
            "tipo": "prestador",
            "ativo": True,
            "especialidades": ["limpeza"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "nome": "Maria Santos - Elétrica",
            "email": "maria.eletrica@demo.com",
            "senha": hash_password("demo123"),
            "telefone": "(11) 99999-2222",
            "tipo": "prestador",
            "ativo": True,
            "especialidades": ["elétrica", "manutenção"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "nome": "Carlos Oliveira - Jardim",
            "email": "carlos.jardinagem@demo.com",
            "senha": hash_password("demo123"),
            "telefone": "(11) 99999-3333",
            "tipo": "prestador",
            "ativo": True,
            "especialidades": ["jardinagem", "paisagismo"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "nome": "Ana Costa - Pintura",
            "email": "ana.pintura@demo.com",
            "senha": hash_password("demo123"),
            "telefone": "(11) 99999-4444",
            "tipo": "prestador",
            "ativo": True,
            "especialidades": ["pintura", "reformas"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "nome": "Pedro Lima - Encanamento",
            "email": "pedro.encanamento@demo.com",
            "senha": hash_password("demo123"),
            "telefone": "(11) 99999-5555",
            "tipo": "prestador",
            "ativo": True,
            "especialidades": ["encanamento", "hidráulica"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    try:
        print("🚀 Criando todas as contas de teste...")
        
        # Limpar banco
        await db.users.delete_many({})
        print("🧹 Banco limpo")
        
        # Criar todas as contas
        for account in test_accounts:
            result = await db.users.insert_one(account)
            print(f"✅ Conta criada: {account['nome']} ({account['email']})")
        
        # Verificar total
        count = await db.users.count_documents({})
        print(f"\n📊 Total de contas criadas: {count}")
        
        print("\n📋 CONTAS DE LOGIN DE TESTE CRIADAS:")
        print("=" * 60)
        
        # Usuário Morador
        print("👤 USUÁRIO MORADOR")
        print("   📧 Email: lezinrew@gmail.com")
        print("   🔑 Senha: 123456")
        print("   🏠 Tipo: Morador")
        print()
        
        # Usuário Prestador
        print("👷‍♀️ USUÁRIO PRESTADOR")
        print("   📧 Email: maria.limpeza@alca.com")
        print("   🔑 Senha: limpeza123")
        print("   🏢 Tipo: Prestador")
        print()
        
        # Usuário Dual
        print("👩‍⚕️ USUÁRIO DUAL (Morador + Prestador)")
        print("   📧 Email: psicologa@alca.com")
        print("   🔑 Senha: psicologa123")
        print("   🔄 Tipo: Morador (pode alternar)")
        print()
        
        # Usuários Demo
        print("👷‍♂️ USUÁRIOS DEMO (Prestadores)")
        print("   📧 Email: joao.limpeza@demo.com")
        print("   🔑 Senha: demo123")
        print("   📧 Email: maria.eletrica@demo.com")
        print("   🔑 Senha: demo123")
        print("   📧 Email: carlos.jardinagem@demo.com")
        print("   🔑 Senha: demo123")
        print("   📧 Email: ana.pintura@demo.com")
        print("   🔑 Senha: demo123")
        print("   📧 Email: pedro.encanamento@demo.com")
        print("   🔑 Senha: demo123")
        print()
        
        print("🌐 Acesse: http://localhost:5173/login")
        print("✅ Todas as contas estão prontas para teste!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_all_test_accounts())

