#!/usr/bin/env python3
"""
Comprehensive Backend Tests for Alça Hub
Testing all authentication, services, bookings, and reviews functionality
"""

import requests
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://service-hub-50.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE_URL}")

class AlcaHubTester:
    def __init__(self):
        self.session = requests.Session()
        self.morador_token = None
        self.prestador_token = None
        self.service_id = None
        self.booking_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def test_user_registration(self):
        """Test user registration for both morador and prestador"""
        print("\n=== TESTING USER REGISTRATION ===")
        
        # Test morador registration
        morador_data = {
            "email": "maria.silva@email.com",
            "password": "senha123",
            "cpf": "12345678901",
            "nome": "Maria Silva",
            "telefone": "(11) 99999-1234",
            "endereco": "Rua das Flores, 123 - Apt 45",
            "tipo": "morador"
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/auth/register", json=morador_data)
            if response.status_code == 200:
                data = response.json()
                self.morador_token = data['access_token']
                self.log_test("Morador Registration", True, f"User ID: {data['user']['id']}")
            else:
                self.log_test("Morador Registration", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Morador Registration", False, f"Exception: {str(e)}")
            
        # Test prestador registration
        prestador_data = {
            "email": "joao.santos@email.com",
            "password": "senha456",
            "cpf": "98765432109",
            "nome": "João Santos",
            "telefone": "(11) 88888-5678",
            "endereco": "Av. Principal, 456 - Casa 2",
            "tipo": "prestador"
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/auth/register", json=prestador_data)
            if response.status_code == 200:
                data = response.json()
                self.prestador_token = data['access_token']
                self.log_test("Prestador Registration", True, f"User ID: {data['user']['id']}")
            else:
                self.log_test("Prestador Registration", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Prestador Registration", False, f"Exception: {str(e)}")
            
    def test_user_login(self):
        """Test user login functionality"""
        print("\n=== TESTING USER LOGIN ===")
        
        # Test morador login
        login_data = {
            "email": "maria.silva@email.com",
            "password": "senha123"
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                if not self.morador_token:  # If registration failed, get token from login
                    self.morador_token = data['access_token']
                self.log_test("Morador Login", True, f"Token received, User: {data['user']['nome']}")
            else:
                self.log_test("Morador Login", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Morador Login", False, f"Exception: {str(e)}")
            
        # Test prestador login
        login_data = {
            "email": "joao.santos@email.com",
            "password": "senha456"
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                if not self.prestador_token:  # If registration failed, get token from login
                    self.prestador_token = data['access_token']
                self.log_test("Prestador Login", True, f"Token received, User: {data['user']['nome']}")
            else:
                self.log_test("Prestador Login", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Prestador Login", False, f"Exception: {str(e)}")
            
    def test_jwt_verification(self):
        """Test JWT token verification"""
        print("\n=== TESTING JWT VERIFICATION ===")
        
        if self.morador_token:
            headers = {"Authorization": f"Bearer {self.morador_token}"}
            try:
                response = self.session.get(f"{API_BASE_URL}/auth/me", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("JWT Verification (Morador)", True, f"User: {data['nome']}, Type: {data['tipo']}")
                else:
                    self.log_test("JWT Verification (Morador)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("JWT Verification (Morador)", False, f"Exception: {str(e)}")
        else:
            self.log_test("JWT Verification (Morador)", False, "No morador token available")
            
        if self.prestador_token:
            headers = {"Authorization": f"Bearer {self.prestador_token}"}
            try:
                response = self.session.get(f"{API_BASE_URL}/auth/me", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("JWT Verification (Prestador)", True, f"User: {data['nome']}, Type: {data['tipo']}")
                else:
                    self.log_test("JWT Verification (Prestador)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("JWT Verification (Prestador)", False, f"Exception: {str(e)}")
        else:
            self.log_test("JWT Verification (Prestador)", False, "No prestador token available")
            
    def test_service_creation(self):
        """Test service creation by prestador"""
        print("\n=== TESTING SERVICE CREATION ===")
        
        if not self.prestador_token:
            self.log_test("Service Creation", False, "No prestador token available")
            return
            
        service_data = {
            "nome": "Limpeza Residencial Completa",
            "descricao": "Serviço completo de limpeza residencial incluindo todos os cômodos, banheiros, cozinha e área de serviço. Produtos de limpeza inclusos.",
            "categoria": "Limpeza",
            "preco_por_hora": 35.0,
            "disponibilidade": ["segunda", "terca", "quarta", "quinta", "sexta"],
            "horario_inicio": "08:00",
            "horario_fim": "17:00"
        }
        
        headers = {"Authorization": f"Bearer {self.prestador_token}"}
        
        try:
            response = self.session.post(f"{API_BASE_URL}/services", json=service_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.service_id = data['id']
                self.log_test("Service Creation", True, f"Service ID: {self.service_id}, Name: {data['nome']}")
            else:
                self.log_test("Service Creation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Service Creation", False, f"Exception: {str(e)}")
            
    def test_service_listing(self):
        """Test service listing"""
        print("\n=== TESTING SERVICE LISTING ===")
        
        try:
            response = self.session.get(f"{API_BASE_URL}/services")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Service Listing", True, f"Found {len(data)} services")
                if data and len(data) > 0:
                    print(f"   First service: {data[0]['nome']} - R${data[0]['preco_por_hora']}/hora")
            else:
                self.log_test("Service Listing", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Service Listing", False, f"Exception: {str(e)}")
            
    def test_service_detail(self):
        """Test getting specific service details"""
        print("\n=== TESTING SERVICE DETAIL ===")
        
        if not self.service_id:
            self.log_test("Service Detail", False, "No service ID available")
            return
            
        try:
            response = self.session.get(f"{API_BASE_URL}/services/{self.service_id}")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Service Detail", True, f"Service: {data['nome']}, Category: {data['categoria']}")
            else:
                self.log_test("Service Detail", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Service Detail", False, f"Exception: {str(e)}")
            
    def test_booking_creation(self):
        """Test booking creation by morador"""
        print("\n=== TESTING BOOKING CREATION ===")
        
        if not self.morador_token:
            self.log_test("Booking Creation", False, "No morador token available")
            return
            
        if not self.service_id:
            self.log_test("Booking Creation", False, "No service ID available")
            return
            
        # Schedule for tomorrow
        tomorrow = datetime.now() + timedelta(days=1)
        
        booking_data = {
            "service_id": self.service_id,
            "data_agendamento": tomorrow.isoformat(),
            "horario_inicio": "09:00",
            "horario_fim": "12:00",
            "observacoes": "Apartamento de 3 quartos, precisa de atenção especial na cozinha"
        }
        
        headers = {"Authorization": f"Bearer {self.morador_token}"}
        
        try:
            response = self.session.post(f"{API_BASE_URL}/bookings", json=booking_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.booking_id = data['id']
                self.log_test("Booking Creation", True, f"Booking ID: {self.booking_id}, Total: R${data['preco_total']}")
            else:
                self.log_test("Booking Creation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Booking Creation", False, f"Exception: {str(e)}")
            
    def test_booking_listing(self):
        """Test booking listing for both morador and prestador"""
        print("\n=== TESTING BOOKING LISTING ===")
        
        # Test morador bookings
        if self.morador_token:
            headers = {"Authorization": f"Bearer {self.morador_token}"}
            try:
                response = self.session.get(f"{API_BASE_URL}/bookings", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("Morador Booking Listing", True, f"Found {len(data)} bookings")
                else:
                    self.log_test("Morador Booking Listing", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Morador Booking Listing", False, f"Exception: {str(e)}")
        else:
            self.log_test("Morador Booking Listing", False, "No morador token available")
            
        # Test prestador bookings
        if self.prestador_token:
            headers = {"Authorization": f"Bearer {self.prestador_token}"}
            try:
                response = self.session.get(f"{API_BASE_URL}/bookings", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("Prestador Booking Listing", True, f"Found {len(data)} bookings")
                else:
                    self.log_test("Prestador Booking Listing", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Prestador Booking Listing", False, f"Exception: {str(e)}")
        else:
            self.log_test("Prestador Booking Listing", False, "No prestador token available")
            
    def test_booking_status_update(self):
        """Test booking status updates"""
        print("\n=== TESTING BOOKING STATUS UPDATE ===")
        
        if not self.prestador_token:
            self.log_test("Booking Status Update", False, "No prestador token available")
            return
            
        if not self.booking_id:
            self.log_test("Booking Status Update", False, "No booking ID available")
            return
            
        # Test status progression: pendente -> confirmado -> em_andamento -> concluido
        statuses = ["confirmado", "em_andamento", "concluido"]
        
        headers = {"Authorization": f"Bearer {self.prestador_token}"}
        
        for status in statuses:
            update_data = {"status": status}
            try:
                response = self.session.patch(f"{API_BASE_URL}/bookings/{self.booking_id}", 
                                            json=update_data, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    self.log_test(f"Update Status to {status}", True, f"New status: {data['status']}")
                else:
                    self.log_test(f"Update Status to {status}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Update Status to {status}", False, f"Exception: {str(e)}")
                
    def test_review_creation(self):
        """Test review creation after booking completion"""
        print("\n=== TESTING REVIEW CREATION ===")
        
        if not self.morador_token:
            self.log_test("Review Creation", False, "No morador token available")
            return
            
        if not self.booking_id:
            self.log_test("Review Creation", False, "No booking ID available")
            return
            
        review_data = {
            "booking_id": self.booking_id,
            "rating": 5,
            "comentario": "Excelente serviço! João foi muito profissional e deixou o apartamento impecável. Recomendo!"
        }
        
        headers = {"Authorization": f"Bearer {self.morador_token}"}
        
        try:
            response = self.session.post(f"{API_BASE_URL}/reviews", json=review_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Review Creation", True, f"Review ID: {data['id']}, Rating: {data['rating']}/5")
            else:
                self.log_test("Review Creation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Review Creation", False, f"Exception: {str(e)}")
            
    def test_service_reviews(self):
        """Test getting reviews for a service"""
        print("\n=== TESTING SERVICE REVIEWS ===")
        
        if not self.service_id:
            self.log_test("Service Reviews", False, "No service ID available")
            return
            
        try:
            response = self.session.get(f"{API_BASE_URL}/services/{self.service_id}/reviews")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Service Reviews", True, f"Found {len(data)} reviews")
                if data and len(data) > 0:
                    print(f"   Latest review: {data[0]['rating']}/5 - {data[0]['comentario'][:50]}...")
            else:
                self.log_test("Service Reviews", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Service Reviews", False, f"Exception: {str(e)}")

    def test_mercadopago_public_key(self):
        """Test getting Mercado Pago public key"""
        print("\n=== TESTING MERCADO PAGO PUBLIC KEY ===")
        
        try:
            response = self.session.get(f"{API_BASE_URL}/mercadopago/public-key")
            if response.status_code == 200:
                data = response.json()
                if 'public_key' in data and data['public_key']:
                    self.log_test("Mercado Pago Public Key", True, f"Key: {data['public_key'][:20]}...")
                else:
                    self.log_test("Mercado Pago Public Key", False, "No public key in response")
            else:
                self.log_test("Mercado Pago Public Key", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Mercado Pago Public Key", False, f"Exception: {str(e)}")

    def test_pix_payment_creation(self):
        """Test PIX payment creation for a booking"""
        print("\n=== TESTING PIX PAYMENT CREATION ===")
        
        if not self.morador_token:
            self.log_test("PIX Payment Creation", False, "No morador token available")
            return
            
        if not self.booking_id:
            self.log_test("PIX Payment Creation", False, "No booking ID available")
            return
            
        payment_data = {
            "booking_id": self.booking_id,
            "payer_email": "maria.silva@email.com",
            "payer_name": "Maria Silva",
            "payer_identification": "12345678901",
            "payer_identification_type": "CPF"
        }
        
        headers = {"Authorization": f"Bearer {self.morador_token}"}
        
        try:
            response = self.session.post(f"{API_BASE_URL}/payments/pix", json=payment_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.payment_id = data.get('payment_id')
                self.log_test("PIX Payment Creation", True, 
                            f"Payment ID: {self.payment_id}, Status: {data.get('status')}, Amount: R${data.get('amount')}")
                if data.get('qr_code'):
                    print(f"   QR Code: {data['qr_code'][:50]}...")
            else:
                self.log_test("PIX Payment Creation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("PIX Payment Creation", False, f"Exception: {str(e)}")

    def test_payment_status_check(self):
        """Test payment status checking"""
        print("\n=== TESTING PAYMENT STATUS CHECK ===")
        
        if not self.morador_token:
            self.log_test("Payment Status Check", False, "No morador token available")
            return
            
        if not hasattr(self, 'payment_id') or not self.payment_id:
            self.log_test("Payment Status Check", False, "No payment ID available")
            return
            
        headers = {"Authorization": f"Bearer {self.morador_token}"}
        
        try:
            response = self.session.get(f"{API_BASE_URL}/payments/{self.payment_id}/status", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Payment Status Check", True, 
                            f"Payment ID: {data.get('payment_id')}, Status: {data.get('status')}, Amount: R${data.get('amount')}")
            else:
                self.log_test("Payment Status Check", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Payment Status Check", False, f"Exception: {str(e)}")

    def test_credit_card_payment_structure(self):
        """Test credit card payment endpoint structure (without actual payment)"""
        print("\n=== TESTING CREDIT CARD PAYMENT STRUCTURE ===")
        
        if not self.morador_token:
            self.log_test("Credit Card Payment Structure", False, "No morador token available")
            return
            
        if not self.booking_id:
            self.log_test("Credit Card Payment Structure", False, "No booking ID available")
            return
            
        # Test with invalid card token to check endpoint structure
        payment_data = {
            "booking_id": self.booking_id,
            "card_token": "test_card_token_invalid",
            "installments": 1,
            "payer_email": "maria.silva@email.com",
            "payer_name": "Maria Silva",
            "payer_identification": "12345678901",
            "payer_identification_type": "CPF"
        }
        
        headers = {"Authorization": f"Bearer {self.morador_token}"}
        
        try:
            response = self.session.post(f"{API_BASE_URL}/payments/credit-card", json=payment_data, headers=headers)
            # We expect this to fail with invalid token, but endpoint should exist
            if response.status_code in [400, 422]:  # Bad request due to invalid token
                self.log_test("Credit Card Payment Structure", True, 
                            f"Endpoint exists and validates input (Status: {response.status_code})")
            elif response.status_code == 200:
                self.log_test("Credit Card Payment Structure", True, "Endpoint working (unexpected success)")
            else:
                self.log_test("Credit Card Payment Structure", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Credit Card Payment Structure", False, f"Exception: {str(e)}")

    def test_webhook_endpoint(self):
        """Test webhook endpoint structure"""
        print("\n=== TESTING WEBHOOK ENDPOINT ===")
        
        # Test webhook with sample payload
        webhook_payload = {
            "type": "payment",
            "data": {
                "id": "test_payment_id_123"
            }
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/webhooks/mercadopago", json=webhook_payload)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'received':
                    self.log_test("Webhook Endpoint", True, "Webhook received and processed")
                else:
                    self.log_test("Webhook Endpoint", False, f"Unexpected response: {data}")
            else:
                self.log_test("Webhook Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Webhook Endpoint", False, f"Exception: {str(e)}")

    def test_payment_integration_flow(self):
        """Test complete payment integration flow"""
        print("\n=== TESTING PAYMENT INTEGRATION FLOW ===")
        
        # This is a comprehensive test that combines multiple payment operations
        flow_success = True
        flow_details = []
        
        # Step 1: Get public key
        try:
            response = self.session.get(f"{API_BASE_URL}/mercadopago/public-key")
            if response.status_code == 200:
                flow_details.append("✓ Public key retrieved")
            else:
                flow_success = False
                flow_details.append("✗ Failed to get public key")
        except Exception as e:
            flow_success = False
            flow_details.append(f"✗ Public key error: {str(e)}")
        
        # Step 2: Create PIX payment (if we have booking)
        if self.booking_id and self.morador_token:
            payment_data = {
                "booking_id": self.booking_id,
                "payer_email": "maria.silva@email.com",
                "payer_name": "Maria Silva",
                "payer_identification": "12345678901",
                "payer_identification_type": "CPF"
            }
            
            headers = {"Authorization": f"Bearer {self.morador_token}"}
            
            try:
                response = self.session.post(f"{API_BASE_URL}/payments/pix", json=payment_data, headers=headers)
                if response.status_code == 200:
                    flow_details.append("✓ PIX payment created")
                    payment_data = response.json()
                    payment_id = payment_data.get('payment_id')
                    
                    # Step 3: Check payment status
                    if payment_id:
                        try:
                            status_response = self.session.get(f"{API_BASE_URL}/payments/{payment_id}/status", headers=headers)
                            if status_response.status_code == 200:
                                flow_details.append("✓ Payment status checked")
                            else:
                                flow_success = False
                                flow_details.append("✗ Failed to check payment status")
                        except Exception as e:
                            flow_success = False
                            flow_details.append(f"✗ Status check error: {str(e)}")
                else:
                    flow_success = False
                    flow_details.append("✗ Failed to create PIX payment")
            except Exception as e:
                flow_success = False
                flow_details.append(f"✗ PIX payment error: {str(e)}")
        else:
            flow_details.append("⚠ Skipped PIX payment (no booking/token)")
        
        self.log_test("Payment Integration Flow", flow_success, "; ".join(flow_details))
            
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Alça Hub Backend Tests")
        print("=" * 50)
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_jwt_verification()
        
        # Service tests
        self.test_service_creation()
        self.test_service_listing()
        self.test_service_detail()
        
        # Booking tests
        self.test_booking_creation()
        self.test_booking_listing()
        self.test_booking_status_update()
        
        # Review tests
        self.test_review_creation()
        self.test_service_reviews()
        
        # Payment tests (Mercado Pago integration)
        self.test_mercadopago_public_key()
        self.test_pix_payment_creation()
        self.test_payment_status_check()
        self.test_credit_card_payment_structure()
        self.test_webhook_endpoint()
        self.test_payment_integration_flow()
        
        # Summary
        self.print_summary()
        
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result['success']:
                print(f"  - {result['test']}")

if __name__ == "__main__":
    tester = AlcaHubTester()
    tester.run_all_tests()