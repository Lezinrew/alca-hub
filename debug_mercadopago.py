#!/usr/bin/env python3
"""
Debug Mercado Pago Integration
"""

import mercadopago
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load environment variables
load_dotenv('/app/backend/.env')

# Get credentials
ACCESS_TOKEN = os.environ.get('MERCADO_PAGO_ACCESS_TOKEN')
PUBLIC_KEY = os.environ.get('MERCADO_PAGO_PUBLIC_KEY')

print(f"Access Token: {ACCESS_TOKEN}")
print(f"Public Key: {PUBLIC_KEY}")

# Initialize SDK
sdk = mercadopago.SDK(ACCESS_TOKEN)

# Test simple payment creation
expiration_date = datetime.utcnow() + timedelta(minutes=30)

payment_data = {
    "transaction_amount": 105.0,
    "description": "Test PIX Payment",
    "external_reference": "test_booking_123",
    "payment_method_id": "pix",
    "date_of_expiration": expiration_date.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
    "payer": {
        "email": "test@example.com",
        "first_name": "Test User",
        "identification": {
            "type": "CPF",
            "number": "12345678901"
        }
    }
}

print("\nTesting PIX payment creation...")
print(f"Payment data: {payment_data}")

result = sdk.payment().create(payment_data)

print(f"\nResult status: {result['status']}")
print(f"Result response: {result['response']}")

if result["status"] != 201:
    print("\n❌ Payment creation failed!")
    if 'response' in result and 'message' in result['response']:
        print(f"Error message: {result['response']['message']}")
    if 'response' in result and 'cause' in result['response']:
        print(f"Error cause: {result['response']['cause']}")
else:
    print("\n✅ Payment creation successful!")
    payment = result["response"]
    print(f"Payment ID: {payment['id']}")
    print(f"Status: {payment['status']}")
    if 'point_of_interaction' in payment:
        print("QR Code data available")