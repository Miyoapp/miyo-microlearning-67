
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import Home from '@/pages/Home';
import LoginPage from '@/components/auth/LoginPage';
import DashboardHome from '@/pages/DashboardHome';
import DashboardCourse from '@/pages/DashboardCourse';
import DashboardNotes from '@/pages/DashboardNotes';
import DashboardCourseNotes from '@/pages/DashboardCourseNotes';
import DashboardResumes from '@/pages/DashboardResumes';
import DashboardActionPlans from '@/pages/DashboardActionPlans';
import RequireAuth from '@/components/auth/RequireAuth';
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
                <Route path="/dashboard" element={<RequireAuth><DashboardHome /></RequireAuth>} />
                <Route path="/dashboard/course/:courseId" element={<RequireAuth><DashboardCourse /></RequireAuth>} />
                <Route path="/dashboard/notes" element={<RequireAuth><DashboardNotes /></RequireAuth>} />
                <Route path="/dashboard/notes/:courseId" element={<RequireAuth><DashboardCourseNotes /></RequireAuth>} />
                <Route path="/dashboard/resumes" element={<RequireAuth><DashboardResumes /></RequireAuth>} />
                <Route path="/dashboard/action-plans" element={<RequireAuth><DashboardActionPlans /></RequireAuth>} />
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
