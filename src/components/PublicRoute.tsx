import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // Giriş yapmış kullanıcıyı profile/dashboard gibi sayfaya yönlendir
    return <Navigate to="/profile/dashboard" replace />;
  }

  // Giriş yoksa public içeriği göster
  return <>{children}</>;
};

export default PublicRoute;
