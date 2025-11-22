"""
Transaction API Routes
"""
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.db import get_session
from app.services.transaction_service import transaction_service

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/{user_id}")
def get_user_transactions(
    user_id: int,
    limit: int = None,
    session: Session = Depends(get_session)
):
    """
    Get transaction history for a user.
    
    Args:
        user_id: ID of the user
        limit: Optional limit on number of transactions (default: all)
        
    Returns:
        List of transactions with tracker information
    """
    transactions = transaction_service.get_user_transactions(
        user_id=user_id,
        session=session,
        limit=limit
    )
    
    return transactions
