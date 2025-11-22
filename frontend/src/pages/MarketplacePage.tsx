import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackerApi } from '../services/api';
import type { Tracker } from '../types';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import {Button, Card, CardContent, CardMedia, Typography, Box, Container} from '@mui/material';

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

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading trackers...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  }

  return (
      
    <Box sx={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', py: 4 }}>
      <Navbar />

      <Container maxWidth="lg">

        <Box sx={{ 
          backgroundColor: 'var(--card-bg)', 
          px: { xs: 2, sm: 4 }, // Reduce padding on mobile
          py: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on mobile
          justifyContent: { xs: 'flex-start', sm: 'space-between' }, 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2 // Consistent gap between sections
        }}>
          <Typography variant="body1" sx={{ color: 'var(--text-primary)' }}>
            {user?.name}
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, // Stack balance and buttons on mobile
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 3 }, // Responsive gap
            flexWrap: 'wrap' // Allow wrapping if needed
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexShrink: 0 // Prevent balance from shrinking
            }}>
              <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
                Balance:
              </Typography>
              <Typography variant="h6" sx={{ color: 'var(--accent-positive)' }}>
                {user?.balance_clp}
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: 'wrap' // Allow buttons to wrap on very small screens
            }}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  color: 'var(--accent-info)',
                  borderColor: 'var(--accent-info)',
                  '&:hover': { borderColor: 'var(--accent-info)', backgroundColor: 'var(--accent-info-light)' }
                }}
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>

              <Button
                variant="outlined"
                size="small"
                sx={{
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--text-secondary)',
                  '&:hover': { borderColor: 'var(--text-secondary)', backgroundColor: 'var(--text-secondary-light)' }
                }}
                onClick={logout}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Box>
        
        
        <Typography
          variant="h5"
          component="h1"
          sx={{ color: 'var(--text-primary)', mb: 4, fontWeight: 'bold' }}
        >
          Portafolios destacados: Politicians & Return Rates
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {trackers.map((tracker) => (
            <Card
              key={tracker.id}
              onClick={() => navigate(`/tracker/${tracker.id}`)}
              sx={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                flex: '1 1 300px',
                maxWidth: 350,
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={tracker.avatar_url}
                alt={tracker.name}
              />
              <CardContent>
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 1 }}>
                  {tracker.name}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{ color: 'var(--accent-positive)', fontWeight: 'bold', mb: 0.5 }}
                >
                  {tracker.ytd_return}
                </Typography>

                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                  {tracker.risk_level}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--accent-info)',
                    backgroundColor: 'var(--accent-info-light)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  Hedge cherry picking
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              color: 'var(--accent-info)',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Ver nuestra más fina selección →
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default MarketplacePage;
