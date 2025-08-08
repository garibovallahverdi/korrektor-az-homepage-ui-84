// components/GoogleCallback.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processGoogleAuth = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Hata durumunda
      if (error) {
        toast({
          title: "Google girişi iptal edildi",
          description: "Giriş işlemi başarısız oldu.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Code yoksa login sayfasına yönlendir
      if (!code) {
        navigate('/login');
        return;
      }

      try {
        setIsProcessing(true);
        
        // Google auth API'sini çağır
        const response = await apiService.googleAuth(code);
        
        // Tokenları kontrol et ve kaydet
        if (response.access && response.refresh) {
          localStorage.setItem('accessToken', response.access);
          localStorage.setItem('refreshToken', response.refresh);
          
          // AuthContext'teki user state'ini güncelle
          await refreshUser();
          
          toast({
            title: "Google girişi uğurlu",
            description: "Xoş gəldiniz!",
          });
          
          // Dashboard'a yönlendir
          navigate('/profile/dashboard');
        } else {
          throw new Error('Invalid response from Google auth');
        }
        
      } catch (error) {
        console.error('Google auth error:', error);
        toast({
          title: "Google giriş xətası",
          description: "Giriş zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processGoogleAuth();
  }, [searchParams, navigate, toast, refreshUser]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Google hesabınız ilə giriş edilir...</p>
        </div>
      </div>
    );
  }

  return null;
};