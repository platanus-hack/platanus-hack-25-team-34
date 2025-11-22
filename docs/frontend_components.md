# Frontend Components Documentation

## Overview
This document identifies all components in the frontend codebase and specifies the data they receive/display.

---

## 1. **TrackerCard** (Currently inline in MarketplacePage)
**Location:** `MarketplacePage.tsx` (lines 118-161)  
**Status:** Not extracted as separate component yet  
**Purpose:** Display tracker preview in marketplace grid

### Data Requirements:
```typescript
interface TrackerCardProps {
  tracker: {
    id: number;
    name: string;              // Display: Main title
    avatar_url?: string;       // Display: Card image (200px height)
    ytd_return: number;        // Display: Large green text (e.g., "+15.2%")
    risk_level: string;        // Display: Subtitle text (e.g., "Medium Risk")
    type: string;              // Used for filtering (not displayed)
    description?: string;      // Not currently displayed in card
    average_delay: number;     // Not displayed in card
    followers_count: number;   // Not displayed in card
  };
  onClick: () => void;         // Navigate to tracker detail
}
```

### Display Elements:
- **Image:** `tracker.avatar_url` (200px height)
- **Title:** `tracker.name` (h6, primary text color)
- **Return:** `tracker.ytd_return` (h5, green/positive color, bold)
- **Risk:** `tracker.risk_level` (body2, secondary text color)
- **Badge:** "Hedge cherry picking" (hardcoded, info badge)

### Styling:
- Material-UI Card component
- Background: `var(--card-bg)`
- Flex: `1 1 300px`, max-width: 350px
- Cursor: pointer (clickable)

---

## 2. **HoldingsTable** (Currently inline in TrackerDetailPage)
**Location:** `TrackerDetailPage.tsx` (lines 144-167)  
**Status:** Not extracted as separate component yet  
**Purpose:** Display tracker's stock/asset holdings

### Data Requirements:
```typescript
interface HoldingsTableProps {
  holdings: TrackerHolding[];
}

interface TrackerHolding {
  id: number;
  tracker_id: number;         // Not displayed
  ticker: string;             // Display: Column 1 (e.g., "AAPL")
  company_name: string;       // Display: Column 2 (e.g., "Apple Inc.")
  allocation_percent: number; // Display: Column 3 (e.g., "25.5%")
}
```

### Display Elements:
- **Table Headers:** Ticker | Company | Allocation
- **Ticker:** `holding.ticker` (left-aligned)
- **Company:** `holding.company_name` (left-aligned)
- **Allocation:** `holding.allocation_percent%` (right-aligned)
- **Empty State:** "No holdings available" when `holdings.length === 0`

### Styling:
- HTML table with borders
- Border: `1px solid #ddd` (header), `#eee` (rows)
- Padding: 10px per cell

---

## 3. **PortfolioSummary** (Currently inline in DashboardPage)
**Location:** `DashboardPage.tsx` (lines 81-90)  
**Status:** Not extracted as separate component yet  
**Purpose:** Display user's total portfolio metrics

### Data Requirements:
```typescript
interface PortfolioSummaryProps {
  portfolio: {
    available_balance_clp: number;      // Display: Available funds
    total_invested_clp: number;         // Display: Total invested
    total_current_value_clp: number;    // Display: Current portfolio value
    total_profit_loss_clp: number;      // Display: P&L amount (colored)
    total_profit_loss_percent: number;  // Display: P&L percentage (colored)
  };
}
```

### Display Elements:
- **Available:** Formatted as CLP currency
- **Invested:** Formatted as CLP currency
- **Current Value:** Formatted as CLP currency
- **P&L:** Green (positive) or red (negative) with +/- prefix
- **P&L %:** Displayed in parentheses (e.g., "(+5.2%)")

### Styling:
- Plain text with color coding
- Green: P&L >= 0
- Red: P&L < 0

---

## 4. **ActiveTrackerCard** (Currently inline in DashboardPage)
**Location:** `DashboardPage.tsx` (lines 93-106)  
**Status:** Not extracted as separate component yet  
**Purpose:** Display individual tracker investment in portfolio

### Data Requirements:
```typescript
interface ActiveTrackerCardProps {
  tracker: {
    tracker_id: number;              // Used for navigation
    tracker_name: string;            // Display: Title
    invested_amount_clp: number;     // Display: Amount invested
    current_value_clp: number;       // Display: Current value
    profit_loss_clp: number;         // Display: P&L amount (colored)
    profit_loss_percent: number;     // Display: P&L percentage (colored)
  };
  onViewDetails: () => void;         // Navigate to tracker detail
}
```

