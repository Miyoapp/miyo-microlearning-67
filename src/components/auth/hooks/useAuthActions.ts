
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Mejorar el manejo de errores específicos
        if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
          return { 
            error: { 
              message: 'Tu email no ha sido verificado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.',
              code: 'email_not_confirmed'
            } 
          };
        }
        return { error };
      }

      // AuthProvider se encarga de la redirección automática
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error: { message: 'Error inesperado durante el inicio de sesión' } };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      console.log('Starting signup process for:', email);
      
      // Configurar la URL de redirección correctamente
      const siteUrl = window.location.origin;
      const redirectUrl = `${siteUrl}/login`;
      
      console.log('Redirect URL configured as:', redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name || email
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      console.log('Signup successful:', data);
      
      // Verificar si el perfil se creó correctamente
      if (data.user) {
        console.log('User created with ID:', data.user.id);
        
        // Esperar un momento para que el trigger se ejecute
        setTimeout(async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profileError) {
              console.error('Profile not found after signup:', profileError);
              // Crear manualmente el perfil si no existe
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  name: name || data.user.email,
                  email_verified: false
                });
              
              if (insertError) {
                console.error('Error creating profile manually:', insertError);
              } else {
                console.log('Profile created manually');
              }
            } else {
              console.log('Profile found:', profile);
            }
          } catch (err) {
            console.error('Error checking/creating profile:', err);
          }
        }, 1000);
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { error: { message: 'Error inesperado durante el registro' } };
    }
  };

  const signOut = async (clearAuthState: () => void) => {
    try {
      console.log('Starting signOut process...');
      
      // Limpiar el estado local primero para feedback inmediato
      clearAuthState();
      
      // Hacer el signOut en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during signOut:', error);
        // Aún así continuar con la redirección
      }
      
      console.log('SignOut completed, redirecting to home...');
      
      // Redirección forzada al home
      window.location.href = '/';
      
    } catch (error) {
      console.error('Exception during signOut:', error);
      // En caso de excepción, forzar la limpieza y redirección
      clearAuthState();
      window.location.href = '/';
    }
  };

  const forceLogout = (clearAuthState: () => void) => {
    console.log('Force logout triggered');
    clearAuthState();
    // Intentar signOut sin esperar resultado
    supabase.auth.signOut().catch(console.error);
    // Redirección inmediata
    window.location.href = '/';
  };

  return {
    signIn,
    signUp,
    signOut,
    forceLogout
  };
};
