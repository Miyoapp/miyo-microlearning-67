
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthType = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthType;
}

const AuthModal = ({ isOpen, onClose, initialView = 'login' }: AuthModalProps) => {
  const [authType, setAuthType] = useState<AuthType>(initialView);
  
  const switchView = (type: AuthType) => {
    setAuthType(type);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {authType === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </DialogTitle>
        </DialogHeader>
        
        {authType === 'login' ? (
          <LoginForm onRegisterClick={() => switchView('register')} />
        ) : (
          <RegisterForm onLoginClick={() => switchView('login')} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
