import React from 'react';
import { Box, Typography, Input, ToggleButtonGroup, ToggleButton } from '@mui/material';

interface InvestmentInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: 'CLP' | 'USD';
  onCurrencyChange: (currency: 'CLP' | 'USD') => void;
  disabled?: boolean;
}

const InvestmentInput: React.FC<InvestmentInputProps> = ({
  value,
  onChange,
  currency,
  onCurrencyChange,
  disabled
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mr: 1 }}>
          $
        </Typography>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Valor ingresado"
          disableUnderline={false}
          disabled={disabled}
          type="number"
          sx={{
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            width: '100%',
            maxWidth: '300px',
            '& .MuiInput-input': {
              textAlign: 'center',
              paddingBottom: '8px',
              MozAppearance: 'textfield',
              '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            },
            '&:before': {
              borderBottom: '2px solid #000 !important',
            },
            '&:after': {
              borderBottom: '2px solid #000',
            }
          }}
        />
      </Box>

      <ToggleButtonGroup
        value={currency}
        exclusive
        onChange={(_, newCurrency) => {
          if (newCurrency) onCurrencyChange(newCurrency);
        }}
        aria-label="currency"
        sx={{
          gap: 2,
          '& .MuiToggleButton-root': {
            borderRadius: '20px',
            border: '1px solid #000',
            color: '#000',
            px: 3,
            py: 0.5,
            textTransform: 'none',
            fontSize: '0.9rem',
            height: '32px',
            '&.Mui-selected': {
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#333',
              }
            },
            '&:not(.Mui-selected):hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }
        }}
      >
        <ToggleButton value="CLP">CLP</ToggleButton>
        <ToggleButton value="USD">USD</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default InvestmentInput;
