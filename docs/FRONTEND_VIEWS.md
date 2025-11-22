# Hedgie Frontend Views - Complete Guide

## Overview

Hedgie MVP has **4 main views** that make up the user journey from login to investment tracking. This document provides detailed information about each view, their purpose, components, data requirements, and user flows.

---

## View 1: Login Page 🔐

### Location
- **Route:** `/login`
- **Component:** `src/pages/LoginPage.tsx`
- **Access:** Public (no authentication required)

### Purpose
Development login screen for selecting a mock user. In production, this will be replaced with Google OAuth or similar authentication provider.

### User Interface

#### LayoutV
```
┌────────────────────────────────────┐
│     Welcome to Hedgie Logo         │
│                                    │
│   ┌────────────────────────────┐  │
│   │  Select User Dropdown      │  │
│   │  ○ User 1 - Alice Johnson  │  │
│   │  ○ User 2 - Bob Smith      │  │
│   │  ○ User 3 - Charlie Brown  │  │
│   └────────────────────────────┘  │
│                                    │
│   [ Login Button ]                 │
│                                    │
│   Error messages appear here       │
└────────────────────────────────────┘
```

#### Components
- **Dropdown/Select:** User selection (3 mock users)
- **Login Button:** Submits authentication
- **Error Display:** Shows validation/API errors

#### Mock Users
1. **Alice Johnson (User 1)** - 1,000,000 CLP (wealthy investor)
2. **Bob Smith (User 2)** - 20,000 CLP (small investor)
3. **Charlie Brown (User 3)** - 100,000 CLP (medium investor)

### Data Flow

#### API Call
```typescript
POST /api/v1/auth/dev-login
Request: { user_id: number }
Response: { id: number, name: string, balance_clp: number }
```

#### State Management
- Stores user in `AuthContext`
- Persists to `localStorage` as `hedgie_user`
- Redirects to `/marketplace` on success

### User Flow
```
1. User lands on /login
2. Selects user from dropdown
3. Clicks "Login"
4. API validates user_id
5. User stored in context
6. Redirect → /marketplace
```

### Local Development Mode
When `VITE_LOCAL_DEVELOPMENT=true`:
- This page still works but is not required
- Users can navigate directly to `/marketplace`
- Auto-authenticated as "Dev User (Local)" with 1M CLP

### Future Enhancements (TODOs)
- [ ] Replace with Google OAuth
- [ ] Add Auth0 integration
- [ ] Implement email/password flow
- [ ] Add "Remember Me" functionality
- [ ] Add password reset flow

---

## View 2: Marketplace Page 🏪

### Location
- **Route:** `/marketplace`
- **Component:** `src/pages/MarketplacePage.tsx`
- **Access:** Protected (requires authentication, bypassed in local dev mode)

### Purpose
Browse all available trackers (investment strategies) that users can follow. This is the main discovery page where users explore different investment opportunities.

### User Interface

#### Layout
```
┌────────────────────────────────────────────────────┐
│  Header: Current Balance | Logout | Dashboard     │
├────────────────────────────────────────────────────┤
│                                                    │
│  Available Trackers                                │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ Nancy Pelosi │  │Warren Buffett│              │
│  │ [Avatar]     │  │ [Avatar]     │              │
│  │ Congress     │  │ Hedge Fund   │              │
│  │ YTD: +45.0%  │  │ YTD: +12.0%  │              │
│  │ Risk: High   │  │ Risk: Low    │              │
│  │ 15 days avg  │  │ 30 days avg  │              │
│  │ 15.2k follow │  │ 89.1k follow │              │
│  │              │  │              │              │
│  │ [View Detail]│  │ [View Detail]│              │
│  └──────────────┘  └──────────────┘              │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### Components
- **Header Bar:** Shows user balance, navigation buttons
- **Tracker Grid:** Responsive grid of tracker cards
- **Tracker Card:** Individual tracker preview with key stats
- **Navigation Buttons:** "Dashboard" and "Logout"

#### Tracker Card Information
Each card displays:
- **Avatar/Photo:** Visual identifier
- **Name:** e.g., "Nancy Pelosi"
- **Type Badge:** Congress | Hedge Fund | Fund Manager
- **YTD Return:** Year-to-date performance (with color coding)
- **Risk Level:** Low | Medium | High
- **Average Delay:** Days between real trade and copy
- **Followers Count:** Number of users following this tracker
- **Action Button:** "View Details" → navigates to tracker detail

### Data Flow

#### API Call
```typescript
GET /api/v1/trackers/
Response: Tracker[]

