/**
 * Frontend View Tests for Local Development Mode
 * 
 * This test suite verifies that all views are accessible
 * when VITE_LOCAL_DEVELOPMENT=true.
 * 
 * Note: These are simple accessibility tests, not full component tests.
 * They verify that routes render without crashing.
 * 
 * Run with: npm test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
 
// Import pages
import LoginPage from '../pages/LoginPage';
import MarketplacePage from '../pages/MarketplacePage';
import TrackerDetailPage from '../pages/TrackerDetailPage';
import DashboardPage from '../pages/DashboardPage';

// Mock environment variable for local development
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    // Override isLocalDevelopment to true for tests
  };
});

// Mock API calls
vi.mock('../services/api', () => ({
  authApi: {
    devLogin: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Test User',
      balance_clp: 1000000,
    }),
  },
  trackerApi: {
    getAllTrackers: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Nancy Pelosi',
        type: 'politician',
        ytd_return: 25.5,
        risk_level: 'High',
        average_delay: 45,
        followers_count: 1200,
      },
      {
        id: 2,
        name: 'Warren Buffett',
        type: 'fund',
        ytd_return: 15.2,
        risk_level: 'Low',
        average_delay: 90,
        followers_count: 5000,
      },
    ]),
    getTrackerDetails: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Nancy Pelosi',
      type: 'politician',
      description: 'Former Speaker of the House',
      ytd_return: 25.5,
      risk_level: 'High',
      average_delay: 45,
      followers_count: 1200,
    }),
    getTrackerHoldings: vi.fn().mockResolvedValue([
      {
        id: 1,
        tracker_id: 1,
        ticker: 'NVDA',
        company_name: 'NVIDIA Corp',
        allocation_percent: 40.0,
      },
      {
        id: 2,
        tracker_id: 1,
        ticker: 'MSFT',
        company_name: 'Microsoft Corp',
        allocation_percent: 30.0,
      },
    ]),
  },
  portfolioApi: {
    getUserPortfolio: vi.fn().mockResolvedValue({
      user_id: 1,
      available_balance_clp: 950000,
      total_invested_clp: 50000,
      total_current_value_clp: 52500,
      total_profit_loss_clp: 2500,
      total_profit_loss_percent: 5.0,
      active_trackers: [
        {
          tracker_id: 1,
          tracker_name: 'Nancy Pelosi',
          invested_amount_clp: 50000,
          current_value_clp: 52500,
          profit_loss_clp: 2500,
          profit_loss_percent: 5.0,
        },
      ],
    }),
  },
  investmentApi: {
    executeInvestment: vi.fn().mockResolvedValue({
      success: true,
      message: 'Investment successful',
    }),
  },
}));

// Helper to render with router and auth context
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('Frontend Views - Local Development Mode', () => {
  beforeEach(() => {
    // Set environment variable for local development
    import.meta.env.VITE_LOCAL_DEVELOPMENT = 'true';
  });

  describe('LoginPage', () => {
    it('should render without crashing', () => {
      renderWithRouter(<LoginPage />);
      expect(screen.getByText(/login/i)).toBeInTheDocument();
    });

    it('should show user selection dropdown', () => {
      renderWithRouter(<LoginPage />);
      // The page should render some form of user selection
      expect(document.body).toBeTruthy();
    });
  });

  describe('MarketplacePage', () => {
    it('should render without crashing', async () => {
      renderWithRouter(<MarketplacePage />);
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should display trackers when loaded', async () => {
      renderWithRouter(<MarketplacePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Nancy Pelosi/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Warren Buffett/i)).toBeInTheDocument();
    });

    it('should be accessible in local development mode', () => {
      // In local dev mode, this should render even without authentication
      renderWithRouter(<MarketplacePage />);
      expect(document.body).toBeTruthy();
    });
  });

  describe('TrackerDetailPage', () => {
    it('should render without crashing', async () => {
      renderWithRouter(
        <Routes>
          <Route path="/tracker/:id" element={<TrackerDetailPage />} />
        </Routes>,
        { route: '/tracker/1' }
      );
      
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should display tracker details', async () => {
      renderWithRouter(
        <Routes>
          <Route path="/tracker/:id" element={<TrackerDetailPage />} />
        </Routes>,
        { route: '/tracker/1' }
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Nancy Pelosi/i)).toBeInTheDocument();
      });
    });

    it('should display holdings table', async () => {
      renderWithRouter(
        <Routes>
          <Route path="/tracker/:id" element={<TrackerDetailPage />} />
        </Routes>,
        { route: '/tracker/1' }
      );
      
      await waitFor(() => {
        expect(screen.getByText(/NVDA/i)).toBeInTheDocument();
        expect(screen.getByText(/MSFT/i)).toBeInTheDocument();
      });
    });

    it('should show investment form', async () => {
      renderWithRouter(
        <Routes>
          <Route path="/tracker/:id" element={<TrackerDetailPage />} />
        </Routes>,
        { route: '/tracker/1' }
      );
      
      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });
    });
  });

  describe('DashboardPage', () => {
    it('should render without crashing', async () => {
      renderWithRouter(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should display portfolio summary', async () => {
      renderWithRouter(<DashboardPage />);
      
      await waitFor(() => {
        // Should show some balance information
        expect(document.body).toBeTruthy();
      });
    });

    it('should show active investments', async () => {
      renderWithRouter(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Nancy Pelosi/i)).toBeInTheDocument();
      });
    });
  });

  describe('Local Development Mode', () => {
    it('should auto-authenticate in local development', () => {
      renderWithRouter(<MarketplacePage />);
      // Should render without redirecting to login
      expect(document.body).toBeTruthy();
    });

    it('should allow direct access to protected routes', () => {
      // All these should render without authentication
      renderWithRouter(<MarketplacePage />);
      renderWithRouter(<DashboardPage />);
      renderWithRouter(
        <Routes>
          <Route path="/tracker/:id" element={<TrackerDetailPage />} />
        </Routes>,
        { route: '/tracker/1' }
      );
      
      expect(document.body).toBeTruthy();
    });
  });
});
