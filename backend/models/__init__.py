"""
Models package com Beanie ODM

Importa todos os Document models para facilitar o uso.
"""
from models.user import User
from models.service import Service
from models.booking import Booking
from models.payment import Payment

__all__ = [
    "User",
    "Service",
    "Booking",
    "Payment",
]
