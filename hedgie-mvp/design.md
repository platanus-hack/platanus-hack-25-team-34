# Hedgie MVP Design Document

## Overview

Hedgie is a fintech middleware application that enables retail investors to discover and mirror investment strategies of hedge fund managers ("Whales") and US politicians. The MVP focuses on validating the core user experience through a simulated trading environment with no real money, live brokerage accounts, or actual trade execution.

The system architecture prioritizes a clean separation between business logic and broker integration points, making it straightforward to swap mock implementations with real broker APIs in future iterations.

### Key Design Principles

1. **Mock-First Architecture**: All broker and market data operations use mock implementations with clear integration points for future real broker APIs
2. **Stateless Frontend**: React-based SPA that communicates with a backend API
3. **Data Transparency**: Clear communication about data lag (45-day reporting) and simulated environment
4. **Compliance-Aware**: Built-in disclaimers and risk communication throughout the user journey

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (React SPA)"
        A[Marketplace View]
        B[Tracker Detail View]
        C[Investment Flow]
        D[User Dashboard]
    end
    
    subgraph "Backend API"
        E[API Gateway/Router]
        F[Tracker Service]
        G[Investment Service]
        H[Portfolio Service]
        I[Mock Broker Service]
    end
    
    subgraph "Data Layer"
        J[Database]
        K[Static Seed Files]
        L[Mock Market Data]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    E --> G
    E --> H
    
    F --> K
    G --> I
    G --> J
    H --> J
    H --> L
    I --> L
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- React Router for navigation
- Axios for API communication
- Chart.js or Recharts for performance visualization
- Tailwind CSS or Material-UI for styling

**Backend:**
- Node.js with Express or NestJS
- TypeScript for type safety
- PostgreSQL or SQLite for data persistence
- Environment-based configuration for mock vs real mode

**Rationale**: This stack provides strong typing, rapid development, and clear separation of concerns. TypeScript ensures type safety across the full stack, reducing integration errors.

## Components and Interfaces

### Frontend Components

#### 1. Marketplace Component

**Purpose**: Display public list of available tracker portfolios without authentication

**Key Features**:
- Grid/list view of tracker cards
- Each card displays: name, avatar, 1-year return, risk level, description
- No authentication required
- Click-through to detail view

**Props Interface**:
```typescript
interface TrackerCard {
  id: string;
  name: string;
  avatar: string;
  oneYearReturn: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
}
```

#### 2. Tracker Detail Component

**Purpose**: Show comprehensive information about a specific tracker

**Key Features**:
- Strategy description
- Current holdings table (ticker, allocation %)
- Historical performance chart with S&P 500 benchmark
- Compliance disclaimers (45-day lag, past performance)
- "Invest" CTA button

**Props Interface**:
```typescript
interface TrackerDetail {
  id: string;
  name: string;
  avatar: string;
  description: string;
  strategy: string;
  holdings: Holding[];
  performanceHistory: PerformanceDataPoint[];
  oneYearReturn: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface Holding {
  ticker: string;
  companyName: string;
  allocationPercent: number;
}

interface PerformanceDataPoint {
  date: string;
  trackerValue: number;
  sp500Value: number;
}
```

#### 3. Investment Flow Component

**Purpose**: Handle investment amount input and execution

**Key Features**:
- Dollar amount input with validation
- Generic account terminology (no broker branding)
- Buying power validation
- Execution feedback
- Redirect to dashboard on success

**State Management**:
```typescript
interface InvestmentState {
  trackerId: string;
  amount: number;
  isValidating: boolean;
  isExecuting: boolean;
  error: string | null;
}
```

#### 4. Dashboard Component

**Purpose**: Display user's portfolio summary and active trackers

**Key Features**:
- Portfolio summary card (total invested, current value, P&L)
- List of active tracker investments
- Drill-down to position details
- Real-time P&L calculations using mock market data

