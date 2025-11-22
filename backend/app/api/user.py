"""
User Account Management API

Handles user account operations:
- Deposit funds (mock)
- Withdraw funds (mock)
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional

from app.core.db import get_session
from app.models.user import User

router = APIRouter(prefix="/user", tags=["user"])


class DepositRequest(BaseModel):
    amount_clp: float


class WithdrawRequest(BaseModel):
    amount_clp: float


class BalanceResponse(BaseModel):
    user_id: int
    name: str
    balance_clp: float
    message: str


@router.post("/{user_id}/deposit", response_model=BalanceResponse)
def deposit_funds(
    user_id: int,
    request: DepositRequest,
    session: Session = Depends(get_session)
):
    """
    Deposit funds into user account (mock operation).
    
    Args:
        user_id: ID of the user
        request: Deposit amount in CLP
        
    Returns:
        Updated user balance
        
    Raises:
        HTTPException 400: If amount is invalid
        HTTPException 404: If user not found
    """
    # Validate amount
    if request.amount_clp <= 0:
        raise HTTPException(status_code=400, detail="Deposit amount must be positive")
    
    # Get user
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update balance (mock deposit)
    user.balance_clp += request.amount_clp
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return BalanceResponse(
        user_id=user.id,
        name=user.name,
        balance_clp=user.balance_clp,
        message=f"Successfully deposited {request.amount_clp:,.0f} CLP"
    )


@router.post("/{user_id}/withdraw", response_model=BalanceResponse)
def withdraw_funds(
    user_id: int,
    request: WithdrawRequest,
    session: Session = Depends(get_session)
):
    """
    Withdraw funds from user account (mock operation).
    
    Args:
        user_id: ID of the user
        request: Withdrawal amount in CLP
        
    Returns:
        Updated user balance
        
    Raises:
        HTTPException 400: If amount is invalid or exceeds balance
        HTTPException 404: If user not found
    """
    # Validate amount
    if request.amount_clp <= 0:
        raise HTTPException(status_code=400, detail="Withdrawal amount must be positive")
    
    # Get user
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check sufficient balance
    if user.balance_clp < request.amount_clp:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Available: {user.balance_clp:,.0f} CLP, Requested: {request.amount_clp:,.0f} CLP"
        )
    
    # Update balance (mock withdrawal)
    user.balance_clp -= request.amount_clp
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return BalanceResponse(
        user_id=user.id,
        name=user.name,
        balance_clp=user.balance_clp,
        message=f"Successfully withdrew {request.amount_clp:,.0f} CLP"
    )


@router.get("/{user_id}/balance", response_model=BalanceResponse)
def get_balance(
    user_id: int,
    session: Session = Depends(get_session)
):
    """
    Get current user balance.
    
    Args:
        user_id: ID of the user
        
    Returns:
        User balance information
        
    Raises:
        HTTPException 404: If user not found
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return BalanceResponse(
        user_id=user.id,
        name=user.name,
        balance_clp=user.balance_clp,
        message="Balance retrieved successfully"
    )
