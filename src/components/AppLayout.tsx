import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import Sidebar from './Sidebar';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BrandMark from './BrandMark';

const PATH_LABEL: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/buses': 'Bus Fleet',
  '/trips': 'Trip Management',
  '/staff': 'Staff & Crew',
  '/settlement': 'Daily Settlement',
  '/reports': 'Reports',
  '/reports/performance': 'Performance Analytics',
  '/routes': 'Route Master',
  '/notifications': 'Notifications',
  '/blueprint': 'Product Blueprint',
  '/settings': 'Settings',
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const { unreadCount } = useNotifications();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageLabel =
    PATH_LABEL[location.pathname] ??
    (location.pathname.startsWith('/reports/') ? 'Reports' : 'Dashboard');
  const isFullWidthPage = location.pathname === '/reports/performance';
  const displayName = user?.fullName?.trim() || 'Owner';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'O';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-sm font-semibold text-slate-900">{pageLabel}</h2>
                <p className="text-[11px] text-slate-400">BusEka - Sri Lankan Bus Operations Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`p-4 lg:p-8 ${isFullWidthPage ? 'w-full' : 'max-w-7xl'}`}>
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white px-4 lg:px-8 py-6 mt-8">
          <div className="max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandMark
                imageClassName="h-8"
                textClassName="text-sm font-semibold tracking-tight text-slate-900"
                subtitle="Sri Lankan Bus Operations Platform"
                subtitleClassName="text-[11px] text-slate-400"
              />
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <span>Version 1.0 MVP</span>
              <span>Built for Sri Lankan Private Bus Operators</span>
              <span>2026 BusEka</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