**Props Interface**:
```typescript
interface DashboardData {
  portfolioSummary: PortfolioSummary;
  activeTrackers: ActiveTracker[];
}

interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface ActiveTracker {
  trackerId: string;
  trackerName: string;
  amountInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  positions: Position[];
}

interface Position {
  ticker: string;
  shares: number;
  avgPurchasePrice: number;
  currentPrice: number;
  profitLoss: number;
  allocationPercent: number;
}
```

### Backend Services

#### 1. Tracker Service

**Purpose**: Manage tracker data and marketplace operations

**Responsibilities**:
- Load tracker data from static seed files
- Provide marketplace listing
- Provide tracker detail information
- Calculate allocation weights

**Key Methods**:
```typescript
class TrackerService {
  async getAllTrackers(): Promise<TrackerCard[]>
  async getTrackerById(id: string): Promise<TrackerDetail>
  async getTrackerHoldings(id: string): Promise<Holding[]>
  private loadSeedData(): void
}
```

**Design Decision**: Seed data is loaded at service initialization and cached in memory for the MVP. This avoids repeated file I/O and provides fast response times. Future iterations can replace this with a database-backed approach.

#### 2. Investment Service

**Purpose**: Handle investment execution and validation

**Responsibilities**:
- Validate investment amounts
- Check buying power (via Mock Broker Service)
- Calculate share allocations based on tracker weights
- Execute simulated trades
- Record investment transactions

**Key Methods**:
```typescript
class InvestmentService {
  async validateInvestment(userId: string, amount: number): Promise<ValidationResult>
  async executeInvestment(userId: string, trackerId: string, amount: number): Promise<InvestmentResult>
  private calculateShareAllocations(amount: number, holdings: Holding[]): ShareAllocation[]
  private recordTransaction(userId: string, transaction: Transaction): Promise<void>
}

interface ShareAllocation {
  ticker: string;
  shares: number;
  estimatedCost: number;
}
```

**Design Decision**: Share allocation uses a proportional distribution algorithm that respects the tracker's allocation percentages. Fractional shares are rounded down to whole shares, with any remaining cash left uninvested (tracked separately for future enhancement).

#### 3. Portfolio Service

**Purpose**: Manage user portfolio data and calculations

**Responsibilities**:
- Retrieve user's active trackers
- Calculate portfolio summary metrics
- Fetch position details
- Update portfolio values using mock market data

**Key Methods**:
```typescript
class PortfolioService {
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary>
  async getActiveTrackers(userId: string): Promise<ActiveTracker[]>
  async getTrackerPositions(userId: string, trackerId: string): Promise<Position[]>
  private calculateProfitLoss(positions: Position[]): ProfitLossMetrics
}
```

#### 4. Mock Broker Service

**Purpose**: Simulate broker operations for the MVP

**Responsibilities**:
- Simulate buying power checks
- Simulate trade execution
- Provide mock market data for current prices
- Log integration points for future real broker API

**Key Methods**:
```typescript
class MockBrokerService {
  async getBuyingPower(userId: string): Promise<number>
  // Integration Point: Replace with real broker API call
  // Example: await alpacaClient.getAccount().buying_power
  
  async executeTrade(userId: string, order: Order): Promise<TradeResult>
  // Integration Point: Replace with real broker API call
  // Example: await alpacaClient.createOrder(order)
  
  async getCurrentPrice(ticker: string): Promise<number>
  // Integration Point: Replace with real market data API
  // Example: await alpacaClient.getLatestTrade(ticker)
  
  private simulateTradeExecution(order: Order): TradeResult
}

interface Order {
  ticker: string;
  shares: number;
  orderType: 'market' | 'limit';
  side: 'buy' | 'sell';
}
```

**Design Decision**: The Mock Broker Service uses a configuration flag (`BROKER_MODE=mock`) to determine behavior. All methods include comments indicating where real broker API integration would occur. Mock implementations use deterministic logic (e.g., buying power = $10,000, execution time = 500ms) for consistent testing.

## Data Models

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trackers table (could be seeded from static files)
CREATE TABLE trackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'hedge_fund' or 'politician'
  avatar_url VARCHAR(500),
  description TEXT,
  strategy TEXT,
  risk_level VARCHAR(20),
  one_year_return DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracker holdings (seeded from 13F and Stock Act data)
