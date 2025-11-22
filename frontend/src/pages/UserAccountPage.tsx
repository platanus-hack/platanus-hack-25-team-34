/**
 * User Account Page
 * 
 * Displays user balance in CLP and USD
 * Allows deposit and withdrawal of funds (mock operations)
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { formatCLP, formatUSD, convertClpToUsd, CLP_TO_USD_RATE } from '../config/constants';
import { Button } from '@mui/material';
import type { BalanceResponse } from '../types';
import Navbar from '../components/Navbar';

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
      if (!user) return;
      
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
      <div data-page="user-account">
        <Navbar />
        <div data-section="content">
          <p>Cargando balance...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-page="user-account">
      <Navbar />
      
      <div data-section="content">
        <h1>Mi Cuenta</h1>
        
        <div data-section="balance-summary">
          <h2>Saldo Disponible</h2>
          <div data-section="balance-amounts">
            <p data-currency="clp">
              <strong>CLP:</strong> {formatCLP(balance)}
            </p>
            <p data-currency="usd">
              <strong>USD:</strong> {formatUSD(balanceUsd)}
            </p>
            <p data-info="exchange-rate">
              (Tasa de cambio: 1 USD = {CLP_TO_USD_RATE} CLP)
            </p>
          </div>
        </div>

        {message && (
          <div data-state="success">
            {message}
          </div>
        )}

        {error && (
          <div data-state="error">
            {error}
          </div>
        )}

        <div data-section="actions">
          <div data-section="deposit-form">
            <h2>Depositar Fondos</h2>
            <form onSubmit={handleDeposit}>
              <div>
                <label htmlFor="deposit-amount">Monto en CLP</label>
                <input
                  id="deposit-amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Ej: 100000"
                  disabled={loading}
                />
              </div>
              {depositAmount && parseFloat(depositAmount) > 0 && (
                <p data-info="conversion">
                  Equivalente: {formatUSD(convertClpToUsd(parseFloat(depositAmount)))}
                </p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Procesando...' : 'Depositar'}
              </Button>
            </form>
          </div>

          <div data-section="withdraw-form">
            <h2>Retirar Fondos</h2>
            <form onSubmit={handleWithdraw}>
              <div>
                <label htmlFor="withdraw-amount">Monto en CLP</label>
                <input
                  id="withdraw-amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Ej: 50000"
                  disabled={loading}
                />
              </div>
              {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                <p data-info="conversion">
                  Equivalente: {formatUSD(convertClpToUsd(parseFloat(withdrawAmount)))}
                </p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Procesando...' : 'Retirar'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccountPage;
