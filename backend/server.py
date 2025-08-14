from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from enum import Enum
import mercadopago
import hmac
import hashlib
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = "alca-hub-secret-key-2025"  # In production, use a secure random key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Mercado Pago configuration
MERCADO_PAGO_ACCESS_TOKEN = os.environ.get('MERCADO_PAGO_ACCESS_TOKEN')
MERCADO_PAGO_PUBLIC_KEY = os.environ.get('MERCADO_PAGO_PUBLIC_KEY')
WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET')

# Create the main app without a prefix
app = FastAPI(title="Alça Hub API", description="Sistema de gestão de serviços para condomínios")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserType(str, Enum):
    MORADOR = "morador"
    PRESTADOR = "prestador"
    ADMIN = "admin"

class ServiceStatus(str, Enum):
    DISPONIVEL = "disponivel"
    INDISPONIVEL = "indisponivel"

class BookingStatus(str, Enum):
    PENDENTE = "pendente"
    CONFIRMADO = "confirmado"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    cpf: str
    nome: str
    telefone: str
    endereco: str
    tipo: UserType
    foto_url: Optional[str] = None
    ativo: bool = True
    # Geolocalização para prestadores
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    disponivel: bool = True  # Para prestadores indicarem disponibilidade
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    cpf: str
    nome: str
    telefone: str
    endereco: str
    tipo: UserType
    foto_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prestador_id: str
    nome: str
    descricao: str
    categoria: str
    preco_por_hora: float
    disponibilidade: List[str]  # ["segunda", "terca", ...]
    horario_inicio: str  # "08:00"
    horario_fim: str  # "18:00"
    status: ServiceStatus = ServiceStatus.DISPONIVEL
    avaliacoes: List[Dict[str, Any]] = []
    media_avaliacoes: float = 0.0
    total_avaliacoes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ServiceCreate(BaseModel):
    nome: str
    descricao: str
    categoria: str
    preco_por_hora: float
    disponibilidade: List[str]
    horario_inicio: str
    horario_fim: str

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    morador_id: str
    prestador_id: str
    service_id: str
    data_agendamento: datetime
    horario_inicio: str
    horario_fim: str
    preco_total: float
    observacoes: Optional[str] = None
    status: BookingStatus = BookingStatus.PENDENTE
    payment_status: str = "pending"  # pending, paid, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BookingCreate(BaseModel):
    service_id: str
    data_agendamento: datetime
    horario_inicio: str
    horario_fim: str
    observacoes: Optional[str] = None

class BookingUpdate(BaseModel):
    status: BookingStatus

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_id: str
    morador_id: str
    prestador_id: str
    service_id: str
    rating: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = None

# Payment Models
class PIXPaymentRequest(BaseModel):
    booking_id: str
    payer_email: str
    payer_name: str
    payer_identification: str
    payer_identification_type: str = "CPF"

class CreditCardPaymentRequest(BaseModel):
    booking_id: str
    card_token: str
    installments: int = 1
    payer_email: str
    payer_name: str
    payer_identification: str
    payer_identification_type: str = "CPF"

class PaymentResponse(BaseModel):
    payment_id: str
    status: str
    payment_method: str
    amount: float
    qr_code: Optional[str] = None
    qr_code_base64: Optional[str] = None
    installments: Optional[int] = None
    expiration_date: Optional[str] = None

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return User(**user)

def get_mercado_pago_sdk():
    """Get configured Mercado Pago SDK instance"""
    if not MERCADO_PAGO_ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="Mercado Pago not configured")
    return mercadopago.SDK(MERCADO_PAGO_ACCESS_TOKEN)

