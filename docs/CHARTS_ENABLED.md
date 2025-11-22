# Chart Features - Now Enabled! 📊

## Status: ✅ ACTIVE

All chart dependencies have been installed and the chart features are now enabled.

## Where Charts Are Used

### 1. **Tracker Detail Page** (`/tracker/:id`)
- **Location**: `/frontend/src/pages/TrackerDetailPage.tsx`
- **Component**: `<ChartFromAPI />` from `/frontend/src/components/Chart.jsx`
- **What it shows**: Interactive Apple (AAPL) stock chart with 6 months of historical data
- **Features**:
  - Click to select data points
  - Hover tooltips showing Date and Price
  - Interactive zoom and pan
  - Displays selected data point details

**How to view**:
```bash
# Navigate to any tracker detail page
http://localhost:5173/tracker/1
http://localhost:5173/tracker/2
```

The chart appears below the tracker information and above the holdings table.

## Chart Architecture

### Backend (FastAPI + Altair + yfinance)

**File**: `/backend/app/api/chart.py`
- **Endpoint**: `POST /api/v1/chart/test`
- **Request**: `{ "val": 1 }`
- **Response**: Vega-Lite chart specification (JSON)

**What it does**:
1. Fetches 6 months of Apple stock data using `yfinance`
2. Creates interactive line chart using `Altair`
3. Returns Vega-Lite spec to frontend

**Dependencies** (installed via `requirements.txt`):
- `altair` - Chart generation
- `yfinance` - Stock data fetching
- `vega_datasets` - Example datasets
- `polars` - Data manipulation
- `pyarrow` - Data serialization

### Frontend (React + react-vega)

**Component**: `/frontend/src/components/Chart.jsx`
- **Library**: `react-vega` (VegaEmbed component)
- **State Management**: React hooks (useState, useCallback)
- **Features**:
  - Loading states
  - Error handling
  - Click event handling
  - Selected data display

**Dependencies** (installed via `package.json`):
- `react-vega@^8.0.0` - React wrapper for Vega
- `vega` - Visualization grammar
- `vega-lite` - High-level grammar
- `vega-embed` - Embeds charts in web pages

**API Integration**: `/frontend/src/services/api.ts`
```typescript
export const chartApi = {
  getChart: async () => {
    const response = await apiClient.post("chart/test", { val: 1 });
    return response.data;
  },
};
```

## Testing the Chart

### 1. **Backend Test**
```bash
curl -X POST http://localhost:8000/api/v1/chart/test \
  -H "Content-Type: application/json" \
  -d '{"val": 1}'
```

Expected response:
```json
{
  "status": "success",
  "spec": {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "mark": "line",
    "encoding": { ... }
  }
}
```

### 2. **Frontend Test**
1. Start the app: `docker-compose up`
2. Navigate to: `http://localhost:5173/tracker/1`
3. Click "Generate Chart" button
4. Interactive chart should appear showing AAPL stock prices
5. Click on data points to see details

## Chart Interaction Features

When you click "Generate Chart":

1. **Loading State**: Shows "Generating..." on the button
2. **Data Fetch**: Backend fetches real-time Apple stock data
3. **Chart Render**: Interactive Vega-Lite chart appears
4. **User Interactions**:
   - **Hover**: See date and price tooltips
   - **Click**: Select a data point to view full details
   - **Zoom**: Mouse wheel to zoom in/out
   - **Pan**: Drag to move around the chart
   - **Export**: Use Vega menu to save as PNG or SVG

## Future Enhancements

### Current Limitation
- Chart shows hardcoded Apple (AAPL) stock data
- Not connected to tracker's actual holdings

### Planned Improvements
1. **Dynamic Ticker Selection**: Chart shows the tracker's top holding
2. **Multiple Tickers**: Overlay multiple stocks from holdings
3. **Performance Tracking**: Show tracker's actual YTD performance
4. **Comparison Charts**: Compare tracker vs. market indices
5. **Custom Date Ranges**: User-selectable time periods
6. **Portfolio Charts**: Show user's investment performance over time

## Technical Details

### Vega-Lite Spec Example
The backend generates specs like:
```json
{
  "mark": "line",
  "encoding": {
    "x": { "field": "Date", "type": "temporal", "title": "Date" },
    "y": { "field": "Close", "type": "quantitative", "title": "Price (USD)" },
    "tooltip": [
      { "field": "Date", "type": "temporal" },
      { "field": "Close", "type": "quantitative" }
    ]
  },
  "width": 1000,
  "height": 300
}
```

### React Integration
```jsx
<VegaEmbed
  spec={chartSpec}
  options={{ actions: true, tooltip: true, hover: true }}
  onNewView={(view) => {
    view.addEventListener("click", handleChartClick);
  }}
/>
```

## Troubleshooting

### Chart doesn't appear
1. Check browser console for errors
2. Verify backend is running: `docker logs hackathon-backend-1`
3. Test API directly: `curl -X POST http://localhost:8000/api/v1/chart/test -d '{"val":1}'`

### "Module not found" errors
```bash
# Reinstall frontend dependencies
cd frontend
npm install

# Rebuild backend
docker-compose build backend
docker-compose up -d
```

### Chart loads but shows no data
- Check yfinance is working (may have rate limits)
- Check backend logs for errors
- Verify internet connection (yfinance fetches real-time data)

## Files Modified to Enable Charts

### Backend
- ✅ `/backend/app/main.py` - Uncommented chart router import
- ✅ `/backend/requirements.txt` - Already had dependencies

### Frontend  
- ✅ `/frontend/src/pages/TrackerDetailPage.tsx` - Uncommented Chart import and usage
- ✅ `/frontend/package.json` - Already had react-vega dependency
- ✅ Ran `npm install` to install dependencies

---

**The chart feature is now fully functional! Visit any tracker page to see it in action.** 🎉