interface Tracker {
  id: number;
  name: string;
  type: string;              // 'fund' | 'politician'
  avatar_url?: string;
  description?: string;
  ytd_return: number;        // 45.0 = 45%
  average_delay: number;     // days
  risk_level: string;        // 'low' | 'medium' | 'high'
  followers_count: number;
}
```

#### State Management
```typescript
const [trackers, setTrackers] = useState<Tracker[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string>('');
const { user } = useAuth(); // Current user context
```

### User Flow
```
1. User navigates to /marketplace
2. Component fetches all trackers
3. While loading → shows spinner
4. On success → displays tracker grid
5. On error → shows error message
6. User clicks tracker card → navigate to /tracker/:id
7. User clicks "Dashboard" → navigate to /dashboard
8. User clicks "Logout" → clear auth, navigate to /login
```

### Visual Design
- **Color Coding:**
  - Green: Positive YTD returns
  - Red: Negative YTD returns
  - Orange/Yellow: High risk
  - Green: Low risk
- **Responsive:** Grid adapts to screen size (1-3 columns)
- **Empty State:** Message when no trackers available

### Future Enhancements (TODOs)
- [ ] Add search/filter functionality
- [ ] Sort by: Performance | Risk | Followers
- [ ] Category filters (Politicians | Funds | etc.)
- [ ] Pagination or infinite scroll
- [ ] Favorite/bookmark trackers
- [ ] Compare trackers side-by-side

---

## View 3: Tracker Detail Page 📊

### Location
- **Route:** `/tracker/:id`
- **Component:** `src/pages/TrackerDetailPage.tsx`
- **Access:** Protected (requires authentication, bypassed in local dev mode)

### Purpose
Detailed view of a specific tracker including full stats, portfolio holdings, and investment form. This is where users make investment decisions.

### User Interface

#### Layout
```
┌────────────────────────────────────────────────────┐
│  [← Back to Marketplace]                           │
├────────────────────────────────────────────────────┤
│  ┌──────┐                                          │
│  │Avatar│  Nancy Pelosi                            │
│  │      │  Congress                                │
│  └──────┘  Former Speaker of the House            │
├────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │YTD   │ │Risk  │ │Delay │ │Follow│             │
│  │+25.5%│ │High  │ │45 d  │ │1.2k  │             │
│  └──────┘ └──────┘ └──────┘ └──────┘             │
├────────────────────────────────────────────────────┤
│  Performance Chart                                 │
│  [TODO: Recharts line chart]                      │
│  [Currently: Placeholder]                          │
├────────────────────────────────────────────────────┤
│  Portfolio Holdings                                │
│  ┌────────────────────────────────────────────┐   │
│  │Ticker │ Company        │ Allocation      │   │
│  │────────────────────────────────────────────│   │
│  │NVDA   │ NVIDIA Corp    │ 40%             │   │
│  │MSFT   │ Microsoft      │ 30%             │   │
│  │AAPL   │ Apple Inc      │ 30%             │   │
│  └────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────┤
│  Invest in Nancy Pelosi                            │
│  Your balance: $1,000,000 CLP                     │
│                                                    │
│  Amount (CLP): [___________]                      │
│                                                    │
│  [ Invest Now ]                                    │
└────────────────────────────────────────────────────┘
```

#### Sections

##### 1. Header Section
- **Back Button:** Returns to marketplace
- **Avatar/Photo:** Large profile image
- **Name & Type:** Primary identifier
- **Description:** Brief bio/strategy description

##### 2. Stats Cards (4 Cards)
- **YTD Return:** Performance metric (color-coded)
- **Risk Level:** Investment risk assessment
- **Average Delay:** Time lag for trade replication
- **Followers:** Social proof metric

##### 3. Performance Chart (Currently Placeholder)
- **Purpose:** Historical performance visualization
- **Status:** TODO - Will use Recharts
- **Data:** Time-series YTD return data

##### 4. Holdings Table
- **Columns:** Ticker, Company Name, Allocation %
- **Purpose:** Shows what stocks this tracker holds
- **Visual:** Clean table with alternating row colors
- **Calculation:** Percentages must sum to 100%

##### 5. Investment Form
- **User Balance Display:** Shows available CLP
- **Amount Input:** Numeric input for investment amount
- **Validation:** 
  - Must be > 0
  - Must be ≤ user balance
- **Submit Button:** "Invest Now"
- **Success Message:** Confirmation + redirect to dashboard
- **Error Display:** Validation or API errors

### Data Flow

#### API Calls (3 endpoints)

**1. Get Tracker Details**
```typescript
GET /api/v1/trackers/:id
Response: Tracker (full details)
```

**2. Get Tracker Holdings**
```typescript
GET /api/v1/trackers/:id/holdings
Response: TrackerHolding[]

interface TrackerHolding {
  id: number;
  tracker_id: number;
  ticker: string;              // "NVDA"
  company_name: string;        // "NVIDIA Corporation"
  allocation_percent: number;  // 25.0
}
```

**3. Execute Investment**
```typescript
POST /api/v1/invest
Request: {
  user_id: number,
  tracker_id: number,
  amount_clp: number
}
Response: {
  success: boolean,
  message?: string,
  transaction_id?: number,
  remaining_balance?: number
}
```

#### State Management
```typescript
const [tracker, setTracker] = useState<Tracker | null>(null);
const [holdings, setHoldings] = useState<TrackerHolding[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string>('');
const [investmentAmount, setInvestmentAmount] = useState<string>('');
const [investing, setInvesting] = useState(false);
const [investmentError, setInvestmentError] = useState<string>('');
const [investmentSuccess, setInvestmentSuccess] = useState(false);
```

### User Flow

#### Standard Flow
```
1. User clicks tracker from marketplace
2. Navigate to /tracker/:id
3. Load tracker details + holdings (parallel)
4. Display all information
5. User enters investment amount
6. User clicks "Invest Now"
7. Validate input (amount > 0, amount ≤ balance)
8. If valid → POST /invest
9. Show success message
10. Wait 2 seconds
11. Redirect to /dashboard
```

#### Error Flows

**Insufficient Balance:**
```
1. User enters amount > balance
2. Validation fails
3. Show error: "Insufficient balance"
4. Keep user on page
```

**Invalid Amount:**
```
1. User enters 0 or negative
2. Validation fails
3. Show error: "Please enter a valid amount"
```

**API Error:**
```
1. POST /invest fails
2. Catch error
3. Display: error.response?.data?.detail || "Investment failed"
```

### Currency Formatting
All CLP amounts displayed using:
```typescript
new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
}).format(amount)
```

### Future Enhancements (TODOs)
- [ ] Implement real performance chart (Recharts)
- [ ] Add allocation percentage slider
- [ ] Investment confirmation modal
- [ ] Show estimated portfolio composition
- [ ] Add share/social buttons
- [ ] Historical trade list
- [ ] Risk warning disclaimer
- [ ] Add to favorites/watchlist

---

## View 4: Dashboard Page 📈

### Location
- **Route:** `/dashboard`
- **Component:** `src/pages/DashboardPage.tsx`
- **Access:** Protected (requires authentication, bypassed in local dev mode)

### Purpose
Personal portfolio view showing all active investments, total balance, and profit/loss tracking. This is the user's main financial overview.

### User Interface

#### Layout
```
┌────────────────────────────────────────────────────┐
│  [← Back to Marketplace]  [Logout]                 │
├────────────────────────────────────────────────────┤
│  Portfolio Summary                                 │
│                                                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │Avail │ │Total │ │Current│ │ P&L  │             │
│  │850k  │ │150k  │ │157.5k │ │+7.5k │             │
│  │CLP   │ │CLP   │ │CLP    │ │+5%   │             │
│  └──────┘ └──────┘ └──────┘ └──────┘             │
├────────────────────────────────────────────────────┤
│  Active Investments                                │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Nancy Pelosi                    [View] [Sell]│ │
│  │ Congress                                      │ │
│  │ Invested: 100,000 CLP                        │ │
│  │ Current:  105,000 CLP                        │ │
│  │ P&L:      +5,000 CLP (+5.0%)    ✓            │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Warren Buffett                  [View] [Sell]│ │
│  │ Hedge Fund                                    │ │
│  │ Invested: 50,000 CLP                         │ │
│  │ Current:  52,500 CLP                         │ │
│  │ P&L:      +2,500 CLP (+5.0%)    ✓            │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [ Start Investing ] (if empty)                   │
└────────────────────────────────────────────────────┘
```

#### Sections

##### 1. Header Navigation
- **Back Button:** Return to marketplace
- **Logout Button:** End session

##### 2. Summary Cards (4 Cards)
- **Available Balance:** 
  - Money not invested
  - Can be used for new investments
- **Total Invested:**
  - Sum of all initial investments
  - Historical cost basis
- **Current Value:**
  - Current market value of all investments
  - Updated based on tracker performance
- **Total P&L:**
  - Profit/Loss in CLP
  - Percentage gain/loss
  - Color: Green (+) / Red (-)

##### 3. Active Investments List
Each investment shows:
- **Tracker Name:** Clickable → goes to tracker detail
- **Tracker Type:** Category/classification
- **Amount Invested:** Original investment amount
- **Current Value:** Current worth based on performance
- **P&L:** Individual profit/loss (amount + %)
- **Action Buttons:**
  - "View" → Navigate to tracker detail
  - "Sell" → TODO: Liquidate position

##### 4. Empty State
When no investments:
- Message: "You haven't made any investments yet"
- **Button:** "Start Investing" → Navigate to marketplace

### Data Flow

#### API Call
```typescript
GET /api/v1/portfolio/:user_id
Response: Portfolio