### Display Elements:
- **Title:** `tracker.tracker_name` (h3)
- **Invested:** `tracker.invested_amount_clp` (formatted CLP)
- **Current:** `tracker.current_value_clp` (formatted CLP)
- **P&L:** `tracker.profit_loss_clp` (green/red, +/- prefix)
- **P&L %:** `tracker.profit_loss_percent` (in parentheses)
- **Button:** "View Details" (navigates to tracker)

### Styling:
- Border: `1px solid #ccc`
- Padding: 10px
- Margin: 10px vertical

---

## 5. **TransactionHistoryTable** (Currently inline in DashboardPage)
**Location:** `DashboardPage.tsx` (lines 115-141)  
**Status:** Not extracted as separate component yet  
**Purpose:** Display user's investment transaction history

### Data Requirements:
```typescript
interface TransactionHistoryTableProps {
  transactions: Transaction[];
}

interface Transaction {
  id: number;
  type: string;              // Display: "buy" or "sell" (capitalized)
  tracker_id: number;        // Not displayed directly
  tracker_name: string;      // Display: Tracker name
  amount_clp: number;        // Display: Transaction amount (formatted CLP)
  timestamp: string;         // Display: Formatted date/time
}
```

### Display Elements:
- **Table Headers:** Date | Type | Tracker | Amount
- **Date:** Formatted as "Nov 22, 2025, 19:44" (es-CL locale)
- **Type:** Capitalized (e.g., "Buy", "Sell")
- **Tracker:** `transaction.tracker_name`
- **Amount:** Formatted CLP, right-aligned
- **Empty State:** "No transaction history yet" when `transactions.length === 0`

### Styling:
- Table: 100% width, collapsed borders
- Border: `1px solid #ddd` (header), `#eee` (rows)
- Text transform: capitalize for type column

---

## 6. **InvestmentForm** (Currently inline in TrackerDetailPage)
**Location:** `TrackerDetailPage.tsx` (lines 218-245)  
**Status:** Not extracted as separate component yet  
**Purpose:** Allow user to invest in a tracker

### Data Requirements:
```typescript
interface InvestmentFormProps {
  tracker: {
    id: number;
    name: string;              // Display in heading
  };
  userBalance: number;         // Display available balance
  onInvest: (amount: number) => Promise<void>;
  loading: boolean;
  error?: string;
  success: boolean;
}
```

### Display Elements:
- **Heading:** "Invest in {tracker.name}"
- **Available Balance:** Formatted CLP (bold)
- **Input:** Number input for amount in CLP
- **Error Message:** Red text if validation fails
- **Success Message:** Green checkmark when complete
- **Submit Button:** "Invest Now" / "Processing..."

### Validation:
- Amount > 0
- Amount <= userBalance
- Backend validation for sufficient funds

### Styling:
- Border: `2px solid #007bff`
- Border radius: 8px
- Padding: 20px
- Margin top: 20px

---

## 7. **Navbar** Component
**Location:** `frontend/src/components/Navbar.tsx`  
**Status:** ✅ Extracted as component  
**Purpose:** Global navigation for authenticated users

### Data Requirements:
```typescript
interface NavbarProps {
  // No props - uses AuthContext internally
}
```

### Internal Data (from AuthContext):
- `user.name` - Display user name
- `isAuthenticated` - Show/hide navbar
- `logout()` - Logout function

### Display Elements:
- **Brand:** "Hedgie" (h1)
- **Links:**
  - Marketplace button
  - Dashboard button
  - Mi Cuenta button
- **User Info:** User name display
- **Logout:** Cerrar Sesión button

### Styling:
- Data attributes for styling hooks
- `data-component="navbar"`
- `data-section="navbar-container"`, `navbar-brand`, `navbar-links`, `user-info`

---

## 8. **Chart** Component
**Location:** `frontend/src/components/Chart.tsx`  
**Status:** ✅ Extracted as component  
**Purpose:** Display Vega-Lite charts from API

### Data Requirements:
```typescript
interface ChartProps {
  // No props - fetches data internally from API
}
```

### Internal State:
- `chartSpec` - Vega-Lite specification from API
- `selectedData` - Data point clicked by user
- `loading` - Loading state
- `error` - Error message

### Display Elements:
- **Title:** "Advanced Chart Generator"
- **Generate Button:** Trigger chart generation
- **Chart:** VegaEmbed component with spec
- **Selected Data:** JSON display of clicked data point
- **Error Display:** Red error message

