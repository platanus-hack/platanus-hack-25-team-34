# Requirements Document

## Introduction

Hedgie is a fintech middleware application that democratizes access to investment strategies used by "Whales" (hedge fund managers) and US politicians. The MVP enables retail investors to discover and mirror these high-performing portfolios through a simulated trading environment.

The core value proposition is "Invest like a Whale" - providing retail investors with transparent access to 13F filings and Stock Act data, packaged as easy-to-follow investment trackers.

For the MVP, all broker interactions are mocked. Users interact only with Hedgie's interface, with no real money, live brokerage accounts, or actual trade execution. This allows validation of the core user experience and business logic before integrating with real brokers.

## Requirements

### Requirement 1: Public Marketplace Discovery

**User Story:** As a retail investor, I want to browse available investment trackers in a public marketplace, so that I can discover strategies used by successful investors and politicians without needing to create an account.

#### Acceptance Criteria

1. WHEN a user visits the marketplace THEN the system SHALL display a list of available tracker portfolios
2. WHEN displaying each tracker THEN the system SHALL show the tracker name (e.g., "Buffett Tracker", "Pelosi Tracker")
3. WHEN displaying each tracker THEN the system SHALL show the 1-year return percentage
4. WHEN displaying each tracker THEN the system SHALL show the risk level (e.g., Low, Medium, High)
5. WHEN displaying each tracker THEN the system SHALL show a brief description of the strategy
6. WHEN displaying each tracker THEN the system SHALL show an avatar or visual representation of the entity being tracked
7. WHEN the marketplace loads THEN the system SHALL use mock/static data for all tracker information
8. WHEN the marketplace is accessed THEN the system SHALL NOT require user authentication

### Requirement 2: Portfolio Detail View

**User Story:** As a retail investor, I want to view detailed information about a specific tracker, so that I can understand the strategy, current holdings, and historical performance before deciding to invest.

#### Acceptance Criteria

1. WHEN a user selects a tracker from the marketplace THEN the system SHALL display a detailed view of that tracker
2. WHEN displaying tracker details THEN the system SHALL show a comprehensive description of the investment strategy
3. WHEN displaying tracker details THEN the system SHALL show the current top holdings with ticker symbols
4. WHEN displaying tracker details THEN the system SHALL show the allocation percentage for each holding
5. WHEN displaying tracker details THEN the system SHALL display a historical performance chart
6. WHEN displaying the performance chart THEN the system SHALL include a comparison benchmark (S&P 500)
7. WHEN displaying tracker details THEN the system SHALL show a compliance disclaimer stating "Past performance does not guarantee future results"
8. WHEN displaying tracker details THEN the system SHALL highlight the 45-day reporting lag for 13F and Stock Act data
9. WHEN displaying tracker details THEN the system SHALL use mock/static data for holdings and performance

### Requirement 3: Investment Flow - Amount Input

**User Story:** As a retail investor, I want to specify how much money I want to invest in a tracker, so that I can allocate a specific dollar amount to mirror a whale's strategy.

#### Acceptance Criteria

1. WHEN a user is viewing a tracker detail page THEN the system SHALL provide an "Invest" action button
2. WHEN a user clicks the "Invest" button THEN the system SHALL display an input field for dollar amount
3. WHEN a user enters an investment amount THEN the system SHALL validate that the amount is a positive number
4. WHEN a user enters an investment amount THEN the system SHALL validate that the amount is greater than zero
5. WHEN displaying the investment input THEN the system SHALL NOT show any broker selection or broker branding
6. WHEN displaying the investment input THEN the system SHALL use generic terminology (e.g., "Your Account") instead of broker-specific terms

### Requirement 4: Investment Flow - Validation and Execution

**User Story:** As a retail investor, I want the system to validate my investment and execute the allocation, so that I can successfully mirror a whale's portfolio with my specified amount.

#### Acceptance Criteria

1. WHEN a user confirms an investment amount THEN the system SHALL simulate a buying power check
2. IF the simulated buying power is less than the investment amount THEN the system SHALL display an error message
3. IF the simulated buying power is greater than or equal to the investment amount THEN the system SHALL proceed with execution
4. WHEN executing an investment THEN the system SHALL calculate the number of shares for each asset based on the tracker's current allocation weights
5. WHEN executing an investment THEN the system SHALL simulate market buy orders for each calculated position
6. WHEN executing an investment THEN the system SHALL use mock functions with comments indicating where real broker API integration would occur
7. WHEN investment execution completes THEN the system SHALL provide near-immediate feedback (simulated execution should complete within 2 seconds)
8. WHEN investment execution completes THEN the system SHALL redirect the user to their dashboard
9. WHEN simulating broker operations THEN the system SHALL NOT make any real API calls to external brokers
10. WHEN simulating broker operations THEN the system SHALL NOT store or require any real API keys or credentials

### Requirement 5: User Dashboard - Portfolio Summary

