
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from './AuthProvider';
import Logo from '@/components/common/Logo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if we're in signup mode from URL parameter
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');

  // Update signup mode when URL parameter changes
  useEffect(() => {
    setIsSignUp(searchParams.get('mode') === 'signup');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password, name)
        : await signIn(email, password);

      if (error) {
        toast.error(error.message);
      } else {
        if (isSignUp) {
          // Redirigir a página de confirmación de email
          navigate('/email-confirmation');
        } else {
          toast.success('¡Bienvenido de vuelta!');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = !isSignUp;
    setIsSignUp(newMode);
    // Clear form when switching modes
    setName('');
    setEmail('');
    setPassword('');
    // Update URL parameter
    navigate(`/login${newMode ? '?mode=signup' : ''}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-2xl font-bold mt-4">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-miyo-800 hover:bg-miyo-900"
              disabled={loading}
            >
              {loading ? 'Cargando...' : (isSignUp ? 'Crear cuenta' : 'Iniciar sesión')}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-miyo-800 hover:underline"
              >
                {isSignUp 
                  ? '¿Ya tienes cuenta? Inicia sesión' 
                  : '¿No tienes cuenta? Regístrate'
                }
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
