import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackerApi, investmentApi } from '../services/api';
import type { Tracker, TrackerHolding } from '../types';
import { useAuth } from '../context/AuthContext';
import ChartFromAPI from '../components/Chart';
import Navbar from '../components/Navbar';
import { Button } from '@mui/material';

const TrackerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, updateUser } = useAuth();
  
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [holdings, setHoldings] = useState<TrackerHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [investing, setInvesting] = useState(false);
  const [investmentError, setInvestmentError] = useState<string>('');
  const [investmentSuccess, setInvestmentSuccess] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [trackerData, holdingsData] = await Promise.all([
          trackerApi.getTrackerDetails(Number(id)),
          trackerApi.getTrackerHoldings(Number(id))
        ]);
        setTracker(trackerData);
        setHoldings(holdingsData);
      } catch (err) {
        setError('Failed to load tracker details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const parseErrorMessage = (err: any): string => {
    let errorMessage = 'Investment failed';
    
    if (err.response?.data) {
      const errorData = err.response.data;
      
      // FastAPI validation error format
      if (errorData.detail && Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail
          .map((e: any) => e.msg || JSON.stringify(e))
          .join(', ');
      } 
      // Simple string detail
      else if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      }
      // Generic error object
      else if (errorData.error) {
        errorMessage = errorData.error;
      }
    }
    
    return errorMessage;
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tracker) return;

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setInvestmentError('Please enter a valid amount');
      return;
    }

    if (amount > user.balance_clp) {
      setInvestmentError('Insufficient balance');
      return;
    }

    setInvesting(true);
    setInvestmentError('');

    try {
      const response = await investmentApi.executeInvestment(user.id, tracker.id, amount);
      
      // Update user balance in AuthContext
      if (updateUser && response.remaining_balance !== undefined) {
        updateUser({ ...user, balance_clp: response.remaining_balance });
      }
      
      setInvestmentSuccess(true);
      setInvestmentAmount('');
      
    } catch (err: any) {
      console.error('Investment error:', err.response?.data);
      setInvestmentError(parseErrorMessage(err));
    } finally {
      setInvesting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  if (error || !tracker) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error || 'Tracker not found'}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Navbar />

      <img 
        src={tracker.avatar_url} 
        alt={tracker.name}
        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
      />
      <h1>{tracker.name}</h1>
      <p>{tracker.type} | {tracker.description}</p>

      <p>YTD Return: {tracker.ytd_return >= 0 ? '+' : ''}{tracker.ytd_return}%</p>
      <p>Risk: {tracker.risk_level} | Delay: {tracker.average_delay} days | Followers: {tracker.followers_count.toLocaleString()}</p>

      <ChartFromAPI />

      <h2>Holdings</h2>
      {holdings.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Ticker</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Company</th>
              <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Allocation</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={holding.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{holding.ticker}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{holding.company_name}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{holding.allocation_percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No holdings available</p>
      )}

      <div data-section="disclaimer">
        <Button onClick={() => setShowDisclaimer(true)}>
          Ver Disclaimer
        </Button>
      </div>

      {showDisclaimer && (
        <div data-component="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div data-section="modal-content" style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowDisclaimer(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h2>Disclaimer</h2>
            <p>Disclaimer, Dani agrega un disclaimer aquí.</p>
            <Button onClick={() => setShowDisclaimer(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #007bff', borderRadius: '8px' }}>
        <h2>Invest in {tracker.name}</h2>
        <p>Available: <strong>{formatCurrency(user?.balance_clp || 0)}</strong></p>

        {investmentSuccess ? (
          <p style={{ color: 'green' }}>✓ Investment successful! Redirecting...</p>
        ) : (
          <form onSubmit={handleInvest}>
            <label>Amount (CLP):</label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              disabled={investing}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            {investmentError && <p style={{ color: 'red' }}>{String(investmentError)}</p>}
            <Button type="submit" disabled={investing} fullWidth size="large">
              {investing ? 'Processing...' : 'Invest Now'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TrackerDetailPage;
