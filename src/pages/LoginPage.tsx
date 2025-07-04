
import React, { useEffect } from 'react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if this is a password recovery redirect
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type === 'recovery') {
      // Redirect to reset password page
      navigate('/reset-password');
      return;
    }
  }, [navigate, searchParams]);

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
