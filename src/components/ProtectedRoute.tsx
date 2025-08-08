import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
  
  // ?code query param is available as `code` from useParams
  // You can use `code` as needed here, for example:
  console.log('Query code:', code);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }
 if(code){
    return <Navigate to={`/auth/google/callback?code=${code}`} replace />;
 }
  if (!isAuthenticated && !code) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};