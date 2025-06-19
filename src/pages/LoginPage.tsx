
import React from 'react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoginDialog open={true} onOpenChange={handleOpenChange} />
    </div>
  );
};

export default LoginPage;
