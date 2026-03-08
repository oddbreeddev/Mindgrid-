import React, { useState, useEffect } from 'react';
import { Bell, X, Heart, BookOpen, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead } from '../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const data = await getNotifications(user.uid);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    };
    fetchNotifications();
    
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={14} className="text-red-500" />;
      case 'new_article': return <BookOpen size={14} className="text-blue-500" />;
      default: return <Info size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-blue-500 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#050505]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      onClick={() => handleMarkRead(notification.id)}
                      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative ${!notification.read ? 'bg-blue-500/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">{getIcon(notification.type)}</div>
                        <div>
                          <p className="text-xs font-bold text-white mb-1">{notification.title}</p>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{notification.message}</p>
                          <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase tracking-widest">
                            {notification.created_at?.seconds ? new Date(notification.created_at.seconds * 1000).toLocaleDateString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">No notifications yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
