import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackerApi } from '../services/api';
import type { Tracker } from '../types';
import Navbar from '../components/Navbar';
import TrackerCard from '../components/TrackerCard';

import {Typography, Box, Container} from '@mui/material';

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
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando portafolios...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  }

  return (
      
    <Box sx={{ backgroundColor: '#F5F5F5', minHeight: '100vh', py: 4 }}>
      <Navbar />

      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: '#333', mb: 1, fontWeight: 'bold' }}
        >
          Conoce a nuestros Hedgies preferidos
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: '#FF5252', mb: 4, fontWeight: 'bold' }}
        >
          Hedgies preferidos
        </Typography>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
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

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline', color: '#333' },
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
