// AuthContext.tsx (veya benzeri dosya)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, LoginRequest, RegisterRequest } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: {
    fullname?: string;
    username?: string;
    email?: string;
    plan?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = await apiService.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      toast({
        title: "Giriş uğurlu",
        description: "Xoş gəldiniz!",
      });
      await checkAuthStatus(); // Giriş sonrası kullanıcıyı güncelle
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Giriş xətası",
        description: "E-mail və ya şifrə yanlışdır.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(data);
      toast({
        title: "Qeydiyyat uğurlu",
        description: "Hesabınız yaradıldı!",
      });
      await checkAuthStatus(); // Kayıt sonrası kullanıcıyı güncelle
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Qeydiyyat xətası",
        description: "Qeydiyyat zamanı xəta baş verdi.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      toast({
        title: "Çıxış uğurlu",
        description: "Sağ salamat qalın!",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  const updateUser = async (data: {
    fullname?: string;
    username?: string;
    email?: string;
    plan?: string;
    password?: string;
  }) => {
    try {
      setIsLoading(true);
      const updatedUser = await apiService.updateUser(data);
      setUser(updatedUser);
      toast({
        title: "Profil yeniləndi",
        description: "Məlumatlarınız uğurla yeniləndi.",
      });
    } catch (error) {
      console.error('Update failed:', error);
      toast({
        title: "Yeniləmə xətası",
        description: "Profil məlumatlarınızı yeniləyərkən xəta baş verdi.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
