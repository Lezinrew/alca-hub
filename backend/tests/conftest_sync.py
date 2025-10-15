"""
Synchronous initialization for Beanie to avoid event loop issues
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie


def pytest_configure(config):
    """Called before test collection - initialize Beanie synchronously"""
    # Import models
    from models.user import User
    from models.service import Service
    from models.booking import Booking
    from models.payment import Payment

    # Create event loop and initialize Beanie
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    async def init():
        client = AsyncIOMotorClient("mongodb://localhost:27017")
        db = client.alca_hub_test

        await init_beanie(
            database=db,
            document_models=[User, Service, Booking, Payment]
        )

    loop.run_until_complete(init())
