"""
Investment API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session
from app.core.db import get_session
from app.services import investment_service

router = APIRouter(prefix="/invest", tags=["investment"])


class InvestmentRequest(BaseModel):
    """Request body for investment operations."""
    user_id: int = Field(description="ID of the user making the investment")
    tracker_id: int = Field(description="ID of the tracker to invest in")
    amount_clp: float = Field(gt=0, description="Amount to invest in CLP (must be positive)")


@router.post("/")
async def execute_investment(
    request: InvestmentRequest,
    session: Session = Depends(get_session)
):
    """
    Execute an investment in a tracker.
    
    This endpoint:
    1. Validates the user has sufficient funds
    2. Deducts the amount from their balance
    3. Creates or updates a PortfolioItem
    4. Records the transaction
    """
    result = await investment_service.execute_investment(
        user_id=request.user_id,
        tracker_id=request.tracker_id,
        amount_clp=request.amount_clp,
        session=session
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Investment failed"))
    
    return result
