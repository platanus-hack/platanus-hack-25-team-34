"""
Tests for API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models import User, Tracker, PortfolioItem


class TestAuthEndpoints:
    """Tests for authentication endpoints."""
    
    def test_dev_login_success(self, client: TestClient, session: Session, mock_user: User):
        """Test successful dev login."""
        response = client.post(
            "/api/v1/auth/dev-login",
            json={"user_id": mock_user.id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == mock_user.id
        assert data["name"] == "Test User"
        assert data["balance_clp"] == 1_000_000
    
    def test_dev_login_user_not_found(self, client: TestClient):
        """Test dev login with non-existent user."""
        response = client.post(
            "/api/v1/auth/dev-login",
            json={"user_id": 999}
        )
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestTrackerEndpoints:
    """Tests for tracker endpoints."""
    
    def test_get_all_trackers(self, client: TestClient, session: Session, mock_tracker_pelosi: Tracker, mock_tracker_buffett: Tracker):
        """Test getting all trackers."""
        response = client.get("/api/v1/trackers")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        
        names = [tracker["name"] for tracker in data]
        assert "Nancy Pelosi" in names
        assert "Warren Buffett" in names
    
    def test_get_all_trackers_empty(self, client: TestClient):
        """Test getting trackers when none exist."""
        response = client.get("/api/v1/trackers")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0
    
    def test_get_tracker_by_id(self, client: TestClient, session: Session, mock_tracker_pelosi: Tracker):
        """Test getting tracker by ID."""
        response = client.get(f"/api/v1/trackers/{mock_tracker_pelosi.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Nancy Pelosi"
        assert data["type"] == "politician"
        assert data["ytd_return"] == 34.5
        assert data["average_delay"] == 45
        assert data["risk_level"] == "high"
    
    def test_get_tracker_by_id_not_found(self, client: TestClient):
        """Test getting non-existent tracker."""
        response = client.get("/api/v1/trackers/999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_get_tracker_holdings(self, client: TestClient, session: Session, mock_tracker_with_holdings: Tracker):
        """Test getting tracker holdings."""
        response = client.get(f"/api/v1/trackers/{mock_tracker_with_holdings.id}/holdings")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        
        tickers = [holding["ticker"] for holding in data]
        assert "AAPL" in tickers
        assert "NVDA" in tickers
        assert "MSFT" in tickers
        
        # Check allocation_percent
        for holding in data:
            assert "allocation_percent" in holding
            assert holding["allocation_percent"] > 0
    
    def test_get_tracker_holdings_empty(self, client: TestClient, session: Session, mock_tracker_buffett: Tracker):
        """Test getting holdings for tracker with no holdings."""
        response = client.get(f"/api/v1/trackers/{mock_tracker_buffett.id}/holdings")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0


class TestInvestmentEndpoints:
    """Tests for investment endpoints."""
    
    def test_invest_success(self, client: TestClient, session: Session, mock_user: User, mock_tracker_pelosi: Tracker):
        """Test successful investment."""
        response = client.post(
            "/api/v1/invest",
            json={
                "user_id": mock_user.id,
                "tracker_id": mock_tracker_pelosi.id,
                "amount_clp": 50_000
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["remaining_balance"] == 950_000
        
        # Verify user balance was updated
        session.refresh(mock_user)
        assert mock_user.balance_clp == 950_000
    
    def test_invest_insufficient_funds(self, client: TestClient, session: Session, mock_user_low_balance: User, mock_tracker_pelosi: Tracker):
        """Test investment with insufficient funds."""
        response = client.post(
            "/api/v1/invest",
            json={
                "user_id": mock_user_low_balance.id,
                "tracker_id": mock_tracker_pelosi.id,
                "amount_clp": 50_000
            }
        )
        
        assert response.status_code == 400
        assert "Insufficient funds" in response.json()["detail"]
    
    def test_invest_invalid_amount(self, client: TestClient, session: Session, mock_user: User, mock_tracker_pelosi: Tracker):
        """Test investment with invalid amount."""
        response = client.post(
            "/api/v1/invest",
            json={
                "user_id": mock_user.id,
                "tracker_id": mock_tracker_pelosi.id,
                "amount_clp": -1000  # Negative amount
            }
        )
        
        # FastAPI validation should catch this
        assert response.status_code == 422
    
    def test_invest_nonexistent_tracker(self, client: TestClient, session: Session, mock_user: User):
        """Test investment in non-existent tracker."""
        response = client.post(
            "/api/v1/invest",
            json={
                "user_id": mock_user.id,
                "tracker_id": 999,
                "amount_clp": 50_000
            }
        )
        
        assert response.status_code == 400


class TestPortfolioEndpoints:
    """Tests for portfolio endpoints."""
    
    def test_get_portfolio_empty(self, client: TestClient, session: Session, mock_user: User):
        """Test getting portfolio with no investments."""
        response = client.get(f"/api/v1/portfolio/{mock_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == mock_user.id
        assert data["available_balance_clp"] == 1_000_000
        assert data["total_invested_clp"] == 0
        assert len(data["active_trackers"]) == 0
    
    def test_get_portfolio_with_investments(self, client: TestClient, session: Session, mock_user: User, mock_tracker_pelosi: Tracker, mock_portfolio_item: PortfolioItem):
        """Test getting portfolio with investments."""
        response = client.get(f"/api/v1/portfolio/{mock_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == mock_user.id
        assert data["total_invested_clp"] == 50_000
        assert data["total_current_value_clp"] == 52_500
        assert data["total_profit_loss_clp"] == 2_500
        assert data["total_profit_loss_percent"] == 5.0
        assert len(data["active_trackers"]) == 1
        
        tracker = data["active_trackers"][0]
        assert tracker["tracker_name"] == "Nancy Pelosi"
        assert tracker["invested_amount_clp"] == 50_000
        assert tracker["current_value_clp"] == 52_500
        assert tracker["profit_loss_clp"] == 2_500
        assert tracker["profit_loss_percent"] == 5.0
    
    def test_get_portfolio_user_not_found(self, client: TestClient):
        """Test getting portfolio for non-existent user."""
        response = client.get("/api/v1/portfolio/999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_get_portfolio_multiple_trackers(self, client: TestClient, session: Session, mock_user: User, mock_tracker_pelosi: Tracker, mock_tracker_buffett: Tracker):
        """Test portfolio with multiple investments."""
        # Create two investments
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
        
        response = client.get(f"/api/v1/portfolio/{mock_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_invested_clp"] == 150_000
        assert data["total_current_value_clp"] == 157_500
        assert data["total_profit_loss_clp"] == 7_500
        assert len(data["active_trackers"]) == 2


class TestEndToEndFlow:
    """End-to-end tests for complete user flows."""
    
    def test_complete_investment_flow(self, client: TestClient, session: Session, mock_user: User, mock_tracker_with_holdings: Tracker):
        """Test complete flow: login -> view trackers -> invest -> check portfolio."""
        # 1. Dev login
        login_response = client.post(
            "/api/v1/auth/dev-login",
            json={"user_id": mock_user.id}
        )
        assert login_response.status_code == 200
        
        # 2. View all trackers
        trackers_response = client.get("/api/v1/trackers")
        assert trackers_response.status_code == 200
        trackers = trackers_response.json()
        assert len(trackers) > 0
        
        # 3. View tracker details and holdings
        tracker_id = mock_tracker_with_holdings.id
        detail_response = client.get(f"/api/v1/trackers/{tracker_id}")
        assert detail_response.status_code == 200
        
        holdings_response = client.get(f"/api/v1/trackers/{tracker_id}/holdings")
        assert holdings_response.status_code == 200
        assert len(holdings_response.json()) == 3
        
        # 4. Make investment
        invest_response = client.post(
            "/api/v1/invest",
            json={
                "user_id": mock_user.id,
                "tracker_id": tracker_id,
                "amount_clp": 100_000
            }
        )
        assert invest_response.status_code == 200
        invest_data = invest_response.json()
        assert invest_data["success"] is True
        assert invest_data["remaining_balance"] == 900_000
        
        # 5. Check portfolio
        portfolio_response = client.get(f"/api/v1/portfolio/{mock_user.id}")
        assert portfolio_response.status_code == 200
        portfolio = portfolio_response.json()
        assert portfolio["total_invested_clp"] == 100_000
        assert portfolio["available_balance_clp"] == 900_000
        assert len(portfolio["active_trackers"]) == 1
