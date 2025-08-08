import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiService } from '@/services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
        const data= {
            email
        }
      // API çağrısı - şifre sıfırlama linki gönder
      const res =await apiService.passwordResetRequest(email)
      console.log(await res.json(),"xetaa 2");
      
      setIsSuccess(true);
    } catch (error: any) {
        console.log(error.message);
        
      setError(error?.response?.data?.message || 'Bir xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin ={
    
  }
  // Login linkini oluştur (mevcut parametreleri koru)
  const getLoginLink = () => {
    const searchParams = new URLSearchParams(location.search);
    const textParam = searchParams.get('text');
    const redirectParam = searchParams.get('redirect');
    
    let loginUrl = '/login';
    const params = new URLSearchParams();
    
    if (redirectParam) {
      params.set('redirect', redirectParam);
    }
    if (textParam) {
      params.set('text', textParam);
    }
    
    if (params.toString()) {
      loginUrl += `?${params.toString()}`;
    }
    
    return loginUrl;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">E-poçt göndərildi</CardTitle>
            <CardDescription>
              Şifrə sıfırlama linki e-poçt ünvanınıza göndərildi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <strong>{email}</strong> ünvanına şifrə sıfırlama linki göndərildi. 
                E-poçt qutunuzu yoxlayın və linkə klikləyərək yeni şifrə təyin edin.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>• E-poçt 5-10 dəqiqə ərzində gələcək</p>
              <p>• Spam qovluğunu da yoxlamağı unutmayın</p>
              <p>• Link 24 saat etibarlıdır</p>
            </div>

            <div className="flex flex-col space-y-2 pt-4">
              <Button
                onClick={() => setIsSuccess(false)}
                variant="outline"
                className="w-full"
              >
                Yenidən göndər
              </Button>
              
              <Link to={getLoginLink()}>
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Girişə qayıt
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Şifrəni sıfırla</CardTitle>
          <CardDescription>
            E-poçt ünvanınızı daxil edin, sizə şifrə sıfırlama linki göndərəcəyik
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-poçt ünvanı</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="E-poçt ünvanınızı daxil edin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Göndərilir...' : 'Sıfırlama linki göndər'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to={getLoginLink()} 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Girişə qayıt
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};