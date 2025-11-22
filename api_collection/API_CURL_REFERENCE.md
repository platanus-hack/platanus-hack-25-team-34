# Hedgie API - Complete curl Reference Guide

This document contains all API endpoints with curl commands, explanations, and expected responses.

---

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Service health check |
| `/auth/dev-login` | POST | Development login |
| `/trackers` | GET | List all trackers |
| `/trackers/{id}` | GET | Get tracker details |
| `/trackers/{id}/holdings` | GET | Get tracker portfolio |
| `/invest` | POST | Execute investment |
| `/portfolio/{user_id}` | GET | Get user portfolio |

**Base URL**: `http://localhost:8000/api/v1`

---

## 1. Health Check

**Purpose**: Verify that the API service is running and responding correctly.

**When to use**: 
- Before starting any testing
- To diagnose connectivity issues
- As part of monitoring/healthcheck systems

### curl Command

```bash
curl http://localhost:8000/api/v1/health
```

### Expected Response

```json
{
  "status": "healthy"
}
```

**Status Code**: `200 OK`

---

## 2. Dev Login

**Purpose**: Authenticate as a mock user for development/testing. This simulates user authentication without requiring passwords or OAuth.

**When to use**: 
- At the start of any user flow
- To switch between test users
- To test different balance scenarios

**Note**: In production, this will be replaced with proper OAuth/JWT authentication.

### curl Command

```bash
curl -X POST http://localhost:8000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'
```

### Request Body

```json
{
  "user_id": 1
}
```

**Available User IDs**:
- `1` - Alice Johnson (1,000,000 CLP) - High balance user
- `2` - Bob Smith (20,000 CLP) - Low balance user
- `3` - Charlie Brown (100,000 CLP) - Medium balance user

### Expected Response

```json
{
  "user_id": 1,
  "name": "Alice Johnson",
  "balance_clp": 1000000.0
}
```

**Status Code**: `200 OK`

### Error Scenarios

**User not found** (status `404`):
```json
{
  "detail": "User not found"
}
```

---

## 3. List All Trackers

**Purpose**: Retrieve all available trackers (Whales) in the marketplace. This is the main discovery endpoint for users to browse investment opportunities.

**When to use**: 
- To display the marketplace/homepage
- To show all available copy-trading options
- To get an overview of tracker performance

### curl Command

```bash
curl http://localhost:8000/api/v1/trackers/
```

### Expected Response

```json
[
  {
    "id": 1,
    "name": "Nancy Pelosi",
    "type": "congress",
    "description": "Former Speaker of the House with notable portfolio performance. Known for well-timed tech stock investments.",
    "ytd_return": 45.0,
    "average_delay": 15.0,
    "risk_level": "high",
    "followers_count": 15234,
    "avatar_url": "https://example.com/avatars/pelosi.jpg",
    "created_at": "2025-11-22T06:00:00Z"
  },
  {
    "id": 2,
    "name": "Warren Buffett",
    "type": "hedge_fund",
    "description": "Legendary investor and CEO of Berkshire Hathaway. Value investing approach with focus on long-term holdings.",
    "ytd_return": 12.0,
    "average_delay": 30.0,
    "risk_level": "low",
    "followers_count": 89123,
    "avatar_url": "https://example.com/avatars/buffett.jpg",
    "created_at": "2025-11-22T06:00:00Z"
  }
]
```

**Status Code**: `200 OK`

### Response Fields Explained

- `id`: Unique tracker identifier
- `name`: Display name of the whale/tracker
- `type`: Category - `congress`, `hedge_fund`, `insider`, etc.
- `description`: Detailed description for users
- `ytd_return`: Year-to-date return percentage (e.g., 45.0 = 45%)
- `average_delay`: Average days between real trade and disclosure
- `risk_level`: `low`, `medium`, or `high`
- `followers_count`: Number of users following this tracker
- `avatar_url`: Profile image URL
- `created_at`: When tracker was added to platform

---

## 4. Get Tracker Details

