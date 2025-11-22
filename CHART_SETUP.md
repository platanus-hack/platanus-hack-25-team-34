# Chart Feature Setup Guide

## Current Status
The chart/visualization features are **temporarily disabled** to allow the app to run without missing dependencies.

## What Was Disabled

### Backend
- File: `/backend/app/api/chart.py` (exists but not imported)
- Commented out in `/backend/app/main.py`:
  ```python
  # from app.api import chart  # TODO: Install altair, yfinance, vega_datasets first
  # app.include_router(chart.router, prefix=settings.API_V1_STR)
  ```

### Frontend
- File: `/frontend/src/components/Chart.jsx` (exists but not used)
- Commented out in `/frontend/src/pages/TrackerDetailPage.tsx`:
  ```tsx
  // import ChartFromAPI from '/src/components/Chart.jsx';
  // <ChartFromAPI></ChartFromAPI>
  ```

## How to Enable Chart Features

### Step 1: Install Backend Dependencies

The required packages are already in `requirements.txt`:
- `altair`
- `yfinance`
- `vega_datasets`
- `polars`
- `pyarrow`

**Option A: Rebuild Backend Container**
```bash
cd /home/alonso/hackathon
docker-compose stop backend
docker-compose build backend
docker-compose up -d backend
```

**Option B: Install in Running Container**
```bash
docker-compose exec backend pip install altair yfinance vega_datasets polars pyarrow
docker-compose restart backend
```

### Step 2: Install Frontend Dependencies

The required package is already in `package.json`:
- `react-vega`: "^8.0.0"

**Rebuild Frontend Container:**
```bash
cd /home/alonso/hackathon
docker-compose stop frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Step 3: Uncomment Code

**Backend (`/backend/app/main.py`):**
```python
from app.api import trackers, invest, portfolio, auth, chart  # Uncomment chart

# Later in file:
app.include_router(chart.router, prefix=settings.API_V1_STR)  # Uncomment this line
```

**Frontend (`/frontend/src/pages/TrackerDetailPage.tsx`):**
```tsx
import ChartFromAPI from '/src/components/Chart.jsx';  // Uncomment

// In the JSX:
<div>
  <ChartFromAPI></ChartFromAPI>  {/* Uncomment */}
</div>
```

### Step 4: Restart Services
```bash
docker-compose restart backend frontend
```

### Step 5: Test
Visit http://localhost:5173/tracker/1 and you should see the chart component.

## Why This Happened

The chart files (`chart.py` and `Chart.jsx`) were added to the codebase but:
1. The Docker containers weren't rebuilt to install the new dependencies
2. Building from scratch takes time due to installing system packages (gcc, etc.)

## Quick Test Without Charts

The app works perfectly without charts:
- ✅ Login
- ✅ Marketplace
- ✅ Tracker Details
- ✅ Holdings Table
- ✅ Investment Form
- ✅ Dashboard
- ❌ Performance Chart (disabled)

Charts are a **nice-to-have feature**, not critical for MVP functionality.