**User Story:** As a retail investor who has made investments, I want to see a summary of my portfolio, so that I can track my total invested value and current profit/loss.

#### Acceptance Criteria

1. WHEN a user accesses their dashboard THEN the system SHALL display the total invested value across all trackers
2. WHEN a user accesses their dashboard THEN the system SHALL display the current portfolio value
3. WHEN a user accesses their dashboard THEN the system SHALL calculate and display the profit/loss (P&L)
4. WHEN displaying P&L THEN the system SHALL show both the dollar amount and percentage change
5. WHEN calculating portfolio value THEN the system SHALL use mock market data for current stock prices
6. WHEN the dashboard loads THEN the system SHALL use simulated/mock data for all calculations

### Requirement 6: User Dashboard - Active Trackers

**User Story:** As a retail investor with multiple investments, I want to see a list of all trackers I'm following, so that I can monitor each strategy separately and understand my allocation across different whales.

#### Acceptance Criteria

1. WHEN a user accesses their dashboard THEN the system SHALL display a list of all active tracker investments
2. WHEN displaying each active tracker THEN the system SHALL show the tracker name
3. WHEN displaying each active tracker THEN the system SHALL show the amount invested in that tracker
4. WHEN displaying each active tracker THEN the system SHALL show the current value of that tracker investment
5. WHEN displaying each active tracker THEN the system SHALL show the P&L for that specific tracker
6. WHEN a user selects an active tracker THEN the system SHALL provide a drill-down view showing specific positions

### Requirement 7: User Dashboard - Position Details

**User Story:** As a retail investor, I want to view the specific stock positions held under each tracker, so that I can see exactly which stocks I own and their individual performance.

#### Acceptance Criteria

1. WHEN a user drills down into a specific tracker THEN the system SHALL display all positions held under that tracker
2. WHEN displaying each position THEN the system SHALL show the stock ticker symbol
3. WHEN displaying each position THEN the system SHALL show the number of shares owned
4. WHEN displaying each position THEN the system SHALL show the average purchase price per share
5. WHEN displaying each position THEN the system SHALL show the current price per share (using mock data)
6. WHEN displaying each position THEN the system SHALL calculate and show the position's P&L
7. WHEN displaying each position THEN the system SHALL show the allocation percentage within that tracker

### Requirement 8: Mock Data Infrastructure

**User Story:** As a developer, I want all broker and market data operations to use mock implementations, so that the MVP can be developed and tested without real money or live broker connections.

#### Acceptance Criteria

1. WHEN the system needs to check buying power THEN it SHALL use a mock function that returns a simulated value
2. WHEN the system needs to execute a trade THEN it SHALL use a mock function that simulates order placement
3. WHEN the system needs current stock prices THEN it SHALL use mock/static market data
4. WHEN the system needs tracker holdings data THEN it SHALL use static seed files for 13F and Stock Act data
5. WHEN implementing mock functions THEN the code SHALL include comments indicating where real broker API integration would occur (e.g., "// Here we should implement the buy/sell API integration with a real broker")
6. WHEN the system is configured THEN it SHALL use environment variables to indicate mock mode vs future real integration mode
7. WHEN the system processes any operation THEN it SHALL NOT make external API calls to real brokers
8. WHEN the system stores data THEN it SHALL NOT store or require real API keys, secrets, or brokerage credentials

### Requirement 9: Security and Compliance

**User Story:** As a compliance officer, I want the system to clearly communicate the limitations and risks of the investment data, so that users understand the nature of the information and the MVP's simulated environment.

#### Acceptance Criteria

1. WHEN displaying any performance data THEN the system SHALL include the disclaimer "Past performance does not guarantee future results"
2. WHEN displaying tracker information based on 13F or Stock Act data THEN the system SHALL highlight the 45-day reporting lag
3. WHEN the system logs any information THEN it SHALL NOT log sensitive data or credentials
4. WHEN the MVP is accessed THEN the system SHALL clearly indicate that it is a demo/mock trading environment
5. WHEN the MVP is accessed THEN the system SHALL clearly communicate that no real funds are involved
6. WHEN the system stores any data THEN it SHALL ensure no real brokerage credentials are stored

### Requirement 10: Data Sources and Updates

**User Story:** As a product owner, I want the system to use static seed data for whale and politician portfolios, so that the MVP can demonstrate functionality without requiring complex data pipeline integrations.

#### Acceptance Criteria

1. WHEN the system needs 13F filing data THEN it SHALL use a static seed file with sample hedge fund holdings
2. WHEN the system needs Stock Act data THEN it SHALL use a static seed file with sample politician trades
3. WHEN the system initializes THEN it SHALL load tracker data from these seed files
4. WHEN displaying tracker information THEN the system SHALL use the data from seed files for holdings and allocations
5. WHEN the seed files are structured THEN they SHALL include at minimum: entity name, ticker symbols, allocation percentages, and mock historical returns
