import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackerApi } from '../services/api';
import type { Tracker } from '../types';
// DELETE: import Navbar from '../components/Navbar'; <--- This was the culprit
import TrackerCard from '../components/TrackerCard';
import { Typography, Box, Container, CircularProgress, Fade } from '@mui/material';

const MarketplacePage: React.FC = () => {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#111827' }} />
      </Box>
    );
  }

  if (error) {
    return <Box sx={{ textAlign: 'center', mt: 8, color: 'error.main' }}>{error}</Box>;
  }

  return (
    // Removed <Navbar /> and simplified the container
    <Box sx={{ pb: 8 }}> 
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ mb: 5, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ 
              color: '#111827', 
              fontWeight: 800, 
              letterSpacing: '-0.02em',
              mb: 1 
            }}
          >
            Top Performing Hedgies
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#6B7280', fontSize: '1.1rem' }}>
            Follow the portfolios of the world's most influential investors.
          </Typography>
        </Box>

        <Fade in={!loading}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: 3 
          }}>
            {trackers.map((tracker) => (
              <TrackerCard
                key={tracker.id}
                tracker={tracker}
                onClick={() => navigate(`/tracker/${tracker.id}`)}
              />
            ))}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default MarketplacePage;