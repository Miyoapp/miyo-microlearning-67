
import { Session } from '@supabase/supabase-js';

export const clearLocalStorage = () => {
  console.log('Clearing auth state...');
  // Limpiar localStorage manualmente como fallback
  localStorage.removeItem('sb-ubsextjrmofwzvhvatcl-auth-token');
  localStorage.removeItem('supabase.auth.token');
  // Limpiar cualquier dato del localStorage relacionado con el usuario
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('user') || key.includes('auth') || key.includes('session')) {
      localStorage.removeItem(key);
    }
  });
};

export const isValidSession = (session: Session | null): boolean => {
  if (!session) return false;
  
  // Verificar si la sesión no ha expirado
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at || 0;
  
  if (expiresAt <= now) {
    console.log('Session expired, clearing state');
    return false;
  }
  
  return true;
};

export const shouldRedirectToDashboard = (currentPath: string): boolean => {
  return currentPath === '/login' || currentPath === '/' || currentPath === '/registration-confirmation';
};
