import { useState, useEffect } from 'react';
import {
  subscribeToNotifications,
  subscribeToConversations,
  markNotificationRead,
  markAllNotificationsRead,
  Notification,
  Conversation,
} from '../services/inboxService';

export const useInbox = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // Écoute temps réel des notifications
    const unsubNotifs = subscribeToNotifications((notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    // Écoute temps réel des conversations
    const unsubConvs = subscribeToConversations((convs) => {
      setConversations(convs);
    });

    return () => {
      unsubNotifs();
      unsubConvs();
    };
  }, []);

  const readNotification = async (notifId: string) => {
    await markNotificationRead(notifId);
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  const readAllNotifications = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    conversations,
    loading,
    error,
    unreadCount,
    readNotification,
    readAllNotifications,
  };
};