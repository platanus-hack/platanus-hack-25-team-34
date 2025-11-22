import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackerApi, investmentApi } from '../services/api';
import type { Tracker, TrackerHolding } from '../types';
import { useAuth } from '../context/AuthContext';
import ChartFromAPI from '../components/Chart.jsx';

import {Button, Card, CardContent, CardMedia, Typography} from '@mui/material';

const TrackerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [holdings, setHoldings] = useState<TrackerHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [investing, setInvesting] = useState(false);
  const [investmentError, setInvestmentError] = useState<string>('');
  const [investmentSuccess, setInvestmentSuccess] = useState(false);

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
      await investmentApi.executeInvestment(user.id, tracker.id, amount);
      setInvestmentSuccess(true);
      setInvestmentAmount('');
      
      // TODO: Update user balance in context
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
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
    <div>
      <Button
        onClick={() => navigate('/marketplace')}
      >
        ← Back to Marketplace
      </Button>

      <div>
        <div>
          <img 
            src={tracker.avatar_url} 
            alt={tracker.name}
            style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
        <div>
          <h1>{tracker.name}</h1>
          <p>{tracker.type}</p>
          <p>{tracker.description}</p>
        </div>
      </div>

      <div>
        <div>
          <div>YTD Return</div>
          <div>{tracker.ytd_return >= 0 ? '+' : ''}{tracker.ytd_return}%</div>
        </div>
        <div>
          <div>Risk Level</div>
          <div>{tracker.risk_level}</div>
        </div>
        <div>
          <div>Avg Delay</div>
          <div>{tracker.average_delay} days</div>
        </div>
        <div>
          <div>Followers</div>
          <div>{tracker.followers_count.toLocaleString()}</div>
        </div>
      </div>

      <div>
        <h3>Performance Chart</h3>
        <p>TODO: Add Recharts line chart showing historical performance</p>
        <div>
          [Chart Placeholder - Will show YTD performance trend]
        </div>
      </div>

      <div>
        <ChartFromAPI></ChartFromAPI>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '15px' }}>Portfolio Holdings</h2>
        {holdings.length > 0 ? (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #ddd'
          }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Ticker</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Company</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Allocation</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                    {holding.ticker}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {holding.company_name}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                    {holding.allocation_percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
            No holdings information available
          </p>
        )}
      </div>

      <div style={{
        padding: '20px',
        border: '2px solid #007bff',
        borderRadius: '8px',
        backgroundColor: '#f0f8ff'
      }}>
        <h2>Invest in {tracker.name}</h2>
        <p>
          Your available balance: <strong>{formatCurrency(user?.balance_clp || 0)}</strong>
        </p>

        {investmentSuccess ? (
          <div style={{
            padding: '15px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ✓ Investment successful! Redirecting to dashboard...
          </div>
        ) : (
          <form onSubmit={handleInvest}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Amount (CLP):
              </label>
              <input
                id="amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="Enter amount in CLP"
                min="1"
                step="1"
                disabled={investing}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {investmentError && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                color: '#c00'
              }}>
                {String(investmentError)}
              </div>
            )}

            <button
              type="submit"
              disabled={investing}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: investing ? '#6c757d' : '#007bff',
                border: 'none',
                borderRadius: '4px',
                cursor: investing ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!investing) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                if (!investing) {
                  e.currentTarget.style.backgroundColor = '#007bff';
                }
              }}
            >
              {investing ? 'Processing...' : 'Invest Now'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TrackerDetailPage;
