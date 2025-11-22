/**
 * Navbar Component
 * 
 * Global navigation bar displayed on all pages
 * Shows links to main sections and logout button
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { Button } from '@mui/material';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav data-component="navbar" style={{ backgroundColor: 'white', borderBottom: '1px solid #eee', padding: '10px 20px' }}>
      <div data-section="navbar-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div data-section="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>
          <Logo height={32} width={50} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1D1D1F' }}>Hedgie</h1>
        </div>
        
        <div data-section="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => navigate('/marketplace')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#333' }}>
            Portafolios
          </button>
          <button onClick={() => navigate('/insights')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#333' }}>
            Insights
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#333' }}>
            Mis Inversiones
          </button>
          <button onClick={() => navigate('/account')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#333' }}>
            Mi Cuenta
          </button>
          {user && (
            <span data-section="user-info" style={{ fontSize: '14px', color: '#666', borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
              {user.name}
            </span>
          )}
          <Button onClick={logout} size="small">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