CREATE TABLE tracker_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracker_id UUID REFERENCES trackers(id),
  ticker VARCHAR(10) NOT NULL,
  company_name VARCHAR(255),
  allocation_percent DECIMAL(5, 2) NOT NULL,
  as_of_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User investments
CREATE TABLE user_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tracker_id UUID REFERENCES trackers(id),
  amount_invested DECIMAL(15, 2) NOT NULL,
  invested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' -- 'active', 'closed'
);

-- User positions (individual stock holdings)
CREATE TABLE user_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  investment_id UUID REFERENCES user_investments(id),
  ticker VARCHAR(10) NOT NULL,
  shares DECIMAL(15, 6) NOT NULL,
  avg_purchase_price DECIMAL(15, 4) NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'open' -- 'open', 'closed'
);

-- Transaction log
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  investment_id UUID REFERENCES user_investments(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'buy', 'sell'
  ticker VARCHAR(10) NOT NULL,
  shares DECIMAL(15, 6) NOT NULL,
  price_per_share DECIMAL(15, 4) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Design Decision**: The schema separates tracker metadata from user-specific investment data. This allows multiple users to invest in the same tracker without data duplication. The `as_of_date` field in `tracker_holdings` supports future functionality where holdings can be updated over time.

### Static Seed Files

**13F Seed File Structure** (`seed-data/13f-filings.json`):
```json
{
  "trackers": [
    {
      "name": "Buffett Tracker",
      "entity_type": "hedge_fund",
      "entity_name": "Berkshire Hathaway",
      "avatar_url": "/avatars/buffett.png",
      "description": "Follow Warren Buffett's value investing approach",
      "strategy": "Long-term value investing focused on quality companies with strong fundamentals",
      "risk_level": "Low",
      "one_year_return": 12.5,
      "as_of_date": "2024-09-30",
      "holdings": [
        {
          "ticker": "AAPL",
          "company_name": "Apple Inc.",
          "allocation_percent": 45.2
        },
        {
          "ticker": "BAC",
          "company_name": "Bank of America",
          "allocation_percent": 12.8
        }
      ]
    }
  ]
}
```

**Stock Act Seed File Structure** (`seed-data/stock-act-trades.json`):
```json
{
  "trackers": [
    {
      "name": "Pelosi Tracker",
      "entity_type": "politician",
      "entity_name": "Nancy Pelosi",
      "avatar_url": "/avatars/pelosi.png",
      "description": "Track investment moves disclosed by Nancy Pelosi",
      "strategy": "Technology-focused portfolio with emphasis on large-cap growth stocks",
      "risk_level": "Medium",
      "one_year_return": 18.3,
      "as_of_date": "2024-10-15",
      "holdings": [
        {
          "ticker": "NVDA",
          "company_name": "NVIDIA Corporation",
          "allocation_percent": 25.0
        },
        {
          "ticker": "MSFT",
          "company_name": "Microsoft Corporation",
          "allocation_percent": 20.0
        }
      ]
    }
  ]
}
```

**Design Decision**: Seed files use JSON format for easy parsing and human readability. The structure mirrors the database schema, allowing straightforward seeding scripts. The `as_of_date` field communicates the 45-day reporting lag to users.

## Error Handling

### Error Categories

1. **Validation Errors**: User input validation failures (e.g., negative investment amount)
2. **Business Logic Errors**: Insufficient buying power, invalid tracker ID
3. **System Errors**: Database connection failures, service unavailability

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Common Error Codes

- `INVALID_AMOUNT`: Investment amount is invalid
- `INSUFFICIENT_FUNDS`: Buying power less than investment amount
- `TRACKER_NOT_FOUND`: Requested tracker does not exist
- `EXECUTION_FAILED`: Trade execution simulation failed
- `SYSTEM_ERROR`: Unexpected system error

### Frontend Error Handling

**Design Decision**: Errors are displayed inline within the relevant component (e.g., investment flow shows validation errors below the input field). Toast notifications are used for system-level errors. All error messages are user-friendly and avoid technical jargon.

### Backend Error Handling

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
  }
}

