import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface BalanceCardProps {
  balanceClp: string;
  balanceUsd: string;
  exchangeRate: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balanceClp, balanceUsd, exchangeRate }) => {
  return (
    <Box sx={{
      backgroundColor: '#131824', // Dark blue/black from image
      color: 'white',
      borderRadius: '16px',
      p: 4,
      mb: 4,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, opacity: 0.7 }}>
        <AttachMoneyIcon sx={{ fontSize: 20, mr: 0.5 }} />
        <Typography variant="body2">Saldo Disponible</Typography>
      </Box>
      
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
        {balanceClp}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 3 }}>
        CLP
      </Typography>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
      
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
        {balanceUsd}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 3 }}>
        USD
      </Typography>
      
      <Typography variant="caption" sx={{ opacity: 0.5 }}>
        Tasa de cambio: 1 USD = {exchangeRate} CLP
      </Typography>
    </Box>
  );
};

export default BalanceCard;
