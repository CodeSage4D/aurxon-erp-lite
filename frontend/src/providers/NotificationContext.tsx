'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PlatformNotification {
  id: string;
  title: string;
  category: 'REGISTRATION' | 'APPROVAL' | 'LICENSE' | 'SECURITY' | 'SUPPORT' | 'DEPLOYMENT' | 'BILLING' | 'SYSTEM' | 'AUDIT';
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: PlatformNotification[];
  unreadCount: number;
  criticalCount: number;
  approvalsCount: number;
  supportCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => !n.isRead && ['SECURITY', 'AUDIT'].includes(n.category)).length;
  const approvalsCount = notifications.filter(n => !n.isRead && ['APPROVAL', 'REGISTRATION'].includes(n.category)).length;
  const supportCount = notifications.filter(n => !n.isRead && n.category === 'SUPPORT').length;

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('aurxon_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchNotifications = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('aurxon_token') : null;
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/notifications', {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err: any) {
      console.warn('In-app alerts: Notification server offline.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetch(`http://localhost:5000/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
    } catch (err) {
      console.warn('Failed to mark notification as read (offline).');
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await fetch('http://localhost:5000/notifications/read-all', {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (err) {
      console.warn('Failed to mark all notifications as read (offline).');
    }
  };

  const clearNotifications = async () => {
    setNotifications([]);
    try {
      await fetch('http://localhost:5000/notifications/clear', {
        method: 'DELETE',
        headers: getHeaders(),
      });
    } catch (err) {
      console.warn('Failed to clear notifications (offline).');
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Setup periodic polling check (every 10 seconds)
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        criticalCount,
        approvalsCount,
        supportCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
