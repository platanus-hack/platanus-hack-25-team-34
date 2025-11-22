# Hedgie MVP - Available Views

## Quick Access URLs

With `VITE_LOCAL_DEVELOPMENT=true`, all views are accessible directly:

| View | URL | Access |
|------|-----|--------|
| **Login** | http://localhost:5173/login | Public |
| **Marketplace** | http://localhost:5173/marketplace | Protected* |
| **Tracker Detail** | http://localhost:5173/tracker/1 | Protected* |
| **Dashboard** | http://localhost:5173/dashboard | Protected* |

*Protected routes bypass authentication when `VITE_LOCAL_DEVELOPMENT=true`

---

## View 1: Login Page

### URL
```
http://localhost:5173/login
```

### Purpose
Development login screen for selecting a mock user.

### What It Shows
- Dropdown with 3 mock users:
  - User 1: Alice Johnson (1,000,000 CLP)
  - User 2: Bob Smith (20,000 CLP)
  - User 3: Charlie Brown (100,000 CLP)
- "Login" button
- Error messages if login fails

### Frontend Data Models

**Input:**
```typescript
selectedUserId: number  // 1, 2, or 3
```

**API Call:**
```typescript
authApi.devLogin(userId: number) → User
```

**User Type:**
```typescript
interface User {
  id: number;
  name: string;
  balance_clp: number;
}
```

### Backend Dependencies

**API Endpoint:**
```
POST /api/v1/auth/dev-login
```

**Request Body:**
```json
{
  "user_id": 1
}
```

**Response:**
```json
{
  "user_id": 1,
  "name": "Alice Johnson",
  "balance_clp": 1000000.0
}
```

**Backend Model:**
```python
class User(SQLModel, table=True):
    id: Optional[int]
    name: str
    balance_clp: float
    portfolio_items: List["PortfolioItem"]
    transactions: List["Transaction"]
```

### User Flow
1. User selects from dropdown
2. Clicks "Login"
3. Redirects to `/marketplace` on success

---

## View 2: Marketplace Page

### URL
```
http://localhost:5173/marketplace
```

### Purpose
Browse all available trackers (Whales) to copy-trade.

### What It Shows
- Header with user's current balance
- Logout button
- Grid of tracker cards, each showing:
  - Avatar/icon
  - Name (e.g., "Nancy Pelosi")
  - Type (Congress, Hedge Fund)
  - YTD Return (e.g., "45.0%")
  - Risk Level (Low/Medium/High)
  - Average Delay (e.g., "15 days")
  - Followers count
  - "View Details" button
- "Go to Dashboard" button

### Frontend Data Models

**API Call:**
```typescript
trackerApi.getAllTrackers() → Tracker[]
```

**Tracker Type:**
```typescript
interface Tracker {
  id: number;
  name: string;
  type: string;              // 'fund' | 'politician'
  avatar_url?: string;
  description?: string;
  ytd_return: number;        // e.g., 45.0
  average_delay: number;     // days
  risk_level: string;        // 'low' | 'medium' | 'high'
  followers_count: number;
}
```

**State:**
```typescript
trackers: Tracker[]
loading: boolean
error: string
user: User  // from AuthContext
```

### Backend Dependencies

**API Endpoint:**
```
GET /api/v1/trackers/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nancy Pelosi",
    "type": "congress",
    "avatar_url": "https://...",
    "description": "Former Speaker...",
    "ytd_return": 45.0,
    "average_delay": 15,
    "risk_level": "high",
    "followers_count": 15234
  },
  {
    "id": 2,
    "name": "Warren Buffett",
    "type": "hedge_fund",
    "ytd_return": 12.0,
    "average_delay": 30,
    "risk_level": "low",
    "followers_count": 89123
  }
]
```

**Backend Model:**
```python
class Tracker(SQLModel, table=True):
    id: Optional[int]
    name: str
    type: str  # 'fund' or 'politician'
    avatar_url: Optional[str]
    description: Optional[str]
    ytd_return: float
    average_delay: int
    risk_level: str
    followers_count: int
    holdings: List["TrackerHolding"]
    portfolio_items: List["PortfolioItem"]
    transactions: List["Transaction"]
```

