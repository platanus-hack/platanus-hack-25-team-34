"""
Tests for service layer.
"""
import pytest
from sqlmodel import Session
from app.services.broker_service import MockBrokerService
from app.services.tracker_service import TrackerService
from app.services.investment_service import InvestmentService
from app.services.portfolio_service import PortfolioService
from app.models import User, Tracker, PortfolioItem


class TestMockBrokerService:
    """Tests for MockBrokerService."""
    
    @pytest.mark.anyio
    async def test_get_buying_power(self, session: Session, mock_user: User):
        """Test getting user's buying power."""
        service = MockBrokerService()
        buying_power = await service.get_buying_power(mock_user.id, session)
        
        assert buying_power == 1_000_000
    
    @pytest.mark.anyio
    async def test_get_buying_power_nonexistent_user(self, session: Session):
        """Test getting buying power for non-existent user."""
        service = MockBrokerService()
        buying_power = await service.get_buying_power(999, session)
        
        assert buying_power == 0


class TestTrackerService:
    """Tests for TrackerService."""
    
    def test_get_all_trackers(self, session: Session, mock_tracker_pelosi: Tracker, mock_tracker_buffett: Tracker):
        """Test retrieving all trackers."""
        service = TrackerService()
        trackers = service.get_all_trackers(session)
        
        assert len(trackers) == 2
        tracker_names = [t.name for t in trackers]
        assert "Nancy Pelosi" in tracker_names
        assert "Warren Buffett" in tracker_names
    
    def test_get_tracker_by_id(self, session: Session, mock_tracker_pelosi: Tracker):
        """Test retrieving tracker by ID."""
        service = TrackerService()
        tracker = service.get_tracker_by_id(mock_tracker_pelosi.id, session)
        
        assert tracker is not None
        assert tracker.name == "Nancy Pelosi"
        assert tracker.type == "politician"
        assert tracker.ytd_return == 34.5
    
    def test_get_tracker_by_id_not_found(self, session: Session):
        """Test retrieving non-existent tracker."""
        service = TrackerService()
        tracker = service.get_tracker_by_id(999, session)
        
        assert tracker is None
    
    def test_get_tracker_holdings(self, session: Session, mock_tracker_with_holdings: Tracker):
        """Test retrieving tracker holdings."""
        service = TrackerService()
        holdings = service.get_tracker_holdings(mock_tracker_with_holdings.id, session)
        
        assert len(holdings) == 3
        tickers = [h.ticker for h in holdings]
        assert "AAPL" in tickers
        assert "NVDA" in tickers
        assert "MSFT" in tickers
    
    def test_get_tracker_holdings_empty(self, session: Session, mock_tracker_buffett: Tracker):
        """Test retrieving holdings for tracker with no holdings."""
        service = TrackerService()
        holdings = service.get_tracker_holdings(mock_tracker_buffett.id, session)
        
        assert len(holdings) == 0


