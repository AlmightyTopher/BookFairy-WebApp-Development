/**
 * Notification Management Hook
 *
 * Provides notification state management, push notification integration,
 * and fairy-themed messaging for the BookFairy application
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Notification,
  NotificationType,
  NotificationPreferences,
  NotificationPriority,
  PaginatedResponse,
  UseAsyncState
} from '@/types';
import { useAuthContext } from './useAuth';
import { supabase } from '@/services/supabase/client';
import { pushNotificationService } from '@/services/notifications/push';
import { validateNotification, createFairyNotificationMessage } from '@/types/Notification';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  pushEnabled: boolean;
  pushSupported: boolean;
}

export interface NotificationFilters {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  read_status?: boolean;
  date_range?: { start: string; end: string };
}

export interface NotificationActions {
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<NotificationPreferences>;
  enablePushNotifications: () => Promise<{ success: boolean; message: string }>;
  disablePushNotifications: () => Promise<{ success: boolean; message: string }>;
  testPushNotification: () => Promise<{ success: boolean; message: string }>;
  refreshNotifications: () => Promise<void>;
  getNotifications: (filters?: NotificationFilters, page?: number, limit?: number) => Promise<PaginatedResponse<Notification>>;
  createNotification: (type: NotificationType, message: string, data?: Record<string, any>) => Promise<Notification>;
  clearError: () => void;
}

export interface UseNotificationsResult extends NotificationState, NotificationActions {}

export const useNotifications = (): UseNotificationsResult => {
  const { user, isAuthenticated } = useAuthContext();
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    preferences: {
      push_enabled: false,
      email_enabled: true,
      book_available: true,
      wishlist_reminder: true,
      reading_reminder: true,
      recommendation: true,
      system_update: true,
      quiet_hours: {
        enabled: false,
        start_time: '22:00',
        end_time: '08:00'
      },
      frequency_limits: {
        daily_max: 10,
        weekly_max: 50
      }
    },
    isLoading: false,
    error: null,
    lastFetched: null,
    pushEnabled: false,
    pushSupported: false
  });

  // Initialize push notifications and load data when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeNotifications();
    } else {
      setState(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0
      }));
    }
  }, [isAuthenticated, user?.id]);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        handleNewNotification(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        handleNotificationUpdate(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  const initializeNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check push notification support
      const pushSupported = pushNotificationService.isSupported();

      // Load user preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      let preferences = state.preferences;
      if (!prefsError && prefsData) {
        preferences = {
          push_enabled: prefsData.push_enabled,
          email_enabled: prefsData.email_enabled,
          book_available: prefsData.book_available,
          wishlist_reminder: prefsData.wishlist_reminder,
          reading_reminder: prefsData.reading_reminder,
          recommendation: prefsData.recommendation,
          system_update: prefsData.system_update,
          quiet_hours: prefsData.quiet_hours || preferences.quiet_hours,
          frequency_limits: prefsData.frequency_limits || preferences.frequency_limits
        };
      }

      // Check push permission status
      let pushEnabled = false;
      if (pushSupported) {
        const permissionResult = await pushNotificationService.getPermissionStatus();
        pushEnabled = permissionResult.permission === 'granted';
      }

      setState(prev => ({
        ...prev,
        preferences,
        pushSupported,
        pushEnabled,
        isLoading: false
      }));

      // Load notifications
      await refreshNotifications();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize notifications'
      }));
    }
  }, [user, state.preferences]);

  const handleNewNotification = useCallback((notification: any) => {
    const mappedNotification = mapDbRecordToNotification(notification);

    setState(prev => ({
      ...prev,
      notifications: [mappedNotification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1
    }));

    // Show push notification if enabled
    if (state.pushEnabled && state.preferences.push_enabled) {
      const payload = pushNotificationService.createNotificationPayload(mappedNotification);
      pushNotificationService.showLocalNotification(payload).catch(console.warn);
    }
  }, [state.pushEnabled, state.preferences.push_enabled]);

  const handleNotificationUpdate = useCallback((notification: any) => {
    const mappedNotification = mapDbRecordToNotification(notification);

    setState(prev => {
      const newNotifications = prev.notifications.map(n =>
        n.id === notification.id ? mappedNotification : n
      );

      const newUnreadCount = newNotifications.filter(n => !n.read_status).length;

      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: newUnreadCount
      };
    });
  }, []);

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read_status: true,
          read_timestamp: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => {
        const newNotifications = prev.notifications.map(n =>
          n.id === notificationId ? { ...n, read_status: true } : n
        );

        return {
          ...prev,
          notifications: newNotifications,
          unreadCount: Math.max(0, prev.unreadCount - 1)
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read'
      }));
      throw error;
    }
  }, [user]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read_status: true,
          read_timestamp: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('read_status', false);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, read_status: true })),
        unreadCount: 0
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
      }));
      throw error;
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => {
        const deletedNotification = prev.notifications.find(n => n.id === notificationId);
        const newNotifications = prev.notifications.filter(n => n.id !== notificationId);
        const unreadCountAdjustment = deletedNotification && !deletedNotification.read_status ? 1 : 0;

        return {
          ...prev,
          notifications: newNotifications,
          unreadCount: Math.max(0, prev.unreadCount - unreadCountAdjustment)
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete notification'
      }));
      throw error;
    }
  }, [user]);

  const clearAllNotifications = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to clear notifications'
      }));
      throw error;
    }
  }, [user]);

  const updatePreferences = useCallback(async (
    preferencesUpdate: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const newPreferences = { ...state.preferences, ...preferencesUpdate };

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        preferences: newPreferences,
        isLoading: false
      }));

      return newPreferences;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences'
      }));
      throw error;
    }
  }, [user, state.preferences]);

  const enablePushNotifications = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await pushNotificationService.subscribe();

      if (result.success && result.subscription) {
        // Save subscription to database
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user!.id,
            endpoint: result.subscription.endpoint,
            p256dh_key: result.subscription.keys.p256dh,
            auth_key: result.subscription.keys.auth,
            created_at: new Date().toISOString()
          });

        // Update preferences
        await updatePreferences({ push_enabled: true });

        setState(prev => ({
          ...prev,
          pushEnabled: true,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }

      return {
        success: result.success,
        message: result.fairy_message
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to enable push notifications'
      }));
      return {
        success: false,
        message: 'Oh honey, I couldn\'t turn on push notifications right now!'
      };
    }
  }, [user, updatePreferences]);

  const disablePushNotifications = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await pushNotificationService.unsubscribe();

      if (result.success) {
        // Remove subscription from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user!.id);

        // Update preferences
        await updatePreferences({ push_enabled: false });

        setState(prev => ({
          ...prev,
          pushEnabled: false,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }

      return {
        success: result.success,
        message: result.fairy_message
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to disable push notifications'
      }));
      return {
        success: false,
        message: 'Oh honey, I couldn\'t turn off push notifications right now!'
      };
    }
  }, [user, updatePreferences]);

  const testPushNotification = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await pushNotificationService.testNotification();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Oh honey, the test notification didn\'t work!'
      };
    }
  }, []);

  const refreshNotifications = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('delivery_timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifications = data.map(mapDbRecordToNotification);
      const unreadCount = notifications.filter(n => !n.read_status).length;

      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        isLoading: false,
        lastFetched: new Date().toISOString()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load notifications'
      }));
    }
  }, [user]);

  const getNotifications = useCallback(async (
    filters?: NotificationFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Notification>> => {
    if (!user) throw new Error('User not authenticated');

    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply filters
      if (filters?.type?.length) {
        query = query.in('type', filters.type);
      }

      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }

      if (filters?.read_status !== undefined) {
        query = query.eq('read_status', filters.read_status);
      }

      if (filters?.date_range) {
        query = query
          .gte('delivery_timestamp', filters.date_range.start)
          .lte('delivery_timestamp', filters.date_range.end);
      }

      // Pagination
      const offset = (page - 1) * limit;
      query = query
        .range(offset, offset + limit - 1)
        .order('delivery_timestamp', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const notifications = data.map(mapDbRecordToNotification);

      return {
        data: notifications,
        pagination: {
          current_page: page,
          total_pages: Math.ceil((count || 0) / limit),
          total_items: count || 0,
          items_per_page: limit,
          has_next: offset + limit < (count || 0),
          has_previous: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }, [user]);

  const createNotification = useCallback(async (
    type: NotificationType,
    message: string,
    data?: Record<string, any>
  ): Promise<Notification> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const fairyMessage = createFairyNotificationMessage(type, message, data);

      const newNotification = {
        user_id: user.id,
        type,
        title: getNotificationTitle(type),
        message,
        fairy_message: fairyMessage,
        delivery_timestamp: new Date().toISOString(),
        read_status: false,
        priority: getNotificationPriority(type),
        related_book_id: data?.book_id || null,
        action_url: data?.action_url || null,
        metadata: data || {}
      };

      const { data: insertedData, error } = await supabase
        .from('notifications')
        .insert(newNotification)
        .select()
        .single();

      if (error) throw error;

      return mapDbRecordToNotification(insertedData);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create notification'
      }));
      throw error;
    }
  }, [user]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const recentNotifications = useMemo(() => {
    return state.notifications.slice(0, 5);
  }, [state.notifications]);

  const urgentNotifications = useMemo(() => {
    return state.notifications.filter(n => n.priority === 'high' && !n.read_status);
  }, [state.notifications]);

  const notificationsByType = useMemo(() => {
    const grouped: Record<NotificationType, Notification[]> = {
      book_available: [],
      wishlist_reminder: [],
      reading_reminder: [],
      recommendation: [],
      system_update: []
    };

    state.notifications.forEach(notification => {
      if (grouped[notification.type]) {
        grouped[notification.type].push(notification);
      }
    });

    return grouped;
  }, [state.notifications]);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    enablePushNotifications,
    disablePushNotifications,
    testPushNotification,
    refreshNotifications,
    getNotifications,
    createNotification,
    clearError,
    // Additional computed properties
    recentNotifications,
    urgentNotifications,
    notificationsByType
  } as UseNotificationsResult & {
    recentNotifications: Notification[];
    urgentNotifications: Notification[];
    notificationsByType: Record<NotificationType, Notification[]>;
  };
};

// Helper functions
function mapDbRecordToNotification(record: any): Notification {
  return {
    id: record.id,
    user_id: record.user_id,
    type: record.type,
    title: record.title,
    message: record.message,
    fairy_message: record.fairy_message || '',
    delivery_timestamp: record.delivery_timestamp,
    read_status: record.read_status || false,
    read_timestamp: record.read_timestamp,
    priority: record.priority || 'medium',
    related_book_id: record.related_book_id,
    action_url: record.action_url,
    metadata: record.metadata || {}
  };
}

function getNotificationTitle(type: NotificationType): string {
  const titles = {
    book_available: 'Book Available',
    wishlist_reminder: 'Wishlist Reminder',
    reading_reminder: 'Reading Reminder',
    recommendation: 'New Recommendation',
    system_update: 'System Update'
  };

  return titles[type];
}

function getNotificationPriority(type: NotificationType): NotificationPriority {
  const priorities = {
    book_available: 'high' as NotificationPriority,
    wishlist_reminder: 'medium' as NotificationPriority,
    reading_reminder: 'medium' as NotificationPriority,
    recommendation: 'low' as NotificationPriority,
    system_update: 'high' as NotificationPriority
  };

  return priorities[type];
}