import React from 'react';
import type { Tracker } from '../types';

interface TrackerCardProps {
  tracker: Tracker;
  onClick: () => void;
}

const TrackerCard: React.FC<TrackerCardProps> = ({ tracker, onClick }) => {
  const isPositive = tracker.ytd_return >= 0;
  const returnColor = isPositive ? '#00C853' : '#FF5252';

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
        border: '1px solid #f0f0f0',
        height: '100%',
        minHeight: '120px'
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
            alt={tracker.name} 
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
            {tracker.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          margin: '0 0 4px 0', 
          fontSize: '18px', 
          fontWeight: '700',
          color: '#000000' // Black
        }}>
          {tracker.name}
        </h3>
        
        <div style={{ 
          fontSize: '11px', 
          textTransform: 'uppercase', 
          color: '#888', 
          marginBottom: '12px',
          letterSpacing: '0.5px'
        }}>
          {tracker.type || 'Fondo'}
        </div>

        {/* Metrics Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '600', color: '#333' }}>Rentabilidad</span>
            <span style={{ 
              fontWeight: '700', 
              color: returnColor,
              fontSize: '16px'
            }}>
              {isPositive ? '+' : ''}{tracker.ytd_return}%
            </span>
          </div>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: '#eee' }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#888', fontSize: '11px' }}>Riesgo</span>
            <span style={{ color: '#555', fontWeight: '500' }}>{tracker.risk_level}</span>
          </div>
        </div>

        {/* Progress Bar */}
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
            width: `${Math.min(Math.abs(tracker.ytd_return) * 2, 100)}%`, // Visual scaling
            backgroundColor: returnColor,
            borderRadius: '2px'
          }} />
        </div>
      </div>
    </div>
  );
};

export default TrackerCard;
