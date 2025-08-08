import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Register = () => {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Form validasyonu
  const validateForm = () => {
    const newErrors: string[] = [];

    if (fullname.length < 2) {
      newErrors.push('Ad və soyad ən azı 2 hərf olmalıdır.');
    }

    if (username.length < 3) {
      newErrors.push('İstifadəçi adı ən azı 3 hərf olmalıdır.');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.push('İstifadəçi adı yalnız hərf, rəqəm və alt xətt (_) olmalıdır.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push('Düzgün e-mail ünvanı daxil edin.');
    }

    // FIX: password1 kullanın password değil
    if (password.length < 8) {
      newErrors.push('Şifrə ən azı 8 hərf olmalıdır.');
    }

    // FIX: password1 kullanın password değil
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.push('Şifrə kiçik hərf, böyük hərf və rəqəm olmalıdır.');
    }

    // FIX: password1 kullanın password değil
    if (password !== password2) {
      newErrors.push('Şifrələr uyğun deyil.');
    }

    setClientErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientErrors([]);
    setServerErrors([]);

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        fullname,
        username,
        email,
        password,
        password2,
      });
      console.log(result);
      
      if (result.success) {
        // URL parametrelerini kontrol et
        const searchParams = new URLSearchParams(location.search);
        const redirectPath = searchParams.get('redirect') || '/profile';
        const textParam = searchParams.get('text');
        
        // Eğer text parametresi varsa, onu koruyarak yönlendir
        if (textParam) {
          const targetUrl = `${redirectPath}?text=${encodeURIComponent(textParam)}`;
          navigate(targetUrl);
        } else {
          navigate(redirectPath);
        }
      } else if (result.errors) {
        setServerErrors(result.errors);
      }
      
    } catch (error) {
      // FIX: error.username yanlış - error mesajını düzgün yakalayın
      console.error('Registration error:', error);
      // Hata mesajını kullanıcıya göster
      if (error instanceof Error) {
        setServerErrors([error.message]);
      } else {
        setServerErrors(['Kayıt sırasında bir hata oluştu.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login linkine parametreleri aktar
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

  // FIX: useEffect eksik ve hatalı - gereksiz olduğu için kaldırıldı
  // Gerçek zamanlı validasyon gerekiyorsa aşağıdaki gibi eklenebilir:
  /*
  useEffect(() => {
    // Gerçek zamanlı validasyon
    if (password1 || password2 || fullname || username || email) {
      validateForm();
    }
  }, [password1, password2, fullname, username, email]);
  */

  // Tüm hataları birleştir
  const allErrors = [...clientErrors, ...serverErrors];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Qeydiyyat</CardTitle>
          <CardDescription>
            Yeni hesab yaradın və mətni yoxlaya başlayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Hata mesajları */}
          {allErrors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {allErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Ad Soyad</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Adınızı və soyadınızı daxil edin"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">İstifadəçi adı</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="İstifadəçi adınızı daxil edin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Yalnız hərf, rəqəm və alt xətt (_) istifadə edin</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="E-mail ünvanınızı daxil edin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifrə</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrənizi daxil edin"
                  value={password}
                  onChange={(e) => setPassword1(e.target.value)}
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
              <p className="text-xs text-gray-500">Ən azı 8 hərf, böyük və kiçik hərf, rəqəm olmalıdır</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password2">Şifrəni təkrarlayın</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password2"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrənizi təkrar daxil edin"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Qeydiyyat edilir...' : 'Qeydiyyat'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Hesabınız var? </span>
            <Link to={getLoginLink()} className="text-red-500 hover:text-red-600 font-medium">
              Daxil ol
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};