### User Flow
1. Page loads tracker list from API
2. User browses available trackers
3. Clicks tracker card → navigates to `/tracker/:id`
4. Or clicks "Dashboard" → navigates to `/dashboard`
5. Or clicks "Logout" → returns to `/login`

---

## View 3: Tracker Detail Page

### URL
```
http://localhost:5173/tracker/:id
```

**Examples:**
- Nancy Pelosi: http://localhost:5173/tracker/1
- Warren Buffett: http://localhost:5173/tracker/2

### Purpose
View detailed information about a specific tracker and execute investments.

### What It Shows
- **Header Section:**
  - Back to Marketplace button
  - Tracker avatar
  - Name and type
  - Description
  
- **Stats Cards:**
  - YTD Return
  - Risk Level
  - Average Delay
  - Followers Count

- **Performance Chart:**
  - Placeholder (TODO: Recharts implementation)

- **Holdings Table:**
  - Stock ticker
  - Company name
  - Allocation percentage
  - Example: "NVDA - NVIDIA Corporation - 25%"

- **Investment Form:**
  - Amount input (CLP)
  - Allocation percentage input
  - User's current balance display
  - "Invest" button
  - Success/error messages

### Frontend Data Models

**URL Parameter:**
```typescript
id: string  // from useParams()
```

**API Calls:**
```typescript
trackerApi.getTrackerDetails(id: number) → Tracker
trackerApi.getTrackerHoldings(id: number) → TrackerHolding[]
investmentApi.executeInvestment(data) → InvestmentResponse
```

**TrackerHolding Type:**
```typescript
interface TrackerHolding {
  id: number;
  tracker_id: number;
  ticker: string;              // e.g., "NVDA"
  company_name: string;        // e.g., "NVIDIA Corporation"
  allocation_percent: number;  // e.g., 25.0
}
```

**InvestmentResponse Type:**
```typescript
interface InvestmentResponse {
  success: boolean;
  message?: string;
  portfolio_item_id?: number;
  remaining_balance?: number;
  error?: string;
}
```

**State:**
```typescript
tracker: Tracker | null
holdings: TrackerHolding[]
investmentAmount: string
investing: boolean
investmentError: string
investmentSuccess: boolean
user: User  // from AuthContext
```

### Backend Dependencies

**API Endpoints:**

1. **Get Tracker Details**
```
GET /api/v1/trackers/:id/
```
Response: Single Tracker object (see Marketplace)

2. **Get Tracker Holdings**
```
GET /api/v1/trackers/:id/holdings/
```
Response:
```json
[
  {
    "id": 1,
    "tracker_id": 1,
    "ticker": "NVDA",
    "company_name": "NVIDIA Corporation",
    "allocation_percent": 25.0
  },
  {
    "id": 2,
    "tracker_id": 1,
    "ticker": "MSFT",
    "company_name": "Microsoft Corporation",
    "allocation_percent": 20.0
  }
]
```

3. **Execute Investment**
```
POST /api/v1/invest
```
Request:
```json
{
  "user_id": 1,
  "tracker_id": 1,
  "amount_clp": 50000,
  "allocation_percent": 20
}
```
Response:
```json
{
  "success": true,
  "message": "Investment successful",
  "transaction_id": 1,
  "remaining_balance": 950000.0
}
```

**Backend Models:**

```python
class TrackerHolding(SQLModel, table=True):
    id: Optional[int]
    tracker_id: Optional[int]
    ticker: str
    company_name: str
    allocation_percent: float
    tracker: Optional[Tracker]

class PortfolioItem(SQLModel, table=True):
    id: Optional[int]
    user_id: Optional[int]
    tracker_id: Optional[int]
    invested_amount_clp: float
    current_value_clp: float
    user: Optional[User]
    tracker: Optional[Tracker]

class Transaction(SQLModel, table=True):
    id: Optional[int]
    user_id: Optional[int]
    tracker_id: Optional[int]
    type: str  # 'buy' or 'sell'
    amount_clp: float
    timestamp: datetime
```

