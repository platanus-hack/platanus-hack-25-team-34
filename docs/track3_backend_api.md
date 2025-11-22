# Track 3: Backend API & Logic

## Implementation Summary

### Services Layer
Created a service layer pattern with four core services:

1. **MockBrokerService** (`app/services/broker_service.py`)
   - Simulates broker interactions with TODO comments marking real integration points
   - `get_buying_power()`: Reads user balance from DB
   - `get_current_price()`: Returns deterministic mock prices
   - `execute_trade()`: Simulates trade execution with 500ms delay

2. **TrackerService** (`app/services/tracker_service.py`)
   - `get_all_trackers()`: Lists all available trackers
   - `get_tracker_by_id()`: Fetches detailed tracker info
   - `get_tracker_holdings()`: Returns portfolio composition

3. **InvestmentService** (`app/services/investment_service.py`)
   - `validate_investment()`: Checks user funds and request validity
   - `execute_investment()`: Core logic for investing in a tracker
   - Updates user balance, creates/updates PortfolioItem, records Transaction

4. **PortfolioService** (`app/services/portfolio_service.py`)
   - `get_user_portfolio()`: Calculates P&L and aggregates user investments

### API Endpoints
All endpoints are under `/api/v1`:

- **Auth**: `POST /auth/dev-login` - Simple user selection for MVP
- **Trackers**: 
  - `GET /trackers` - Marketplace listing
  - `GET /trackers/{id}` - Detail view
  - `GET /trackers/{id}/holdings` - Portfolio composition
- **Investment**: `POST /invest` - Execute investment
- **Portfolio**: `GET /portfolio/{user_id}` - User dashboard data

### Key Decisions
- **CORS enabled** for frontend on localhost:5173
- **Dependency injection** using FastAPI's `Depends(get_session)`
- **Mock-first approach** with clear TODO comments for broker integration
- **CLP currency** throughout the system

## Testing
The API is now accessible at `http://localhost:8000/docs` (Swagger UI) when running via Docker.

**Example requests:**
```bash
# Get all trackers
curl http://localhost:8000/api/v1/trackers

# Dev login as User 1
curl -X POST http://localhost:8000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'

# Invest 50000 CLP in tracker 1
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "tracker_id": 1, "amount_clp": 50000}'

# Check portfolio
curl http://localhost:8000/api/v1/portfolio/1
```