**Purpose**: Retrieve detailed information about a specific tracker. This provides the same data as the list endpoint but for a single tracker.

**When to use**: 
- When user clicks on a tracker from the marketplace
- To refresh tracker information
- Before making an investment decision

### curl Command

```bash
curl http://localhost:8000/api/v1/trackers/1
```

### Expected Response

```json
{
  "id": 1,
  "name": "Nancy Pelosi",
  "type": "congress",
  "description": "Former Speaker of the House with notable portfolio performance. Known for well-timed tech stock investments.",
  "ytd_return": 45.0,
  "average_delay": 15.0,
  "risk_level": "high",
  "followers_count": 15234,
  "avatar_url": "https://example.com/avatars/pelosi.jpg",
  "created_at": "2025-11-22T06:00:00Z"
}
```

**Status Code**: `200 OK`

### Error Scenarios

**Tracker not found** (status `404`):
```json
{
  "detail": "Tracker not found"
}
```

### Examples for Different Trackers

**Nancy Pelosi (ID: 1)**:
```bash
curl http://localhost:8000/api/v1/trackers/1
```

**Warren Buffett (ID: 2)**:
```bash
curl http://localhost:8000/api/v1/trackers/2
```

---

## 5. Get Tracker Holdings

**Purpose**: Retrieve the portfolio composition (stock holdings) of a specific tracker. This shows what stocks the whale owns and in what percentages.

**When to use**: 
- To show users what they'll be investing in
- To display portfolio diversification
- To help users make informed investment decisions

**Note**: These holdings represent the tracker's actual portfolio composition that will be replicated when users invest.

### curl Command

```bash
curl http://localhost:8000/api/v1/trackers/1/holdings/
```

### Expected Response

```json
[
  {
    "id": 1,
    "tracker_id": 1,
    "ticker": "NVDA",
    "company_name": "NVIDIA Corporation",
    "percentage": 25.0,
    "last_updated": "2025-11-22T06:00:00Z"
  },
  {
    "id": 2,
    "tracker_id": 1,
    "ticker": "MSFT",
    "company_name": "Microsoft Corporation",
    "percentage": 20.0,
    "last_updated": "2025-11-22T06:00:00Z"
  },
  {
    "id": 3,
    "tracker_id": 1,
    "ticker": "GOOGL",
    "company_name": "Alphabet Inc.",
    "percentage": 15.0,
    "last_updated": "2025-11-22T06:00:00Z"
  },
  {
    "id": 4,
    "tracker_id": 1,
    "ticker": "TSLA",
    "company_name": "Tesla Inc.",
    "percentage": 10.0,
    "last_updated": "2025-11-22T06:00:00Z"
  }
]
```

**Status Code**: `200 OK`

### Response Fields Explained

- `id`: Unique holding record identifier
- `tracker_id`: Which tracker owns this holding
- `ticker`: Stock ticker symbol
- `company_name`: Full company name
- `percentage`: Percentage of portfolio (e.g., 25.0 = 25%)
- `last_updated`: When this holding was last updated

### Error Scenarios

**Tracker not found** (status `404`):
```json
{
  "detail": "Tracker not found"
}
```

**No holdings** (status `200` with empty array):
```json
[]
```

### Examples for Different Trackers

**Pelosi's Holdings** (Tech-heavy, high risk):
```bash
curl http://localhost:8000/api/v1/trackers/1/holdings
# Expected: NVDA 25%, MSFT 20%, GOOGL 15%, TSLA 10%
```

**Buffett's Holdings** (Value stocks, low risk):
```bash
curl http://localhost:8000/api/v1/trackers/2/holdings
# Expected: AAPL 40%, BAC 12%, KO 10%, AXP 8%
```

---

## 6. Execute Investment

**Purpose**: Execute an investment to copy-trade a specific tracker. This is the core transaction endpoint that allocates user funds to follow a whale's portfolio.

**When to use**: 
- After user decides to invest in a tracker
- When user wants to start copy-trading

