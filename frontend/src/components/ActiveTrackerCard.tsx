import React from 'react';
import type { ActiveTracker } from '../types';

interface ActiveTrackerCardProps {
  tracker: ActiveTracker;
  onClick: () => void;
}

const ActiveTrackerCard: React.FC<ActiveTrackerCardProps> = ({ tracker, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isPositive = tracker.profit_loss_clp >= 0;
  const profitColor = isPositive ? '#00C853' : '#FF5252'; // Green / Red

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        marginBottom: '16px',
        border: '1px solid #f0f0f0'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
    >
      {/* Avatar Section */}
      <div style={{ flexShrink: 0 }}>
        {tracker.avatar_url ? (
          <img 
            src={tracker.avatar_url} 
            alt={tracker.tracker_name} 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              objectFit: 'cover',
              backgroundColor: '#f5f5f5'
            }}
          />
        ) : (
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            backgroundColor: '#eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#aaa'
          }}>
            {tracker.tracker_name.charAt(0)}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          margin: '0 0 4px 0', 
          fontSize: '18px', 
          fontWeight: '700',
          color: '#FF5252' // Brand Red
        }}>
          {tracker.tracker_name}
        </h3>
        
        <div style={{ 
          fontSize: '11px', 
          textTransform: 'uppercase', 
          color: '#888', 
          marginBottom: '12px',
          letterSpacing: '0.5px'
        }}>
          {tracker.type || 'Fondo de Inversión'}
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Valor Actual</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
              {formatCurrency(tracker.current_value_clp)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Retorno</div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: profitColor 
            }}>
              {isPositive ? '+' : ''}{formatCurrency(tracker.profit_loss_clp)}
              <span style={{ fontSize: '12px', marginLeft: '4px', fontWeight: '500' }}>
                ({tracker.profit_loss_percent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar / Visual Indicator */}
        <div style={{ 
          marginTop: '8px', 
          height: '4px', 
          width: '100%', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(Math.abs(tracker.profit_loss_percent) * 5, 100)}%`, // Visual scaling
            backgroundColor: profitColor,
            borderRadius: '2px'
          }} />
        </div>
      </div>
    </div>
  );
};

export default ActiveTrackerCard;
