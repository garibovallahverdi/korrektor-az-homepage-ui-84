import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiService } from '@/services/api';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    // Token yoxlandı
    if (!token) {
      setIsValidToken(false);
      setError('Şifrə sıfırlama linki etibarsızdır və ya vaxtı bitib.');
    }
  }, [token]);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (password.length < minLength) {
      return 'Şifrə ən azı 8 simvoldan ibarət olmalıdır';
    }
    if (!hasUpperCase) {
      return 'Şifrədə ən azı bir böyük hərf olmalıdır';
    }
    if (!hasLowerCase) {
      return 'Şifrədə ən azı bir kiçik hərf olmalıdır';
    }
    if (!hasNumbers) {
      return 'Şifrədə ən azı bir rəqəm olmalıdır';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Frontend validation
    if (password !== confirmPassword) {
      setError('Şifrələr uyğun gəlmir');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setError(passwordValidation);
      return;
    }

    if (!token) {
      setError('Token mövcud deyil');
      return;
    }

    setIsLoading(true);
    
    try {
      const data = {
        token,
        new_password : password,
        re_new_password : confirmPassword
      };
      
      // API çağrısı - token və şifrələri göndər
      const response = await apiService.passwordResetConfirm(token, password, confirmPassword);
      
      if (response.ok) {
        setIsSuccess(true);
        // 3 saniyə sonra login səhifəsinə yönləndir
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData?.message || 'Şifrə sıfırlama zamanı xəta baş verdi');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error?.response?.data?.message || 'Şəbəkə xətası. Yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Token etibarsız olarsa
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Link etibarsızdır</CardTitle>
            <CardDescription>
              Şifrə sıfırlama linki etibarsızdır və ya vaxtı bitib
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                Şifrə sıfırlama linki etibarsızdır, vaxtı bitib və ya artıq istifadə edilib. 
                Yeni şifrə sıfırlama tələbi göndərin.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col space-y-2 pt-4">
              <Link to="/forgot-password">
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                  Yeni link tələb et
                </Button>
              </Link>
              
              <Link to="/login">
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

  // Uğurlu sıfırlama
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Şifrə uğurla dəyişdirildi</CardTitle>
            <CardDescription>
              Yeni şifrənizlə daxil ola bilərsiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Şifrəniz uğurla yeniləndi. İndi yeni şifrənizlə hesabınıza daxil ola bilərsiniz.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>3 saniyə sonra avtomatik olaraq giriş səhifəsinə yönləndiriləcəksiniz...</p>
            </div>

            <Link to="/login">
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                İndi daxil ol
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Yeni şifrə təyin edin</CardTitle>
          <CardDescription>
            Hesabınız üçün yeni və güclü şifrə təyin edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Yeni şifrə</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Yeni şifrənizi daxil edin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifrəni təkrarla</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Şifrənizi təkrar daxil edin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Şifrə tələbləri */}
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium">Şifrə tələbləri:</p>
              <ul className="space-y-1 pl-2">
                <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                  • Ən azı 8 simvol
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                  • Ən azı bir böyük hərf
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                  • Ən azı bir kiçik hərf
                </li>
                <li className={/\d/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                  • Ən azı bir rəqəm
                </li>
              </ul>
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
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? 'Şifrə dəyişdirilir...' : 'Şifrəni dəyişdir'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
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