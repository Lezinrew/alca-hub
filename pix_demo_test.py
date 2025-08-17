#!/usr/bin/env python3
"""
Focused PIX Demo Mode Test for Alça Hub
Testing the complete PIX payment flow with demo auto-approval
"""

import requests
import json
import time
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import socket

# Load environment variables
load_dotenv('/app/frontend/.env')
load_dotenv()


def _is_local_env():
    node_env = (os.getenv('NODE_ENV') or '').lower()
    debug_env = (os.getenv('DEBUG') or '').lower()
    hostname = socket.gethostname().lower()
    return node_env == 'development' or debug_env in ('1', 'true', 'yes') or hostname.endswith('.local')


def _prefer_local_if_available(default_url: str) -> str:
    if _is_local_env():
        return 'http://localhost:8000'
    try:
        resp = requests.get('http://localhost:8000/ping', timeout=0.5)
        if resp.status_code == 200 and resp.json().get('message') == 'pong':
            return 'http://localhost:8000'
    except Exception:
        pass
    return default_url


def resolve_backend_url() -> str:
    forced = os.getenv('FORCE_BACKEND_URL')
    if forced:
        return forced
    fallback = os.getenv(
        'REACT_APP_BACKEND_URL',
        'https://e641a91d-99c2-4bc5-be8b-ac6dfefb7674.preview.emergentagent.com'
    )
    return _prefer_local_if_available(fallback)


BACKEND_URL = resolve_backend_url()
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing PIX Demo Mode at: {API_BASE_URL}")