interface Portfolio {
  user_id: number;
  available_balance_clp: number;
  total_invested_clp: number;
  total_current_value_clp: number;
  total_profit_loss_clp: number;
  total_profit_loss_percent: number;
  active_trackers: ActiveTracker[];
}

interface ActiveTracker {
  tracker_id: number;
  tracker_name: string;
  tracker_type: string;
  invested_amount_clp: number;
  current_value_clp: number;
  profit_loss_clp: number;
  profit_loss_percent: number;
}
```

#### Calculation Logic (Backend)
```python
# Available Balance
available = user.balance_clp

# Total Invested
total_invested = sum(item.invested_amount_clp for item in user.portfolio_items)

# Current Value
total_current = sum(item.current_value_clp for item in user.portfolio_items)

# P&L
total_pl = total_current - total_invested
total_pl_percent = (total_pl / total_invested * 100) if total_invested > 0 else 0
```

#### State Management
```typescript
const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string>('');
const { user } = useAuth();
```

### User Flow

#### With Investments
```
1. User navigates to /dashboard
2. Fetch portfolio data for user_id
3. Display summary cards
4. List all active investments
5. User clicks tracker → navigate to /tracker/:id
6. User clicks "Back to Marketplace" → /marketplace
```

#### Without Investments (Empty State)
```
1. User navigates to /dashboard
2. Fetch portfolio (returns empty active_trackers)
3. Show empty state message
4. Display "Start Investing" button
5. User clicks → navigate to /marketplace
```

### Visual Indicators

#### Profit/Loss Colors
- **Green:** Positive returns (profit_loss_clp > 0)
- **Red:** Negative returns (profit_loss_clp < 0)
- **Gray/Black:** Break-even (profit_loss_clp = 0)

#### Icons
- **✓ Checkmark:** Positive performance
- **✗ X-mark:** Negative performance

### Future Enhancements (TODOs)
- [ ] "Sell" functionality to liquidate positions
- [ ] Transaction history table
- [ ] Performance charts over time
- [ ] Export portfolio as PDF/CSV
- [ ] Portfolio rebalancing suggestions
- [ ] Dividend/income tracking
- [ ] Tax reporting helpers
- [ ] Alerts/notifications for significant changes

---

## Navigation Flow Chart

```
        ┌─────────┐
        │  Login  │
        └────┬────┘
             │
             ▼
      ┌──────────────┐
      │ Marketplace  │◄──────┐
      └──┬───────┬───┘       │
         │       │           │
    ┌────┘       └────┐      │
    ▼                 ▼      │
