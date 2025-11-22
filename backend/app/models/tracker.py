from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class Tracker(SQLModel, table=True):
    """
    Represents a 'Whale' entity (Hedge Fund or Politician) that users can copy-trade.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(description="Name of the fund or politician (e.g., 'Nancy Pelosi')")
    type: str = Field(description="Type of entity: 'fund' or 'politician'")
    avatar_url: Optional[str] = Field(default=None, description="URL to the entity's avatar image")
    description: Optional[str] = Field(default=None, description="Short bio or strategy description")
    ytd_return: float = Field(default=0.0, description="Year-to-date return percentage (e.g., 25.5)")
    average_delay: int = Field(default=45, description="Average reporting delay in days (e.g., 45 for politicians due to Stock Act)")
    risk_level: str = Field(description="Risk categorization: 'Low', 'Medium', 'High'")
    followers_count: int = Field(default=0, description="Number of users copying this tracker")
    
    # Relationships
    holdings: List["TrackerHolding"] = Relationship(back_populates="tracker")
    portfolio_items: List["PortfolioItem"] = Relationship(back_populates="tracker")
    transactions: List["Transaction"] = Relationship(back_populates="tracker")

class TrackerHolding(SQLModel, table=True):
    """
    Represents a single stock holding within a Tracker's portfolio.
    Defines the composition of the strategy (e.g., 40% NVDA).
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    tracker_id: Optional[int] = Field(default=None, foreign_key="tracker.id", description="ID of the parent Tracker")
    
    ticker: str = Field(description="Stock ticker symbol (e.g., 'NVDA')")
    company_name: str = Field(description="Full company name")
    allocation_percent: float = Field(description="Target allocation percentage for this stock (0-100)")
    
    # Relationships
    tracker: Optional[Tracker] = Relationship(back_populates="holdings")
