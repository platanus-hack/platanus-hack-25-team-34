"""
Tests for database models.
"""
import pytest
from sqlmodel import Session, select
from app.models import User, Tracker, TrackerHolding, PortfolioItem, Transaction


def test_create_user(session: Session):
    """Test creating a user with balance."""
    user = User(
        name="Test User",
        balance_clp=1_000_000
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    
    assert user.id is not None
    assert user.name == "Test User"
    assert user.balance_clp == 1_000_000


def test_create_tracker(session: Session):
    """Test creating a tracker with all fields."""
    tracker = Tracker(
        name="Warren Buffett",
        type="fund",
        avatar_url="https://example.com/buffett.jpg",
        description="Legendary investor",
        ytd_return=18.2,
        average_delay=90,
        risk_level="low",
        followers_count=5420
    )
    session.add(tracker)
    session.commit()
    session.refresh(tracker)
    
    assert tracker.id is not None
    assert tracker.name == "Warren Buffett"
    assert tracker.type == "fund"
    assert tracker.ytd_return == 18.2
    assert tracker.average_delay == 90
    assert tracker.risk_level == "low"
    assert tracker.followers_count == 5420


def test_tracker_with_holdings(session: Session, mock_tracker_pelosi: Tracker):
    """Test creating tracker holdings."""
    holding = TrackerHolding(
        tracker_id=mock_tracker_pelosi.id,
        ticker="AAPL",
        company_name="Apple Inc.",
        allocation_percent=25.0
    )
    session.add(holding)
    session.commit()
    session.refresh(holding)
    
    assert holding.id is not None
    assert holding.tracker_id == mock_tracker_pelosi.id
    assert holding.ticker == "AAPL"
    assert holding.allocation_percent == 25.0


def test_portfolio_item(session: Session, mock_user: User, mock_tracker_pelosi: Tracker):
    """Test creating a portfolio item."""
    portfolio_item = PortfolioItem(
        user_id=mock_user.id,
        tracker_id=mock_tracker_pelosi.id,
        invested_amount_clp=50_000,
        current_value_clp=52_500
    )
    session.add(portfolio_item)
    session.commit()
    session.refresh(portfolio_item)
    
    assert portfolio_item.id is not None
    assert portfolio_item.user_id == mock_user.id
    assert portfolio_item.tracker_id == mock_tracker_pelosi.id
    assert portfolio_item.invested_amount_clp == 50_000
    assert portfolio_item.current_value_clp == 52_500


def test_transaction(session: Session, mock_user: User, mock_tracker_pelosi: Tracker):
    """Test creating a transaction record."""
    transaction = Transaction(
        user_id=mock_user.id,
        tracker_id=mock_tracker_pelosi.id,
        type="buy",
        amount_clp=50_000
    )
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    
    assert transaction.id is not None
    assert transaction.user_id == mock_user.id
    assert transaction.type == "buy"
    assert transaction.amount_clp == 50_000
    assert transaction.timestamp is not None


def test_multiple_portfolio_items(session: Session, mock_user: User, mock_tracker_pelosi: Tracker, mock_tracker_buffett: Tracker):
    """Test user can have multiple portfolio items."""
    item1 = PortfolioItem(
        user_id=mock_user.id,
        tracker_id=mock_tracker_pelosi.id,
        invested_amount_clp=50_000,
        current_value_clp=52_500
    )
    item2 = PortfolioItem(
        user_id=mock_user.id,
        tracker_id=mock_tracker_buffett.id,
        invested_amount_clp=100_000,
        current_value_clp=105_000
    )
    session.add(item1)
    session.add(item2)
    session.commit()
    
    statement = select(PortfolioItem).where(PortfolioItem.user_id == mock_user.id)
    items = session.exec(statement).all()
    
    assert len(items) == 2