**Important**: This is a mock endpoint. No real money or broker transactions occur.

### curl Command

```bash
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "tracker_id": 1,
    "amount_clp": 50000,
    "allocation_percent": 20
  }'
```

### Request Body

```json
{
  "user_id": 1,
  "tracker_id": 1,
  "amount_clp": 50000,
  "allocation_percent": 20
}
```

### Request Fields Explained

- `user_id`: The user making the investment (must exist)
- `tracker_id`: The tracker to follow (must exist)
- `amount_clp`: Amount to invest in Chilean Pesos (must be positive)
- `allocation_percent`: Portfolio allocation percentage (0-100)

### Expected Response (Success)

```json
{
  "success": true,
  "message": "Investment successful",
  "transaction_id": 1,
  "remaining_balance": 950000.0
}
```

**Status Code**: `200 OK`

### Response Fields Explained

- `success`: Boolean indicating if investment succeeded
- `message`: Human-readable success message
- `transaction_id`: Unique transaction identifier for this investment
- `remaining_balance`: User's balance after investment (in CLP)

### Error Scenarios

**Insufficient Balance** (status `400`):
```json
{
  "detail": "Insufficient balance"
}
```

**Invalid Amount** (status `422`):
```json
{
  "detail": [
    {
      "loc": ["body", "amount_clp"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

**User Not Found** (status `404`):
```json
{
  "detail": "User not found"
}
```

**Tracker Not Found** (status `404`):
```json
{
  "detail": "Tracker not found"
}
```

### Test Examples

**Successful Investment** (User 1 with 1M balance):
```bash
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "tracker_id": 1,
    "amount_clp": 100000,
    "allocation_percent": 25
  }'
# Expected: Success with remaining_balance: 900000.0
```

**Insufficient Balance** (User 2 with only 20k):
```bash
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "tracker_id": 1,
    "amount_clp": 50000,
    "allocation_percent": 20
  }'
# Expected: 400 Bad Request - "Insufficient balance"
```

**Multiple Investments**:
```bash
# First investment
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "tracker_id": 1, "amount_clp": 100000, "allocation_percent": 20}'

