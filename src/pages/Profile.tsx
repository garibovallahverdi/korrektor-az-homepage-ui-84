import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TextChecker } from '@/components/TextChecker';
import { User, Mail, Calendar, LogOut } from 'lucide-react';

export const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/lovable-uploads/7b7bf9b8-3318-4217-8c4e-8a6b622237ce.png"
                alt="Korrektor.az"
                className="h-8 w-auto"
              />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold text-gray-900">Profil</h1>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıxış
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="bg-red-500 text-white text-xl">
                    {user ? getInitials(user.first_name, user.last_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">
                  {user ? `${user.first_name} ${user.last_name}` : 'İstifadəçi'}
                </CardTitle>
                <CardDescription>
                  Korrektor.az istifadəçisi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{user?.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">ID: {user?.id}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Aktiv istifadəçi</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status</h4>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Aktiv
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Text Checker Main Area */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Mətn Yoxlayıcısı</span>
                  <Badge variant="secondary">Beta</Badge>
                </CardTitle>
                <CardDescription>
                  Azərbaycan dilində mətninizi yoxlayın və düzəldin
                </CardDescription>
              </CardHeader>
            </Card>

            <TextChecker />
          </div>
        </div>
      </div>
    </div>
  );
};