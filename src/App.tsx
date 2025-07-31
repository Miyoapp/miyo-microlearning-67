
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import Header from './components/Header';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailConfirmation from './pages/EmailConfirmation';
import Dashboard from './pages/Dashboard';
import DashboardCourse from './pages/DashboardCourse';
import DashboardDiscover from './pages/DashboardDiscover';
import DashboardMyRoutes from './pages/DashboardMyRoutes';
import NotFound from './pages/NotFound';

import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

const queryClient = new QueryClient();

// Componente para proteger rutas del dashboard
const ProtectedDashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas públicas (redirige usuarios logueados al dashboard)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  // Si el usuario está logueado y está en una ruta pública, redirigir al dashboard
  if (user && (window.location.pathname === '/' || window.location.pathname === '/login')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Home />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/email-confirmation" element={<EmailConfirmation />} />
      
      {/* Dashboard routes - Protected */}
      <Route path="/dashboard" element={
        <ProtectedDashboardRoute>
          <Dashboard />
        </ProtectedDashboardRoute>
      } />
      <Route path="/dashboard/discover" element={
        <ProtectedDashboardRoute>
          <DashboardDiscover />
        </ProtectedDashboardRoute>
      } />
      <Route path="/dashboard/my-routes" element={
        <ProtectedDashboardRoute>
          <DashboardMyRoutes />
        </ProtectedDashboardRoute>
      } />
      <Route path="/dashboard/course/:courseId" element={
        <ProtectedDashboardRoute>
          <DashboardCourse />
        </ProtectedDashboardRoute>
      } />

      {/* Payment result pages */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failure" element={<PaymentFailure />} />
      <Route path="/payment/pending" element={<PaymentSuccess />} />

      {/* Not Found Route - Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <AppRoutes />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
