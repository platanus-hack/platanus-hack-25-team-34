import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {Button, MenuItem, Select, Alert} from '@mui/material';

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
    <div>
      <h1>Hedgie - Dev Login</h1>
      <p>
        Select a mock user to test the application
      </p>

      <div>
        <form onSubmit={handleLogin}>
          <Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
          >
            <MenuItem value={1}>User 1 - 1,000,000 CLP (Rich User)</MenuItem>
            <MenuItem value={2}>User 2 - 20,000 CLP (Low Balance)</MenuItem>
            <MenuItem value={3}>User 3 - 100,000 CLP (Medium Balance)</MenuItem>
          </Select>
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" disabled={loading} variant="contained">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <Alert severity="info">Note: This is a development login. No passwords required.</Alert>
      </div>
    </div>
  );
};

export default LoginPage;
