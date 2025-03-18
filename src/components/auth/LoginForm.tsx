
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface LoginFormProps {
  onRegisterClick: () => void;
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Ingresa un email válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = ({ onRegisterClick }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error al iniciar sesión",
          description: error.message,
        });
        return;
      }
      
      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2 pb-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      {...field} 
                      placeholder="tu@email.com" 
                      type="email" 
                      className="pl-10" 
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      {...field} 
                      placeholder="********" 
                      type="password" 
                      className="pl-10" 
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Iniciando sesión...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </span>
            )}
          </Button>
        </form>
      </Form>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">o</span>
        </div>
      </div>
      
      <Button variant="outline" className="w-full" onClick={onRegisterClick} disabled={isLoading}>
        ¿No tienes cuenta? Regístrate
      </Button>
    </div>
  );
};

export default LoginForm;
