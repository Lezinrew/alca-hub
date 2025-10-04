#!/usr/bin/env python3
"""
Script para verificar usuários no banco
"""

import asyncio
import motor.motor_asyncio

# Configuração do MongoDB
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "alca_hub"

async def check_users():
    """Verifica usuários no banco"""
    
    # Conectar ao MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        print("🔍 Verificando usuários no banco...")
        
        # Listar todos os usuários
        users = await db.users.find({}).to_list(length=None)
        
        print(f"📊 Total de usuários: {len(users)}")
        print("=" * 50)
        
        for user in users:
            print(f"👤 {user.get('nome', 'N/A')}")
            print(f"   📧 Email: {user.get('email', 'N/A')}")
            print(f"   🔑 Tipo: {user.get('tipo', 'N/A')}")
            print(f"   ✅ Ativo: {user.get('ativo', 'N/A')}")
            print(f"   🆔 ID: {user.get('_id', 'N/A')}")
            print()
        
        # Testar busca específica
        print("🧪 Testando busca por email...")
        user = await db.users.find_one({"email": "lezinrew@gmail.com"})
        
        if user:
            print("✅ Usuário encontrado!")
            print(f"   Nome: {user.get('nome')}")
            print(f"   Email: {user.get('email')}")
            print(f"   Ativo: {user.get('ativo')}")
            print(f"   Senha hash: {user.get('senha', 'N/A')[:50]}...")
        else:
            print("❌ Usuário não encontrado!")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