### User Flow
1. Page loads tracker details and holdings from API
2. User reviews tracker information
3. User enters investment amount (e.g., 50000 CLP)
4. User sets allocation percentage (e.g., 20%)
5. User clicks "Invest"
6. System validates:
   - Amount > 0
   - Amount ≤ user balance
   - Allocation between 0-100
7. On success:
   - Shows success message
   - Redirects to dashboard after 2 seconds
8. On error:
   - Shows error message (e.g., "Insufficient balance")

---

## View 4: Dashboard Page

### URL
```
http://localhost:5173/dashboard
```

### Purpose
View user's complete portfolio with all active investments and P&L.

### What It Shows
- **Header:**
  - Back to Marketplace button
  - Logout button

- **Summary Cards (4 cards):**
  - Available Balance (CLP)
  - Total Invested (CLP)
  - Current Value (CLP)
  - Total P&L (CLP and %)

- **Active Tracker Investments:**
  - Card for each active tracker showing:
    - Tracker name and type
    - Amount invested
    - Current value
    - P&L (amount and %)
    - Click to view tracker details

- **Empty State:**
  - Shown when no investments
  - "Start investing" button → Marketplace

### Frontend Data Models

**API Call:**
```typescript
portfolioApi.getUserPortfolio(userId: number) → Portfolio
```

**Portfolio Type:**
```typescript
interface Portfolio {
  user_id: number;
  available_balance_clp: number;
  total_invested_clp: number;
  total_current_value_clp: number;
  total_profit_loss_clp: number;
  total_profit_loss_percent: number;
  active_trackers: ActiveTracker[];
}
```

**ActiveTracker Type:**
```typescript
interface ActiveTracker {
  tracker_id: number;
  tracker_name: string;
  invested_amount_clp: number;
  current_value_clp: number;
  profit_loss_clp: number;
  profit_loss_percent: number;
}
```

**State:**
```typescript
portfolio: Portfolio | null
loading: boolean
error: string
user: User  // from AuthContext
```

### Backend Dependencies

**API Endpoint:**
```
GET /api/v1/portfolio/:user_id/
```

**Response (With Investments):**
```json
{
  "user_id": 1,
  "available_balance_clp": 850000.0,
  "total_invested_clp": 150000.0,
  "total_current_value_clp": 157500.0,
  "total_profit_loss_clp": 7500.0,
  "total_profit_loss_percent": 5.0,
  "active_trackers": [
    {
      "tracker_id": 1,
      "tracker_name": "Nancy Pelosi",
      "tracker_type": "congress",
      "invested_amount_clp": 100000.0,
      "current_value_clp": 105000.0,
      "profit_loss_clp": 5000.0,
      "profit_loss_percent": 5.0
    },
    {
      "tracker_id": 2,
      "tracker_name": "Warren Buffett",
      "tracker_type": "hedge_fund",
      "invested_amount_clp": 50000.0,
      "current_value_clp": 52500.0,
      "profit_loss_clp": 2500.0,
      "profit_loss_percent": 5.0
    }
  ]
}
```

**Response (No Investments):**
```json
{
  "user_id": 1,
  "available_balance_clp": 1000000.0,
  "total_invested_clp": 0.0,
  "total_current_value_clp": 0.0,
  "total_profit_loss_clp": 0.0,
  "total_profit_loss_percent": 0.0,
  "active_trackers": []
}
```

**Backend Models:**
All calculations derived from:
```python
# PortfolioService aggregates data from:
User.balance_clp
PortfolioItem.invested_amount_clp
PortfolioItem.current_value_clp
Tracker.name (for tracker info)
```

### User Flow
1. Page loads user's portfolio from API
2. User views investment summary
3. User can:
   - Click tracker card → view tracker details
   - Click "Back to Marketplace" → browse more trackers
   - Click "Logout" → return to login

---

## Data Flow Summary

### Authentication Flow
```
LoginPage → POST /auth/dev-login → User object → localStorage
         → AuthContext → All protected pages
```

### Marketplace Flow
```
MarketplacePage → GET /trackers/ → Tracker[] → Display grid
                → Click tracker → Navigate to /tracker/:id
```

