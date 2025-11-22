# Frontend Testing Guide

## Quick Start

### Install Test Dependencies

```bash
# Run the installation script
./install_test_dependencies.sh
```

This will install:
- **vitest** - Fast unit test framework for Vite
- **@vitest/ui** - Visual UI for test results
- **jsdom** - DOM implementation for Node.js
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation

## Running Tests

### Option 1: Shell Script (Accessibility Tests)

Tests that all views are accessible when `VITE_LOCAL_DEVELOPMENT=true`:

```bash
# Make sure frontend is running first
docker-compose up -d frontend

# Run the test script
./test_frontend_views.sh
```

**What it tests:**
- ✓ All routes return HTTP 200
- ✓ Login page accessible
- ✓ Marketplace accessible
- ✓ Tracker detail pages accessible (ID 1 & 2)
- ✓ Dashboard accessible
- ✓ Invalid tracker page doesn't crash

### Option 2: Vitest (Component Tests)

After installing dependencies with `./install_test_dependencies.sh`:

```bash
cd frontend

# Run tests in watch mode
npm test

# Run tests with visual UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

**What it tests:**
- ✓ Components render without crashing
- ✓ Data loading states work
- ✓ API calls are made correctly
- ✓ Local development mode bypasses auth
- ✓ User interactions trigger expected behavior

## Test Files

```
frontend/
├── src/
│   └── __tests__/
│       ├── setup.ts           # Test environment configuration
│       └── views.test.tsx     # Component tests for all views
├── vitest.config.ts           # Vitest configuration
└── package.json               # Test scripts defined here

/test_frontend_views.sh        # Shell accessibility tests
```

## Test Structure

### Shell Tests (`test_frontend_views.sh`)

Simple HTTP accessibility tests:
```bash
test_view "Marketplace Page" \
    "$FRONTEND_URL/marketplace" \
    ""
```

### Component Tests (`views.test.tsx`)

React component rendering tests:
```typescript
describe('MarketplacePage', () => {
  it('should render without crashing', async () => {
    renderWithRouter(<MarketplacePage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });
});
```

## Mocking

All API calls are mocked in the test files:

```typescript
vi.mock('../services/api', () => ({
  trackerApi: {
    getAllTrackers: vi.fn().mockResolvedValue([...]),
    getTrackerDetails: vi.fn().mockResolvedValue({...}),
  },
  // ... other mocks
}));
```

## Environment Setup

Tests run with:
- `VITE_LOCAL_DEVELOPMENT=true` - Bypasses authentication
- Mock API responses - No backend needed
- jsdom - Simulates browser environment

## Continuous Integration (Future)

To run tests in CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
        working-directory: frontend
      - run: npm test
        working-directory: frontend
```

## Coverage Reports

After running `npm run test:coverage`:

```
frontend/
└── coverage/
    ├── index.html          # Open in browser
    ├── coverage.json       # Raw coverage data
    └── lcov.info          # LCOV format for CI tools
```

## Troubleshooting

### "Module not found" errors
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
./install_test_dependencies.sh
```

### "Frontend is not running" (shell tests)
```bash
# Start the frontend
docker-compose up -d frontend

# Wait a few seconds for it to start
sleep 5

# Run tests
./test_frontend_views.sh
```

### TypeScript errors in tests
```bash
# Make sure TypeScript is installed
cd frontend
npm install --save-dev typescript @types/react @types/react-dom
```

## Next Steps

1. **Install dependencies**: `./install_test_dependencies.sh`
2. **Run shell tests**: `./test_frontend_views.sh`
3. **Run component tests**: `cd frontend && npm test`
4. **View coverage**: `npm run test:coverage`
5. **Add more tests**: Edit `frontend/src/__tests__/views.test.tsx`

## Writing New Tests

### Add a new view test:

```typescript
describe('NewPage', () => {
  it('should render without crashing', async () => {
    renderWithRouter(<NewPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('should display expected content', async () => {
    renderWithRouter(<NewPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Expected Text/i)).toBeInTheDocument();
    });
  });
});
```

### Add a new shell test:

```bash
test_view "New Page" \
    "$FRONTEND_URL/new-page" \
    ""
```

## Documentation

- **View Documentation**: `docs/FRONTEND_VIEWS.md` - Complete guide to all views
- **API Reference**: `api_collection/API_CURL_REFERENCE.md` - Backend API docs
- **Development Config**: `docs/frontend_development_config.md` - Local dev setup

---

**Happy Testing! 🧪**
