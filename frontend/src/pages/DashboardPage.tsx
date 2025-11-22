import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioApi, transactionApi } from '../services/api';
import type { Portfolio, Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ActiveTrackerCard from '../components/ActiveTrackerCard';

const DashboardPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [portfolioData, transactionData] = await Promise.all([
          portfolioApi.getUserPortfolio(user.id),
          transactionApi.getUserTransactions(user.id, 20) // Last 20 transactions
        ]);
        
        setPortfolio(portfolioData);
        setTransactions(transactionData);
        
        // Update user context with latest balance from portfolio
        if (updateUser) {
          updateUser({ ...user, balance_clp: portfolioData.available_balance_clp });
        }
      } catch (err) {
        setError('Failed to load portfolio');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) return <p>Loading...</p>;
  if (error || !portfolio) return <p style={{ color: 'red' }}>{error || 'Portfolio not found'}</p>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#333' }}>Portfolio - {user?.name}</h1>
          <div>
            <button onClick={() => navigate('/marketplace')} style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer' }}>Browse Trackers</button>
            <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#555' }}>Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#888' }}>Available Balance</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(portfolio.available_balance_clp)}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#888' }}>Total Invested</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(portfolio.total_invested_clp)}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#888' }}>Current Value</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(portfolio.total_current_value_clp)}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#888' }}>Total P&L</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: portfolio.total_profit_loss_clp >= 0 ? '#00C853' : '#FF5252' }}>
                {portfolio.total_profit_loss_clp >= 0 ? '+' : ''}
                {formatCurrency(portfolio.total_profit_loss_clp)} ({portfolio.total_profit_loss_percent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ color: '#333' }}>Active Investments</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {portfolio.active_trackers.length > 0 ? (
            portfolio.active_trackers.map((tracker) => (
              <ActiveTrackerCard 
                key={tracker.tracker_id} 
                tracker={tracker} 
                onClick={() => navigate(`/tracker/${tracker.tracker_id}`)} 
              />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
              <p>No investments yet</p>
              <button onClick={() => navigate('/marketplace')} style={{ padding: '10px 20px', cursor: 'pointer' }}>Start Investing</button>
            </div>
          )}
        </div>

        <h2 style={{ color: '#333' }}>Investment History</h2>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {transactions.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9f9f9' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee', color: '#666' }}>Date</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee', color: '#666' }}>Type</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee', color: '#666' }}>Tracker</th>
                  <th style={{ padding: '15px', textAlign: 'right', borderBottom: '1px solid #eee', color: '#666' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>{formatDate(tx.timestamp)}</td>
                    <td style={{ padding: '15px', textTransform: 'capitalize' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: tx.type === 'buy' ? '#E8F5E9' : '#FFEBEE',
                        color: tx.type === 'buy' ? '#2E7D32' : '#C62828',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: '15px', fontWeight: '500' }}>{tx.tracker_name}</td>
                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCurrency(tx.amount_clp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No transaction history yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