### Investment Flow
```
TrackerDetailPage → GET /trackers/:id → Tracker details
                  → GET /trackers/:id/holdings → Holdings table
                  → POST /invest → Create PortfolioItem + Transaction
                  → Navigate to /dashboard
```

### Portfolio Flow
```
DashboardPage → GET /portfolio/:user_id → Portfolio with P&L
              → Click tracker → Navigate to /tracker/:id
```

---

## Backend Model Relationships

```
User
 ├── portfolio_items: List[PortfolioItem]
 └── transactions: List[Transaction]

Tracker
 ├── holdings: List[TrackerHolding]
 ├── portfolio_items: List[PortfolioItem]
 └── transactions: List[Transaction]

PortfolioItem
 ├── user: User
 └── tracker: Tracker

TrackerHolding
 └── tracker: Tracker

Transaction
 ├── user: User
 └── tracker: Tracker
```

---

## Frontend-Backend Type Mapping

| Frontend Type | Backend Model | API Endpoint |
|---------------|---------------|--------------|
| `User` | `User` | `/auth/dev-login` |
| `Tracker` | `Tracker` | `/trackers/`, `/trackers/:id/` |
| `TrackerHolding` | `TrackerHolding` | `/trackers/:id/holdings/` |
| `Portfolio` | Computed (PortfolioService) | `/portfolio/:user_id/` |
| `ActiveTracker` | Computed (PortfolioService) | `/portfolio/:user_id/` |
| `InvestmentResponse` | API Response | `/invest` |

---

## Local Development Mode

When `VITE_LOCAL_DEVELOPMENT=true`:

- **Auto-login**: Uses mock user (ID: 1, 1M CLP)
- **All views accessible**: No login required
- **Direct URLs work**: Can navigate directly to any page
- **Console indicator**: Shows "🔧 LOCAL_DEVELOPMENT mode"

To test with real authentication:
```bash
# In frontend/.env
VITE_LOCAL_DEVELOPMENT=false
```

Then restart frontend:
```bash
docker-compose restart frontend
```

---

## Quick Testing Guide

### Test Complete User Journey

1. **Start at login** (or marketplace if LOCAL_DEVELOPMENT=true)
   ```
   http://localhost:5173/login
   ```

2. **Select User 1** (Alice - 1M CLP)

3. **Browse marketplace**
   ```
   http://localhost:5173/marketplace
   ```

4. **View Nancy Pelosi tracker**
   ```
   http://localhost:5173/tracker/1
   ```

5. **Invest 50,000 CLP**
   - Enter: 50000
   - Allocation: 20%
   - Click "Invest"

6. **View dashboard**
   ```
   http://localhost:5173/dashboard
   ```

7. **Verify investment appears** with P&L

### Test Error Scenarios

**Insufficient Balance:**
1. Login as User 2 (Bob - only 20k CLP)
2. Try to invest 50,000 CLP in any tracker
3. Should show "Insufficient balance" error

**Invalid Tracker:**
```
http://localhost:5173/tracker/999
```
Should show error message or 404

---

## API Dependencies Per View

| View | API Calls | Required Models |
|------|-----------|-----------------|
| **Login** | `POST /auth/dev-login` | User |
| **Marketplace** | `GET /trackers/` | Tracker |
| **Tracker Detail** | `GET /trackers/:id/`<br>`GET /trackers/:id/holdings/`<br>`POST /invest` | Tracker<br>TrackerHolding<br>PortfolioItem<br>Transaction |
| **Dashboard** | `GET /portfolio/:user_id/` | User<br>PortfolioItem<br>Tracker |

---

## Environment Configuration

All views require these environment variables:

**Frontend (`.env`):**
```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_LOCAL_DEVELOPMENT=true
```

**Backend (`.env`):**
```bash
DATABASE_URL=postgresql://hedgie:hedgie_password@db:5432/hedgie
BROKER_MODE=mock
```

**Services Running:**
```bash
docker-compose up -d
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1
- API Docs: http://localhost:8000/docs
- Database: localhost:5432
