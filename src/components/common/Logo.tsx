
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
        src="https://res.cloudinary.com/dyjx9cjat/image/upload/v1742489263/image/jag130kkjn6aezxvf9q6.jpg" 
        alt="MIYO Logo" 
        className={`h-10 w-auto ${className}`}
      />
    </Link>
  );
};

export default Logo;
