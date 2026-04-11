import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationsContext';
import { AlertTriangle, Info, CheckCircle2, AlertCircle, Check, RefreshCw } from 'lucide-react';

const NotificationsView: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    markRead,
    markAllRead,
    refreshNotifications,
  } = useNotifications();
  const hasRefreshedOnMount = useRef(false);

  useEffect(() => {
    if (hasRefreshedOnMount.current) return;
    hasRefreshedOnMount.current = true;
    void refreshNotifications({ silent: notifications.length > 0 });
  }, [notifications.length, refreshNotifications]);

  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const typeConfig: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
    WARNING: { icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', border: 'border-amber-200' },
    ERROR: { icon: <AlertCircle className="w-5 h-5 text-red-600" />, bg: 'bg-red-50', border: 'border-red-200' },
    SUCCESS: { icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', border: 'border-emerald-200' },
    INFO: { icon: <Info className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', border: 'border-blue-200' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">{unreadCount} unread notifications</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => refreshNotifications()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
            >
              <Check className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
        {isLoading && (
          <div className="p-4 rounded-xl border bg-white border-slate-100 text-sm text-slate-500">
            Loading notifications...
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <div className="p-4 rounded-xl border bg-white border-slate-100 text-sm text-slate-500">
            No notifications available
          </div>
        )}

        {sorted.map(notif => {
          const config = typeConfig[notif.severity] || typeConfig.INFO;
          return (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.targetUrl) navigate(notif.targetUrl);
              }}
              className={`p-4 rounded-xl border transition-all ${
                notif.isRead ? 'bg-white border-slate-100' : `${config.bg} ${config.border}`
              } ${notif.targetUrl ? 'cursor-pointer' : ''}`}
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
                        onClick={(event) => {
                          event.stopPropagation();
                          void markRead(notif.id);
                        }}
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
