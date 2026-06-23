// src/hooks/useInbox.ts
import { useState, useEffect } from 'react';
import {
  getNotifications,
  getConversations,
  markNotificationRead,
  Notification,
  Conversation,
} from '../services/inboxService';

export const useInbox = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charge notifications + conversations en même temps
  const loadInbox = async () => {
    try {
      setLoading(true);
      const [notifs, convs] = await Promise.all([
        getNotifications(),
        getConversations(),
      ]);
      setNotifications(notifs);
      setConversations(convs);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Marque une notification comme lue localement + Firestore
  const readNotification = async (notifId: string) => {
    await markNotificationRead(notifId);
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  useEffect(() => {
    loadInbox();
  }, []);

  // Nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    conversations,
    loading,
    error,
    unreadCount,
    readNotification,
    reload: loadInbox,
  };
};