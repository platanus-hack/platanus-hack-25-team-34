"""
Mock Broker Service

This service simulates all broker interactions for the MVP.
In production, this would be replaced with real broker API integration.
"""
import asyncio
from typing import Dict
from app.core.config import settings


class MockBrokerService:
    """
    Simulates a broker backend for buying power checks and trade execution.
    """
    
    # Mock prices for deterministic testing (in USD for simplicity, could convert to CLP)
    MOCK_PRICES: Dict[str, float] = {
        "NVDA": 850.0,
        "MSFT": 420.0,
        "AAPL": 195.0,
        "BAC": 35.0,
        "AXP": 210.0,
    }
    
    def __init__(self):
        self.broker_mode = settings.BROKER_MODE
    
    async def get_buying_power(self, user_id: int, session) -> float:
        """
        Returns the user's available cash balance in CLP.
        
        # TODO: Real Broker Integration
        # In production, this would call the broker's API:
        # response = await broker_client.get_account(user_id)
        # return response['buying_power']
        """
        from app.models import User
        from sqlmodel import select
        
        user = session.exec(select(User).where(User.id == user_id)).first()
        if not user:
            return 0.0
        return user.balance_clp
    
    async def get_current_price(self, ticker: str) -> float:
        """
        Returns the current market price for a ticker.
        
        # TODO: Real Broker Integration
        # In production, this would fetch real-time quotes:
        # response = await market_data_api.get_quote(ticker)
        # return response['last_price']
        """
        return self.MOCK_PRICES.get(ticker, 100.0)  # Default to 100 if ticker unknown
    
    async def execute_trade(
        self, 
        user_id: int, 
        ticker: str, 
        shares: float, 
        action: str = "buy"
    ) -> Dict:
        """
        Simulates trade execution with a delay.
        
        # TODO: Real Broker Integration
        # In production, this would place an order:
        # order = await broker_client.place_order(
        #     account_id=user_id,
        #     symbol=ticker,
        #     qty=shares,
        #     side=action,
        #     type='market'
        # )
        # return order
        """
        # Simulate network latency
        await asyncio.sleep(0.5)
        
        price = await self.get_current_price(ticker)
        total_value = shares * price
        
        return {
            "success": True,
            "ticker": ticker,
            "shares": shares,
            "price": price,
            "total_value": total_value,
            "action": action,
            "status": "filled"  # Mock: always filled immediately
        }


# Singleton instance
broker_service = MockBrokerService()
