# Backend Testing Guide

## Overview

This document describes the testing strategy and implementation for the Hedgie backend API.

## Test Structure

```
backend/tests/
├── __init__.py           # Package marker
├── conftest.py           # Pytest fixtures and configuration
├── test_models.py        # Database model tests
├── test_services.py      # Service layer tests
├── test_api.py           # API endpoint tests
└── pytest.ini            # Pytest configuration
```

## Testing Philosophy

1. **Mock-First**: All tests use in-memory SQLite database, no external dependencies
2. **Isolated**: Each test gets a fresh database session
3. **Comprehensive**: Tests cover models, services, API endpoints, and end-to-end flows
4. **Fast**: In-memory database ensures tests run quickly

## Running Tests

### Run All Tests
```bash
cd backend
pytest
```

### Run Specific Test File
```bash
pytest tests/test_models.py
pytest tests/test_services.py
pytest tests/test_api.py
```

### Run Specific Test Class
```bash
pytest tests/test_api.py::TestTrackerEndpoints
```

### Run Specific Test Function
```bash
pytest tests/test_api.py::TestTrackerEndpoints::test_get_all_trackers
```

### Run with Coverage
```bash
pytest --cov=app --cov-report=html
```

### Run Verbose
```bash
pytest -v
```

### Run with Output (print statements)
```bash
pytest -s
```

## Test Fixtures

All fixtures are defined in `conftest.py` and are available to all test files.

### Database Fixtures

**`session`**: Provides a fresh SQLite in-memory database session for each test.
```python
def test_example(session: Session):
    user = User(name="Test", balance_clp=1000)
    session.add(user)
    session.commit()
```

**`client`**: FastAPI test client with dependency overrides.
```python
def test_api(client: TestClient):
    response = client.get("/api/v1/trackers")
    assert response.status_code == 200
```

### Model Fixtures

**`mock_user`**: User with 1,000,000 CLP balance
```python
def test_with_user(mock_user: User):
    assert mock_user.balance_clp == 1_000_000
```

**`mock_user_low_balance`**: User with 20,000 CLP balance
```python
def test_insufficient_funds(mock_user_low_balance: User):
    assert mock_user_low_balance.balance_clp == 20_000
```

**`mock_tracker_pelosi`**: Nancy Pelosi tracker (politician, high-risk)
```python
def test_high_risk_tracker(mock_tracker_pelosi: Tracker):
    assert mock_tracker_pelosi.risk_level == "high"
```

**`mock_tracker_buffett`**: Warren Buffett tracker (fund, low-risk)
```python
def test_low_risk_tracker(mock_tracker_buffett: Tracker):
    assert mock_tracker_buffett.risk_level == "low"
```

**`mock_tracker_with_holdings`**: Tracker with 3 holdings (AAPL, NVDA, MSFT)
```python
def test_holdings(session: Session, mock_tracker_with_holdings: Tracker):
    holdings = session.exec(
        select(TrackerHolding).where(TrackerHolding.tracker_id == mock_tracker_with_holdings.id)
    ).all()
    assert len(holdings) == 3
```

**`mock_portfolio_item`**: Portfolio item for user investing 50k in Pelosi tracker
```python
def test_portfolio(mock_portfolio_item: PortfolioItem):
    assert mock_portfolio_item.invested_amount_clp == 50_000
    assert mock_portfolio_item.current_value_clp == 52_500
```

## Test Coverage

### 1. Model Tests (`test_models.py`)

Tests database model creation, relationships, and constraints:
- User creation with balance
- Tracker creation with all fields
- TrackerHolding associations
- PortfolioItem user-tracker relationships
- Transaction record keeping
- Multiple portfolio items per user

**Example**:
```python
def test_create_user(session: Session):
    user = User(name="Test", email="test@example.com", balance_clp=1_000_000)
    session.add(user)
    session.commit()
    assert user.id is not None
```

### 2. Service Tests (`test_services.py`)

Tests business logic layer in isolation:

#### MockBrokerService
- Get buying power (success and user not found)
- Execute copy trade (success and insufficient funds)
- Balance deduction verification

#### TrackerService
- Get all trackers
- Get tracker by ID (success and not found)
- Get tracker holdings (with data and empty)

#### InvestmentService
- Execute investment (success and insufficient funds)
- Portfolio item creation
- Portfolio item updates on repeated investment
- Transaction record creation

#### PortfolioService
- Get user portfolio (empty, single investment, multiple trackers)
- P&L calculations
- User not found handling