// Global error handler middleware
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', err);
  
  return res.status(500).json({
    error: {
      code: 'SYSTEM_ERROR',
      message: 'An unexpected error occurred'
    }
  });
}
```

## Testing Strategy

### Unit Testing

**Frontend**:
- Component rendering tests using React Testing Library
- User interaction tests (button clicks, form submissions)
- Mock API responses using MSW (Mock Service Worker)

**Backend**:
- Service method tests with mocked dependencies
- Mock Broker Service tests to verify simulation logic
- Data model validation tests

**Coverage Target**: 80% code coverage for business logic

### Integration Testing

- API endpoint tests using Supertest
- Database integration tests with test database
- End-to-end investment flow tests

### Manual Testing Scenarios

1. **Marketplace Discovery**: Browse trackers, view details, verify disclaimers
2. **Investment Flow**: Input amount, validate errors, execute investment, verify dashboard update
3. **Portfolio Management**: View dashboard, drill down into trackers, verify P&L calculations
4. **Mock Data Verification**: Confirm no real API calls, verify mock responses

**Design Decision**: The MVP prioritizes integration tests over extensive unit tests to validate the complete user journey. Mock Broker Service is thoroughly tested to ensure it accurately simulates real broker behavior.

## Configuration and Environment

### Environment Variables

```bash
# Application mode
NODE_ENV=development|production
BROKER_MODE=mock|real

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hedgie

# Mock Broker Configuration
MOCK_BUYING_POWER=10000
MOCK_EXECUTION_DELAY_MS=500

# Future: Real Broker API Keys (not used in MVP)
# ALPACA_API_KEY=
# ALPACA_SECRET_KEY=
```

**Design Decision**: `BROKER_MODE` flag controls whether the system uses mock or real broker implementations. In the MVP, this is always set to `mock`. The configuration structure anticipates future real broker integration without requiring architectural changes.

## Security Considerations

### MVP Security Measures

1. **No Real Credentials**: System does not store or require real brokerage API keys
2. **Input Validation**: All user inputs are validated on both frontend and backend
3. **SQL Injection Prevention**: Use parameterized queries for all database operations
4. **XSS Prevention**: React's built-in escaping, Content Security Policy headers
5. **HTTPS**: All communication over HTTPS in production

### Compliance and Disclaimers

**Displayed Throughout Application**:
- "This is a simulated trading environment. No real funds are involved."
- "Past performance does not guarantee future results."
- "13F and Stock Act data has a 45-day reporting lag."

**Design Decision**: Disclaimers are prominently displayed on every page that shows performance data or investment information. This ensures users understand the limitations and simulated nature of the MVP.

## Future Considerations

### Real Broker Integration

When transitioning from mock to real broker:

1. Implement broker adapter pattern with interface:
```typescript
interface BrokerAdapter {
  getBuyingPower(userId: string): Promise<number>;
  executeTrade(userId: string, order: Order): Promise<TradeResult>;
  getCurrentPrice(ticker: string): Promise<number>;
}
```

2. Create concrete implementations (e.g., `AlpacaBrokerAdapter`, `InteractiveBrokerAdapter`)
3. Use dependency injection to swap mock with real implementation
4. Update environment configuration to use `BROKER_MODE=real`

### Data Pipeline Integration

Future enhancements for automated data updates:

- Scheduled jobs to fetch latest 13F filings from SEC EDGAR
- Stock Act data scraping and parsing
- Automated tracker holding updates
- Historical performance calculation and storage

### Scalability Considerations

- Implement caching layer (Redis) for frequently accessed tracker data
- Use message queue (RabbitMQ/SQS) for asynchronous trade execution
- Separate read and write databases for portfolio queries
- Implement rate limiting for API endpoints

**Design Decision**: The MVP architecture is designed to support these future enhancements without requiring major refactoring. The service-oriented design and clear separation of concerns make it straightforward to add new capabilities incrementally.
