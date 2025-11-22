"""
Authentication API Routes (Simplified "Dev Login" for MVP)
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session
from app.core.db import get_session
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class DevLoginRequest(BaseModel):
    """Simple dev login - just select a user ID."""
    user_id: int


class DevLoginResponse(BaseModel):
    """Response with user info."""
    user_id: int
    name: str
    balance_clp: float


@router.post("/dev-login", response_model=DevLoginResponse)
def dev_login(request: DevLoginRequest, session: Session = Depends(get_session)):
    """
    Simplified authentication for MVP.
    In production, this would be replaced with proper OAuth/JWT.
    """
    user = session.get(User, request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return DevLoginResponse(
        user_id=user.id,
        name=user.name,
        balance_clp=user.balance_clp
    )
