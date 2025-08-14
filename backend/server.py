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
        
        # Get Mercado Pago SDK
        mp_sdk = get_mercado_pago_sdk()
        
        # Calculate expiration (30 minutes from now)
        expiration_date = datetime.utcnow() + timedelta(minutes=30)
        
        # Create payment data
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
    """Get payment status from Mercado Pago"""
    try:
        # Get payment from database
        payment = await db.payments.find_one({"mercado_pago_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Pagamento não encontrado")
        
        # Verify user owns the payment
        if current_user.id != payment["user_id"]:
            raise HTTPException(status_code=403, detail="Sem permissão para visualizar este pagamento")
        
        # Get latest status from Mercado Pago
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