┌─────────┐      ┌──────────┐│
│Tracker  │      │Dashboard ││
│Detail   │      └──────────┘│
└────┬────┘                  │
     │                       │
     └───────────────────────┘
```

### Navigation Rules

#### Protected Routes (Require Auth)
- `/marketplace`
- `/tracker/:id`
- `/dashboard`

**Behavior:**
- Normal mode: Redirect to `/login` if not authenticated
- Local dev mode: Allow access without authentication

#### Public Routes
- `/login` - Always accessible

#### Default Route
- `/` → Redirects to `/login`

---

## Local Development Mode 🔧

### Environment Variable
```bash
VITE_LOCAL_DEVELOPMENT=true
```

### Effects

#### 1. Auto-Authentication
- `AuthContext` auto-creates mock user
- No login required
- Mock user: "Dev User (Local)" with 1M CLP

#### 2. Direct Route Access
- All protected routes accessible
- No redirects to login
- Can bookmark/refresh any page

#### 3. Console Indicator
```javascript
console.log('🔧 LOCAL_DEVELOPMENT mode: Auto-authenticated as Dev User');
```

### Use Cases
- **Frontend development:** Test UI without backend
- **API integration:** Test with mock data
- **View testing:** Direct access to any view
- **Demo/presentation:** Quick navigation

### Disable for Production
```bash
VITE_LOCAL_DEVELOPMENT=false
```

---

## Data Models Summary

### Frontend Types (TypeScript)

```typescript
// User
interface User {
  id: number;
  name: string;
  balance_clp: number;
}

