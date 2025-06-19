import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';

import AuthProvider from './components/auth/AuthProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CoursePage from './pages/CoursePage';
import DiscoverPage from './pages/DiscoverPage';
import MyRoutesPage from './pages/MyRoutesPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';

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
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard routes - Protected */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/discover" element={<DiscoverPage />} />
            <Route path="/dashboard/my-routes" element={<MyRoutesPage />} />
            <Route path="/dashboard/course/:courseId" element={<CoursePage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />

            {/* Payment result pages */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/pending" element={<PaymentSuccess />} />

            {/* Not Found Route - Catch all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
