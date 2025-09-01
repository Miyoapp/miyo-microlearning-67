
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import Home from '@/pages/Home';
import LoginPage from '@/components/auth/LoginPage';
import Dashboard from '@/pages/Dashboard';
import DashboardCourse from '@/pages/DashboardCourse';
import DashboardMisNotas from '@/pages/DashboardMisNotas';
import DashboardCourseNotes from '@/pages/DashboardCourseNotes';
import DashboardMisResumenes from '@/pages/DashboardMisResumenes';
import DashboardMisPlanes from '@/pages/DashboardMisPlanes';
import { RequireAuth } from '@/components/auth/RequireAuth';
import './App.css';

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
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/dashboard/course/:courseId" element={<RequireAuth><DashboardCourse /></RequireAuth>} />
                <Route path="/dashboard/notes" element={<RequireAuth><DashboardMisNotas /></RequireAuth>} />
                <Route path="/dashboard/notes/:courseId" element={<RequireAuth><DashboardCourseNotes /></RequireAuth>} />
                <Route path="/dashboard/resumes" element={<RequireAuth><DashboardMisResumenes /></RequireAuth>} />
                <Route path="/dashboard/action-plans" element={<RequireAuth><DashboardMisPlanes /></RequireAuth>} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </AudioPlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
