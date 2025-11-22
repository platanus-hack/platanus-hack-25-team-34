import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

interface HoldingItemProps {
  imageUrl?: string;
  abbreviation: string;
  name: string;
  percentage: number;
}

const HoldingItem: React.FC<HoldingItemProps> = ({ imageUrl, abbreviation, name, percentage }) => {
  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={imageUrl}
          variant="rounded"
          sx={{
            bgcolor: '#f5f5f5',
            color: '#d32f2f',
            width: 48,
            height: 48,
            fontWeight: 'bold',
            fontSize: '1.2rem',
          }}
        >
          {!imageUrl && abbreviation[0]}
        </Avatar>
        
        <Box>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', lineHeight: 1 }}>
            {abbreviation}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
            {name}
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {percentage}%
      </Typography>
    </Box>
  );
};

export default HoldingItem;
