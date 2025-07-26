// app/profile/layout.tsx

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Separator } from '@/components/ui/separator';
import { Outlet } from 'react-router-dom';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="flex">
        <Sidebar />
        <Separator orientation="vertical" className="h-full w-px bg-gray-200" />
        <main className="flex-1 p-6">{<Outlet/>}</main>
      </div>
    </div>
  );
}
