# Track 2: Data & Models

## Decisions & Implementation

### 1. Data Modeling (SQLModel)
We used **SQLModel** to define our database schema. This allows us to use the same classes for both SQLAlchemy models (database) and Pydantic models (API validation), reducing duplication.

- **User**: Stores mock users and their CLP balance.
- **Tracker**: Represents a "Whale" (Politician or Fund). Includes metadata like `risk_level` and `one_year_return`.
- **TrackerHolding**: The composition of a Tracker's portfolio (e.g., 40% NVDA).
- **PortfolioItem**: Represents a user's investment in a specific Tracker.
- **Transaction**: A record of buy/sell actions for audit trails.

### 2. Database & Migrations
- **Alembic**: Configured for database migrations. We updated `env.py` to import our SQLModel metadata so autogeneration works.
- **SQLite vs Postgres**: The system is configured to work with either. For local development without Docker, it defaults to `hedgie.db` (SQLite).

### 3. Seeding Strategy
We implemented a robust seeding mechanism (`backend/app/seed.py`) that:
1. Creates tables if they don't exist.
2. Reads from JSON files in `backend/app/seed_data/`.
3. Idempotently inserts data (checks if User/Tracker exists before adding).

**Seed Data**:
- **Users**: 3 mock users with different balances (1M, 20k, 100k CLP).
- **Trackers**:
    - **Nancy Pelosi**: High risk, tech-heavy (NVDA, MSFT).
    - **Warren Buffett**: Low risk, value-heavy (AAPL, BAC).

## Next Steps
With the data layer ready, we can move to **Track 3: Backend API & Logic** to implement the services that will consume this data and expose it to the frontend.
