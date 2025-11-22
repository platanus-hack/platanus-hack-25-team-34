import React from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface TransactionCardProps {
  type: 'deposit' | 'withdraw';
  amount: string;
  onAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  type, 
  amount, 
  onAmountChange, 
  onSubmit, 
  loading 
}) => {
  const isDeposit = type === 'deposit';
  const color = isDeposit ? '#00C853' : '#D32F2F'; // Green : Red
  const title = isDeposit ? 'Depositar' : 'Retirar';
  const buttonText = isDeposit ? 'Depositar Fondos' : 'Retirar Fondos';
  const Icon = isDeposit ? ArrowUpwardIcon : ArrowDownwardIcon;
  const iconBg = isDeposit ? 'rgba(0, 200, 83, 0.1)' : 'rgba(211, 47, 47, 0.1)';

  return (
    <Box sx={{
      backgroundColor: 'white',
      borderRadius: '16px',
      p: 3,
      border: '1px solid #eee',
      flex: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ 
          backgroundColor: iconBg, 
          borderRadius: '50%', 
          p: 1, 
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon sx={{ color: color }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>

      <form onSubmit={onSubmit}>
        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
          Monto en CLP
        </Typography>
        <TextField
          fullWidth
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder={isDeposit ? "100000" : "50000"}
          type="number"
          disabled={loading}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: '#f8f9fa'
            }
          }}
          slotProps={{
             htmlInput: { min: 0 }
          }}
        />

        <Button
          type="submit"
          fullWidth
          disabled={loading}
          sx={{
            backgroundColor: color,
            color: 'white',
            py: 1.5,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: isDeposit ? '#009624' : '#b71c1c'
            }
          }}
        >
          {loading ? 'Procesando...' : buttonText}
        </Button>
      </form>
    </Box>
  );
};

export default TransactionCard;
