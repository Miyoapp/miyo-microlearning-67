
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

// Lazy load components
const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DashboardDiscover = lazy(() => import('@/pages/DashboardDiscover'));
const DashboardMyRoutes = lazy(() => import('@/pages/DashboardMyRoutes'));
const DashboardMyNotes = lazy(() => import('@/pages/DashboardMyNotes'));
const DashboardMisResumenes = lazy(() => import('@/pages/DashboardMisResumenes'));
const DashboardCourse = lazy(() => import('@/pages/DashboardCourse'));
const CompanyCourse = lazy(() => import('@/pages/CompanyCourse'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const EmailConfirmation = lazy(() => import('@/pages/EmailConfirmation'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('@/pages/PaymentFailure'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
                <Route path="/company/:courseId" element={<CompanyCourse />} />
                
                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/discover" element={
                  <ProtectedRoute>
                    <DashboardDiscover />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/my-routes" element={
                  <ProtectedRoute>
                    <DashboardMyRoutes />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/my-notes" element={
                  <ProtectedRoute>
                    <DashboardMyNotes />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/mis-resumenes" element={
                  <ProtectedRoute>
                    <DashboardMisResumenes />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/course/:courseId" element={
                  <ProtectedRoute>
                    <DashboardCourse />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
