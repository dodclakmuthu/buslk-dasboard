import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import {
  LayoutDashboard, Bus, MapPin, Users, Route,
  Calculator, BarChart3, Bell, Settings, FileText, X, ChevronRight
} from 'lucide-react';
import BrandMark from './BrandMark';

const VIEW_PATH: Record<string, string> = {
  dashboard: '/dashboard',
  buses: '/buses',
  trips: '/trips',
  staff: '/staff',
  settlement: '/settlement',
  reports: '/reports',
  routes: '/routes',
  notifications: '/notifications',
  blueprint: '/blueprint',
  settings: '/settings',
};

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'buses' as const, label: 'Bus Fleet', icon: Bus },
  { id: 'trips' as const, label: 'Trip Management', icon: Route },
  { id: 'staff' as const, label: 'Staff & Crew', icon: Users },
  { id: 'settlement' as const, label: 'Daily Settlement', icon: Calculator },
  { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
  { id: 'routes' as const, label: 'Route Master', icon: MapPin },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  { id: 'blueprint' as const, label: 'Product Blueprint', icon: FileText },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = user?.fullName?.trim() || 'Owner';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'O';

  const handleNavigate = (path: string) => {
    navigate(path);

    if (typeof window !== 'undefined' && window.innerWidth < 1024 && sidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white z-50 transition-all duration-300 flex flex-col
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className={`flex items-center gap-3 ${!sidebarOpen ? 'lg:justify-center lg:w-full' : ''}`}>
            <div className={`${!sidebarOpen ? 'lg:hidden' : ''}`}>
              <BrandMark
                imageClassName="h-10"
                textClassName="text-lg font-bold tracking-tight text-white"
                subtitle="Bus Operations Platform"
                subtitleClassName="text-[10px] -mt-0.5 text-slate-400"
              />
            </div>
            {!sidebarOpen && (
              <img src="/logo.png" alt="BusEka" className="hidden h-10 w-auto object-contain lg:block" />
            )}
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-1 hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map(item => {
              const Icon = item.icon;
              const itemPath = VIEW_PATH[item.id];
              const isActive =
                location.pathname === itemPath ||
                (itemPath === '/reports' && location.pathname.startsWith('/reports/'));
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(itemPath)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                      ${isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }
                      ${!sidebarOpen ? 'lg:justify-center lg:px-2' : ''}
                    `}
                    title={item.label}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
                    <span className={`text-sm font-medium ${!sidebarOpen ? 'lg:hidden' : ''}`}>
                      {item.label}
                    </span>
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <span className={`bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center
                        ${!sidebarOpen ? 'lg:absolute lg:top-0 lg:right-0 lg:w-4 lg:h-4' : 'ml-auto w-5 h-5'}
                      `}>
                        {unreadCount}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className={`w-4 h-4 ml-auto text-amber-400 ${!sidebarOpen ? 'lg:hidden' : ''}`} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className={`p-4 border-t border-slate-700/50 ${!sidebarOpen ? 'lg:px-2' : ''}`}>
          <div className={`flex items-center gap-3 ${!sidebarOpen ? 'lg:justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
              {initials}
            </div>
            <div className={`${!sidebarOpen ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-[11px] text-slate-400">Owner</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
