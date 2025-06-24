
import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuthState } from './hooks/useAuthState';
import { useEmailVerification } from './hooks/useEmailVerification';
import { useAuthActions } from './hooks/useAuthActions';
import { useAuthListener } from './hooks/useAuthListener';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  forceLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading, clearAuthState, updateAuthState } = useAuthState();
  const { isEmailVerified, checkEmailVerificationAsync } = useEmailVerification();
  const { signIn, signUp, signOut: signOutAction, forceLogout: forceLogoutAction } = useAuthActions();

  // Set up auth listener
  useAuthListener({
    updateAuthState,
    clearAuthState,
    checkEmailVerificationAsync
  });

  // Wrap auth actions to pass required dependencies
  const handleSignOut = async () => {
    await signOutAction(clearAuthState);
  };

  const handleForceLogout = () => {
    forceLogoutAction(clearAuthState);
  };

  const value = {
    user,
    session,
    loading,
    isEmailVerified,
    signIn,
    signUp,
    signOut: handleSignOut,
    forceLogout: handleForceLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
