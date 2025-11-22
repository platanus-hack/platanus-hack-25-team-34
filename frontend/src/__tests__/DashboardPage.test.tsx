/**
 * Dashboard Page Tests
 * 
 * Tests the portfolio/dashboard view functionality including:
 * - Data fetching and display
 * - Error handling
 * - Loading states
 * - Empty state (no investments)
 * - Active investments display
 * - Navigation interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  portfolioApi: {
    getUserPortfolio: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardPage', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    balance_clp: 1000000,
  };

  const mockLogout = vi.fn();

  const mockPortfolioEmpty = {
    user_id: 1,
    available_balance_clp: 1000000,
    total_invested_clp: 0,
    total_current_value_clp: 0,
    total_profit_loss_clp: 0,
    total_profit_loss_percent: 0,
    active_trackers: [],
  };

  const mockPortfolioWithInvestments = {
    user_id: 1,
    available_balance_clp: 900000,
    total_invested_clp: 100000,
    total_current_value_clp: 110000,
    total_profit_loss_clp: 10000,
    total_profit_loss_percent: 10.0,
    active_trackers: [
      {
        tracker_id: 1,
        tracker_name: 'Nancy Pelosi',
        invested_amount_clp: 50000,
        current_value_clp: 55000,
        profit_loss_clp: 5000,
        profit_loss_percent: 10.0,
      },
      {
        tracker_id: 2,
        tracker_name: 'Warren Buffett',
        invested_amount_clp: 50000,
        current_value_clp: 55000,
        profit_loss_clp: 5000,
        profit_loss_percent: 10.0,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = (user = mockUser) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user, logout: mockLogout }}>
          <DashboardPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  describe('Loading State', () => {
    it('should show loading message while fetching portfolio', () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderDashboard();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockRejectedValue(
        new Error('Network error')
      );

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load portfolio')).toBeInTheDocument();
      });
    });

    it('should display error when portfolio data is null', async () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue(null);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Portfolio not found')).toBeInTheDocument();
      });
    });

    it('should handle missing user gracefully', async () => {
      renderDashboard(null);
      
      // Should not call API when no user
      expect(api.portfolioApi.getUserPortfolio).not.toHaveBeenCalled();
    });
  });

  describe('Empty Portfolio State', () => {
    beforeEach(() => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue(
        mockPortfolioEmpty
      );
    });

    it('should display user name', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/Test User/)).toBeInTheDocument();
      });
    });

    it('should display available balance correctly', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/Available:/)).toBeInTheDocument();
        expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument(); // Chilean format
      });
    });

    it('should show zero invested amount', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/Invested:/)).toBeInTheDocument();
        expect(screen.getByText(/\$0/)).toBeInTheDocument();
      });
    });

    it('should display empty state message', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('No investments yet')).toBeInTheDocument();
      });
    });

    it('should show Browse Marketplace button in empty state', async () => {
      renderDashboard();

      await waitFor(() => {
        const buttons = screen.getAllByText('Browse Marketplace');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Portfolio with Investments', () => {
    beforeEach(() => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue(
        mockPortfolioWithInvestments
      );
    });

    it('should display total invested amount', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/Invested:/)).toBeInTheDocument();
        expect(screen.getByText(/100\.000/)).toBeInTheDocument();
      });
    });

    it('should display current portfolio value', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/Current Value:/)).toBeInTheDocument();
        expect(screen.getByText(/110\.000/)).toBeInTheDocument();
      });
    });

    it('should display profit/loss with correct formatting', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/P&L:/)).toBeInTheDocument();
        expect(screen.getByText(/\+/)).toBeInTheDocument(); // Plus sign for positive
        expect(screen.getByText(/10\.00%/)).toBeInTheDocument();
      });
    });

    it('should display all active tracker investments', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Nancy Pelosi')).toBeInTheDocument();
        expect(screen.getByText('Warren Buffett')).toBeInTheDocument();
      });
    });

    it('should show individual tracker P&L', async () => {
      renderDashboard();

      await waitFor(() => {
        // Should show P&L for each tracker
        const plElements = screen.getAllByText(/10\.00%/);
        expect(plElements.length).toBeGreaterThanOrEqual(2); // At least 2 trackers
      });
    });

    it('should have View Details buttons for each tracker', async () => {
      renderDashboard();

      await waitFor(() => {
        const viewButtons = screen.getAllByText('View Details');
        expect(viewButtons).toHaveLength(2); // One per tracker
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue(
        mockPortfolioEmpty
      );
    });

    it('should have Browse Trackers button in header', async () => {
      renderDashboard();

      await waitFor(() => {
        const browseButton = screen.getByText('Browse Trackers');
        expect(browseButton).toBeInTheDocument();
      });
    });

    it('should have Logout button', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('should call logout when Logout button clicked', async () => {
      renderDashboard();

      await waitFor(() => {
        const logoutButton = screen.getByText('Logout');
        logoutButton.click();
      });

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should navigate to tracker detail when View Details clicked', async () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue(
        mockPortfolioWithInvestments
      );

      renderDashboard();

      await waitFor(() => {
        const viewButtons = screen.getAllByText('View Details');
        viewButtons[0].click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/tracker/1');
    });
  });

  describe('Currency Formatting', () => {
    it('should format CLP currency correctly', async () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue({
        ...mockPortfolioEmpty,
        available_balance_clp: 1500000.5,
      });

      renderDashboard();

      await waitFor(() => {
        // Chilean format uses dots for thousands, no decimals
        expect(screen.getByText(/1\.500\.001/)).toBeInTheDocument();
      });
    });

    it('should handle negative P&L correctly', async () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue({
        ...mockPortfolioWithInvestments,
        total_profit_loss_clp: -5000,
        total_profit_loss_percent: -5.0,
      });

      renderDashboard();

      await waitFor(() => {
        // Should show negative without plus sign
        const plText = screen.getByText(/P&L:/);
        expect(plText.nextSibling?.textContent).toMatch(/-/);
      });
    });
  });

  describe('Data Refresh', () => {
    it('should fetch portfolio data on mount', async () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue(
        mockPortfolioEmpty
      );

      renderDashboard();

      await waitFor(() => {
        expect(api.portfolioApi.getUserPortfolio).toHaveBeenCalledWith(1);
      });
    });

    it('should refetch when user changes', async () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue(
        mockPortfolioEmpty
      );

      const { rerender } = renderDashboard();

      await waitFor(() => {
        expect(api.portfolioApi.getUserPortfolio).toHaveBeenCalledTimes(1);
      });

      // Simulate user change
      const newUser = { ...mockUser, id: 2 };
      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={{ user: newUser, logout: mockLogout }}>
            <DashboardPage />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(api.portfolioApi.getUserPortfolio).toHaveBeenCalledWith(2);
      });
    });
  });

  describe('Display Requirements', () => {
    it('should have minimal structure with no excessive styling', async () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue(
        mockPortfolioEmpty
      );

      const { container } = renderDashboard();

      await waitFor(() => {
        // Should have basic div structure
        const divs = container.querySelectorAll('div');
        expect(divs.length).toBeGreaterThan(0);
        
        // Should not have complex nested structures (keep it minimal)
        const nestedDivs = container.querySelectorAll('div > div > div > div > div');
        expect(nestedDivs.length).toBeLessThan(5); // Arbitrary limit for simplicity
      });
    });

    it('should display all required portfolio information', async () => {
      vi.mocked(api.portfolioApi.getUserPortfolio).mockResolvedValue(
        mockPortfolioWithInvestments
      );

      renderDashboard();

      await waitFor(() => {
        // User info
        expect(screen.getByText(/Test User/)).toBeInTheDocument();
        
        // Summary section
        expect(screen.getByText(/Available:/)).toBeInTheDocument();
        expect(screen.getByText(/Invested:/)).toBeInTheDocument();
        expect(screen.getByText(/Current Value:/)).toBeInTheDocument();
        expect(screen.getByText(/P&L:/)).toBeInTheDocument();
        
        // Active investments section
        expect(screen.getByText('Active Investments')).toBeInTheDocument();
        
        // Individual tracker data
        expect(screen.getByText('Nancy Pelosi')).toBeInTheDocument();
        expect(screen.getByText('Warren Buffett')).toBeInTheDocument();
      });
    });
  });
});
