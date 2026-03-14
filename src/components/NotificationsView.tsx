import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Bell, AlertTriangle, Info, CheckCircle2, AlertCircle, Check } from 'lucide-react';

const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead } = useAppContext();

  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const typeConfig: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
    warning: { icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', border: 'border-amber-200' },
    alert: { icon: <AlertCircle className="w-5 h-5 text-red-600" />, bg: 'bg-red-50', border: 'border-red-200' },
    success: { icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', border: 'border-emerald-200' },
    info: { icon: <Info className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', border: 'border-blue-200' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500 mt-1">{notifications.filter(n => !n.isRead).length} unread notifications</p>
      </div>

      <div className="space-y-3">
        {sorted.map(notif => {
          const config = typeConfig[notif.type] || typeConfig.info;
          return (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all ${
                notif.isRead ? 'bg-white border-slate-100' : `${config.bg} ${config.border}`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-semibold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200 flex-shrink-0"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{notif.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString('en-LK')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsView;