class PIXDemoTester:
    def __init__(self):
        self.session = requests.Session()
        self.morador_token = None
        self.prestador_token = None
        self.service_id = None
        self.booking_id = None
        self.payment_id = None
        
    def login_users(self):
        """Login existing users"""
        print("\n=== LOGGING IN USERS ===")
        
        # Login morador
        login_data = {"email": "maria.silva@email.com", "password": "senha123"}
        response = self.session.post(f"{API_BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            self.morador_token = response.json()['access_token']
            print("✅ Morador logged in successfully")
        else:
            print(f"❌ Morador login failed: {response.status_code}")
            return False
            
        # Login prestador
        login_data = {"email": "joao.santos@email.com", "password": "senha456"}
        response = self.session.post(f"{API_BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            self.prestador_token = response.json()['access_token']
            print("✅ Prestador logged in successfully")
        else:
            print(f"❌ Prestador login failed: {response.status_code}")
            return False
            
        return True
        
    def get_service(self):
        """Get an existing service"""
        print("\n=== GETTING SERVICE ===")
        
        response = self.session.get(f"{API_BASE_URL}/services")
        if response.status_code == 200:
            services = response.json()
            if services:
                self.service_id = services[0]['id']
                print(f"✅ Using service: {services[0]['nome']} (ID: {self.service_id})")
                return True
            else:
                print("❌ No services available")
                return False
        else:
            print(f"❌ Failed to get services: {response.status_code}")
            return False
            
    def create_booking(self):
        """Create a new booking for payment testing"""
        print("\n=== CREATING BOOKING ===")
        
        if not self.morador_token or not self.service_id:
            print("❌ Missing morador token or service ID")
            return False
            
        tomorrow = datetime.now() + timedelta(days=1)
        booking_data = {
            "service_id": self.service_id,
            "data_agendamento": tomorrow.isoformat(),
            "horario_inicio": "10:00",
            "horario_fim": "13:00",
            "observacoes": "Teste completo do fluxo PIX demo"
        }
        
        headers = {"Authorization": f"Bearer {self.morador_token}"}
        response = self.session.post(f"{API_BASE_URL}/bookings", json=booking_data, headers=headers)
        
        if response.status_code == 200:
            booking = response.json()
            self.booking_id = booking['id']
            print(f"✅ Booking created: {self.booking_id}")
            print(f"   Total amount: R${booking['preco_total']}")
            print(f"   Payment status: {booking.get('payment_status', 'pending')}")
            return True
        else:
            print(f"❌ Failed to create booking: {response.status_code}")
            return False
            
    def create_pix_payment(self):
        """Create PIX payment"""
        print("\n=== CREATING PIX PAYMENT ===")
        
        if not self.morador_token or not self.booking_id:
            print("❌ Missing morador token or booking ID")
            return False
            
        payment_data = {
            "booking_id": self.booking_id,
            "payer_email": "maria.silva@email.com",
            "payer_name": "Maria Silva",
            "payer_identification": "12345678901",
            "payer_identification_type": "CPF"
        }
        
        headers = {"Authorization": f"Bearer {self.morador_token}"}
        response = self.session.post(f"{API_BASE_URL}/payments/pix", json=payment_data, headers=headers)
        
        if response.status_code == 200:
            payment = response.json()
            self.payment_id = payment['payment_id']
            print(f"✅ PIX payment created: {self.payment_id}")
            print(f"   Status: {payment['status']}")
            print(f"   Amount: R${payment['amount']}")
            print(f"   QR Code available: {'Yes' if payment.get('qr_code') else 'No'}")
            return True
        else:
            print(f"❌ Failed to create PIX payment: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    def wait_and_check_approval(self):
        """Wait for auto-approval and check status"""
        print("\n=== WAITING FOR AUTO-APPROVAL ===")
        
        if not self.morador_token or not self.payment_id:
            print("❌ Missing morador token or payment ID")
            return False
            
        print("⏳ Waiting 35 seconds for demo auto-approval...")
        time.sleep(35)
        
        headers = {"Authorization": f"Bearer {self.morador_token}"}
        
        # Check payment status
        print("🔍 Checking payment status...")
        response = self.session.get(f"{API_BASE_URL}/payments/{self.payment_id}/status", headers=headers)
        
        if response.status_code == 200:
            payment_status = response.json()
            print(f"✅ Payment status retrieved:")
            print(f"   Payment ID: {payment_status['payment_id']}")
            print(f"   Status: {payment_status['status']}")
            print(f"   Amount: R${payment_status['amount']}")
            
            if payment_status['status'] == 'approved':
                print("✅ Payment was auto-approved!")
                return True
            else:
                print(f"❌ Payment not approved. Status: {payment_status['status']}")
                return False
        else:
            print(f"❌ Failed to check payment status: {response.status_code}")
            return False
            
    def check_booking_payment_status(self):
        """Check if booking was marked as paid"""
        print("\n=== CHECKING BOOKING PAYMENT STATUS ===")
        
        if not self.morador_token:
            print("❌ Missing morador token")
            return False
            
        headers = {"Authorization": f"Bearer {self.morador_token}"}
        response = self.session.get(f"{API_BASE_URL}/bookings", headers=headers)
        
        if response.status_code == 200:
            bookings = response.json()
            test_booking = next((b for b in bookings if b['id'] == self.booking_id), None)
            
            if test_booking:
                payment_status = test_booking.get('payment_status', 'pending')
                print(f"✅ Booking found:")
                print(f"   Booking ID: {test_booking['id']}")
                print(f"   Payment Status: {payment_status}")
                print(f"   Booking Status: {test_booking['status']}")
                
                if payment_status == 'paid':
                    print("✅ Booking successfully marked as PAID!")
                    return True
                else:
                    print(f"❌ Booking not marked as paid. Status: {payment_status}")
                    return False
            else:
                print("❌ Test booking not found")
                return False
        else:
            print(f"❌ Failed to get bookings: {response.status_code}")
            return False
            
    def run_complete_test(self):
        """Run the complete PIX demo flow test"""
        print("🚀 Starting Complete PIX Demo Flow Test")
        print("=" * 60)
        
        success = True
        
        # Step 1: Login users
        if not self.login_users():
            success = False
            
        # Step 2: Get service
        if success and not self.get_service():
            success = False
            
        # Step 3: Create booking
        if success and not self.create_booking():
            success = False
            
        # Step 4: Create PIX payment
        if success and not self.create_pix_payment():
            success = False
            
        # Step 5: Wait and check approval
        if success and not self.wait_and_check_approval():
            success = False
            
        # Step 6: Check booking payment status
        if success and not self.check_booking_payment_status():
            success = False
            
        # Summary
        print("\n" + "=" * 60)
        print("📊 COMPLETE PIX DEMO FLOW TEST SUMMARY")
        print("=" * 60)
        
        if success:
            print("🎉 ALL TESTS PASSED!")
            print("✅ PIX demo mode is working perfectly:")
            print("   - Payment created successfully")
            print("   - Auto-approval after 30 seconds works")
            print("   - Booking marked as paid correctly")
        else:
            print("❌ SOME TESTS FAILED!")
            print("   Please check the logs above for details")
            
        return success

if __name__ == "__main__":
    tester = PIXDemoTester()
    tester.run_complete_test()