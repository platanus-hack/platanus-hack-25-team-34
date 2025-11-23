import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackerApi, investmentApi } from '../services/api';
import type { Tracker, TrackerHolding } from '../types';
import { useAuth } from '../context/AuthContext';
import ChartFromAPI from '../components/Chart';
import HoldingsList from '../components/HoldingsList';
import { 
  Button, Typography, Box, Container, Chip, Stack, Input, 
  InputAdornment, Fade, CircularProgress, Alert
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TrackerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [holdings, setHoldings] = useState<TrackerHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
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
        setError('Error loading proprietary data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tracker) return;
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) { setInvestmentError('INVALID AMOUNT'); return; }
    if (amount > user.balance_clp) { setInvestmentError('INSUFFICIENT FUNDS'); return; }

    setInvesting(true);
    setInvestmentError('');

    try {
      const response = await investmentApi.executeInvestment(user.id, tracker.id, amount);
      if (updateUser && response.remaining_balance !== undefined) {
        updateUser({ ...user, balance_clp: response.remaining_balance });
      }
      setInvestmentSuccess(true);
      setInvestmentAmount('');
    } catch (err: any) {
      setInvestmentError('TRANSACTION FAILED');
    } finally {
      setInvesting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#000' }} /></Box>;
  if (error || !tracker) return <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>{error}</Box>;
  const isPositive = tracker.ytd_return >= 0;

  return (
    <Box sx={{ pb: 12, pt: 4 }}> 
      <Container maxWidth="md">
        
        {/* Header */}
        <Box sx={{ mb: 4 }}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate('/marketplace')}
                sx={{ color: '#9CA3AF', mb: 2, pl: 0, '&:hover': { background: 'transparent', color: '#111827' } }}
            >
                Back to Terminal
            </Button>
            
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#111827' }}>
                    {tracker.name}
                </Typography>
                <Chip 
                    label={tracker.type || 'FUND'} 
                    size="small"
                    sx={{ 
                        borderRadius: 0, // Sharp corners = Punk
                        fontWeight: 700, 
                        fontSize: '0.7rem',
                        bgcolor: '#000',
                        color: '#fff',
                    }}
                />
            </Stack>
            <Typography variant="body1" sx={{ color: '#6B7280', maxWidth: '600px', lineHeight: 1.6 }}>
                {tracker.description}
            </Typography>
        </Box>

        {/* Data Strip */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, py: 3, borderBottom: '2px solid #000', borderTop: '2px solid #000', mb: 5 }}>
            <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>YTD RETURN</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isPositive ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                    <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, color: isPositive ? '#00C853' : '#EF4444', letterSpacing: '-0.05em' }}>
                        {isPositive ? '+' : ''}{tracker.ytd_return}%
                    </Typography>
                </Box>
            </Box>
            <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>13F DELAY</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ color: '#4B5563', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{tracker.average_delay} DAYS</Typography>
                </Box>
            </Box>
            <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>TRACKERS</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon sx={{ color: '#4B5563', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{tracker.followers_count.toLocaleString()}</Typography>
                </Box>
            </Box>
        </Box>

        {/* Personal Position */}
        <Box sx={{ mb: 6 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>Current Position</Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '-0.04em', color: '#111827' }}>$0</Typography>
            <Typography variant="body2" sx={{ color: '#00C853', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                 <TrendingUpIcon fontSize="small" /> $0 (+0%) Today
            </Typography>
        </Box>

        {/* CHART SECTION: Fixed Overlap */}
        {/* Increased height to 350 to fit axis labels, Added mb-10 for breathing room */}
        <Box sx={{ mb: 10, height: 350, width: '100%' }}>
             <ChartFromAPI trackerId={tracker.id} />
        </Box>

        {/* Punk Divider: The Tear-off line */}
        <Box sx={{ 
            borderBottom: '2px dashed #D1D5DB', 
            mb: 6, 
            position: 'relative',
            '&:after': {
                content: '"HOLDINGS_BREAKDOWN"',
                position: 'absolute',
                top: -10,
                right: 0,
                background: '#F9FAFB', // Matches page bg
                paddingLeft: 1,
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                color: '#9CA3AF'
            }
        }} />

        {/* Holdings */}
        <Box sx={{ mb: 8 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Portfolio Composition</Typography>
            <HoldingsList holdings={holdings} />
        </Box>

        {/* Investment Form */}
        <Box sx={{ maxWidth: 500 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Deploy Capital</Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 4, fontFamily: 'monospace' }}>
                AVAILABLE: {formatCurrency(user?.balance_clp || 0)}
            </Typography>

            {investmentSuccess ? (
                <Alert severity="success" sx={{ borderRadius: 0, mb: 4, border: '1px solid green' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>ORDER EXECUTED</Typography>
                </Alert>
            ) : (
                <form onSubmit={handleInvest}>
                    <Input
                        fullWidth
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        placeholder="0"
                        disabled={investing}
                        startAdornment={<InputAdornment position="start"><Typography variant="h4" sx={{ fontWeight: 300, color: '#9CA3AF' }}>$</Typography></InputAdornment>}
                        endAdornment={<InputAdornment position="end"><Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>CLP</Typography></InputAdornment>}
                        sx={{
                            fontSize: '2.5rem', fontWeight: 700, fontFamily: 'monospace', color: '#111827', py: 1,
                            '&:before': { borderBottom: '3px solid #E5E7EB' },
                            '&:after': { borderBottom: '3px solid #111827' },
                            '& input': { textAlign: 'right', mr: 2 }
                        }}
                    />
                    {investmentError && <Typography color="error" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700 }}>* {investmentError}</Typography>}
                    <Button 
                        type="submit" disabled={investing} fullWidth
                        sx={{ 
                            mt: 4, bgcolor: '#000', color: '#fff', borderRadius: 0, py: 2, // Square button = Punk
                            fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                            '&:hover': { bgcolor: '#222' },
                            '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' }
                        }}
                    >
                        {investing ? 'Processing...' : 'Execute Order'}
                    </Button>
                </form>
            )}
        </Box>

        {/* Disclaimer Link */}
        <Box sx={{ mt: 8 }}>
             <Typography onClick={() => setShowDisclaimer(true)} variant="caption" sx={{ color: '#9CA3AF', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'monospace' }}>
                LEGAL_DISCLAIMER_V1.txt
            </Typography>
        </Box>

        {showDisclaimer && (
          <Fade in={showDisclaimer}>
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDisclaimer(false)}>
              <Box sx={{ bgcolor: 'white', p: 4, maxWidth: 500, mx: 2, border: '2px solid black' }} onClick={(e) => e.stopPropagation()}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: 'monospace' }}>RISK_DISCLOSURE</Typography>
                <Typography variant="body2" sx={{fontFamily: 'monospace', fontSize: '0.8rem'}} paragraph>
                    Trading involves substantial risk of loss...
                </Typography>
                <Button fullWidth onClick={() => setShowDisclaimer(false)} sx={{ mt: 2, color: 'white', bgcolor: 'black', fontWeight: 700, borderRadius: 0, '&:hover':{bgcolor:'#333'} }}>ACKNOWLEDGE</Button>
              </Box>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default TrackerDetailPage;