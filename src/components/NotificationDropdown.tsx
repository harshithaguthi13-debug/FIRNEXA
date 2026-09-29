import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, Clock, ShieldAlert, FileText, AlertCircle, Sparkles } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const {
    currentUser,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter((n) => {
    if (currentUser?.role === 'CITIZEN') {
      return n.userId === currentUser.id;
    }
    if (currentUser?.role === 'POLICE' || currentUser?.role === 'ADMIN') {
      return (
        n.targetRole === currentUser.role ||
        n.targetRole === 'POLICE' ||
        n.userId === currentUser.id
      );
    }
    return false;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'FIR':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'COMPLAINT':
        return <ShieldAlert className="w-4 h-4 text-blue-600" />;
      case 'INVESTIGATION':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'STATUS':
        return <AlertCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition focus:outline-hidden"
        title="View Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-slate-900">
            {unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold">Activity Notifications</h4>
            </div>
            {unreadNotificationCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] text-blue-300 hover:text-white flex items-center gap-1 font-medium transition"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {userNotifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No recent notifications for your account.
              </div>
            ) : (
              userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 transition cursor-pointer flex gap-3 text-left ${
                    !notif.isRead ? 'bg-blue-50/60 hover:bg-blue-50' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 p-1.5 bg-white rounded border border-slate-200 shadow-2xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{notif.referenceId || notif.type}</span>
                      <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 text-center bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
            Real-time updates synced with State Crime Records Bureau (SCRB)
          </div>
        </div>
      )}
    </div>
  );
};
