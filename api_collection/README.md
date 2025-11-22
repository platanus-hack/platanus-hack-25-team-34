# Hedgie API Collection

Complete collection of API requests for testing the Hedgie MVP backend.

## 📁 Collection Structure

This collection contains all 8 API endpoints organized sequentially:

1. **Health Check** - Verify service is running
2. **Dev Login** - Authenticate with mock user
3. **List Trackers** - Get all available trackers
4. **Get Tracker Details** - Get specific tracker info
5. **Get Tracker Holdings** - Get tracker's portfolio composition
6. **Execute Investment** - Invest in a tracker
7. **Get User Portfolio** - View user's complete portfolio with P&L

## 🚀 Quick Start

### Using curl (Command Line)

All requests are available as standalone curl commands in `curl_commands.sh`.

```bash
# Make executable
chmod +x curl_commands.sh

# Run all tests
./curl_commands.sh

# Or run individual commands
source curl_commands.sh
health_check
dev_login
list_trackers
# ... etc
```

### Using Bruno

1. Open Bruno
2. Import this collection folder: `/home/alonso/hackathon/api_collection`
3. The collection will load with all requests and variables

### Variables

The collection uses these variables (defined in `bruno_collection.bru`):

- `base_url`: http://localhost:8000/api/v1
- `user_id`: 1 (default test user)
- `tracker_id`: 1 (default tracker - Nancy Pelosi)

You can override these in Bruno's environment settings.

## 📋 Test Scenarios

### Scenario 1: Complete User Journey

```bash
# 1. Check service is running
curl http://localhost:8000/api/v1/health

# 2. Login as User 1 (Alice - 1M CLP)
curl -X POST http://localhost:8000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'

# 3. Browse marketplace
curl http://localhost:8000/api/v1/trackers

# 4. View Nancy Pelosi tracker details
curl http://localhost:8000/api/v1/trackers/1

# 5. View her holdings
curl http://localhost:8000/api/v1/trackers/1/holdings

# 6. Invest 50,000 CLP with 20% allocation
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "tracker_id": 1,
    "amount_clp": 50000,
    "allocation_percent": 20
  }'

# 7. Check portfolio
curl http://localhost:8000/api/v1/portfolio/1
```

### Scenario 2: Test Insufficient Balance

```bash
# Login as User 2 (Bob - only 20k CLP)
curl -X POST http://localhost:8000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2}'

# Try to invest 50,000 CLP (should fail)
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "tracker_id": 1,
    "amount_clp": 50000,
    "allocation_percent": 20
  }'
# Expected: 400 Bad Request with "Insufficient balance"
```

### Scenario 3: Multiple Investments

```bash
# Login as User 1
curl -X POST http://localhost:8000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'

# Invest in Nancy Pelosi
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "tracker_id": 1,
    "amount_clp": 100000,
    "allocation_percent": 20
  }'

# Invest in Warren Buffett
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "tracker_id": 2,
    "amount_clp": 50000,
    "allocation_percent": 10
  }'

# View portfolio (should show both investments)
curl http://localhost:8000/api/v1/portfolio/1
```

## 🧪 Expected Responses

### Successful Responses

All successful responses return status `200 OK` with JSON data.

### Error Responses

- **400 Bad Request**: Invalid input (e.g., insufficient balance, negative amount)
- **404 Not Found**: Resource doesn't exist (e.g., invalid tracker_id)
- **422 Unprocessable Entity**: Validation error (e.g., missing required field)

Example error response:
```json
{
  "detail": "Insufficient balance"
}
```

## 📊 Test Data

### Mock Users

| ID | Name | Balance (CLP) |
|----|------|---------------|
| 1 | Alice Johnson | 1,000,000 |
| 2 | Bob Smith | 20,000 |
| 3 | Charlie Brown | 100,000 |

### Mock Trackers

| ID | Name | Type | YTD Return | Risk Level |
|----|------|------|------------|------------|
| 1 | Nancy Pelosi | congress | 45% | high |
| 2 | Warren Buffett | hedge_fund | 12% | low |

### Pelosi Holdings
- NVDA: 25%
- MSFT: 20%
- GOOGL: 15%
- TSLA: 10%

### Buffett Holdings
- AAPL: 40%
- BAC: 12%
- KO: 10%
- AXP: 8%

## 🔍 Debugging Tips

### Check if backend is running
```bash
curl http://localhost:8000/api/v1/health
```

### View backend logs
```bash
docker-compose logs backend -f
```

### Check database data
```bash
docker-compose exec db psql -U hedgie -d hedgie -c "SELECT * FROM users;"
docker-compose exec db psql -U hedgie -d hedgie -c "SELECT * FROM trackers;"
```

### Reset database
```bash
docker-compose down -v
docker-compose up -d
# Wait for seeding to complete
```

## 📝 Notes

- All amounts are in **CLP** (Chilean Pesos)
- This is a **mock system** - no real money or broker connections
- P&L calculations are simulated (5% gain in examples)
- All endpoints are unauthenticated (dev mode only)

## 🐛 Common Issues

### CORS Errors
If testing from browser, make sure backend CORS is configured:
```python
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

### Connection Refused
Make sure all services are running:
```bash
docker-compose ps
```

### Empty Tracker List
Database might not be seeded. Check logs:
```bash
docker-compose logs backend | grep "Seeding"
```

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Backend Code**: `/home/alonso/hackathon/backend/app/api/`
- **Test Suite**: `/home/alonso/hackathon/backend/tests/`
- **Project Docs**: `/home/alonso/hackathon/docs/`
