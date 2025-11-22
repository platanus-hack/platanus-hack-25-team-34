"""
Pytest configuration and shared fixtures.
"""
import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
from app.core.db import get_session
from app.models import User, Tracker, TrackerHolding, PortfolioItem, Transaction


@pytest.fixture(name="session")
def session_fixture():
    """
    Create an in-memory SQLite database for testing.
    Each test gets a fresh database session.
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """
    Create a FastAPI test client with the test database session.
    """
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def mock_user(session: Session):
    """
    Create a mock user with 1,000,000 CLP balance.
    """
    user = User(
        name="Test User",
        balance_clp=1_000_000
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def mock_user_low_balance(session: Session):
    """
    Create a mock user with low balance (20,000 CLP).
    """
    user = User(
        name="Low Balance User",
        balance_clp=20_000
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def mock_tracker_pelosi(session: Session):
    """
    Create a mock tracker (Nancy Pelosi - Politician).
    """
    tracker = Tracker(
        name="Nancy Pelosi",
        type="politician",
        avatar_url="https://example.com/pelosi.jpg",
        description="Former Speaker of the House with notable trading record",
        ytd_return=34.5,
        average_delay=45,
        risk_level="high",
        followers_count=1250
    )
    session.add(tracker)
    session.commit()
    session.refresh(tracker)
    return tracker


@pytest.fixture
def mock_tracker_buffett(session: Session):
    """
    Create a mock tracker (Warren Buffett - Fund).
    """
    tracker = Tracker(
        name="Warren Buffett",
        type="fund",
        avatar_url="https://example.com/buffett.jpg",
        description="Legendary investor and CEO of Berkshire Hathaway",
        ytd_return=18.2,
        average_delay=90,
        risk_level="low",
        followers_count=5420
    )
    session.add(tracker)
    session.commit()
    session.refresh(tracker)
    return tracker


@pytest.fixture
def mock_tracker_with_holdings(session: Session, mock_tracker_pelosi: Tracker):
    """
    Create a tracker with sample holdings.
    """
    holdings = [
        TrackerHolding(
            tracker_id=mock_tracker_pelosi.id,
            ticker="AAPL",
            company_name="Apple Inc.",
            allocation_percent=25.0
        ),
        TrackerHolding(
            tracker_id=mock_tracker_pelosi.id,
            ticker="NVDA",
            company_name="NVIDIA Corporation",
            allocation_percent=30.0
        ),
        TrackerHolding(
            tracker_id=mock_tracker_pelosi.id,
            ticker="MSFT",
            company_name="Microsoft Corporation",
            allocation_percent=20.0
        ),
    ]
    for holding in holdings:
        session.add(holding)
    session.commit()
    return mock_tracker_pelosi


@pytest.fixture
def mock_portfolio_item(session: Session, mock_user: User, mock_tracker_pelosi: Tracker):
    """
    Create a portfolio item for a user.
    """
    portfolio_item = PortfolioItem(
        user_id=mock_user.id,
        tracker_id=mock_tracker_pelosi.id,
        invested_amount_clp=50_000,
        current_value_clp=52_500
    )
    session.add(portfolio_item)
    session.commit()
    session.refresh(portfolio_item)
    return portfolio_item
