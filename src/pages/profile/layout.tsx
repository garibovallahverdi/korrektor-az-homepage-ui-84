import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Separator } from '@/components/ui/separator';
import { Outlet } from 'react-router-dom';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <Separator orientation="vertical" className="hidden lg:block h-full w-px bg-gray-200" />
        
        {/* Main Content */}
        <main className="flex-1 lg:p-6 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}