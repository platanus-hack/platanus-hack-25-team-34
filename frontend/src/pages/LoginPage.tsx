import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

import {Button, MenuItem, Select, Alert, Box, Container, Typography, Paper} from '@mui/material';

const LoginPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(selectedUserId);
      navigate('/marketplace');
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f7' }}>
      <Paper elevation={0} sx={{ p: 5, width: '100%', textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Logo height={80} width={125} />
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom fontWeight="700" sx={{ color: '#1D1D1F' }}>
          Hedgie
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Dev Login - Select a mock user
        </Typography>

        <form onSubmit={handleLogin}>
          <Box sx={{ mb: 3 }}>
            <Select
              fullWidth
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              sx={{ textAlign: 'left', borderRadius: 2 }}
            >
              <MenuItem value={1}>User 1 - 1,000,000 CLP (Rich User)</MenuItem>
              <MenuItem value={2}>User 2 - 20,000 CLP (Low Balance)</MenuItem>
              <MenuItem value={3}>User 3 - 100,000 CLP (Medium Balance)</MenuItem>
            </Select>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Button 
            type="submit" 
            disabled={loading} 
            variant="contained" 
            fullWidth 
            size="large"
            sx={{ 
              backgroundColor: '#000', 
              '&:hover': { backgroundColor: '#333' },
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <Alert severity="info" sx={{ mt: 4, textAlign: 'left', borderRadius: 2 }}>
          Note: This is a development login. No passwords required.
        </Alert>
      </Paper>
    </Container>
  );
};

export default LoginPage;
