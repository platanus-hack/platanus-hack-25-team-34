import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackerApi, investmentApi } from '../services/api';
import type { Tracker, TrackerHolding } from '../types';
import { useAuth } from '../context/AuthContext';
import ChartFromAPI from '../components/Chart';
import Navbar from '../components/Navbar';
import HoldingsList from '../components/HoldingsList';
import InvestmentInput from '../components/InvestmentInput';
import { Button } from '@mui/material';

const TrackerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, updateUser } = useAuth();
  
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [holdings, setHoldings] = useState<TrackerHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'CLP' | 'USD'>('CLP');
  const [investing, setInvesting] = useState(false);
  const [investmentError, setInvestmentError] = useState<string>('');
  const [investmentSuccess, setInvestmentSuccess] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

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
        setError('Error al cargar los detalles del portafolio');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const parseErrorMessage = (err: any): string => {
    let errorMessage = 'La inversión falló';
    
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
      setInvestmentError('Por favor ingrese un monto válido');
      return;
    }

    if (amount > user.balance_clp) {
      setInvestmentError('Saldo insuficiente');
      return;
    }

    setInvesting(true);
    setInvestmentError('');

    try {
      const response = await investmentApi.executeInvestment(user.id, tracker.id, amount);
      
      // Update user balance in AuthContext
      if (updateUser && response.remaining_balance !== undefined) {
        updateUser({ ...user, balance_clp: response.remaining_balance });
      }
      
      setInvestmentSuccess(true);
      setInvestmentAmount('');
      
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
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;
  }

  if (error || !tracker) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error || 'Portafolio no encontrado'}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Navbar />

      <img 
        src={tracker.avatar_url} 
        alt={tracker.name}
        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
      />
      <h1>{tracker.name}</h1>
      <p>{tracker.type} | {tracker.description}</p>

      <p>Retorno YTD: {tracker.ytd_return >= 0 ? '+' : ''}{tracker.ytd_return}%</p>
      <p>Riesgo: {tracker.risk_level} | Retraso: {tracker.average_delay} días | Seguidores: {tracker.followers_count.toLocaleString()}</p>

      <ChartFromAPI />

      <HoldingsList holdings={holdings} />

      <div data-section="disclaimer">
        <Button onClick={() => setShowDisclaimer(true)}>
          Ver Disclaimer
        </Button>
      </div>

      {showDisclaimer && (
        <div data-component="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div data-section="modal-content" style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowDisclaimer(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h2>Disclaimer</h2>
            <p>Disclaimer, Dani agrega un disclaimer aquí.</p>
            <Button onClick={() => setShowDisclaimer(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #007bff', borderRadius: '8px' }}>
        <h2>Invertir en {tracker.name}</h2>
        <p>Disponible: <strong>{formatCurrency(user?.balance_clp || 0)}</strong></p>

        {investmentSuccess ? (
          <p style={{ color: 'green' }}>✓ ¡Inversión exitosa! Redirigiendo...</p>
        ) : (
          <form onSubmit={handleInvest}>
            <InvestmentInput
              value={investmentAmount}
              onChange={setInvestmentAmount}
              currency={currency}
              onCurrencyChange={setCurrency}
              disabled={investing}
            />
            {investmentError && <p style={{ color: 'red', textAlign: 'center' }}>{String(investmentError)}</p>}
            <Button type="submit" disabled={investing} fullWidth size="large" sx={{ mt: 2 }}>
              {investing ? 'Procesando...' : 'Invertir Ahora'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TrackerDetailPage;
