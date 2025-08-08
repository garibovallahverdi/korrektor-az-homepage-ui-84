import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, LoginRequest, RegisterRequest, ApiError } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; errors?: any }>;
  logout: () => Promise<void>;
  updateUser: (data: {
    fullname?: string;
    username?: string;
    email?: string;
    plan?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>; // Yeni eklenen fonksiyon
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
  // ApiError instance'ı ise, data property'sini kullan
  const errorData = error instanceof ApiError ? error.data : error?.response?.data;
  
  if (errorData) {
    // Detail array formatı - {"detail": ["mesaj"]}
    if (errorData.detail) {
      if (Array.isArray(errorData.detail)) {
        return errorData.detail[0];
      }
      return errorData.detail;
    }
    
    // Field-specific errors
    const fieldErrors = [];
    
    if (errorData.username) {
      const msg = Array.isArray(errorData.username) ? errorData.username[0] : errorData.username;
      fieldErrors.push(msg === "A user with that username already exists." 
        ? "Bu istifadəçi adı artıq istifadə olunur" 
        : `İstifadəçi adı: ${msg}`);
    }
    
    if (errorData.email) {
      const msg = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
      fieldErrors.push(`E-mail: ${msg}`);
    }
    
    if (errorData.password) {
      const msg = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
      fieldErrors.push(`Şifrə: ${msg}`);
    }
    
    if (errorData.password2) {
      const msg = Array.isArray(errorData.password2) ? errorData.password2[0] : errorData.password2;
      fieldErrors.push(`Şifrə təkrarı: ${msg}`);
    }
    
    if (errorData.fullname) {
      const msg = Array.isArray(errorData.fullname) ? errorData.fullname[0] : errorData.fullname;
      fieldErrors.push(`Ad Soyad: ${msg}`);
    }
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join(', ');
    }
    
    // Non-field errors
    if (errorData.non_field_errors) {
      return Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
    }
  }
  
  // HTTP status kodlarına göre varsayılan mesajlar
  const status = error instanceof ApiError ? error.status : error?.response?.status;
  
  if (status === 400) {
    return type === 'login' ? 'İstifadəçi adı və ya şifrə yanlışdır.' : 'Daxil etdiyiniz məlumatları yoxlayın.';
  }
  
  if (status === 401) {
    return 'İstifadəçi adı və ya şifrə yanlışdır.';
  }
  
  if (status === 409) {
    return 'Bu istifadəçi adı və ya e-mail artıq istifadə olunur.';
  }
  
  if (status >= 500) {
    return 'Server xətası baş verdi. Zəhmət olmasa daha sonra cəhd edin.';
  }
  
  // Varsayılan mesajlar
  return type === 'login' ? 'Giriş zamanı xəta baş verdi.' : 'Qeydiyyat zamanı xəta baş verdi.';
};

// API hatalarını detaylı şekilde parse eden fonksiyon
const parseApiErrors = (error: any) => {
  const errors: string[] = [];
  
  // ApiError instance'ı ise, data property'sini kullan
  const errorData = error instanceof ApiError ? error.data : error?.response?.data;
  
  if (errorData) {
    // Detail errors
    if (errorData.detail) {
      if (Array.isArray(errorData.detail)) {
        errors.push(...errorData.detail);
      } else {
        errors.push(errorData.detail);
      }
    }
    
    // Field-specific errors
    Object.keys(errorData).forEach(field => {
      if (field !== 'detail' && field !== 'non_field_errors') {
        const fieldErrors = errorData[field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach(err => {
            if (field === 'username' && err === "A user with that username already exists.") {
              errors.push("Bu istifadəçi adı artıq istifadə olunur");
            } else {
              errors.push(`${getFieldName(field)}: ${err}`);
            }
          });
        } else {
          errors.push(`${getFieldName(field)}: ${fieldErrors}`);
        }
      }
    });
    
    // Non-field errors
    if (errorData.non_field_errors) {
      if (Array.isArray(errorData.non_field_errors)) {
        errors.push(...errorData.non_field_errors);
      } else {
        errors.push(errorData.non_field_errors);
      }
    }
  }
  
  return errors;
};

// Field adlarını Azərbaycanca'ya çevir
const getFieldName = (field: string) => {
  const fieldNames: { [key: string]: string } = {
    username: 'İstifadəçi adı',
    email: 'E-mail',
    password: 'Şifrə',
    password2: 'Şifrə təkrarı',
    fullname: 'Ad Soyad'
  };
  return fieldNames[field] || field;
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

  // Public refreshUser fonksiyonu - Google OAuth callback için
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = await apiService.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Refresh user failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      throw error;
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
      await checkAuthStatus();
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
      console.log('Register successful:', response);
      
      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      
      // API hatalarını parse et
      const apiErrors = parseApiErrors(error);
      console.log('Parsed API errors:', apiErrors);
      
      const errorMessage = getErrorMessage(error, 'register');
      
      toast({
        title: "Qeydiyyat xətası",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, errors: apiErrors };
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
      const errorMessage = getErrorMessage(error, 'register');
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
    refreshUser, // Yeni eklenen fonksiyon
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};