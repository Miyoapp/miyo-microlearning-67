import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const initialMode = modeParam === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Error al iniciar sesión: ' + error.message);
      } else {
        toast.success('¡Sesión iniciada correctamente!');
        navigate('/dashboard');
      }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error('Error al crear la cuenta: ' + error.message);
      } else {
        // Redirigir a la página de confirmación de email
        navigate('/email-confirmation');
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Inicia sesión con tu correo electrónico y contraseña.'
              : 'Crea una cuenta para acceder a todos los cursos.'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Login form */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-miyo-800 hover:bg-miyo-700"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setMode('signup')}
              className="w-full"
            >
              ¿No tienes una cuenta? Crear cuenta
            </Button>
          </form>
        )}

        {/* Signup form */}
        {mode === 'signup' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-miyo-800 hover:bg-miyo-700"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setMode('login')}
              className="w-full"
            >
              ¿Ya tienes una cuenta? Iniciar sesión
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
