"""
Portfolio Service

Handles user portfolio queries and calculations.
"""
from typing import List, Dict
from sqlmodel import Session, select
from app.models import User, PortfolioItem, Tracker


class PortfolioService:
    """
    Service for managing and calculating user portfolio information.
    """
    
    def get_user_portfolio(self, user_id: int, session: Session) -> Dict:
        """
        Returns a summary of the user's portfolio including:
        - Total invested amount
        - Current total value
        - Overall P&L
        - List of active trackers
        """
        user = session.get(User, user_id)
        if not user:
            return {"error": "User not found"}
        
        # Get all portfolio items for user
        statement = select(PortfolioItem).where(PortfolioItem.user_id == user_id)
        portfolio_items = session.exec(statement).all()
        
        total_invested = sum(item.invested_amount_clp for item in portfolio_items)
        total_current_value = sum(item.current_value_clp for item in portfolio_items)
        total_pl = total_current_value - total_invested
        total_pl_percent = (total_pl / total_invested * 100) if total_invested > 0 else 0.0
        
        # Build active trackers list
        active_trackers = []
        for item in portfolio_items:
            tracker = session.get(Tracker, item.tracker_id)
            pl = item.current_value_clp - item.invested_amount_clp
            pl_percent = (pl / item.invested_amount_clp * 100) if item.invested_amount_clp > 0 else 0.0
            
            active_trackers.append({
                "tracker_id": tracker.id,
                "tracker_name": tracker.name,
                "invested_amount_clp": item.invested_amount_clp,
                "current_value_clp": item.current_value_clp,
                "profit_loss_clp": pl,
                "profit_loss_percent": pl_percent
            })
        
        return {
            "user_id": user_id,
            "available_balance_clp": user.balance_clp,
            "total_invested_clp": total_invested,
            "total_current_value_clp": total_current_value,
            "total_profit_loss_clp": total_pl,
            "total_profit_loss_percent": total_pl_percent,
            "active_trackers": active_trackers
        }


# Singleton instance
portfolio_service = PortfolioService()