# Second investment
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "tracker_id": 2, "amount_clp": 50000, "allocation_percent": 10}'
```

---

## 7. Get User Portfolio

**Purpose**: Retrieve a user's complete portfolio including all active tracker investments, balances, and profit/loss calculations.

**When to use**: 
- To display the user's dashboard
- After completing an investment
- To show current portfolio performance
- To calculate total P&L

**Note**: P&L calculations are currently simulated with a 5% gain for demo purposes.

### curl Command

```bash
curl http://localhost:8000/api/v1/portfolio/1/
```

### Expected Response (With Investments)

```json
{
  "user_id": 1,
  "available_balance_clp": 850000.0,
  "total_invested_clp": 150000.0,
  "current_value_clp": 157500.0,
  "total_pnl_clp": 7500.0,
  "total_pnl_percent": 5.0,
  "active_trackers": [
    {
      "tracker_id": 1,
      "tracker_name": "Nancy Pelosi",
      "tracker_type": "congress",
      "amount_invested_clp": 100000.0,
      "allocation_percent": 20.0,
      "current_value_clp": 105000.0,
      "pnl_clp": 5000.0,
      "pnl_percent": 5.0,
      "invested_at": "2025-11-22T07:30:00Z"
    },
    {
      "tracker_id": 2,
      "tracker_name": "Warren Buffett",
      "tracker_type": "hedge_fund",
      "amount_invested_clp": 50000.0,
      "allocation_percent": 10.0,
      "current_value_clp": 52500.0,
      "pnl_clp": 2500.0,
      "pnl_percent": 5.0,
      "invested_at": "2025-11-22T07:35:00Z"
    }
  ]
}
```

**Status Code**: `200 OK`

### Response Fields Explained

**Top-level fields**:
- `user_id`: User identifier
- `available_balance_clp`: Remaining cash balance (not invested)
- `total_invested_clp`: Total amount currently invested across all trackers
- `current_value_clp`: Current market value of all investments
- `total_pnl_clp`: Total profit/loss in CLP (current_value - total_invested)
- `total_pnl_percent`: Total P&L as percentage
- `active_trackers`: Array of individual tracker investments

**Per-tracker fields**:
- `tracker_id`: ID of the tracker
- `tracker_name`: Display name
- `tracker_type`: Category (congress, hedge_fund, etc.)
- `amount_invested_clp`: Original investment amount in this tracker
- `allocation_percent`: Portfolio allocation percentage
- `current_value_clp`: Current value of this specific investment
- `pnl_clp`: Profit/loss for this tracker (current_value - amount_invested)
- `pnl_percent`: P&L percentage for this tracker
- `invested_at`: Timestamp of investment

### Expected Response (No Investments)

```json
{
  "user_id": 1,
  "available_balance_clp": 1000000.0,
  "total_invested_clp": 0.0,
  "current_value_clp": 0.0,
  "total_pnl_clp": 0.0,
  "total_pnl_percent": 0.0,
  "active_trackers": []
}
```

### Error Scenarios

**User Not Found** (status `404`):
```json
{
  "detail": "User not found"
}
```

### Examples for Different Users

**User 1 (Alice) - After investments**:
```bash
curl http://localhost:8000/api/v1/portfolio/1
# Expected: Shows invested trackers with P&L
```

**User 2 (Bob) - No investments**:
```bash
curl http://localhost:8000/api/v1/portfolio/2
# Expected: Empty portfolio with full 20,000 CLP balance
```

**User 3 (Charlie) - Check before investing**:
```bash
curl http://localhost:8000/api/v1/portfolio/3
# Expected: Empty portfolio with 100,000 CLP balance
```

---

## Complete User Journey Example

Here's a complete flow from login to viewing portfolio:

```bash
# 1. Check service health
curl http://localhost:8000/api/v1/health

# 2. Login as Alice (User 1)
curl -X POST http://localhost:8000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'

# 3. Browse available trackers
curl http://localhost:8000/api/v1/trackers

# 4. View Nancy Pelosi's details
curl http://localhost:8000/api/v1/trackers/1

# 5. Check her portfolio composition
curl http://localhost:8000/api/v1/trackers/1/holdings

# 6. Invest 100,000 CLP with 20% allocation
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "tracker_id": 1,
    "amount_clp": 100000,
    "allocation_percent": 20
  }'

# 7. View portfolio (should show the investment)
curl http://localhost:8000/api/v1/portfolio/1

# 8. Invest in Warren Buffett too
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "tracker_id": 2,
    "amount_clp": 50000,
    "allocation_percent": 10
  }'

# 9. View updated portfolio (should show both trackers)
curl http://localhost:8000/api/v1/portfolio/1
```

---

## Testing Scenarios

### Scenario 1: Successful Investment Flow
Test a complete happy path from login to portfolio viewing.

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'

# Invest
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "tracker_id": 1, "amount_clp": 50000, "allocation_percent": 20}'

# Verify in portfolio
curl http://localhost:8000/api/v1/portfolio/1
```

**Expected Result**: Investment appears in portfolio with simulated 5% gain.

### Scenario 2: Insufficient Balance Error
Test validation with a low-balance user.

```bash
# Login as Bob (only 20k CLP)
curl -X POST http://localhost:8000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2}'

# Try to invest 50k (should fail)
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2, "tracker_id": 1, "amount_clp": 50000, "allocation_percent": 20}'
```

**Expected Result**: `400 Bad Request` with "Insufficient balance" error.

### Scenario 3: Multiple Investments
Test portfolio with multiple tracker positions.