// Tracker
interface Tracker {
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

// Tracker Holding
interface TrackerHolding {
  id: number;
  tracker_id: number;
  ticker: string;
  company_name: string;
  allocation_percent: number;
}

// Portfolio
interface Portfolio {
  user_id: number;
  available_balance_clp: number;
  total_invested_clp: number;
  total_current_value_clp: number;
  total_profit_loss_clp: number;
  total_profit_loss_percent: number;
  active_trackers: ActiveTracker[];
}

// Active Tracker (in portfolio)
interface ActiveTracker {
  tracker_id: number;
  tracker_name: string;
  tracker_type: string;
  invested_amount_clp: number;
  current_value_clp: number;
  profit_loss_clp: number;
  profit_loss_percent: number;
}

// Investment Response
interface InvestmentResponse {
  success: boolean;
  message?: string;
  transaction_id?: number;
  remaining_balance?: number;
  error?: string;
}
```

### Backend Models (Python/SQLModel)

See `docs/views.md` for complete backend model definitions.

---

## Testing Views

### Manual Testing Checklist

#### Login Page
- [ ] Renders without errors
- [ ] Shows 3 user options
- [ ] Login button works
- [ ] Redirects to marketplace on success
- [ ] Shows error on invalid user_id

#### Marketplace Page
- [ ] Displays all trackers
- [ ] Shows correct stats for each tracker
- [ ] Cards are clickable
- [ ] Navigation buttons work
- [ ] Handles empty state
- [ ] Handles loading state
- [ ] Handles error state

#### Tracker Detail Page
- [ ] Loads tracker data
- [ ] Displays all stats correctly
- [ ] Holdings table populated
- [ ] Investment form functional
- [ ] Validation works (amount checks)
- [ ] Success flow redirects
- [ ] Error messages display
- [ ] Back button works

#### Dashboard Page
- [ ] Shows summary cards
- [ ] Lists active investments
- [ ] Calculations correct
- [ ] Empty state shows when no investments
- [ ] Navigation works
- [ ] P&L colors correct

### Automated Tests

Run the test suite:
```bash
# Shell script (accessibility tests)
./test_frontend_views.sh

# Vitest (component tests)
cd frontend
npm test
```

See section below for test setup details.

---

## Performance Considerations

### Loading States
All views implement:
- Initial loading spinner/message
- Skeleton screens (TODO)
- Graceful error handling

### API Optimization
- Parallel requests where possible
- Cache responses (TODO)
- Debounce user inputs (TODO)

### Responsive Design
- Mobile-first approach (TODO)
- Breakpoints for tablet/desktop
- Touch-friendly buttons

---

## Accessibility (A11y)

### Current Status
⚠️ Basic accessibility - needs improvement

### Needed Improvements (TODOs)
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader support
- [ ] Color contrast compliance (WCAG AA)
- [ ] Form field labels
- [ ] Error announcements

---

## Browser Compatibility

### Supported
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Issues
- None currently identified

---

## Future Roadmap

### Short-term (MVP → V1)
1. Replace all inline styles with Material UI components
2. Implement performance charts (Recharts)
3. Add proper loading skeletons
4. Implement responsive design
5. Add form validation library (React Hook Form)

### Medium-term (V1 → V2)
1. Replace dev login with Google OAuth
2. Add transaction history view
3. Implement "Sell" functionality
4. Add notification system
5. Real-time price updates (WebSocket)

### Long-term (V2+)
1. Multi-currency support
2. Advanced portfolio analytics
3. Social features (comments, ratings)
4. Mobile app (React Native)
5. API for third-party integrations

---

## Related Documentation

- **API Reference:** `/api_collection/API_CURL_REFERENCE.md`
- **Backend Models:** `/docs/views.md`
- **Development Setup:** `/docs/frontend_development_config.md`
- **Database Migrations:** `/docs/DATABASE_MIGRATIONS.md`
- **Testing Guide:** Current document, section below

---

## Test Setup & Execution

See test files created:
- `/test_frontend_views.sh` - Shell script for accessibility tests
- `/frontend/src/__tests__/views.test.tsx` - Vitest component tests
- `/frontend/vitest.config.ts` - Vitest configuration
- `/frontend/src/__tests__/setup.ts` - Test environment setup

Next: Add test dependencies to package.json and run tests.
