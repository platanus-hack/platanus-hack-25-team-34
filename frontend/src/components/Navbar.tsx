/**
 * Navbar Component
 * 
 * Global navigation bar displayed on all pages
 * Shows links to main sections and logout button
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav data-component="navbar">
      <div data-section="navbar-container">
        <div data-section="navbar-brand">
          <h1>Hedgie</h1>
        </div>
        
        <div data-section="navbar-links">
          <button onClick={() => navigate('/marketplace')}>
            Marketplace
          </button>
          <button onClick={() => navigate('/account')}>
            Mi Cuenta
          </button>
          {user && (
            <span data-section="user-info">
              {user.name}
            </span>
          )}
          <button onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
