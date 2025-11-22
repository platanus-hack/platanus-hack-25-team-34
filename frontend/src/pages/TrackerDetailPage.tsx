import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackerApi, investmentApi } from '../services/api';
import type { Tracker, TrackerHolding } from '../types';
import { useAuth } from '../context/AuthContext';
import ChartFromAPI from '../components/Chart';
import Navbar from '../components/Navbar';
import HoldingsList from '../components/HoldingsList';
import InvestmentInput from '../components/InvestmentInput';
import { Button, Typography, Box, Container, Breadcrumbs, Link } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', pb: 8 }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2, color: '#666' }}
        >
          <Link underline="hover" color="inherit" href="/marketplace">
            fund
          </Link>
          <Typography color="text.primary">{tracker.name}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {tracker.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#666', mb: 3 }}>
          {tracker.description}
        </Typography>

        {/* Metrics Row */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 4, 
          alignItems: 'center',
          mb: 4,
          borderBottom: '1px solid #eee',
          pb: 4
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ color: '#666' }}>Retorno YTD:</Typography>
            <Typography variant="body1" sx={{ 
              color: tracker.ytd_return >= 0 ? '#00C853' : '#D32F2F', 
              fontWeight: 'bold' 
            }}>
              {tracker.ytd_return >= 0 ? '+' : ''}{tracker.ytd_return}%
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ color: '#666' }}>Riesgo:</Typography>
            <CircleIcon sx={{ 
              fontSize: 12, 
              color: tracker.risk_level.toLowerCase() === 'bajo' || tracker.risk_level.toLowerCase() === 'low' ? '#00C853' : 
                     tracker.risk_level.toLowerCase() === 'medio' || tracker.risk_level.toLowerCase() === 'medium' ? '#FFB300' : '#D32F2F'
            }} />
            <Typography variant="body1" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
              {tracker.risk_level}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ color: '#666' }}>Retraso:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {tracker.average_delay} días
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ color: '#666' }}>Seguidores:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {tracker.followers_count.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* User Investment Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
            Tu inversión en {tracker.name}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            $0
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#00C853' }} />
            <Typography variant="body1" sx={{ color: '#00C853', fontWeight: 'bold' }}>
              $0 (+0%) Hoy
            </Typography>
          </Box>
        </Box>

        {/* Mandar un dato de tracker.id */}
        <ChartFromAPI trackerId={tracker.id} />

        <Box sx={{ mt: 4 }}>
          <HoldingsList holdings={holdings} />
        </Box>

        {/* Investment Form */}
        <Box sx={{ mt: 6, maxWidth: 600 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Invertir
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
            Disponible: <strong>{formatCurrency(user?.balance_clp || 0)}</strong>
          </Typography>

          {investmentSuccess ? (
            <Typography sx={{ color: 'green', fontWeight: 'bold', textAlign: 'center', py: 4 }}>
              ✓ ¡Inversión exitosa!
            </Typography>
          ) : (
            <form onSubmit={handleInvest}>
              <InvestmentInput
                value={investmentAmount}
                onChange={setInvestmentAmount}
                currency={currency}
                onCurrencyChange={setCurrency}
                disabled={investing}
              />
              {investmentError && (
                <Typography color="error" align="center" sx={{ mt: 2 }}>
                  {String(investmentError)}
                </Typography>
              )}
              <Button 
                type="submit" 
                disabled={investing} 
                fullWidth 
                size="large" 
                sx={{ 
                  mt: 3,
                  backgroundColor: '#000',
                  color: '#fff',
                  borderRadius: '50px',
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#333'
                  }
                }}
              >
                {investing ? 'Procesando...' : 'Invertir'}
              </Button>
            </form>
          )}
        </Box>

        {/* Disclaimer Link */}
        <Typography 
          onClick={() => setShowDisclaimer(true)}
          sx={{ 
            mt: 8, 
            textAlign: 'center', 
            color: 'text.secondary', 
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '0.875rem'
          }}
        >
          Ver Disclaimer
        </Typography>

        {/* Disclaimer Modal */}
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
      </Container>
    </Box>
  );
};

export default TrackerDetailPage;
