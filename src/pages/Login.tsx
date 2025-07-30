import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login({ username, password });
      
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
      
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register linkini de güncelleyelim ki text parametresi korunsun
  const getRegisterLink = () => {
    const searchParams = new URLSearchParams(location.search);
    const textParam = searchParams.get('text');
    const redirectParam = searchParams.get('redirect');
    
    let registerUrl = '/register';
    const params = new URLSearchParams();
    
    if (redirectParam) {
      params.set('redirect', redirectParam);
    }
    if (textParam) {
      params.set('text', textParam);
    }
    
    if (params.toString()) {
      registerUrl += `?${params.toString()}`;
    }
    
    return registerUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Daxil ol</CardTitle>
          <CardDescription>
            Hesabınıza daxil olaraq mətni yoxlaya biləcəksiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">İstifadəçi adı</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="İstifadəçi adınızı daxil edin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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

            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Daxil olunur...' : 'Daxil ol'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Hesabınız yoxdur? </span>
            <Link to={getRegisterLink()} className="text-red-500 hover:text-red-600 font-medium">
              Qeydiyyatdan keç
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};