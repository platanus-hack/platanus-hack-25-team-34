import React from 'react';
import { 
  Card, 
  CardActionArea, 
  Box, 
  Typography, 
  Avatar, 
  Chip, 
  Stack 
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { Tracker } from '../types';

interface TrackerCardProps {
  tracker: Tracker;
  onClick: () => void;
}

const TrackerCard: React.FC<TrackerCardProps> = ({ tracker, onClick }) => {
  // Logic remains exactly as provided
  const isPositive = tracker.ytd_return >= 0;
  const returnColor = isPositive ? '#00C853' : '#FF5252';
  const trackColor = isPositive ? 'rgba(0, 200, 83, 0.12)' : 'rgba(255, 82, 82, 0.12)';

  // Cunning design trick: Visual scaling logic preserved
  const progressWidth = Math.min(Math.abs(tracker.ytd_return) * 2, 100);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid #F3F4F6',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.08)',
          borderColor: '#E5E7EB'
        }
      }}
    >
      <CardActionArea 
        onClick={onClick} 
        sx={{ 
            height: '100%', 
            p: 2.5,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start' 
        }}
      >
        {/* 1. Avatar Section: Circular is the standard for 'Entities' */}
        <Box sx={{ mr: 2.5, position: 'relative' }}>
          <Avatar
            src={tracker.avatar_url}
            alt={tracker.name}
            variant="circular"
            sx={{
              width: 64,
              height: 64,
              border: '2px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              bgcolor: '#F3F4F6',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#9CA3AF'
            }}
          >
            {/* Fallback logic preserved inside the Avatar component */}
            {!tracker.avatar_url && tracker.name.charAt(0)}
          </Avatar>
          
          {/* Optional: Small badge icon indicating type could go here later */}
        </Box>

        {/* Content Section */}
        <Box sx={{ flex: 1, width: '100%' }}>
          
          {/* Header: Name + Type Tag */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#1F2937',
                  lineHeight: 1.2,
                  mb: 0.5
                }}
              >
                {tracker.name}
              </Typography>
              
              {/* 2. Hierarchy: The Type is now a 'Tag', not just gray text */}
              <Chip 
                label={tracker.type || 'Fondo'} 
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  bgcolor: '#F9FAFB',
                  color: '#6B7280',
                  border: '1px solid #E5E7EB'
                }}
              />
            </Box>
          </Stack>

          {/* 3. Metrics: High impact layout */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem', fontWeight: 600 }}>
              RENTABILIDAD (YTD)
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
              {isPositive ? 
                <TrendingUpIcon sx={{ fontSize: 20, color: returnColor }} /> : 
                <TrendingDownIcon sx={{ fontSize: 20, color: returnColor }} />
              }
              <Typography 
                variant="h5" 
                component="span" 
                sx={{ 
                  fontWeight: 800, 
                  color: returnColor,
                  letterSpacing: '-0.03em'
                }}
              >
                {isPositive && '+'}{tracker.ytd_return}%
              </Typography>
            </Stack>

            {/* Custom Progress Bar with visual scaling logic preserved */}
            <Box 
              sx={{ 
                mt: 1.5, 
                height: 6, 
                width: '100%', 
                bgcolor: trackColor, // Cunning: background matches the metric color but lighter
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${progressWidth}%`,
                  bgcolor: returnColor,
                  borderRadius: 4,
                  transition: 'width 1s ease-out' // Smooth animation on load
                }}
              />
            </Box>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default TrackerCard;