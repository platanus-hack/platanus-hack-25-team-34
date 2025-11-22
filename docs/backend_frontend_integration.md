# Backend-Frontend Integration Guide

## Architecture Overview

The Hedgie application follows a **layered architecture** with clear separation between backend and frontend:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  (React Components + TypeScript)                            │
├─────────────────────────────────────────────────────────────┤
│                     HTTP/JSON API                            │
│              (REST endpoints over HTTP)                      │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ API Routes │→ │  Services  │→ │   Models   │→ Database │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Backend to Frontend

### 1. **Database Models** (SQLModel)
**Location**: `/backend/app/models/*.py`

**Purpose**: Define the database schema and Python objects.

**Example**:
```python
class Tracker(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    ytd_return: float
    # ... other fields
```

**Frontend Impact**: Frontend never directly accesses these. They define the "source of truth" for data structure.

---

### 2. **Services Layer** (Business Logic)
**Location**: `/backend/app/services/*.py`

**Purpose**: Encapsulate business logic, orchestrate database operations, perform calculations.

**Example**:
```python
class PortfolioService:
    def get_user_portfolio(self, user_id: int, session: Session) -> Dict:
        # Fetch data from database
        # Perform calculations (P&L, percentages)
        # Return structured dictionary
        return {
            "user_id": user_id,
            "total_invested_clp": 100000,
            "total_profit_loss_clp": 5000,
            "active_trackers": [...]
        }
```

**Frontend Impact**: Frontend never calls these directly. Services prepare data that will be returned by API endpoints.

---

### 3. **API Routes** (FastAPI Endpoints)
**Location**: `/backend/app/api/*.py`

**Purpose**: HTTP interface that frontend calls. Validates input, calls services, returns JSON.

**Example**:
```python
@router.get("/portfolio/{user_id}")
def get_user_portfolio(user_id: int, session: Session = Depends(get_session)):
    portfolio = portfolio_service.get_user_portfolio(user_id, session)
    if "error" in portfolio:
        raise HTTPException(status_code=404, detail=portfolio["error"])
    return portfolio
```

**API Response** (JSON):
```json
{
  "user_id": 1,
  "available_balance_clp": 950000,
  "total_invested_clp": 50000,
  "total_current_value_clp": 52500,
  "total_profit_loss_clp": 2500,
  "total_profit_loss_percent": 5.0,
  "active_trackers": [
    {
      "tracker_id": 1,
      "tracker_name": "Nancy Pelosi",
      "invested_amount_clp": 50000,
      "current_value_clp": 52500,
      "profit_loss_clp": 2500,
      "profit_loss_percent": 5.0
    }
  ]
}
```

**Frontend Impact**: This is what the frontend **DIRECTLY CONSUMES** via HTTP.

---

### 4. **Frontend API Client** (Axios)
**Location**: `/frontend/src/services/api.ts` (to be created)

**Purpose**: Centralize all HTTP calls to the backend.

**Example**:
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const portfolioApi = {
  getUserPortfolio: async (userId: number) => {
    const response = await apiClient.get(`/portfolio/${userId}`);
    return response.data;
  },
};

export const trackerApi = {
  getAllTrackers: async () => {
    const response = await apiClient.get('/trackers');
    return response.data;
  },
  
  getTrackerDetails: async (trackerId: number) => {
    const response = await apiClient.get(`/trackers/${trackerId}`);
    return response.data;
  },
};

