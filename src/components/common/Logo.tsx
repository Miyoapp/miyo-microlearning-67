
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { getOptimizedCloudinaryUrl, CloudinaryPresets } from '@/utils/cloudinary';

interface LogoProps {
  className?: string;
  linkClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Logo: React.FC<LogoProps> = ({ className = '', linkClassName = '', onClick }) => {
  const { user } = useAuth();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If user is authenticated, prevent navigation
    if (user) {
      e.preventDefault();
      return false;
    }
    
    // Call the provided onClick handler if exists
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link to="/" className={`inline-block ${linkClassName}`} onClick={handleClick}>
      <img 
        src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/dyjx9cjat/image/upload/v1742489263/image/jag130kkjn6aezxvf9q6.jpg", CloudinaryPresets.THUMBNAIL)} 
        alt="MIYO Logo" 
        className={`h-10 w-auto ${className}`}
      />
    </Link>
  );
};

export default Logo;
