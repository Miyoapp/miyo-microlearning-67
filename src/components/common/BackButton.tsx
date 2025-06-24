
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`flex items-center space-x-2 text-[#5e17ea] hover:text-[#5e17ea]/80 hover:bg-[#5e17ea]/10 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Atrás</span>
    </Button>
  );
};

export default BackButton;
