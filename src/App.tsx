
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import Home from '@/pages/Home';
import LoginPage from '@/components/auth/LoginPage';
import { RequireAuth } from '@/components/auth/RequireAuth';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import RouteErrorBoundary from '@/components/ui/RouteErrorBoundary';

// Lazy load heavy dashboard pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DashboardCourseOptimized = lazy(() => import('@/pages/DashboardCourseOptimized'));
const DashboardDiscoverOptimized = lazy(() => import('@/pages/DashboardDiscoverOptimized'));
const DashboardMyRoutesOptimized = lazy(() => import('@/pages/DashboardMyRoutesOptimized'));
const DashboardMisNotasOptimized = lazy(() => import('@/pages/DashboardMisNotasOptimized'));
const DashboardCourseNotes = lazy(() => import('@/pages/DashboardCourseNotes'));
const DashboardMisResumenesOptimized = lazy(() => import('@/pages/DashboardMisResumenesOptimized'));
const DashboardMisPlanesOptimized = lazy(() => import('@/pages/DashboardMisPlanesOptimized'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AudioPlayerProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected routes with lazy loading */}
                    <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                    <Route path="/dashboard/course/:courseId" element={<RouteErrorBoundary><RequireAuth><DashboardCourseOptimized /></RequireAuth></RouteErrorBoundary>} />
                    <Route path="/dashboard/discover" element={<RequireAuth><DashboardDiscoverOptimized /></RequireAuth>} />
                    <Route path="/dashboard/my-routes" element={<RequireAuth><DashboardMyRoutesOptimized /></RequireAuth>} />
                    <Route path="/dashboard/mis-notas" element={<RequireAuth><DashboardMisNotasOptimized /></RequireAuth>} />
                    <Route path="/dashboard/notes/:courseId" element={<RequireAuth><DashboardCourseNotes /></RequireAuth>} />
                    <Route path="/dashboard/mis-resumenes" element={<RequireAuth><DashboardMisResumenesOptimized /></RequireAuth>} />
                    <Route path="/dashboard/mis-planes" element={<RequireAuth><DashboardMisPlanesOptimized /></RequireAuth>} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </div>
            <Toaster />
          </Router>
        </AudioPlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
