#!/usr/bin/env python3
"""
Script para criar usuário de teste: lezinrew@gmail.com / 123456
"""

import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
import uuid

# Adicionar o diretório backend ao path
ROOT_DIR = Path(__file__).parent
sys.path.append(str(ROOT_DIR))

# Configuração do banco
mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "alca_hub")
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Configuração de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash da senha usando bcrypt"""
    return pwd_context.hash(password)

async def create_test_user():
    """Criar usuário de teste lezinrew@gmail.com"""
    try:
        # Verificar se usuário já existe
        existing_user = await db.users.find_one({"email": "lezinrew@gmail.com"})
        if existing_user:
            print("✅ Usuário lezinrew@gmail.com já existe!")
            print(f"   ID: {existing_user.get('id', 'N/A')}")
            print(f"   Nome: {existing_user.get('nome', 'N/A')}")
            print(f"   Tipo: {existing_user.get('tipo', 'N/A')}")
            return
        
        # Criar usuário de teste
        user_data = {
            "id": str(uuid.uuid4()),
            "email": "lezinrew@gmail.com",
            "cpf": "12345678901",
            "nome": "Lezin Rew",
            "telefone": "(11) 99999-0000",
            "endereco": "São Paulo, SP",
            "tipo": "morador",
            "tipos": ["morador"],
            "tipo_ativo": "morador",
            "ativo": True,
            "password": get_password_hash("123456"),
            "aceitou_termos": True,
            "data_aceite_termos": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        # Inserir usuário
        result = await db.users.insert_one(user_data)
        
        print("✅ Usuário de teste criado com sucesso!")
        print(f"   Email: lezinrew@gmail.com")
        print(f"   Senha: 123456")
        print(f"   ID: {user_data['id']}")
        print(f"   Nome: {user_data['nome']}")
        print(f"   Tipo: {user_data['tipo']}")
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        raise
    finally:
        client.close()

async def create_demo_users():
    """Criar usuários demo adicionais"""
    demo_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "psicologa@alca.com",
            "cpf": "66666666666",
            "nome": "Dr. Ana Psicóloga",
            "telefone": "(11) 99999-6666",
            "endereco": "São Paulo, SP",
            "tipo": "prestador",
            "tipos": ["morador", "prestador"],
            "tipo_ativo": "morador",
            "ativo": True,
            "password": get_password_hash("psicologa123"),
            "aceitou_termos": True,
            "data_aceite_termos": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    ]
    
    try:
        for user_data in demo_users:
            # Verificar se usuário já existe
            existing_user = await db.users.find_one({"email": user_data["email"]})
            if existing_user:
                print(f"✅ Usuário {user_data['email']} já existe!")
                continue
            
            # Inserir usuário
            await db.users.insert_one(user_data)
            print(f"✅ Usuário demo criado: {user_data['email']}")
            
    except Exception as e:
        print(f"❌ Erro ao criar usuários demo: {e}")

async def main():
    """Função principal"""
    print("🚀 Criando usuários de teste...")
    print(f"📊 Banco: {db_name}")
    print(f"🔗 URL: {mongo_url}")
    print()
    
    # Criar usuário principal
    await create_test_user()
    print()
    
    # Criar usuários demo
    await create_demo_users()
    print()
    
    print("🎉 Processo concluído!")
    print()
    print("📋 Credenciais disponíveis:")
    print("   • lezinrew@gmail.com / 123456 (Morador)")
    print("   • psicologa@alca.com / psicologa123 (Dual: Morador + Prestador)")

if __name__ == "__main__":
    asyncio.run(main())
