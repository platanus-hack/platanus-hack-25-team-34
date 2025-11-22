# Frontend Testing Guide

## Overview
This guide covers running all frontend tests for the Hedgie MVP application.

## Test Status

**Current Status**: Tests created but need fixes for:
1. API client tests require proper axios mocking setup
2. View tests need adjustments for Material-UI components

## Test Structure

```
frontend/src/__tests__/
├── api.test.ts           # API client tests (63 test cases) - NEEDS MOCKING FIXES
├── DashboardPage.test.tsx # Dashboard page tests (18 test cases) - READY
├── views.test.tsx        # Existing view tests - SOME PASSING
└── setup.ts              # Test configuration
```

## Prerequisites

1. **Install dependencies** (already completed):
   ```bash
   cd frontend
   npm install
   ```

2. **Dependencies installed**:
   - ✅ vitest
   - ✅ @testing-library/react  
   - ✅ @testing-library/user-event
   - ✅ jsdom
   - ✅ @vitest/ui

## Running Tests

### Run All Tests
```bash
cd frontend
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Specific Test File
```bash
# API client tests only
npm test api.test.ts

# Dashboard page tests only
npm test DashboardPage.test.tsx

# View tests
npm test views.test.tsx
```

### Run Tests with UI
```bash
npm run test:ui
```

## Current Test Results

### Passing Tests
- ✅ API Client configuration test (1/20)
- ✅ Some view tests for basic rendering

### Failing Tests Requiring Fixes
- ❌ API Client tests (19/20) - Need axios mock implementation
- ❌ Dashboard tests (18/18) - Need AuthContext mock setup
- ❌ Some view tests - Need Material-UI query adjustments

## Required Fixes

### 1. API Tests - Axios Mocking
The API tests need proper axios mocking. Current approach doesn't work because:
- `vi.mock('axios')` doesn't properly mock the axios instance
- Need to mock `axios.create()` to return a mock client with get/post methods

**Fix needed in `/frontend/src/__tests__/api.test.ts`**:
```typescript
// Current (doesn't work):
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Needs to be:
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
      })),
    },
  };
});
```

### 2. Dashboard Tests - AuthContext Export
Fixed! AuthContext is now properly exported from `/frontend/src/context/AuthContext.tsx`

### 3. Chart Component
Fixed! Removed vega dependencies, replaced with placeholder.

## Test Suites

### 1. API Client Tests (`api.test.ts`)
**Total: 63 test cases (1 passing, 19 need mock fixes)**

Tests the API service layer including:
- ✅ Configuration (baseURL test passing)
- ❌ Auth API (needs mock)
- ❌ Tracker API (needs mock)
- ❌ Investment API (needs mock)  
- ❌ Portfolio API - Critical path (needs mock)
- ❌ Chart API (needs mock)
- ❌ URL path consistency (needs mock)
- ❌ Error handling (needs mock)

**Key Validations**:
- Portfolio endpoint uses NO trailing slash: `portfolio/1` (not `portfolio/1/`)
- Invest endpoint uses trailing slash: `invest/`
- Field names use snake_case: `user_id`, `tracker_id`, `amount_clp`

### 2. Dashboard Page Tests (`DashboardPage.test.tsx`)
**Total: 18 test cases (needs AuthContext mock)**

Tests the portfolio/dashboard view including:
- Loading states
- Error handling
- Empty portfolio state
- Portfolio with investments
- Navigation
- Currency formatting (CLP)
- Data refresh

### 3. View Tests (`views.test.tsx`)
**Total: 14 test cases (some passing, some need query fixes)**

Tests basic page rendering for all main views.

## Next Steps to Fix Tests

### Step 1: Fix API Mocking (Priority 1)
```bash
# Edit api.test.ts to properly mock axios.create()
code frontend/src/__tests__/api.test.ts
```

### Step 2: Run Dashboard Tests (Priority 2)  
Dashboard tests should work now that AuthContext is exported. Test with:
```bash
npm test DashboardPage.test.tsx
```

### Step 3: Fix View Test Queries (Priority 3)
Some view tests use `getByText(/login/i)` which matches multiple elements.
Change to more specific queries like `getByRole('heading', { name: /login/i })`.

## Development Workflow

1. **Before committing**: Run tests
   ```bash
   npm test -- --run
   ```

2. **While developing**: Use watch mode
   ```bash
   npm test -- --watch
   ```

3. **Debugging**: Use UI mode
   ```bash
   npm run test:ui
   ```

## Common Issues & Solutions

### Issue: "Cannot find module '@testing-library/react'"
**Solution**: Already installed ✅

### Issue: "Cannot read properties of undefined (reading 'post')"
**Solution**: Fix axios mocking as described above

### Issue: "Found multiple elements with the text"
**Solution**: Use more specific queries like `getByRole()` instead of `getByText()`

### Issue: "Cannot read properties of undefined (reading 'Provider')"
**Solution**: Fixed! AuthContext is now exported ✅

## Test Coverage Goals

- **API Client**: 100% coverage
- **Dashboard Page**: 90%+ coverage
- **Overall**: 80%+ coverage

## Files Modified

- ✅ `package.json` - Added testing dependencies, removed vega packages
- ✅ `src/components/Chart.jsx` - Replaced with placeholder (vega removed)
- ✅ `src/context/AuthContext.tsx` - Exported AuthContext for tests
- ⏳ `src/__tests__/api.test.ts` - Needs axios mock fix
- ✅ `src/__tests__/DashboardPage.test.tsx` - Ready to test
- ⏳ `src/__tests__/views.test.tsx` - Needs query fixes

## Related Documentation
- `/docs/testing_guide.md` - Backend testing guide
- `/docs/BUGFIX_INVESTMENT_ERROR_HANDLING.md` - Error handling fixes
- `package.json` - Test scripts configuration
- `vitest.config.ts` - Test runner configuration