### API Integration:
- Fetches from: `chartApi.getChart()`
- Returns: `{ spec: VegaLiteSpec }`

---

## 9. **BalanceDisplay** (Currently inline in UserAccountPage)
**Location:** `UserAccountPage.tsx` (lines 136-150)  
**Status:** Not extracted as separate component yet  
**Purpose:** Show user balance in CLP and USD

### Data Requirements:
```typescript
interface BalanceDisplayProps {
  balanceClp: number;        // Primary balance
  exchangeRate: number;      // CLP to USD rate (default: 950)
}
```

### Display Elements:
- **Heading:** "Saldo Disponible"
- **CLP Balance:** Formatted with CLP symbol
- **USD Balance:** Converted and formatted with USD symbol
- **Exchange Rate Info:** "Tasa de cambio: 1 USD = 950 CLP"

### Utilities Used:
- `formatCLP()` - Formats CLP currency
- `formatUSD()` - Formats USD currency
- `convertClpToUsd()` - Converts CLP to USD

---

## 10. **DepositWithdrawForms** (Currently inline in UserAccountPage)
**Location:** `UserAccountPage.tsx` (lines 167-218)  
**Status:** Not extracted as separate component yet  
**Purpose:** Forms for depositing and withdrawing funds

### Data Requirements:
```typescript
interface DepositWithdrawFormsProps {
  onDeposit: (amount: number) => Promise<void>;
  onWithdraw: (amount: number) => Promise<void>;
  currentBalance: number;      // For withdraw validation
  loading: boolean;
  exchangeRate: number;        // Show USD equivalent
}
```

### Display Elements (Deposit Form):
- **Heading:** "Depositar Fondos"
- **Input:** Amount in CLP
- **Conversion Display:** USD equivalent
- **Submit Button:** "Depositar" / "Procesando..."

### Display Elements (Withdraw Form):
- **Heading:** "Retirar Fondos"
- **Input:** Amount in CLP
- **Conversion Display:** USD equivalent
- **Submit Button:** "Retirar" / "Procesando..."

### Validation:
- Deposit: Amount > 0
- Withdraw: Amount > 0 and Amount <= currentBalance

---

## 11. **DisclaimerModal** (Currently inline in TrackerDetailPage)
**Location:** `TrackerDetailPage.tsx` (lines 175-215)  
**Status:** Not extracted as separate component yet  
**Purpose:** Display legal disclaimer

### Data Requirements:
```typescript
interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  content?: string;          // Default: placeholder text
}
```

### Display Elements:
- **Overlay:** Full-screen semi-transparent background
- **Modal Box:** White box centered on screen
- **Close Button:** X button (top-right)
- **Title:** "Disclaimer"
- **Content:** Disclaimer text
- **Close Button:** "Cerrar" button

### Styling:
- Position: fixed, full viewport
- Background: `rgba(0,0,0,0.5)`
- Modal: white, 500px max-width, 90% width
- Z-index: 1000

---

## Summary of Component Extraction Opportunities

### ✅ Already Extracted:
1. `Navbar` - Global navigation
2. `Chart` - Vega chart component

### 🔧 Should Be Extracted:
1. **TrackerCard** - Reusable in marketplace and search results
2. **HoldingsTable** - Reusable for any holdings display
3. **PortfolioSummary** - Reusable dashboard widget
4. **ActiveTrackerCard** - Reusable portfolio item
5. **TransactionHistoryTable** - Reusable transaction display
6. **InvestmentForm** - Reusable investment widget
7. **BalanceDisplay** - Reusable balance widget
8. **DepositWithdrawForms** - Reusable account forms
9. **DisclaimerModal** - Reusable modal component

### 📊 Data Flow Summary:
- **From API:** Tracker, TrackerHolding, Portfolio, Transaction, User
- **From Context:** AuthContext (user, balance, logout, updateUser)
- **From Constants:** Currency formatting (formatCLP, formatUSD, convertClpToUsd, CLP_TO_USD_RATE)

---

## TypeScript Interfaces Reference

All data interfaces are defined in `frontend/src/types/index.ts`:
- `User` - User account data
- `Tracker` - Tracker/fund information
- `TrackerHolding` - Individual stock holdings
- `ActiveTracker` - Portfolio tracker item
- `Portfolio` - Complete portfolio summary
- `Transaction` - Transaction history item
- `InvestmentResponse` - Investment API response
- `BalanceResponse` - Balance API response

