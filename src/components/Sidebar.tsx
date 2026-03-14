import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import {
  LayoutDashboard, Bus, MapPin, Users, Route, Receipt,
  Calculator, BarChart3, Bell, Settings, FileText, X, ChevronRight
} from 'lucide-react';

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
  const { sidebarOpen, toggleSidebar, currentView, setCurrentView, unreadNotificationCount } = useAppContext();

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div className={`${!sidebarOpen ? 'lg:hidden' : ''}`}>
              <h1 className="text-lg font-bold tracking-tight">BusLK</h1>
              <p className="text-[10px] text-slate-400 -mt-0.5">Bus Operations Platform</p>
            </div>
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
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentView(item.id);
                      if (sidebarOpen) toggleSidebar();
                    }}
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
                    {item.id === 'notifications' && unreadNotificationCount > 0 && (
                      <span className={`bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center
                        ${!sidebarOpen ? 'lg:absolute lg:top-0 lg:right-0 lg:w-4 lg:h-4' : 'ml-auto w-5 h-5'}
                      `}>
                        {unreadNotificationCount}
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
              KP
            </div>
            <div className={`${!sidebarOpen ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-medium">Kamal Perera</p>
              <p className="text-[11px] text-slate-400">Owner</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