export const investmentApi = {
  executeInvestment: async (userId: number, trackerId: number, amountClp: number) => {
    const response = await apiClient.post('/invest', {
      user_id: userId,
      tracker_id: trackerId,
      amount_clp: amountClp,
    });
    return response.data;
  },
};
```

---

### 5. **TypeScript Types** (Frontend Models)
**Location**: `/frontend/src/types/*.ts` (to be created)

**Purpose**: Define TypeScript interfaces that **mirror** the backend's JSON responses.

**Example**:
```typescript
// frontend/src/types/tracker.ts
export interface Tracker {
  id: number;
  name: string;
  type: string;
  avatar_url?: string;
  description?: string;
  ytd_return: number;
  average_delay: number;
  risk_level: string;
  followers_count: number;
}

// frontend/src/types/portfolio.ts
export interface ActiveTracker {
  tracker_id: number;
  tracker_name: string;
  invested_amount_clp: number;
  current_value_clp: number;
  profit_loss_clp: number;
  profit_loss_percent: number;
}

export interface Portfolio {
  user_id: number;
  available_balance_clp: number;
  total_invested_clp: number;
  total_current_value_clp: number;
  total_profit_loss_clp: number;
  total_profit_loss_percent: number;
  active_trackers: ActiveTracker[];
}
```

**Critical**: These types must **exactly match** the structure of the JSON returned by the API.

---

### 6. **React Components** (UI)
**Location**: `/frontend/src/components/*.tsx` or `/frontend/src/pages/*.tsx`

**Purpose**: Display data, handle user interaction, trigger API calls.

**Example**:
```typescript
import React, { useEffect, useState } from 'react';
import { portfolioApi } from '../services/api';
import { Portfolio } from '../types/portfolio';

export const DashboardPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const userId = 1; // In real app, get from auth context

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await portfolioApi.getUserPortfolio(userId);
        setPortfolio(data);
      } catch (error) {
        console.error('Failed to fetch portfolio', error);
      }
    };
    fetchPortfolio();
  }, [userId]);

  if (!portfolio) return <div>Loading...</div>;

  return (
    <div>
      <h1>Your Portfolio</h1>
      <p>Available Balance: {portfolio.available_balance_clp} CLP</p>
      <p>Total Invested: {portfolio.total_invested_clp} CLP</p>
      <p>Profit/Loss: {portfolio.total_profit_loss_clp} CLP ({portfolio.total_profit_loss_percent}%)</p>
      
      <h2>Active Trackers</h2>
      {portfolio.active_trackers.map((tracker) => (
        <div key={tracker.tracker_id}>
          <h3>{tracker.tracker_name}</h3>
          <p>Invested: {tracker.invested_amount_clp} CLP</p>
          <p>Current Value: {tracker.current_value_clp} CLP</p>
          <p>P&L: {tracker.profit_loss_clp} CLP ({tracker.profit_loss_percent}%)</p>
        </div>
      ))}
    </div>
  );
};
```

---

## Complete Request Flow Example

**User Action**: User navigates to Dashboard page

1. **Frontend Component** (`DashboardPage.tsx`):
   ```typescript
   portfolioApi.getUserPortfolio(1)
   ```

2. **Frontend API Client** (`api.ts`):
   ```typescript
   GET http://localhost:8000/api/v1/portfolio/1
   ```

3. **Backend API Route** (`backend/app/api/portfolio.py`):
   ```python
   @router.get("/portfolio/{user_id}")
   def get_user_portfolio(user_id: int, session: Session):
       portfolio = portfolio_service.get_user_portfolio(user_id, session)
   ```

4. **Backend Service** (`backend/app/services/portfolio_service.py`):
   ```python
   def get_user_portfolio(self, user_id: int, session: Session):
       user = session.get(User, user_id)
       portfolio_items = session.exec(select(PortfolioItem)...)
       # Calculate totals, P&L
       return { "user_id": 1, "total_invested_clp": 50000, ... }
   ```

5. **Database Models** (`backend/app/models/*.py`):
   ```python
   SQLModel queries: User, PortfolioItem, Tracker
   ```

6. **Database**: PostgreSQL returns rows

7. **Response flows back**:
   - Service → API Route → JSON Response
   - Frontend receives JSON
   - TypeScript types ensure type safety
   - Component re-renders with data

---

## Key Principles

### 1. **Separation of Concerns**
- **Backend**: Data storage, business logic, validation
- **Frontend**: User interface, user experience, presentation

### 2. **API as Contract**
The API endpoints are the **contract** between frontend and backend.
- Frontend only knows about HTTP endpoints and JSON structure
- Backend can change internal implementation (switch databases, refactor services) without breaking frontend
- As long as API responses maintain the same structure, frontend continues to work

### 3. **Type Safety**
- Backend: Pydantic/SQLModel ensure Python type safety
- Frontend: TypeScript interfaces ensure type safety
- Both sides must agree on the **shape of the data**

### 4. **No Direct Access**
Frontend **NEVER**:
- Accesses the database directly
- Calls Python services directly
- Imports backend models

Frontend **ONLY**:
- Makes HTTP requests to API endpoints
- Receives JSON responses
- Works with TypeScript types

---

## Development Workflow

When building a new feature:

1. **Define the data model** (SQLModel) → Database schema
2. **Create seed data** (JSON) → Test data
3. **Build the service** (Business logic) → Data processing
4. **Create API endpoint** (FastAPI route) → HTTP interface
5. **Define TypeScript types** (Frontend) → Type safety
6. **Create API client function** (Axios) → HTTP calls
7. **Build React component** (UI) → User interface

Each layer builds on the previous, creating a clean separation of concerns.

---

## Common Patterns

### Pattern 1: List View (Marketplace)
- **API**: `GET /trackers`
- **Service**: `tracker_service.get_all_trackers()`
- **Frontend**: `trackerApi.getAllTrackers()` → Display grid of cards

### Pattern 2: Detail View
- **API**: `GET /trackers/{id}`
- **Service**: `tracker_service.get_tracker_by_id()`
- **Frontend**: `trackerApi.getTrackerDetails(id)` → Display full details

### Pattern 3: Action (Investment)
- **API**: `POST /invest`
- **Service**: `investment_service.execute_investment()`
- **Frontend**: Form submit → `investmentApi.executeInvestment()` → Show result

### Pattern 4: Dashboard
- **API**: `GET /portfolio/{user_id}`
- **Service**: `portfolio_service.get_user_portfolio()`
- **Frontend**: `portfolioApi.getUserPortfolio()` → Display summary + charts

---

## Testing the Integration

### 1. **Backend Testing** (without frontend):
```bash
# Via Swagger UI
http://localhost:8000/docs

# Via curl
curl http://localhost:8000/api/v1/trackers
```

### 2. **Frontend Testing** (with backend running):
```bash
# Start backend
docker-compose up backend

# Start frontend (separate terminal)
cd frontend && npm run dev

# Frontend makes requests to http://localhost:8000
```

### 3. **Check for CORS issues**:
The backend has CORS middleware configured to allow `localhost:5173` (Vite dev server).

---

## Troubleshooting

**Problem**: Frontend gets 404 errors
- **Check**: Is backend running? Is the URL correct?
- **Verify**: `http://localhost:8000/docs` shows the endpoint

**Problem**: Frontend gets CORS errors
- **Check**: Backend CORS middleware allows frontend origin
- **Verify**: `backend/app/main.py` has correct `allow_origins`

**Problem**: TypeScript type errors
- **Check**: Do TypeScript interfaces match API response structure?
- **Test**: Log `response.data` in browser console to see actual structure

**Problem**: Data doesn't update
- **Check**: Did you re-seed the database after model changes?
- **Run**: `python -m app.seed`
