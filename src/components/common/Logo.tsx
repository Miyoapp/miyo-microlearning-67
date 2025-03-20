
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  linkClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Logo: React.FC<LogoProps> = ({ className = '', linkClassName = '', onClick }) => {
  return (
    <Link to="/" className={`inline-block ${linkClassName}`} onClick={onClick}>
      <img 
        src="/lovable-uploads/e535d5c7-e044-4666-9683-bc71fe4541e3.png" 
        alt="MIYO Logo" 
        className={`h-10 ${className}`}
      />
    </Link>
  );
};

export default Logo;
