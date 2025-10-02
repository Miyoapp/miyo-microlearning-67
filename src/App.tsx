
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import Home from '@/pages/Home';
import LoginPage from '@/components/auth/LoginPage';
import Dashboard from '@/pages/Dashboard';
import DashboardCourseOptimized from '@/pages/DashboardCourseOptimized';
import DashboardDiscoverOptimized from '@/pages/DashboardDiscoverOptimized';
import DashboardMyRoutesOptimized from '@/pages/DashboardMyRoutesOptimized';
import DashboardMisNotasOptimized from '@/pages/DashboardMisNotasOptimized';
import DashboardCourseNotes from '@/pages/DashboardCourseNotes';
import DashboardMisResumenesOptimized from '@/pages/DashboardMisResumenesOptimized';
import DashboardMisPlanesOptimized from '@/pages/DashboardMisPlanesOptimized';
import { RequireAuth } from '@/components/auth/RequireAuth';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

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
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                  <Route path="/dashboard/course/:courseId" element={<RequireAuth><DashboardCourseOptimized /></RequireAuth>} />
                  <Route path="/dashboard/discover" element={<RequireAuth><DashboardDiscoverOptimized /></RequireAuth>} />
                  <Route path="/dashboard/my-routes" element={<RequireAuth><DashboardMyRoutesOptimized /></RequireAuth>} />
                  <Route path="/dashboard/mis-notas" element={<RequireAuth><DashboardMisNotasOptimized /></RequireAuth>} />
                  <Route path="/dashboard/notes/:courseId" element={<RequireAuth><DashboardCourseNotes /></RequireAuth>} />
                  <Route path="/dashboard/mis-resumenes" element={<RequireAuth><DashboardMisResumenesOptimized /></RequireAuth>} />
                  <Route path="/dashboard/mis-planes" element={<RequireAuth><DashboardMisPlanesOptimized /></RequireAuth>} />
                </Routes>
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
