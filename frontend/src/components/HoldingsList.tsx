import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { TrackerHolding } from '../types';
import HoldingItem from './HoldingItem';

interface HoldingsListProps {
  holdings: TrackerHolding[];
}

const HoldingsList: React.FC<HoldingsListProps> = ({ holdings }) => {
  // Take only the top 3 holdings for the preview, or all if requested. 
  // The design implies a preview list ("Ver portafolio completo" at bottom).
  // For now, I'll show up to 3 items as per the image style.
  const displayedHoldings = holdings.slice(0, 3);

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          Composición del portafolio
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
                <ChevronRightIcon />
            </Typography>
            <Typography variant="body2" color="text.secondary">
                <ChevronRightIcon />
            </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {displayedHoldings.map((holding) => (
          <HoldingItem
            key={holding.id}
            abbreviation={holding.ticker}
            name={holding.company_name}
            percentage={holding.allocation_percent}
          />
        ))}
      </Box>

      <Button
        endIcon={<ChevronRightIcon />}
        sx={{
          mt: 2,
          textTransform: 'none',
          color: '#666',
          fontSize: '0.95rem',
          padding: 0,
          '&:hover': {
            backgroundColor: 'transparent',
            textDecoration: 'underline',
          },
          justifyContent: 'flex-start'
        }}
        disableRipple
      >
        Ver portafolio completo
      </Button>
    </Box>
  );
};

export default HoldingsList;
