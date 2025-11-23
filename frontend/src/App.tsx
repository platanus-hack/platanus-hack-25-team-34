import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';

// Layout
import MainLayout from './components/MainLayout';

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
  
  if (isLocalDevelopment) return <>{children}</>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected App Routes wrapped in MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/marketplace" element={
                <ProtectedRoute><MarketplacePage /></ProtectedRoute>
              }/>
              <Route path="/tracker/:id" element={
                <ProtectedRoute><TrackerDetailPage /></ProtectedRoute>
              }/>
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              }/>
              <Route path="/account" element={
                <ProtectedRoute><UserAccountPage /></ProtectedRoute>
              }/>
              <Route path="/insights" element={
                <ProtectedRoute><InsightsPage /></ProtectedRoute>
              }/>
            </Route>

            {/* Redirect root to marketplace */}
            <Route path="/" element={<Navigate to="/marketplace" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;