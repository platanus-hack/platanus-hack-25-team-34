"""
Investment Service

Handles the core logic of investing in a tracker.
"""
from typing import Dict
from sqlmodel import Session, select
from app.models import User, Tracker, PortfolioItem, Transaction, TrackerHolding
from app.services.broker_service import broker_service


class InvestmentService:
    """
    Service for executing investment operations.
    """
    
    async def validate_investment(
        self, 
        user_id: int, 
        tracker_id: int, 
        amount_clp: float, 
        session: Session
    ) -> Dict:
        """
        Validates an investment request.
        Returns a dict with 'valid' boolean and optional 'error' message.
        """
        # Check if user exists
        user = session.get(User, user_id)
        if not user:
            return {"valid": False, "error": "User not found"}
        
        # Check if tracker exists
        tracker = session.get(Tracker, tracker_id)
        if not tracker:
            return {"valid": False, "error": "Tracker not found"}
        
        # Check amount is positive
        if amount_clp <= 0:
            return {"valid": False, "error": "Investment amount must be positive"}
        
        # Check buying power
        buying_power = await broker_service.get_buying_power(user_id, session)
        if buying_power < amount_clp:
            return {
                "valid": False, 
                "error": f"Insufficient funds. Available: {buying_power} CLP, Required: {amount_clp} CLP"
            }
        
        return {"valid": True}
    
    async def execute_investment(
        self, 
        user_id: int, 
        tracker_id: int, 
        amount_clp: float, 
        session: Session
    ) -> Dict:
        """
        Executes an investment by:
        1. Validating the request
        2. Deducting the amount from user's balance
        3. Creating a PortfolioItem
        4. Recording a Transaction
        
        # TODO: Real Broker Integration
        # In production, this would calculate share allocations and place real orders
        """
        # Validate first
        validation = await self.validate_investment(user_id, tracker_id, amount_clp, session)
        if not validation["valid"]:
            return {"success": False, "error": validation["error"]}
        
        # Get user and tracker
        user = session.get(User, user_id)
        tracker = session.get(Tracker, tracker_id)
        
        # Deduct from user balance
        user.balance_clp -= amount_clp
        
        # Check if user already has a portfolio item for this tracker
        statement = select(PortfolioItem).where(
            PortfolioItem.user_id == user_id,
            PortfolioItem.tracker_id == tracker_id
        )
        portfolio_item = session.exec(statement).first()
        
        if portfolio_item:
            # Update existing portfolio item
            portfolio_item.invested_amount_clp += amount_clp
            portfolio_item.current_value_clp += amount_clp  # Mock: initial value = invested amount
        else:
            # Create new portfolio item
            portfolio_item = PortfolioItem(
                user_id=user_id,
                tracker_id=tracker_id,
                invested_amount_clp=amount_clp,
                current_value_clp=amount_clp  # Mock: initial value = invested amount
            )
            session.add(portfolio_item)
        
        # Record transaction
        transaction = Transaction(
            user_id=user_id,
            tracker_id=tracker_id,
            type="buy",
            amount_clp=amount_clp
        )
        session.add(transaction)
        
        # Commit changes
        session.commit()
        session.refresh(user)
        session.refresh(portfolio_item)
        
        return {
            "success": True,
            "message": f"Successfully invested {amount_clp} CLP in {tracker.name}",
            "portfolio_item_id": portfolio_item.id,
            "remaining_balance": user.balance_clp
        }


# Singleton instance
investment_service = InvestmentService()
