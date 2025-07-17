import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, UserCircle, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/profile/dashboard', label: 'Panel', icon: <UserCircle className="w-4 h-4" /> },
    { to: '/profile/settings', label: 'Tənzimləmələr', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r p-4">
      <div className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
      <button
        onClick={logout}
        className="mt-6 flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-100 w-full rounded-md"
      >
        <LogOut className="w-4 h-4" />
        Çıxış
      </button>
    </aside>
  );
};
