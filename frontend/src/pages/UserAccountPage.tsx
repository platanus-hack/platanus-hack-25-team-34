import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { formatCLP, formatUSD, convertClpToUsd, CLP_TO_USD_RATE } from '../config/constants';
import { Box, Container, Typography, Alert } from '@mui/material';
import type { BalanceResponse } from '../types';
// import Navbar from '../components/Navbar';
import BalanceCard from '../components/BalanceCard';
import TransactionCard from '../components/TransactionCard';

const UserAccountPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [fetchingBalance, setFetchingBalance] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user || !user.id) return;
      
      setFetchingBalance(true);
      try {
        const response: BalanceResponse = await userApi.getBalance(user.id);
        setBalance(response.balance_clp);
        
        // Update user context with latest balance
        if (updateUser) {
          updateUser({ ...user, balance_clp: response.balance_clp });
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        // Fallback to user balance from context
        setBalance(user.balance_clp);
      } finally {
        setFetchingBalance(false);
      }
    };
    
    fetchBalance();
  }, [user?.id]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Ingrese un monto válido mayor a 0');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response: BalanceResponse = await userApi.deposit(user.id, amount);
      setBalance(response.balance_clp);
      setMessage(response.message);
      setDepositAmount('');
      
      // Update user context
      if (updateUser) {
        updateUser({ ...user, balance_clp: response.balance_clp });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al depositar fondos');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Ingrese un monto válido mayor a 0');
      return;
    }

    if (amount > balance) {
      setError(`Saldo insuficiente. Disponible: ${formatCLP(balance)}`);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response: BalanceResponse = await userApi.withdraw(user.id, amount);
      setBalance(response.balance_clp);
      setMessage(response.message);
      setWithdrawAmount('');
      
      // Update user context
      if (updateUser) {
        updateUser({ ...user, balance_clp: response.balance_clp });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al retirar fondos');
    } finally {
      setLoading(false);
    }
  };

  const balanceUsd = convertClpToUsd(balance);

  if (fetchingBalance) {
    return (
      <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {/* <Navbar /> */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Cargando balance...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', pb: 8 }}>
      {/* <Navbar /> */}
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
          Mi Cuenta
        </Typography>

        <BalanceCard 
          balanceClp={formatCLP(balance)}
          balanceUsd={formatUSD(balanceUsd)}
          exchangeRate={CLP_TO_USD_RATE}
        />

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3 
        }}>
          <TransactionCard
            type="deposit"
            amount={depositAmount}
            onAmountChange={setDepositAmount}
            onSubmit={handleDeposit}
            loading={loading}
          />
          
          <TransactionCard
            type="withdraw"
            amount={withdrawAmount}
            onAmountChange={setWithdrawAmount}
            onSubmit={handleWithdraw}
            loading={loading}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default UserAccountPage;
