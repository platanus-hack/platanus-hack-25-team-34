import React from 'react';
import { Box, Typography, Input } from '@mui/material';

interface InvestmentInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const InvestmentInput: React.FC<InvestmentInputProps> = ({
  value,
  onChange,
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
        <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
          CLP
        </Typography>
      </Box>
    </Box>
  );
};

export default InvestmentInput;
