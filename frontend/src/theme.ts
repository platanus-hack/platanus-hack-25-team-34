import { createTheme } from '@mui/material/styles';

// Add this link to your index.html head for the full effect:
// <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">

const theme = createTheme({
  typography: {
    fontFamily: '"Instrument Sans", "Inter", sans-serif',
    // The "Secret" font for numbers, financial data, and sensitive info
    button: { 
      fontFamily: '"Instrument Sans", sans-serif',
      textTransform: 'none', 
      fontWeight: 600 
    },
    // We create a custom variant for "Data"
    subtitle2: {
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 500,
      fontSize: '0.8rem',
      letterSpacing: '-0.02em',
    }
  },
  palette: {
    primary: {
      main: '#111827', // Obsidian Black (Professional)
    },
    secondary: {
      main: '#FF6B6B', // THE HEDGIE RED NOSE (The Brand Accent)
    },
    success: {
      main: '#00C853',
      light: '#D1FAE5',
    },
    background: {
      default: '#F9FAFB', // Cool gray background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Softer, more modern corners
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;