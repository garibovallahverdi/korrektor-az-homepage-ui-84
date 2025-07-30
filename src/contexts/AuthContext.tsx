
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

// Hata mesajlarını anlamlı şekilde çeviren fonksiyon
const getErrorMessage = (error: any, type: 'login' | 'register') => {
  if (error?.response?.data) {
    const errorData = error.response.data;
    
    // API'den gelen hata mesajları
    if (errorData.detail) {
      return errorData.detail;
    }
    
    // Specific field errors
    if (errorData.username) {
      return `İstifadəçi adı: ${Array.isArray(errorData.username) ? errorData.username[0] : errorData.username}`;
    }
    
    if (errorData.email) {
      return `E-mail: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`;
    }
    
    if (errorData.password) {
      return `Şifrə: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`;
    }
    
    if (errorData.password2) {
      return `Şifrə təkrarı: ${Array.isArray(errorData.password2) ? errorData.password2[0] : errorData.password2}`;
    }
    
    if (errorData.fullname) {
      return `Ad Soyad: ${Array.isArray(errorData.fullname) ? errorData.fullname[0] : errorData.fullname}`;
    }
    
    // Non-field errors
    if (errorData.non_field_errors) {
      return Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
    }
  }
  
  // HTTP status kodlarına göre varsayılan mesajlar
  if (error?.response?.status === 400) {
    return type === 'login' ? 'İstifadəçi adı və ya şifrə yanlışdır.' : 'Daxil etdiyiniz məlumatları yoxlayın.';
  }
  
  if (error?.response?.status === 401) {
    return 'İstifadəçi adı və ya şifrə yanlışdır.';
  }
  
  if (error?.response?.status === 409) {
    return 'Bu istifadəçi adı və ya e-mail artıq istifadə olunur.';
  }
  
  if (error?.response?.status >= 500) {
    return 'Server xətası baş verdi. Zəhmət olmasa daha sonra cəhd edin.';
  }
  
  // Varsayılan mesajlar
  return type === 'login' ? 'Giriş zamanı xəta baş verdi.' : 'Qeydiyyat zamanı xəta baş verdi.';
};

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
      const errorMessage = getErrorMessage(error, 'login');
      toast({
        title: "Giriş xətası",
        description: errorMessage,
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
      const errorMessage = getErrorMessage(error, 'register');
      toast({
        title: "Qeydiyyat xətası",
        description: errorMessage,
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
      const errorMessage = getErrorMessage(error, 'register'); // Same validation rules
      toast({
        title: "Yeniləmə xətası",
        description: errorMessage,
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