async def auto_approve_demo_payment(payment_id: str, delay_seconds: int):
    """Auto-approve demo payment after delay for testing purposes"""
    import asyncio
    await asyncio.sleep(delay_seconds)
    
    try:
        # Update payment status to approved
        await db.payments.update_one(
            {"mercado_pago_id": payment_id},
            {
                "$set": {
                    "status": "approved",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Update booking payment status
        payment_record = await db.payments.find_one({"mercado_pago_id": payment_id})
        if payment_record:
            await db.bookings.update_one(
                {"id": payment_record["booking_id"]},
                {
                    "$set": {
                        "payment_status": "paid",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        
        logger.info(f"Demo payment {payment_id} auto-approved after {delay_seconds} seconds")
    except Exception as e:
        logger.error(f"Error auto-approving demo payment {payment_id}: {str(e)}")

# Authentication routes
@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Check CPF
    existing_cpf = await db.users.find_one({"cpf": user_data.cpf})
    if existing_cpf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    del user_dict["password"]
    
    user = User(**user_dict)
    user_doc = user.dict()
    user_doc["password"] = hashed_password
    
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.dict()
    }

@api_router.post("/auth/login", response_model=Token)
async def login_user(user_credentials: UserLogin):
    user_doc = await db.users.find_one({"email": user_credentials.email})
    if not user_doc or not verify_password(user_credentials.password, user_doc["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = User(**user_doc)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.dict()
    }

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Service routes
@api_router.post("/services", response_model=Service)
async def create_service(service_data: ServiceCreate, current_user: User = Depends(get_current_user)):
    if current_user.tipo != UserType.PRESTADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas prestadores podem criar serviços"
        )
    
    service = Service(prestador_id=current_user.id, **service_data.dict())
    await db.services.insert_one(service.dict())
    return service

@api_router.get("/services", response_model=List[Service])
async def get_services(categoria: Optional[str] = None, skip: int = 0, limit: int = 20):
    filter_query = {"status": ServiceStatus.DISPONIVEL}
    if categoria:
        filter_query["categoria"] = categoria
    
    services = await db.services.find(filter_query).skip(skip).limit(limit).to_list(length=limit)
    return [Service(**service) for service in services]

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return Service(**service)

@api_router.get("/my-services", response_model=List[Service])
async def get_my_services(current_user: User = Depends(get_current_user)):
    if current_user.tipo != UserType.PRESTADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas prestadores podem ver seus serviços"
        )
    
    services = await db.services.find({"prestador_id": current_user.id}).to_list(length=100)
    return [Service(**service) for service in services]

# Booking routes
@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, current_user: User = Depends(get_current_user)):
    if current_user.tipo != UserType.MORADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas moradores podem fazer agendamentos"
        )
    
    # Get service info
    service = await db.services.find_one({"id": booking_data.service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    # Calculate total price (simple calculation for MVP)
    start_time = datetime.strptime(booking_data.horario_inicio, "%H:%M")
    end_time = datetime.strptime(booking_data.horario_fim, "%H:%M")
    duration_hours = (end_time - start_time).seconds / 3600
    preco_total = duration_hours * service["preco_por_hora"]
    
    booking = Booking(
        morador_id=current_user.id,
        prestador_id=service["prestador_id"],
        service_id=booking_data.service_id,
        data_agendamento=booking_data.data_agendamento,
        horario_inicio=booking_data.horario_inicio,
        horario_fim=booking_data.horario_fim,
        preco_total=preco_total,
        observacoes=booking_data.observacoes
    )
    
    await db.bookings.insert_one(booking.dict())
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_my_bookings(current_user: User = Depends(get_current_user)):
    if current_user.tipo == UserType.MORADOR:
        filter_query = {"morador_id": current_user.id}
    elif current_user.tipo == UserType.PRESTADOR:
        filter_query = {"prestador_id": current_user.id}
    else:
        filter_query = {}
    
    bookings = await db.bookings.find(filter_query).to_list(length=100)
    return [Booking(**booking) for booking in bookings]

@api_router.patch("/bookings/{booking_id}", response_model=Booking)
async def update_booking(booking_id: str, booking_update: BookingUpdate, current_user: User = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    # Check permissions
    if current_user.tipo == UserType.PRESTADOR and current_user.id != booking["prestador_id"]:
        raise HTTPException(status_code=403, detail="Sem permissão para alterar este agendamento")
    elif current_user.tipo == UserType.MORADOR and current_user.id != booking["morador_id"]:
        raise HTTPException(status_code=403, detail="Sem permissão para alterar este agendamento")
    
    # Update booking
    update_data = {"status": booking_update.status, "updated_at": datetime.utcnow()}
    await db.bookings.update_one({"id": booking_id}, {"$set": update_data})
    
    updated_booking = await db.bookings.find_one({"id": booking_id})
    return Booking(**updated_booking)

# Review routes
@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, current_user: User = Depends(get_current_user)):
    if current_user.tipo != UserType.MORADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas moradores podem avaliar serviços"
        )
    
    # Get booking info
    booking = await db.bookings.find_one({"id": review_data.booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    if booking["morador_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para avaliar este agendamento")
    
    if booking["status"] != BookingStatus.CONCLUIDO:
        raise HTTPException(status_code=400, detail="Só é possível avaliar serviços concluídos")
    
    # Check if review already exists
    existing_review = await db.reviews.find_one({"booking_id": review_data.booking_id})
    if existing_review:
        raise HTTPException(status_code=400, detail="Agendamento já foi avaliado")
    
    review = Review(
        booking_id=review_data.booking_id,
        morador_id=current_user.id,
        prestador_id=booking["prestador_id"],
        service_id=booking["service_id"],
        rating=review_data.rating,
        comentario=review_data.comentario
    )
    
    await db.reviews.insert_one(review.dict())
    
    # Update service average rating
    await update_service_rating(booking["service_id"])
    
    return review

async def update_service_rating(service_id: str):
    """Update service average rating based on all reviews"""
    reviews = await db.reviews.find({"service_id": service_id}).to_list(length=1000)
    if reviews:
        total_rating = sum(review["rating"] for review in reviews)
        avg_rating = total_rating / len(reviews)
        
        await db.services.update_one(
            {"id": service_id},
            {"$set": {
                "media_avaliacoes": round(avg_rating, 1),
                "total_avaliacoes": len(reviews),
                "updated_at": datetime.utcnow()
            }}
        )

@api_router.get("/services/{service_id}/reviews", response_model=List[Review])
async def get_service_reviews(service_id: str):
    reviews = await db.reviews.find({"service_id": service_id}).to_list(length=100)
    return [Review(**review) for review in reviews]

# Stats routes (for admin dashboard)
@api_router.get("/stats/overview")
async def get_stats_overview(current_user: User = Depends(get_current_user)):
    if current_user.tipo != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Acesso restrito a administradores")
    
    total_users = await db.users.count_documents({})
    total_moradores = await db.users.count_documents({"tipo": UserType.MORADOR})
    total_prestadores = await db.users.count_documents({"tipo": UserType.PRESTADOR})
    total_services = await db.services.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    total_reviews = await db.reviews.count_documents({})
    
    return {
        "total_users": total_users,
        "total_moradores": total_moradores,
        "total_prestadores": total_prestadores,
        "total_services": total_services,
        "total_bookings": total_bookings,
        "total_reviews": total_reviews
    }

# Payment routes
@api_router.post("/payments/pix", response_model=PaymentResponse)
async def create_pix_payment(
    payment_request: PIXPaymentRequest, 
    current_user: User = Depends(get_current_user)
):
    """Create PIX payment for a booking"""
    try:
        # Get booking information
        booking = await db.bookings.find_one({"id": payment_request.booking_id})
        if not booking:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado")
        
        # Verify user owns the booking
        if current_user.id != booking["morador_id"]:
            raise HTTPException(status_code=403, detail="Sem permissão para pagar este agendamento")
        
        # Check if payment already exists
        existing_payment = await db.payments.find_one({"booking_id": payment_request.booking_id})
        if existing_payment:
            raise HTTPException(status_code=400, detail="Pagamento já existe para este agendamento")
        
        # Check if we're in test mode (demo mode for limitations)
        demo_mode = True  # Enable demo mode due to test credential limitations
        
        if demo_mode:
            # Create simulated PIX payment for demo
            payment_id = str(uuid.uuid4())
            expiration_date = datetime.utcnow() + timedelta(minutes=30)
            
            # Generate a simple demo QR code (base64 encoded placeholder)
            demo_qr_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            demo_qr_code = f"00020126910014br.gov.bcb.pix2569demo.pix.com.br/qr/v2/cobv/{payment_id}5204000053039865406{booking['preco_total']:.2f}5802BR5913Demo PIX Test6008BRASILIA62070503***6304"
            
            # Store payment in database
            payment_record = {
                "id": str(uuid.uuid4()),
                "mercado_pago_id": payment_id,
                "booking_id": payment_request.booking_id,
                "user_id": current_user.id,
                "amount": booking["preco_total"],
                "payment_method": "pix",
                "status": "pending",
                "qr_code": demo_qr_code,
                "qr_code_base64": demo_qr_base64,
                "expiration_date": expiration_date.isoformat(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "demo_mode": True
            }
            
            await db.payments.insert_one(payment_record)
            
            # Schedule automatic approval after 30 seconds for demo
            import asyncio
            asyncio.create_task(auto_approve_demo_payment(payment_id, 30))
            
            return PaymentResponse(
                payment_id=payment_id,
                status="pending",
                payment_method="pix",
                amount=booking["preco_total"],
                qr_code=demo_qr_code,
                qr_code_base64=demo_qr_base64,
                expiration_date=expiration_date.isoformat()
            )
        
        else:
            # Original Mercado Pago implementation (kept for when credentials are upgraded)
            mp_sdk = get_mercado_pago_sdk()
            expiration_date = datetime.utcnow() + timedelta(minutes=30)
            
            payment_data = {
                "transaction_amount": booking["preco_total"],
                "description": f"Pagamento de serviço - Agendamento #{booking['id'][:8]}",
                "external_reference": f"booking_{booking['id']}",
                "payment_method_id": "pix",
                "date_of_expiration": expiration_date.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
                "payer": {
                    "email": payment_request.payer_email,
                    "first_name": payment_request.payer_name,
                    "identification": {
                        "type": payment_request.payer_identification_type,
                        "number": payment_request.payer_identification
                    }
                }
            }
            
            result = mp_sdk.payment().create(payment_data)
            
            if result["status"] == 201:
                payment = result["response"]
                
                payment_record = {
                    "id": str(uuid.uuid4()),
                    "mercado_pago_id": str(payment["id"]),
                    "booking_id": payment_request.booking_id,
                    "user_id": current_user.id,
                    "amount": payment["transaction_amount"],
                    "payment_method": "pix",
                    "status": payment["status"],
                    "qr_code": payment["point_of_interaction"]["transaction_data"]["qr_code"],
                    "qr_code_base64": payment["point_of_interaction"]["transaction_data"]["qr_code_base64"],
                    "expiration_date": payment["date_of_expiration"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                await db.payments.insert_one(payment_record)
                
                return PaymentResponse(
                    payment_id=str(payment["id"]),
                    status=payment["status"],
                    payment_method="pix",
                    amount=payment["transaction_amount"],
                    qr_code=payment["point_of_interaction"]["transaction_data"]["qr_code"],
                    qr_code_base64=payment["point_of_interaction"]["transaction_data"]["qr_code_base64"],
                    expiration_date=payment["date_of_expiration"]
                )
            else:
                error_message = result.get("response", {}).get("message", "Erro desconhecido")
                raise HTTPException(status_code=400, detail=f"Falha ao criar pagamento PIX: {error_message}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar pagamento PIX: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.post("/payments/credit-card", response_model=PaymentResponse)
async def create_credit_card_payment(
    payment_request: CreditCardPaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """Create credit card payment for a booking"""
    try:
        # Get booking information
        booking = await db.bookings.find_one({"id": payment_request.booking_id})
        if not booking:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado")
        
        # Verify user owns the booking
        if current_user.id != booking["morador_id"]:
            raise HTTPException(status_code=403, detail="Sem permissão para pagar este agendamento")
        
        # Check if payment already exists
        existing_payment = await db.payments.find_one({"booking_id": payment_request.booking_id})
        if existing_payment:
            raise HTTPException(status_code=400, detail="Pagamento já existe para este agendamento")
        
        # Get Mercado Pago SDK
        mp_sdk = get_mercado_pago_sdk()
        
        # Create payment data
        payment_data = {
            "transaction_amount": booking["preco_total"],
            "token": payment_request.card_token,
            "description": f"Pagamento de serviço - Agendamento #{booking['id'][:8]}",
            "external_reference": f"booking_{booking['id']}",
            "installments": payment_request.installments,
            "payer": {
                "email": payment_request.payer_email,
                "identification": {
                    "type": payment_request.payer_identification_type,
                    "number": payment_request.payer_identification
                },
                "first_name": payment_request.payer_name
            }
        }
        
        # Create payment with Mercado Pago
        result = mp_sdk.payment().create(payment_data)
        
        if result["status"] == 201:
            payment = result["response"]
            
            # Store payment in database
            payment_record = {
                "id": str(uuid.uuid4()),
                "mercado_pago_id": str(payment["id"]),
                "booking_id": payment_request.booking_id,
                "user_id": current_user.id,
                "amount": payment["transaction_amount"],
                "payment_method": "credit_card",
                "status": payment["status"],
                "installments": payment.get("installments", 1),
                "card_last_four": payment.get("card", {}).get("last_four_digits"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await db.payments.insert_one(payment_record)
            
            return PaymentResponse(
                payment_id=str(payment["id"]),
                status=payment["status"],
                payment_method="credit_card",
                amount=payment["transaction_amount"],
                installments=payment.get("installments", 1)
            )
        else:
            error_message = result.get("response", {}).get("message", "Erro desconhecido")
            raise HTTPException(status_code=400, detail=f"Falha ao criar pagamento: {error_message}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar pagamento com cartão: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.get("/payments/{payment_id}/status")
async def get_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get payment status from Mercado Pago or demo mode"""
    try:
        # Get payment from database
        payment = await db.payments.find_one({"mercado_pago_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Pagamento não encontrado")
        
        # Verify user owns the payment
        if current_user.id != payment["user_id"]:
            raise HTTPException(status_code=403, detail="Sem permissão para visualizar este pagamento")
        
        # Check if this is a demo payment
        if payment.get("demo_mode", False):
            # For demo payments, return status from database
            return {
                "payment_id": payment_id,
                "status": payment["status"],
                "status_detail": "Demo payment - auto processed",
                "amount": payment["amount"],
                "payment_method": payment["payment_method"]
            }
        else:
            # Get latest status from Mercado Pago for real payments
            mp_sdk = get_mercado_pago_sdk()
            result = mp_sdk.payment().get(payment_id)
            
            if result["status"] == 200:
                mp_payment = result["response"]
                
                # Update status in database if changed
                if mp_payment["status"] != payment["status"]:
                    await db.payments.update_one(
                        {"mercado_pago_id": payment_id},
                        {
                            "$set": {
                                "status": mp_payment["status"],
                                "updated_at": datetime.utcnow()
                            }
                        }
                    )
                
                return {
                    "payment_id": payment_id,
                    "status": mp_payment["status"],
                    "status_detail": mp_payment.get("status_detail"),
                    "amount": mp_payment["transaction_amount"],
                    "payment_method": payment["payment_method"]
                }
            else:
                raise HTTPException(status_code=400, detail="Erro ao consultar status do pagamento")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao consultar status do pagamento: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.post("/webhooks/mercadopago")
async def handle_mercadopago_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """Handle Mercado Pago webhook notifications"""
    try:
        # Get signature and body
        signature = request.headers.get("x-signature", "")
        body = await request.body()
        
        # Validate webhook signature (simplified for demo)
        # In production, implement proper signature validation
        
        # Parse webhook payload
        payload = json.loads(body)
        
        # Extract event information
        event_type = payload.get("type")
        data_id = payload.get("data", {}).get("id")
        
        if event_type == "payment":
            # Process payment webhook in background
            background_tasks.add_task(process_payment_webhook, data_id)
        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Erro ao processar webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao processar webhook")

async def process_payment_webhook(payment_id: str):
    """Process payment webhook notification"""
    try:
        # Get payment from Mercado Pago
        mp_sdk = get_mercado_pago_sdk()
        result = mp_sdk.payment().get(payment_id)
        
        if result["status"] == 200:
            payment_data = result["response"]
            
            # Update payment status in database
            await db.payments.update_one(
                {"mercado_pago_id": str(payment_id)},
                {
                    "$set": {
                        "status": payment_data["status"],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # If payment is approved, update booking status
            if payment_data["status"] == "approved":
                payment_record = await db.payments.find_one({"mercado_pago_id": str(payment_id)})
                if payment_record:
                    await db.bookings.update_one(
                        {"id": payment_record["booking_id"]},
                        {
                            "$set": {
                                "payment_status": "paid",
                                "updated_at": datetime.utcnow()
                            }
                        }
                    )
            
            logger.info(f"Pagamento {payment_id} atualizado para status {payment_data['status']}")
        else:
            logger.error(f"Erro ao buscar pagamento {payment_id} no Mercado Pago")
            
    except Exception as e:
        logger.error(f"Erro ao processar webhook do pagamento: {str(e)}")

@api_router.get("/mercadopago/public-key")
async def get_mercadopago_public_key():
    """Get Mercado Pago public key for frontend"""
    if not MERCADO_PAGO_PUBLIC_KEY:
        raise HTTPException(status_code=500, detail="Mercado Pago não configurado")
    
    return {"public_key": MERCADO_PAGO_PUBLIC_KEY}

# Geolocation and Map routes
@api_router.put("/users/location")
async def update_user_location(
    latitude: float,
    longitude: float,
    current_user: User = Depends(get_current_user)
):
    """Update user location coordinates"""
    try:
        await db.users.update_one(
            {"id": current_user.id},
            {
                "$set": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Localização atualizada com sucesso"}
    except Exception as e:
        logger.error(f"Erro ao atualizar localização: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar localização")

@api_router.put("/users/availability")
async def update_availability(
    disponivel: bool,
    current_user: User = Depends(get_current_user)
):
    """Update service provider availability"""
    if current_user.tipo != UserType.PRESTADOR:
        raise HTTPException(status_code=403, detail="Apenas prestadores podem alterar disponibilidade")
    
    try:
        await db.users.update_one(
            {"id": current_user.id},
            {
                "$set": {
                    "disponivel": disponivel,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": f"Disponibilidade alterada para {'disponível' if disponivel else 'indisponível'}"}
    except Exception as e:
        logger.error(f"Erro ao atualizar disponibilidade: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar disponibilidade")

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates using Haversine formula"""
    from math import radians, cos, sin, asin, sqrt
    
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    
    return c * r

@api_router.get("/map/providers-nearby")
async def get_nearby_providers(
    latitude: float,
    longitude: float,
    radius_km: float = 10.0,
    categoria: Optional[str] = None,  
    current_user: User = Depends(get_current_user)
):
    """Get nearby service providers with their services"""
    try:
        # Get all available service providers
        providers_query = {
            "tipo": UserType.PRESTADOR,
            "ativo": True,
            "disponivel": True,
            "latitude": {"$ne": None},
            "longitude": {"$ne": None}
        }
        
        providers = await db.users.find(providers_query).to_list(length=100)
        
        nearby_providers = []
        
        for provider in providers:
            # Calculate distance
            distance = calculate_distance(
                latitude, longitude,
                provider["latitude"], provider["longitude"]
            )
            
            if distance <= radius_km:
                # Get provider's services
                services_query = {"prestador_id": provider["id"], "status": ServiceStatus.DISPONIVEL}
                if categoria:
                    services_query["categoria"] = categoria
                
                services = await db.services.find(services_query).to_list(length=100)
                
                if services:  # Only include providers who have services
                    provider_data = {
                        "provider_id": provider["id"],
                        "nome": provider["nome"],
                        "telefone": provider["telefone"],
                        "latitude": provider["latitude"],
                        "longitude": provider["longitude"],
                        "distance_km": round(distance, 2),
                        "estimated_time_min": max(5, int(distance * 3)),  # 3 min per km, min 5 min
                        "services": [
                            {
                                "id": service["id"],
                                "nome": service["nome"],
                                "categoria": service["categoria"],
                                "preco_por_hora": service["preco_por_hora"],
                                "media_avaliacoes": service.get("media_avaliacoes", 0),
                                "total_avaliacoes": service.get("total_avaliacoes", 0)
                            }
                            for service in services
                        ]
                    }
                    nearby_providers.append(provider_data)
        
        # Sort by distance
        nearby_providers.sort(key=lambda x: x["distance_km"])
        
        return {
            "providers": nearby_providers,
            "total": len(nearby_providers)
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar prestadores próximos: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar prestadores próximos")

# Chat routes for negotiations
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    sender_id: str
    sender_name: str
    message: str
    message_type: str = "text"  # text, service_request, price_offer
    service_id: Optional[str] = None
    proposed_price: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

@api_router.post("/chat/conversations")
async def create_conversation(
    provider_id: str,
    service_id: str,
    initial_message: str,
    current_user: User = Depends(get_current_user)
):
    """Create a new chat conversation for service negotiation"""
    try:
        # Verify provider exists
        provider = await db.users.find_one({"id": provider_id, "tipo": UserType.PRESTADOR})
        if not provider:
            raise HTTPException(status_code=404, detail="Prestador não encontrado")
        
        # Verify service exists
        service = await db.services.find_one({"id": service_id, "prestador_id": provider_id})
        if not service:
            raise HTTPException(status_code=404, detail="Serviço não encontrado")
        
        # Create conversation
        conversation_id = str(uuid.uuid4())
        
        conversation = {
            "id": conversation_id,
            "morador_id": current_user.id,
            "prestador_id": provider_id,
            "service_id": service_id,
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.conversations.insert_one(conversation)
        
        # Create initial message
        message = ChatMessage(
            conversation_id=conversation_id,
            sender_id=current_user.id,
            sender_name=current_user.nome,
            message=initial_message,
            service_id=service_id
        )
        
        await db.chat_messages.insert_one(message.dict())
        
        return {
            "conversation_id": conversation_id,
            "message": "Conversa iniciada com sucesso",
            "service": {
                "nome": service["nome"],
                "preco_por_hora": service["preco_por_hora"]
            },
            "provider": {
                "nome": provider["nome"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar conversa: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao criar conversa")

@api_router.get("/chat/conversations")
async def get_user_conversations(current_user: User = Depends(get_current_user)):
    """Get user's chat conversations"""
    try:
        query = {
            "$or": [
                {"morador_id": current_user.id},
                {"prestador_id": current_user.id}
            ]
        }
        
        conversations = await db.conversations.find(query).sort("updated_at", -1).to_list(length=100)
        
        result = []
        for conv in conversations:
            # Get last message
            last_message = await db.chat_messages.find_one(
                {"conversation_id": conv["id"]}, 
                sort=[("created_at", -1)]
            )
            
            # Get other participant info
            other_user_id = conv["prestador_id"] if current_user.id == conv["morador_id"] else conv["morador_id"]
            other_user = await db.users.find_one({"id": other_user_id})
            
            # Get service info
            service = await db.services.find_one({"id": conv["service_id"]})
            
            if other_user and service:
                result.append({
                    "conversation_id": conv["id"],
                    "other_user": {
                        "id": other_user["id"],
                        "nome": other_user["nome"],
                        "tipo": other_user["tipo"]
                    },
                    "service": {
                        "id": service["id"],
                        "nome": service["nome"],
                        "categoria": service["categoria"]
                    },
                    "last_message": {
                        "message": last_message["message"] if last_message else "",
                        "created_at": last_message["created_at"] if last_message else conv["created_at"]
                    },
                    "status": conv["status"]
                })
        
        return {"conversations": result}
        
    except Exception as e:
        logger.error(f"Erro ao buscar conversas: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar conversas")

@api_router.get("/chat/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get messages from a conversation"""
    try:
        # Verify user is part of conversation
        conversation = await db.conversations.find_one({
            "id": conversation_id,
            "$or": [
                {"morador_id": current_user.id},
                {"prestador_id": current_user.id}
            ]
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversa não encontrada")
        
        messages = await db.chat_messages.find(
            {"conversation_id": conversation_id}
        ).sort("created_at", 1).to_list(length=1000)
        
        return {
            "messages": [ChatMessage(**msg) for msg in messages],
            "conversation_id": conversation_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar mensagens: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar mensagens")

@api_router.post("/chat/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    message: str,
    message_type: str = "text",
    proposed_price: Optional[float] = None,
    current_user: User = Depends(get_current_user)
):
    """Send a message in a conversation"""
    try:
        # Verify user is part of conversation
        conversation = await db.conversations.find_one({
            "id": conversation_id,
            "$or": [
                {"morador_id": current_user.id},
                {"prestador_id": current_user.id}
            ]
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversa não encontrada")
        
        # Create message
        chat_message = ChatMessage(
            conversation_id=conversation_id,
            sender_id=current_user.id,
            sender_name=current_user.nome,
            message=message,
            message_type=message_type,
            proposed_price=proposed_price
        )
        
        await db.chat_messages.insert_one(chat_message.dict())
        
        # Update conversation timestamp
        await db.conversations.update_one(
            {"id": conversation_id},
            {"$set": {"updated_at": datetime.utcnow()}}
        )
        
        return {"message": "Mensagem enviada com sucesso", "chat_message": chat_message}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao enviar mensagem")

@api_router.post("/demo/populate-providers")
async def populate_demo_providers():
    """Populate database with demo service providers for testing"""
    try:
        # São Paulo coordinates for demo providers
        demo_providers = [
            {
                "id": str(uuid.uuid4()),
                "email": "joao.limpeza@demo.com",
                "cpf": "11111111111",
                "nome": "João Silva - Limpeza",
                "telefone": "(11) 99999-1111",
                "endereco": "Vila Madalena, São Paulo",
                "tipo": "prestador",
                "latitude": -23.5505,
                "longitude": -46.6833,
                "disponivel": True,
                "ativo": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "maria.eletrica@demo.com", 
                "cpf": "22222222222",
                "nome": "Maria Santos - Elétrica",
                "telefone": "(11) 99999-2222",
                "endereco": "Pinheiros, São Paulo",
                "tipo": "prestador",
                "latitude": -23.5616,
                "longitude": -46.6731,
                "disponivel": True,
                "ativo": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "carlos.jardinagem@demo.com",
                "cpf": "33333333333", 
                "nome": "Carlos Oliveira - Jardim",
                "telefone": "(11) 99999-3333",
                "endereco": "Jardim Paulista, São Paulo",
                "tipo": "prestador",
                "latitude": -23.5729,
                "longitude": -46.6565,
                "disponivel": True,
                "ativo": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "ana.pintura@demo.com",
                "cpf": "44444444444",
                "nome": "Ana Costa - Pintura", 
                "telefone": "(11) 99999-4444",
                "endereco": "Itaim Bibi, São Paulo",
                "tipo": "prestador",
                "latitude": -23.5900,
                "longitude": -46.6782,
                "disponivel": True,
                "ativo": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "pedro.encanamento@demo.com",
                "cpf": "55555555555",
                "nome": "Pedro Lima - Encanamento",
                "telefone": "(11) 99999-5555", 
                "endereco": "Moema, São Paulo",
                "tipo": "prestador",
                "latitude": -23.6104,
                "longitude": -46.6628,
                "disponivel": True,
                "ativo": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]

        # Add password hash to each provider
        hashed_password = get_password_hash("demo123")
        for provider in demo_providers:
            provider["password"] = hashed_password

        # Insert providers
        await db.users.insert_many(demo_providers)

        # Create demo services for each provider
        demo_services = [
            {
                "id": str(uuid.uuid4()),
                "prestador_id": demo_providers[0]["id"],
                "nome": "Limpeza Residencial Completa",
                "descricao": "Limpeza completa de residências, incluindo banheiros, cozinha e quartos",
                "categoria": "limpeza",
                "preco_por_hora": 45.0,
                "disponibilidade": ["segunda", "terca", "quarta", "quinta", "sexta"],
                "horario_inicio": "08:00",
                "horario_fim": "17:00",
                "status": "disponivel",
                "avaliacoes": [],
                "media_avaliacoes": 4.8,
                "total_avaliacoes": 23,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "prestador_id": demo_providers[1]["id"],
                "nome": "Instalação e Reparo Elétrico",
                "descricao": "Instalação de tomadas, interruptores, luminárias e reparo de problemas elétricos",
                "categoria": "eletrica",
                "preco_por_hora": 80.0,
                "disponibilidade": ["segunda", "terca", "quarta", "quinta", "sexta"],
                "horario_inicio": "08:00",
                "horario_fim": "18:00",
                "status": "disponivel",
                "avaliacoes": [],
                "media_avaliacoes": 4.9,
                "total_avaliacoes": 31,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "prestador_id": demo_providers[2]["id"],
                "nome": "Jardinagem e Paisagismo",
                "descricao": "Cuidado de jardins, poda de plantas, plantio e manutenção de áreas verdes",
                "categoria": "jardinagem",
                "preco_por_hora": 55.0,
                "disponibilidade": ["terca", "quarta", "quinta", "sexta", "sabado"],
                "horario_inicio": "07:00",
                "horario_fim": "16:00",
                "status": "disponivel",
                "avaliacoes": [],
                "media_avaliacoes": 4.7,
                "total_avaliacoes": 18,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "prestador_id": demo_providers[3]["id"],
                "nome": "Pintura Residencial",
                "descricao": "Pintura interna e externa, textura, verniz e acabamentos especiais",
                "categoria": "pintura",
                "preco_por_hora": 65.0,
                "disponibilidade": ["segunda", "terca", "quarta", "quinta", "sexta"],
                "horario_inicio": "08:00",
                "horario_fim": "17:00",
                "status": "disponivel",
                "avaliacoes": [],
                "media_avaliacoes": 4.6,
                "total_avaliacoes": 15,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "prestador_id": demo_providers[4]["id"],
                "nome": "Encanamento e Hidráulica",
                "descricao": "Reparo de vazamentos, instalação de torneiras, desentupimento e manutenção hidráulica",
                "categoria": "encanamento",
                "preco_por_hora": 75.0,
                "disponibilidade": ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"],
                "horario_inicio": "08:00",
                "horario_fim": "18:00",
                "status": "disponivel",
                "avaliacoes": [],
                "media_avaliacoes": 4.8,
                "total_avaliacoes": 27,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]

        await db.services.insert_many(demo_services)

        return {
            "message": "Dados demo criados com sucesso!",
            "providers_created": len(demo_providers),
            "services_created": len(demo_services)
        }

    except Exception as e:
        logger.error(f"Erro ao criar dados demo: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao criar dados demo")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()