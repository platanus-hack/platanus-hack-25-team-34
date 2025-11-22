/**
 * Main App Component
 * 
 * Sets up routing and authentication context.
 * 
 * LOCAL_DEVELOPMENT mode: Set VITE_LOCAL_DEVELOPMENT=true in .env
 * to bypass authentication and access all views directly.
 * 
 * TODO: Add global layout component
 * TODO: Add loading states for route transitions
 * TODO: Add error boundary
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';

// Pages
import LoginPage from './pages/LoginPage';
import MarketplacePage from './pages/MarketplacePage';
import TrackerDetailPage from './pages/TrackerDetailPage';
import DashboardPage from './pages/DashboardPage';
import UserAccountPage from './pages/UserAccountPage';
import InsightsPage from './pages/InsightsPage';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLocalDevelopment } = useAuth();
  
  // In local development mode, always allow access
  if (isLocalDevelopment) {
    return <>{children}</>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <MarketplacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracker/:id"
        element={
          <ProtectedRoute>
            <TrackerDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <UserAccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <InsightsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* TODO: Add 404 page */}
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          {/* TODO: Add global navigation bar component */}
          {/* TODO: Add global footer component */}
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
