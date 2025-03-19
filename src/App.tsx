
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Business from "./pages/Business";
import Course from "./pages/Course";
import CompanyCourse from "./pages/CompanyCourse";
import NotFound from "./pages/NotFound";
import CompanyDashboard from "./pages/CompanyDashboard";
import { RequireAuth } from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/business" element={<Business />} />
          <Route path="/course/:id" element={<Course />} />
          <Route path="/company/dashboard" element={
            <RequireAuth>
              <CompanyDashboard />
            </RequireAuth>
          } />
          <Route path="/company/course/:id" element={
            <RequireAuth>
              <CompanyCourse />
            </RequireAuth>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