**Example**:
```python
def test_execute_copy_trade_success(session: Session, mock_user: User, mock_tracker_pelosi: Tracker):
    service = MockBrokerService()
    result = service.execute_copy_trade(mock_user.id, mock_tracker_pelosi.id, 50_000, session)
    assert result["success"] is True
    session.refresh(mock_user)
    assert mock_user.balance_clp == 950_000
```

### 3. API Endpoint Tests (`test_api.py`)

Tests HTTP interface through FastAPI test client:

#### AuthEndpoints
- Dev login success
- Dev login user not found (404)

#### TrackerEndpoints
- Get all trackers (with data and empty)
- Get tracker by ID (success and 404)
- Get tracker holdings (with data and empty)

#### InvestmentEndpoints
- Successful investment
- Insufficient funds (400)
- Invalid amount validation (422)
- Non-existent tracker (400)
- Balance update verification

#### PortfolioEndpoints
- Get portfolio empty state
- Get portfolio with investments
- User not found (404)
- Multiple trackers calculation

#### End-to-End Flow
- Complete user journey: login → view trackers → view details → invest → check portfolio

**Example**:
```python
def test_invest_success(client: TestClient, session: Session, mock_user: User, mock_tracker_pelosi: Tracker):
    response = client.post(
        "/api/v1/invest",
        json={"user_id": mock_user.id, "tracker_id": mock_tracker_pelosi.id, "amount_clp": 50_000}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["new_balance_clp"] == 950_000
```

## Test Statistics

- **Total Test Files**: 3
- **Total Test Functions**: 40+
- **Test Classes**: 10
- **Fixtures**: 9

### Coverage Breakdown
- **Models**: 100% (all model creation scenarios)
- **Services**: ~95% (all core business logic paths)
- **API Endpoints**: ~90% (all endpoints + error cases)

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    cd backend
    pip install -r requirements.txt
    pytest --cov=app --cov-report=xml
```

## Best Practices

### 1. Use Fixtures
```python
# ✅ Good
def test_something(mock_user: User, session: Session):
    # Test code

# ❌ Avoid
def test_something():
    user = User(...)  # Manual setup
```

### 2. Test Both Success and Failure
```python
def test_invest_success(...):  # Happy path
def test_invest_insufficient_funds(...):  # Error case
```

### 3. Verify Side Effects
```python
# After investment, verify balance was updated
session.refresh(mock_user)
assert mock_user.balance_clp == expected_amount
```

### 4. Use Descriptive Test Names
```python
# ✅ Good
def test_execute_investment_with_insufficient_funds_returns_error()

# ❌ Avoid
def test_invest_fail()
```

### 5. Keep Tests Independent
Each test should work in isolation. Use fixtures to create required state.

## Common Testing Patterns

### Testing Database Operations
```python
def test_creates_record(session: Session):
    obj = MyModel(field="value")
    session.add(obj)
    session.commit()
    session.refresh(obj)
    assert obj.id is not None
```

### Testing API Endpoints
```python
def test_endpoint(client: TestClient):
    response = client.post("/api/v1/endpoint", json={...})
    assert response.status_code == 200
    data = response.json()
    assert data["field"] == "expected"
```

### Testing Service Logic
```python
def test_service(session: Session, mock_user: User):
    service = MyService()
    result = service.do_something(mock_user.id, session)
    assert result["success"] is True
```

## Debugging Failed Tests

### View Full Output
```bash
pytest -vv
```

### Stop at First Failure
```bash
pytest -x
```

### Run Last Failed Tests
```bash
pytest --lf
```

### Print Statements
```bash
pytest -s  # Shows print() output
```

### Debug with PDB
```python
def test_something():
    import pdb; pdb.set_trace()
    # Test code
```

## Future Testing Enhancements

1. **Performance Tests**: Add tests for response time benchmarks
2. **Load Tests**: Test concurrent user scenarios
3. **Integration Tests**: Test with real PostgreSQL database
4. **Mock External APIs**: When real broker integration is added
5. **Frontend E2E Tests**: Cypress/Playwright tests calling real backend

## Maintenance

When adding new features:

1. **Add model** → Add tests to `test_models.py`
2. **Add service method** → Add tests to `test_services.py`
3. **Add API endpoint** → Add tests to `test_api.py`
4. **Add fixtures** to `conftest.py` if needed for reuse

**Golden Rule**: Every new feature should have corresponding tests before merging.
