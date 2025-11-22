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
      setError('Error al iniciar sesión. Por favor intente nuevamente.');
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
          Login de Desarrollo - Selecciona un usuario de prueba
        </Typography>

        <form onSubmit={handleLogin}>
          <Box sx={{ mb: 3 }}>
            <Select
              fullWidth
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              sx={{ textAlign: 'left', borderRadius: 2 }}
            >
              <MenuItem value={1}>Usuario 1 - 1,000,000 CLP (Usuario Rico)</MenuItem>
              <MenuItem value={2}>Usuario 2 - 20,000 CLP (Saldo Bajo)</MenuItem>
              <MenuItem value={3}>Usuario 3 - 100,000 CLP (Saldo Medio)</MenuItem>
            </Select>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Button 
            type="submit" 
            disabled={loading} 
            fullWidth 
            size="large"
            sx={{ 
              py: 1.5,
              fontSize: '16px',
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        
        <Alert severity="info" sx={{ mt: 4, textAlign: 'left', borderRadius: 2 }}>
          Nota: Este es un login de desarrollo. No se requieren contraseñas.
        </Alert>
      </Paper>
    </Container>
  );
};

export default LoginPage;
