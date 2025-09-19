
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { NotesProvider } from '@/contexts/NotesContext';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { usePrefetchStrategy } from '@/hooks/queries/usePrefetchStrategy';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const EmailConfirmation = lazy(() => import('@/pages/EmailConfirmation'));
const DashboardOptimized = lazy(() => import('@/pages/DashboardOptimized'));
const DashboardDiscoverOptimized = lazy(() => import('@/pages/DashboardDiscoverOptimized'));
const DashboardMyRoutesOptimized = lazy(() => import('@/pages/DashboardMyRoutesOptimized'));
const DashboardCourse = lazy(() => import('@/pages/DashboardCourse'));
const DashboardCourseNotes = lazy(() => import('@/pages/DashboardCourseNotes'));
const DashboardMisNotas = lazy(() => import('@/pages/DashboardMisNotas'));
const DashboardMisResumenes = lazy(() => import('@/pages/DashboardMisResumenes'));
const DashboardMisPlanes = lazy(() => import('@/pages/DashboardMisPlanes'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('@/pages/PaymentFailure'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-miyo-800"></div>
  </div>
);

// Component to handle prefetching strategies
const PrefetchManager = () => {
  const { prefetchDashboardData } = usePrefetchStrategy();
  
  useEffect(() => {
    // Prefetch critical data when app loads
    prefetchDashboardData();
  }, [prefetchDashboardData]);
  
  return null;
};

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <NotesProvider>
            <AudioPlayerProvider>
              <PrefetchManager />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/email-confirmation" element={<EmailConfirmation />} />
                  
                  {/* Protected dashboard routes - ALL OPTIMIZED */}
                  <Route path="/dashboard" element={<RequireAuth><DashboardOptimized /></RequireAuth>} />
                  <Route path="/dashboard/discover" element={<RequireAuth><DashboardDiscoverOptimized /></RequireAuth>} />
                  <Route path="/dashboard/my-routes" element={<RequireAuth><DashboardMyRoutesOptimized /></RequireAuth>} />
                  <Route path="/dashboard/course/:courseId" element={<RequireAuth><DashboardCourse /></RequireAuth>} />
                  <Route path="/dashboard/course/:courseId/notes" element={<RequireAuth><DashboardCourseNotes /></RequireAuth>} />
                  <Route path="/dashboard/mis-notas" element={<RequireAuth><DashboardMisNotas /></RequireAuth>} />
                  <Route path="/dashboard/mis-resumenes" element={<RequireAuth><DashboardMisResumenes /></RequireAuth>} />
                  <Route path="/dashboard/mis-planes" element={<RequireAuth><DashboardMisPlanes /></RequireAuth>} />
                  
                  {/* Payment routes */}
                  <Route path="/payment/success" element={<RequireAuth><PaymentSuccess /></RequireAuth>} />
                  <Route path="/payment/failure" element={<RequireAuth><PaymentFailure /></RequireAuth>} />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
            </AudioPlayerProvider>
          </NotesProvider>
        </Router>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
