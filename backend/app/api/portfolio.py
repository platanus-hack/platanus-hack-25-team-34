"""
Portfolio API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.db import get_session
from app.services import portfolio_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/{user_id}")
def get_user_portfolio(user_id: int, session: Session = Depends(get_session)):
    """
    Get the complete portfolio summary for a user.

    Returns:
    - Available balance
    - Total invested amount
    - Current portfolio value
    - Overall P&L
    - List of active trackers with individual P&L
    """
    portfolio = portfolio_service.get_user_portfolio(user_id, session)

    if "error" in portfolio:
        raise HTTPException(status_code=404, detail=portfolio["error"])

    return portfolio
