
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Business from "./pages/Business";
import Course from "./pages/Course";
import CompanyCourse from "./pages/CompanyCourse";
import NotFound from "./pages/NotFound";
import CompanyDashboard from "./pages/CompanyDashboard";
import Dashboard from "./pages/Dashboard";
import DashboardDiscover from "./pages/DashboardDiscover";
import DashboardMyRoutes from "./pages/DashboardMyRoutes";
import DashboardCourse from "./pages/DashboardCourse";
import LoginPage from "./components/auth/LoginPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/personas" element={<Index />} />
            <Route path="/business" element={<Business />} />
            <Route path="/course/:id" element={<Course />} />
            
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
            <Route path="/dashboard/course/:id" element={
              <ProtectedRoute>
                <DashboardCourse />
              </ProtectedRoute>
            } />
            
            {/* Legacy Company Routes */}
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/course/:id" element={<CompanyCourse />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
