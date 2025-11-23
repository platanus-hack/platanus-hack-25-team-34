import React from 'react';
import { Box, Typography } from '@mui/material';
import type { TrackerHolding } from '../types';
import HoldingItem from './HoldingItem';

interface HoldingsListProps {
  holdings: TrackerHolding[];
}

const HoldingsList: React.FC<HoldingsListProps> = ({ holdings }) => {
  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {/* <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          Composición del portafolio
        </Typography> */}
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        maxHeight: '400px',
        overflowY: 'auto',
        pr: 2,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#000',
          borderRadius: '0px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#333',
        }
      }}>
        {holdings.map((holding) => (
          <HoldingItem
            key={holding.id}
            imageUrl={`https://storage.googleapis.com/fintual-public/asset-logo-icons/${holding.ticker}.png`}
            abbreviation={holding.ticker}
            name={holding.company_name}
            percentage={holding.allocation_percent}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HoldingsList;
