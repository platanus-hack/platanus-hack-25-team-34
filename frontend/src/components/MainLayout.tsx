import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  useMediaQuery, 
  useTheme,
  Avatar,
  IconButton,
  Chip 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Icons
import PieChartIcon from '@mui/icons-material/PieChartOutline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DashboardIcon from '@mui/icons-material/DashboardCustomize';
import PersonIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from './Logo';

const SIDEBAR_WIDTH = 280;

const MENU_ITEMS = [
  { text: 'Portafolios', path: '/marketplace', icon: <PieChartIcon /> },
  { text: 'Insights', path: '/insights', icon: <ShowChartIcon /> },
  { text: 'Mis Inversiones', path: '/dashboard', icon: <DashboardIcon /> },
  { text: 'Mi Cuenta', path: '/account', icon: <PersonIcon /> },
];

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const getActiveStyle = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return isActive ? {
      bgcolor: 'secondary.main',
      color: 'white',
      borderRadius: '12px',
      transform: 'rotate(-1deg)',
      boxShadow: '0 4px 14px rgba(255, 107, 107, 0.4)',
      '& .MuiListItemIcon-root': { color: 'white' },
      '&:hover': { bgcolor: 'secondary.dark' }
    } : {
      color: 'text.secondary',
      borderRadius: '12px',
      '&:hover': { bgcolor: '#F3F4F6', color: 'text.primary' }
    };
  };

  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, bgcolor: '#FFFFFF' }}>
      
      {/* Brand Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6, pl: 1, cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>
        <Logo width={36} height={36} />
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#111827' }}>
          Hedgie
        </Typography>
      </Box>

      {/* Navigation Links */}
      <List sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {MENU_ITEMS.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{ 
                ...getActiveStyle(item.path),
                py: 1.5,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ListItemIcon sx={{ minWidth: 42, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname.startsWith(item.path) ? 700 : 500,
                  fontSize: '0.95rem'
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User "Keycard" Section - REDESIGNED */}
      <Box sx={{ pt: 2 }}>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: '16px',
            bgcolor: '#FAFAFA', 
            border: '1px solid #F3F4F6',
            transition: 'all 0.2s',
            '&:hover': {
                 borderColor: '#E5E7EB',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: '#111827', 
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {user?.name?.charAt(0) || 'D'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                {user?.name || 'Dev User'}
              </Typography>
              
              {/* THE FIX: Tech Chip with Clean Sans-Serif Font */}
              <Chip 
                label="LEVEL 1 ACCESS" 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.65rem', 
                  fontFamily: '"Inter", "Roboto", sans-serif', // Forced Sans-Serif
                  fontWeight: 800,
                  textTransform: 'uppercase', // Makes it look military/official
                  letterSpacing: '0.05em',    // Adds readability
                  bgcolor: '#F3F4F6', 
                  color: '#374151',
                  mt: 0.5,
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB'
                }} 
              />
            </Box>
          </Box>

          <ListItemButton 
            onClick={logout}
            sx={{ 
              borderRadius: '8px', 
              color: '#EF4444', 
              py: 0.5,
              px: 1,
              minHeight: 32,
              '&:hover': { bgcolor: '#FEF2F2' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 28, color: '#EF4444' }}>
              <LogoutIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Cerrar Sesión" 
              primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
            />
          </ListItemButton>
        </Box>
      </Box>
    </Box>
  );

  // Mobile Dock stays the same
  const MobileDock = (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 24, 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: 'auto',
        minWidth: 320,
        bgcolor: '#111827', 
        borderRadius: '100px',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
        display: 'flex', 
        justifyContent: 'space-evenly',
        alignItems: 'center',
        p: 1,
        pl: 3,
        pr: 3,
        zIndex: 1200,
        gap: 1
      }}
    >
      {MENU_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <IconButton
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              color: isActive ? 'secondary.main' : 'rgba(255,255,255,0.5)',
              transform: isActive ? 'scale(1.1)' : 'none',
              transition: 'all 0.2s',
              p: 1.5,
              '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            {item.icon}
          </IconButton>
        );
      })}
      <Box sx={{ width: 1, height: 24, bgcolor: 'rgba(255,255,255,0.1)', mx: 1 }} />
      <IconButton onClick={logout} sx={{ color: '#EF4444' }}>
        <LogoutIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
            },
          }}
          open
        >
          {SidebarContent}
        </Drawer>
      )}
      <Box component="main" sx={{ flexGrow: 1, p: 0, width: { sm: `calc(100% - ${SIDEBAR_WIDTH}px)` } }}>
        <Outlet /> 
      </Box>
      {isMobile && MobileDock}
    </Box>
  );
};

export default MainLayout;