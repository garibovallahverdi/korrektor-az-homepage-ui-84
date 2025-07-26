'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    username: user?.username || '',
    password: '',
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveField = async (field: keyof typeof form) => {
    setLoadingField(field);
    await updateUser({ [field]: form[field] });
    setLoadingField(null);
    setEditingField(null);
  };

  const editableInput = (label: string, name: keyof typeof form, type: string = 'text') => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          readOnly={editingField !== name}
          className={editingField === name ? 'border-primary' : 'bg-muted cursor-not-allowed'}
        />
        {editingField !== name ? (
          <Button type="button" size="sm" onClick={() => setEditingField(name)}>
            Dəyiş
          </Button>
        ) : (
          <>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setEditingField(null)}
            >
              Bağla
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => saveField(name)}
              disabled={loadingField === name}
            >
              {loadingField === name ? 'Yadda saxlanılır...' : 'Yadda saxla'}
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const upgradePlan = async () => {
    setPlanLoading(true);
    await updateUser({ plan: 'pro' });
    setPlanLoading(false);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-semibold">Profil Məlumatları</h2>

      <div className="space-y-5">
        {editableInput('Ad Soyad', 'fullname')}
        {editableInput('Email', 'email', 'email')}
        {editableInput('İstifadəçi Adı', 'username')}
        {editableInput('Yeni Şifrə', 'password', 'password')}
      </div>

      {/* Plan Bölümü */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Hesab Planı</h3>

        {/* Aktif Plan Kartı */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Aktiv Plan: {user?.plan === 'pro' ? 'Pro' : 'Basic'}</CardTitle>
            <CardDescription>
              {user?.plan === 'pro'
                ? 'Təbriklər! Bütün pro funksiyalar aktivdir.'
                : 'Hal-hazırda Basic plan istifadə edirsiniz.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {user?.plan === 'pro'
                ? 'Yüksək performans və qabaqcıl xüsusiyyətlərdən istifadə edirsiniz.'
                : 'Pro planla daha çox funksiyaya və üstünlüklərə sahib ola bilərsiniz.'}
            </p>
          </CardContent>
        </Card>

        {/* Yüksəltme Kartı */}
        {user?.plan !== 'pro' && (
          <Card className="border-dashed border-2 border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <ArrowUpRight className="w-5 h-5" />
                Pro Plan'a Yüksəlt
              </CardTitle>
              <CardDescription>
                Limitsiz funksiyalar, prioritet dəstək və daha çox.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={upgradePlan}
                disabled={planLoading}
                className="w-full"
              >
                {planLoading ? 'Yüksəldilir...' : 'İndi Yüksəlt'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
