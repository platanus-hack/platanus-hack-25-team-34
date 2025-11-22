from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
# Forward references to avoid circular imports if needed, though here we import for type hints
# Note: In SQLModel, string forward references in Relationship are often safer.
from .user import User
from .tracker import Tracker

class PortfolioItem(SQLModel, table=True):
    """
    Represents a user's active investment in a specific Tracker.
    Tracks how much was invested and its current simulated value.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", description="The investor")
    tracker_id: Optional[int] = Field(default=None, foreign_key="tracker.id", description="The strategy being followed")
    
    invested_amount_clp: float = Field(description="Total amount of CLP invested in this tracker")
    current_value_clp: float = Field(description="Current market value of this investment in CLP")
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="portfolio_items")
    tracker: Optional[Tracker] = Relationship(back_populates="portfolio_items")

class Transaction(SQLModel, table=True):
    """
    Immutable record of a financial event (Buy/Sell).
    Used for audit trails and history.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    tracker_id: Optional[int] = Field(default=None, foreign_key="tracker.id")
    
    type: str = Field(description="Transaction type: 'buy' or 'sell'")
    amount_clp: float = Field(description="Value of the transaction in CLP")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of execution")
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="transactions")
    tracker: Optional[Tracker] = Relationship(back_populates="transactions")
