
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
        src="/lovable-uploads/4e6c4cb4-598d-409c-ace0-0a58fd3f2abc.png" 
        alt="MIYO Logo" 
        className={`h-10 w-auto ${className}`}
      />
    </Link>
  );
};

export default Logo;