```bash
# Login as Charlie
curl -X POST http://localhost:8000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"user_id": 3}'

# Invest in Pelosi
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{"user_id": 3, "tracker_id": 1, "amount_clp": 30000, "allocation_percent": 15}'

# Invest in Buffett
curl -X POST http://localhost:8000/api/v1/invest \
  -H "Content-Type: application/json" \
  -d '{"user_id": 3, "tracker_id": 2, "amount_clp": 20000, "allocation_percent": 10}'

# Check portfolio
curl http://localhost:8000/api/v1/portfolio/3
```

**Expected Result**: Portfolio shows 2 active trackers, remaining balance of 50,000 CLP.

### Scenario 4: View Different Tracker Holdings
Compare portfolio compositions of different trackers.

```bash
# Pelosi's tech-heavy portfolio
curl http://localhost:8000/api/v1/trackers/1/holdings

# Buffett's value stocks portfolio
curl http://localhost:8000/api/v1/trackers/2/holdings
```

**Expected Result**: Different stock allocations reflecting different investment strategies.

---

## Tips for Testing

### Using jq for Pretty Output
Install `jq` for formatted JSON output:

```bash
curl http://localhost:8000/api/v1/trackers | jq '.'
```

### Viewing Response Headers
Add `-v` flag to see full HTTP headers:

```bash
curl -v http://localhost:8000/api/v1/health
```

### Saving Responses to Files
Save API responses for analysis:

```bash
curl http://localhost:8000/api/v1/trackers > trackers.json
curl http://localhost:8000/api/v1/portfolio/1 > portfolio.json
```

### Testing with Different Users Quickly
Create a shell function:

```bash
function hedgie_invest() {
  curl -X POST http://localhost:8000/api/v1/invest \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": $1, \"tracker_id\": $2, \"amount_clp\": $3, \"allocation_percent\": $4}"
}

# Usage: hedgie_invest USER_ID TRACKER_ID AMOUNT ALLOCATION
hedgie_invest 1 1 50000 20
```

---

## Common Issues & Solutions

### Issue: Connection Refused
**Solution**: Make sure backend is running:
```bash
docker-compose ps
curl http://localhost:8000/api/v1/health
```

### Issue: CORS Errors
**Solution**: CORS is configured for `localhost:5173` and `localhost:3000`. If testing from browser, use these origins.

### Issue: Empty Tracker List
**Solution**: Database might not be seeded. Check logs:
```bash
docker-compose logs backend | grep -i seed
```

### Issue: User Not Found
**Solution**: Only users 1, 2, and 3 exist in seed data. Use valid user IDs.

### Issue: Malformed JSON
**Solution**: Ensure proper JSON formatting. Use `-d @file.json` for complex requests:
```bash
echo '{"user_id": 1, "tracker_id": 1, "amount_clp": 50000, "allocation_percent": 20}' > invest.json
curl -X POST http://localhost:8000/api/v1/invest -H "Content-Type: application/json" -d @invest.json
```

---

## Currency & Amounts

- **All amounts are in CLP** (Chilean Pesos)
- No decimal places required for whole amounts
- Backend accepts floats: `50000` or `50000.0` both work
- Minimum investment: > 0 CLP (no specific minimum enforced)
- Maximum investment: Limited by user balance

---

## Mock System Notes

This is a **development/demo API** with mock data:

- ✅ No real broker connections
- ✅ No real money transactions
- ✅ P&L calculations are simulated (fixed 5% gain)
- ✅ No authentication required (dev-only)
- ✅ All data resets when Docker containers restart

For production, the following would be added:
- Real OAuth/JWT authentication
- Real broker API integration
- Live market data for P&L calculations
- Transaction history persistence
- Rate limiting and security measures

---

## API Documentation

For interactive API documentation, visit:

**Swagger UI**: http://localhost:8000/docs

This provides:
- Interactive API testing
- Full schema documentation
- Request/response examples
- Try-it-out functionality

---

## Support Files

This collection includes:

- `curl_commands.sh` - Executable shell script with all commands
- `*.bru` files - Bruno API client collection
- `README.md` - Collection overview
- This file - Complete curl reference

Choose the format that works best for your workflow!
