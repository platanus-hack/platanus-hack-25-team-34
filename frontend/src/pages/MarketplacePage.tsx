import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackerApi } from '../services/api';
import type { Tracker } from '../types';
import { useAuth } from '../context/AuthContext';

import {Button, Card, CardContent, CardMedia, Typography} from '@mui/material';

const MarketplacePage: React.FC = () => {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchTrackers = async () => {
      try {
        const data = await trackerApi.getAllTrackers();
        setTrackers(data);
      } catch (err) {
        setError('Failed to load trackers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackers();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading trackers...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <div>
        <div>
          <h1>Marketplace - Copy-Trade Whales</h1>
          <p style={{ color: '#666' }}>
            Logged in as: <strong>{user?.name}</strong> | 
            Balance: <strong>{formatCurrency(user?.balance_clp || 0)}</strong>
          </p>
        </div>
        <div>
          <Button onClick={() => navigate('/dashboard')}>
            My Portfolio
          </Button>
          <Button onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <div style={{display:'flex'}}>
        {trackers.map((tracker) => (
          <Card
            key={tracker.id}
            onClick={() => navigate(`/tracker/${tracker.id}`)}
            sx={{ maxWidth: 345 }}
          >
            <CardMedia
              component="img"
              height="194"
              image={tracker.avatar_url}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {tracker.name}
              </Typography>
              <div>
                <div>
                  <span>YTD Return:</span>
                  <span>
                    {tracker.ytd_return >= 0 ? '+' : ''}{tracker.ytd_return}%
                  </span>
                </div>
                <div>
                  <span>Risk Level:</span>
                  <span>
                    {tracker.risk_level}
                  </span>
                </div>
                <div>
                  <span>Avg Delay:</span>
                  <span>{tracker.average_delay} days</span>
                </div>
                <div>
                  <span>Followers:</span>
                  <span>{tracker.followers_count.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trackers.length === 0 && (
        <div>
          No trackers available at the moment.
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
