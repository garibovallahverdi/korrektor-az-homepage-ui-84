import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogOut, UserCircle, Settings, X, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/profile/dashboard', label: 'Panel', icon: <UserCircle className="w-4 h-4" /> },
    { to: '/profile/settings', label: 'Tənzimləmələr', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="w-64 bg-white border-r h-screen shadow-lg lg:shadow-none">
      {/* Mobile Close Button */}
      {onClose && (
        <div className="lg:hidden flex justify-end p-4 border-b" >
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="p-4">
           <Link to="/" className="flex items-center space-x-2 my-4">
                    <img
                      src="/lovable-uploads/7b7bf9b8-3318-4217-8c4e-8a6b622237ce.png"
                      alt="Korrektor.az"
                      className="h-8 w-auto"
                    />
                  </Link>
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-red-100 text-red-800' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-100 w-full rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Çıxış
        </button>
      </div>
    </aside>
  );
};