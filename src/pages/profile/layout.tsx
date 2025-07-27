import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="flex">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            onClick={() => setSidebarOpen(true)}
            variant="outline"
            size="sm"
            className="bg-white shadow-md"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
          />
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onClose={closeSidebar} />
        </div>

        <Separator orientation="vertical" className="hidden lg:block h-full w-px bg-gray-200" />
        
        {/* Main Content */}
        <main className="flex-1 lg:p-6 p-0 lg:ml-0 ml-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}