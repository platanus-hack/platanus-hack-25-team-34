/**
 * Dashboard Page
 * 
 * Shows user's portfolio overview:
 * - Total balance and invested amounts
 * - Profit/Loss summary
 * - List of active tracker investments
 * 
 * TODO: Add portfolio performance chart
 * TODO: Add transaction history
 * TODO: Replace with dashboard layout component
 * TODO: Add ability to sell/withdraw from positions
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioApi } from '../services/api';
import type { Portfolio } from '../types';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;
      try {
        const data = await portfolioApi.getUserPortfolio(user.id);
        setPortfolio(data);
        
        // Update user context with latest balance from portfolio
        if (updateUser) {
          updateUser({ ...user, balance_clp: data.available_balance_clp });
        }
      } catch (err) {
        setError('Failed to load portfolio');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return <p>Loading...</p>;
  if (error || !portfolio) return <p style={{ color: 'red' }}>{error || 'Portfolio not found'}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Portfolio - {user?.name}</h1>
      <button onClick={() => navigate('/marketplace')}>Browse Trackers</button>
      <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>

      <h2>Summary</h2>
      <p>Available: {formatCurrency(portfolio.available_balance_clp)}</p>
      <p>Invested: {formatCurrency(portfolio.total_invested_clp)}</p>
      <p>Current Value: {formatCurrency(portfolio.total_current_value_clp)}</p>
      <p style={{ color: portfolio.total_profit_loss_clp >= 0 ? 'green' : 'red' }}>
        P&L: {portfolio.total_profit_loss_clp >= 0 ? '+' : ''}
        {formatCurrency(portfolio.total_profit_loss_clp)} ({portfolio.total_profit_loss_percent.toFixed(2)}%)
      </p>

      <h2>Active Investments</h2>
      {portfolio.active_trackers.length > 0 ? (
        portfolio.active_trackers.map((tracker) => (
          <div key={tracker.tracker_id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{tracker.tracker_name}</h3>
            <p>Invested: {formatCurrency(tracker.invested_amount_clp)}</p>
            <p>Current: {formatCurrency(tracker.current_value_clp)}</p>
            <p style={{ color: tracker.profit_loss_clp >= 0 ? 'green' : 'red' }}>
              P&L: {tracker.profit_loss_clp >= 0 ? '+' : ''}
              {formatCurrency(tracker.profit_loss_clp)} ({tracker.profit_loss_percent.toFixed(2)}%)
            </p>
            <button onClick={() => navigate(`/tracker/${tracker.tracker_id}`)}>View Details</button>
          </div>
        ))
      ) : (
        <div>
          <p>No investments yet</p>
          <button onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
