import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GoogleCallback } from "@/components/GoogleCallback";
import Index from "./pages/Index";  
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import ProfilePage from "./pages/profile/layout";
import NotFound from "./pages/NotFound";
import ProfileLayout from "./pages/profile/layout";
import DashboardPage from "./pages/profile/dashboard/page";
import SettingsPage from "./pages/profile/settings/page";
import PublicRoute from "./components/PublicRoute";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { ForgotPassword } from "./pages/ForgotPassword ";
import { ResetPassword } from "./pages/ResetPassword";

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

            <Route path="/auth/forgot-password" element={
              <PublicRoute>
                <ForgotPassword/>
              </PublicRoute>
            } />
            
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
        
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            <Route path="/verify-email/:token/:verifyToken" element={
              <PublicRoute>
                <VerifyEmailPage />
              </PublicRoute>
            } />
            
            {/* Google OAuth Callback Route */}
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            
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