class TestInvestmentService:
    """Tests for InvestmentService."""
    
    @pytest.mark.anyio
    async def test_execute_investment_success(self, session: Session, mock_user: User, mock_tracker_pelosi: Tracker):
        """Test successful investment execution."""
        service = InvestmentService()
        result = await service.execute_investment(
            user_id=mock_user.id,
            tracker_id=mock_tracker_pelosi.id,
            amount_clp=50_000,
            session=session
        )
        
        assert "error" not in result
        assert result["success"] is True
        assert result["remaining_balance"] == 950_000
    
    @pytest.mark.anyio
    async def test_execute_investment_insufficient_funds(self, session: Session, mock_user_low_balance: User, mock_tracker_pelosi: Tracker):
        """Test investment with insufficient funds."""
        service = InvestmentService()
        result = await service.execute_investment(
            user_id=mock_user_low_balance.id,
            tracker_id=mock_tracker_pelosi.id,
            amount_clp=50_000,  # More than 20k balance
            session=session
        )
        
        assert "error" in result
        assert "Insufficient funds" in result["error"]
    
    @pytest.mark.anyio
    async def test_execute_investment_creates_portfolio_item(self, session: Session, mock_user: User, mock_tracker_pelosi: Tracker):
        """Test that investment creates a portfolio item."""
        service = InvestmentService()
        await service.execute_investment(
            user_id=mock_user.id,
            tracker_id=mock_tracker_pelosi.id,
            amount_clp=50_000,
            session=session
        )
        
        # Check portfolio item was created
        from sqlmodel import select
        statement = select(PortfolioItem).where(
            PortfolioItem.user_id == mock_user.id,
            PortfolioItem.tracker_id == mock_tracker_pelosi.id
        )
        portfolio_item = session.exec(statement).first()
        
        assert portfolio_item is not None
        assert portfolio_item.invested_amount_clp == 50_000
    
    @pytest.mark.anyio
    async def test_execute_investment_updates_existing_portfolio_item(self, session: Session, mock_user: User, mock_tracker_pelosi: Tracker, mock_portfolio_item: PortfolioItem):
        """Test that second investment updates existing portfolio item."""
        initial_invested = mock_portfolio_item.invested_amount_clp
        
        service = InvestmentService()
        await service.execute_investment(
            user_id=mock_user.id,
            tracker_id=mock_tracker_pelosi.id,
            amount_clp=30_000,
            session=session
        )
        
        # Refresh and check updated amount
        session.refresh(mock_portfolio_item)
        assert mock_portfolio_item.invested_amount_clp == initial_invested + 30_000


class TestPortfolioService:
    """Tests for PortfolioService."""
    
    def test_get_user_portfolio_empty(self, session: Session, mock_user: User):
        """Test getting portfolio for user with no investments."""
        service = PortfolioService()
        portfolio = service.get_user_portfolio(mock_user.id, session)
        
        assert portfolio["user_id"] == mock_user.id
        assert portfolio["available_balance_clp"] == 1_000_000
        assert portfolio["total_invested_clp"] == 0
        assert portfolio["total_current_value_clp"] == 0
        assert portfolio["total_profit_loss_clp"] == 0
        assert len(portfolio["active_trackers"]) == 0
    
    def test_get_user_portfolio_with_investment(self, session: Session, mock_user: User, mock_tracker_pelosi: Tracker, mock_portfolio_item: PortfolioItem):
        """Test getting portfolio with one investment."""
        service = PortfolioService()
        portfolio = service.get_user_portfolio(mock_user.id, session)
        
        assert portfolio["user_id"] == mock_user.id
        assert portfolio["total_invested_clp"] == 50_000
        assert portfolio["total_current_value_clp"] == 52_500
        assert portfolio["total_profit_loss_clp"] == 2_500
        assert portfolio["total_profit_loss_percent"] == 5.0
        assert len(portfolio["active_trackers"]) == 1
        
        tracker = portfolio["active_trackers"][0]
        assert tracker["tracker_name"] == "Nancy Pelosi"
        assert tracker["invested_amount_clp"] == 50_000
        assert tracker["profit_loss_clp"] == 2_500
    
    def test_get_user_portfolio_multiple_trackers(self, session: Session, mock_user: User, mock_tracker_pelosi: Tracker, mock_tracker_buffett: Tracker):
        """Test portfolio with multiple tracker investments."""
        # Create two portfolio items
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
        
        service = PortfolioService()
        portfolio = service.get_user_portfolio(mock_user.id, session)
        
        assert portfolio["total_invested_clp"] == 150_000
        assert portfolio["total_current_value_clp"] == 157_500
        assert portfolio["total_profit_loss_clp"] == 7_500
        assert len(portfolio["active_trackers"]) == 2
    
    def test_get_user_portfolio_nonexistent_user(self, session: Session):
        """Test getting portfolio for non-existent user."""
        service = PortfolioService()
        portfolio = service.get_user_portfolio(999, session)
        
        assert "error" in portfolio
        assert portfolio["error"] == "User not found"
