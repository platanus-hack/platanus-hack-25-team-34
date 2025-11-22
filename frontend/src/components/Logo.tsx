import React from 'react';

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ width = 211, height = 135, className, style }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 211 135" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path d="M195.769 113.654C194.848 113.654 193.96 113.792 193.122 114.046L173.076 88.2709L163.845 25.9637L146.538 49.6172L120 6.34659L110.191 41.5381L73.8448 0L70.9604 46.7328L23.6535 23.0793L45.5777 73.2711L0 72.116L34.6138 105.578L1.15513 127.502L43.8448 132.116H194.614V132.037C194.993 132.083 195.379 132.116 195.769 132.116C200.868 132.116 205 127.984 205 122.885C205 117.789 200.868 113.654 195.769 113.654ZM164.231 115.076C160.05 115.076 156.657 111.683 156.657 107.502C156.657 103.321 160.05 99.9279 164.231 99.9279C168.415 99.9279 171.802 103.321 171.802 107.502C171.802 111.683 168.414 115.076 164.231 115.076Z" fill="#1D1D1F"/>
      <circle cx="197.5" cy="125.558" r="13.5" fill="#F97066"/>
      
    </svg>
  );
};

export default Logo;
