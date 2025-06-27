
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider } from './components/auth/AuthProvider';
import Header from './components/Header';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import EmailConfirmation from './pages/EmailConfirmation';
import Dashboard from './pages/Dashboard';
import DashboardCourse from './pages/DashboardCourse';
import DashboardDiscover from './pages/DashboardDiscover';
import DashboardMyRoutes from './pages/DashboardMyRoutes';
import NotFound from './pages/NotFound';

import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            
            {/* Dashboard routes - Protected */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/discover" element={<DashboardDiscover />} />
            <Route path="/dashboard/my-routes" element={<DashboardMyRoutes />} />
            <Route path="/dashboard/course/:courseId" element={<DashboardCourse />} />

            {/* Payment result pages */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/pending" element={<PaymentSuccess />} />

            {/* Not Found Route - Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
