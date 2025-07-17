import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pagess/Index";  
import { Login } from "./pagess/Login";
import { Register } from "./pagess/Register";
import ProfilePage from "./pagess/profile/layout";
import NotFound from "./pagess/NotFound";
import ProfileLayout from "./pagess/profile/layout";
import DashboardPage from "./pagess/profile/dashboard/page";
import SettingsPage from "./pagess/profile/settings/page";
import PublicRoute from "./components/PublicRoute";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
          <Route path="/login" element={
    <PublicRoute>
      <Login />
    </PublicRoute>
  } />
  
  <Route path="/register" element={
    <PublicRoute>
      <Register />
    </PublicRoute>
  } />
          
          
  <Route path="/profile" element={
    <ProtectedRoute>
      <ProfileLayout children={""} />
    </ProtectedRoute>
  }>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
