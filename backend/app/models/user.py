from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class User(SQLModel, table=True):
    """
    Represents a registered user of the platform.
    For MVP, this is a simplified model without auth credentials.

    TODO For the future: Maybe add Google Auth and extract fields from there.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(description="Display name of the user")
    balance_clp: float = Field(default=0.0, description="Current available cash balance in Chilean Pesos (CLP)")
    
    # Relationships
    portfolio_items: List["PortfolioItem"] = Relationship(back_populates="user")
    transactions: List["Transaction"] = Relationship(back_populates="user")
