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
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;

      try {
        const data = await portfolioApi.getUserPortfolio(user.id);
        setPortfolio(data);
      } catch (err) {
        setError('Failed to load portfolio');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading portfolio...</div>;
  }

  if (error || !portfolio) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error || 'Portfolio not found'}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      {/* TODO: Replace with navigation component */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1>My Portfolio</h1>
          <p style={{ color: '#666' }}>
            Welcome back, <strong>{user?.name}</strong>
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/marketplace')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Browse Trackers
          </button>
          <button
            onClick={logout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {/* TODO: Replace with summary card components */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Available Balance
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {formatCurrency(portfolio.available_balance_clp)}
          </div>
        </div>

        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Total Invested
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {formatCurrency(portfolio.total_invested_clp)}
          </div>
        </div>

        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Current Value
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {formatCurrency(portfolio.total_current_value_clp)}
          </div>
        </div>

        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: portfolio.total_profit_loss_clp >= 0 ? '#d4edda' : '#f8d7da'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Total P&L
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: portfolio.total_profit_loss_clp >= 0 ? '#155724' : '#721c24'
          }}>
            {portfolio.total_profit_loss_clp >= 0 ? '+' : ''}
            {formatCurrency(portfolio.total_profit_loss_clp)}
          </div>
          <div style={{
            fontSize: '14px',
            color: portfolio.total_profit_loss_clp >= 0 ? '#155724' : '#721c24'
          }}>
            ({portfolio.total_profit_loss_percent >= 0 ? '+' : ''}
            {portfolio.total_profit_loss_percent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Active Investments */}
      <div>
        <h2 style={{ marginBottom: '20px' }}>Active Tracker Investments</h2>

        {portfolio.active_trackers.length > 0 ? (
          // TODO: Replace with investment cards component
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {portfolio.active_trackers.map((tracker) => (
              <div
                key={tracker.tracker_id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.3s'
                }}
                onClick={() => navigate(`/tracker/${tracker.tracker_id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{ marginBottom: '15px' }}>{tracker.tracker_name}</h3>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>Invested:</span>
                    <span style={{ fontWeight: 'bold' }}>
                      {formatCurrency(tracker.invested_amount_clp)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>Current Value:</span>
                    <span style={{ fontWeight: 'bold' }}>
                      {formatCurrency(tracker.current_value_clp)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid #eee'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Profit/Loss:</span>
                    <span style={{
                      fontWeight: 'bold',
                      color: tracker.profit_loss_clp >= 0 ? '#28a745' : '#dc3545'
                    }}>
                      {tracker.profit_loss_clp >= 0 ? '+' : ''}
                      {formatCurrency(tracker.profit_loss_clp)}
                      ({tracker.profit_loss_percent >= 0 ? '+' : ''}
                      {tracker.profit_loss_percent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* TODO: Add action buttons (View Details, Sell, etc.) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tracker/${tracker.tracker_id}`);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          // TODO: Replace with empty state component
          <div style={{
            padding: '50px',
            textAlign: 'center',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            color: '#6c757d'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              You haven't invested in any trackers yet
            </p>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
              Start by browsing available trackers in the marketplace
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Browse Marketplace
            </button>
          </div>
        )}
      </div>

      {/* TODO: Add portfolio performance chart */}
      {/* TODO: Add transaction history section */}
    </div>
  );
};

export default DashboardPage;
