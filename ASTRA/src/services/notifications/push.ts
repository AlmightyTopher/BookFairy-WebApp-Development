/**
 * Web Push Notification Service
 *
 * Handles push notification registration, delivery, and management
 * for the BookFairy application with fairy-themed messaging
 */

import type { Notification, NotificationPreferences, NotificationType } from '@/types';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  timestamp?: number;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushNotificationConfig {
  vapid_public_key: string;
  service_worker_path: string;
  notification_icon: string;
  notification_badge: string;
}

export interface SubscriptionResult {
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
  fairy_message: string;
}

export interface NotificationPermissionResult {
  permission: NotificationPermission;
  supported: boolean;
  fairy_message: string;
}

export interface PushError {
  error: string;
  message: string;
  fairy_message: string;
  code?: string;
}

export class PushNotificationService {
  private vapidPublicKey: string = '';
  private serviceWorkerPath: string = '/sw.js';
  private notificationIcon: string = '/assets/fairy-notification-icon.png';
  private notificationBadge: string = '/assets/fairy-badge.png';
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Initialize push notification service
   */
  async initialize(config: PushNotificationConfig): Promise<{ success: boolean; supported: boolean }> {
    try {
      this.vapidPublicKey = config.vapid_public_key;
      this.serviceWorkerPath = config.service_worker_path;
      this.notificationIcon = config.notification_icon;
      this.notificationBadge = config.notification_badge;

      // Check if service workers and notifications are supported
      if (!this.isSupported()) {
        return { success: false, supported: false };
      }

      // Register service worker
      await this.registerServiceWorker();

      return { success: true, supported: true };
    } catch (error) {
      throw this.createPushError(
        'initialization_failed',
        error instanceof Error ? error.message : 'Push notification initialization failed',
        'Oh honey, I\'m having trouble setting up notifications for you!'
      );
    }
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Get current notification permission status
   */
  async getPermissionStatus(): Promise<NotificationPermissionResult> {
    if (!this.isSupported()) {
      return {
        permission: 'denied',
        supported: false,
        fairy_message: 'Well sugar, your browser doesn\'t support notifications. That\'s okay, I\'ll find other ways to help!'
      };
    }

    const permission = Notification.permission;

    const messages = {
      'granted': 'Perfect! I can send you magical notifications when something exciting happens!',
      'denied': 'Oh honey, notifications are turned off. You can enable them in your browser settings if you\'d like!',
      'default': 'I\'d love to send you helpful notifications! Mind if I ask for permission?'
    };

    return {
      permission,
      supported: true,
      fairy_message: messages[permission]
    };
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermissionResult> {
    try {
      if (!this.isSupported()) {
        return {
          permission: 'denied',
          supported: false,
          fairy_message: 'Well bless your heart, your browser doesn\'t support notifications!'
        };
      }

      const permission = await Notification.requestPermission();

      const messages = {
        'granted': 'Wonderful! I can now send you helpful notifications. Thanks, honey!',
        'denied': 'That\'s perfectly fine, sugar! I\'ll still be here whenever you need me.',
        'default': 'Hmm, something went sideways. Let\'s try that again!'
      };

      return {
        permission,
        supported: true,
        fairy_message: messages[permission]
      };
    } catch (error) {
      throw this.createPushError(
        'permission_request_failed',
        error instanceof Error ? error.message : 'Permission request failed',
        'Oh honey, I had trouble asking for notification permission!'
      );
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<SubscriptionResult> {
    try {
      // Check permission first
      const permissionResult = await this.getPermissionStatus();

      if (permissionResult.permission !== 'granted') {
        const requestResult = await this.requestPermission();
        if (requestResult.permission !== 'granted') {
          return {
            success: false,
            fairy_message: 'That\'s okay, honey! You can always enable notifications later if you change your mind.'
          };
        }
      }

      // Ensure service worker is registered
      if (!this.registration) {
        await this.registerServiceWorker();
      }

      if (!this.registration) {
        throw new Error('Service worker registration failed');
      }

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Convert to our format
      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      return {
        success: true,
        subscription: pushSubscription,
        fairy_message: 'Perfect! I\'m all set up to send you helpful notifications, sugar!'
      };
    } catch (error) {
      throw this.createPushError(
        'subscription_failed',
        error instanceof Error ? error.message : 'Push subscription failed',
        'Well honey, I had trouble setting up notifications. Let\'s try again later!'
      );
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<{ success: boolean; fairy_message: string }> {
    try {
      if (!this.registration) {
        return {
          success: true,
          fairy_message: 'You weren\'t subscribed to notifications anyway, honey!'
        };
      }

      const subscription = await this.registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      return {
        success: true,
        fairy_message: 'All done! I won\'t send you notifications anymore, but I\'ll still be here when you need me!'
      };
    } catch (error) {
      throw this.createPushError(
        'unsubscription_failed',
        error instanceof Error ? error.message : 'Unsubscription failed',
        'Oh honey, I had trouble turning off notifications!'
      );
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        return null;
      }

      const subscription = await this.registration.pushManager.getSubscription();

      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Show local notification (for testing or immediate notifications)
   */
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (Notification.permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || this.notificationIcon,
        badge: payload.badge || this.notificationBadge,
        image: payload.image,
        tag: payload.tag,
        data: payload.data,
        timestamp: payload.timestamp || Date.now(),
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        actions: payload.actions?.map(action => ({
          action: action.action,
          title: action.title,
          icon: action.icon
        }))
      };

      if (this.registration) {
        // Use service worker to show notification (recommended)
        await this.registration.showNotification(payload.title, options);
      } else {
        // Fallback to direct notification
        new Notification(payload.title, options);
      }
    } catch (error) {
      throw this.createPushError(
        'local_notification_failed',
        error instanceof Error ? error.message : 'Local notification failed',
        'Oh honey, I couldn\'t show that notification right now!'
      );
    }
  }

  /**
   * Create notification payload from BookFairy notification
   */
  createNotificationPayload(notification: Notification): NotificationPayload {
    const typeConfig = this.getNotificationTypeConfig(notification.type);

    return {
      title: notification.title,
      body: notification.fairy_message || notification.message,
      icon: typeConfig.icon,
      badge: this.notificationBadge,
      tag: notification.type,
      data: {
        notification_id: notification.id,
        type: notification.type,
        user_id: notification.user_id,
        url: this.getNotificationUrl(notification)
      },
      actions: typeConfig.actions,
      timestamp: new Date(notification.delivery_timestamp).getTime(),
      requireInteraction: notification.priority === 'high',
      silent: notification.priority === 'low'
    };
  }

  /**
   * Handle notification click events
   */
  setupNotificationHandlers(): void {
    if (!this.registration) return;

    // Handle notification click
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        this.handleNotificationClick(event.data.notification);
      }
    });

    // Handle notification close
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLOSE') {
        this.handleNotificationClose(event.data.notification);
      }
    });
  }

  /**
   * Test push notification functionality
   */
  async testNotification(): Promise<{ success: boolean; fairy_message: string }> {
    try {
      const testPayload: NotificationPayload = {
        title: 'BookFairy Test Notification',
        body: 'Well hello there, sugar! This is just a test to make sure everything\'s working perfectly!',
        icon: this.notificationIcon,
        badge: this.notificationBadge,
        tag: 'test',
        data: { test: true },
        timestamp: Date.now()
      };

      await this.showLocalNotification(testPayload);

      return {
        success: true,
        fairy_message: 'Perfect! The test notification worked like a charm, honey!'
      };
    } catch (error) {
      return {
        success: false,
        fairy_message: 'Oh honey, the test notification didn\'t work. Let\'s check your settings!'
      };
    }
  }

  // Private helper methods
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register(this.serviceWorkerPath);
        await navigator.serviceWorker.ready;
      } catch (error) {
        throw new Error('Service worker registration failed');
      }
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private getNotificationTypeConfig(type: NotificationType): {
    icon: string;
    actions: NotificationAction[];
  } {
    const configs = {
      book_available: {
        icon: '/assets/icons/book-available.png',
        actions: [
          { action: 'view', title: 'View Book', icon: '/assets/icons/view.png' },
          { action: 'add_to_library', title: 'Add to Library', icon: '/assets/icons/add.png' }
        ]
      },
      wishlist_reminder: {
        icon: '/assets/icons/wishlist.png',
        actions: [
          { action: 'view_wishlist', title: 'View Wishlist', icon: '/assets/icons/list.png' },
          { action: 'dismiss', title: 'Dismiss', icon: '/assets/icons/dismiss.png' }
        ]
      },
      reading_reminder: {
        icon: '/assets/icons/reading.png',
        actions: [
          { action: 'continue_reading', title: 'Continue Reading', icon: '/assets/icons/play.png' },
          { action: 'snooze', title: 'Remind Later', icon: '/assets/icons/snooze.png' }
        ]
      },
      recommendation: {
        icon: '/assets/icons/recommend.png',
        actions: [
          { action: 'view_recommendation', title: 'View Book', icon: '/assets/icons/view.png' },
          { action: 'not_interested', title: 'Not Interested', icon: '/assets/icons/dismiss.png' }
        ]
      },
      system_update: {
        icon: '/assets/icons/system.png',
        actions: [
          { action: 'view_update', title: 'View Details', icon: '/assets/icons/info.png' }
        ]
      }
    };

    return configs[type] || {
      icon: this.notificationIcon,
      actions: []
    };
  }

  private getNotificationUrl(notification: Notification): string {
    const baseUrl = window.location.origin;

    switch (notification.type) {
      case 'book_available':
      case 'recommendation':
        return `${baseUrl}/book/${notification.related_book_id}`;
      case 'wishlist_reminder':
        return `${baseUrl}/wishlist`;
      case 'reading_reminder':
        return `${baseUrl}/library`;
      case 'system_update':
        return `${baseUrl}/settings`;
      default:
        return baseUrl;
    }
  }

  private handleNotificationClick(notification: any): void {
    // Mark notification as read
    // Navigate to appropriate page
    // This would typically interact with your app's routing system
    console.log('Notification clicked:', notification);
  }

  private handleNotificationClose(notification: any): void {
    // Track notification dismissal
    console.log('Notification closed:', notification);
  }

  private createPushError(errorCode: string, message: string, fairyMessage: string): PushError {
    const error = new Error(message) as any;
    error.error = errorCode;
    error.message = message;
    error.fairy_message = fairyMessage;
    return error;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Export convenience functions
export async function initializePushNotifications(config: PushNotificationConfig) {
  return pushNotificationService.initialize(config);
}

export async function requestNotificationPermission() {
  return pushNotificationService.requestPermission();
}

export async function subscribeToPushNotifications() {
  return pushNotificationService.subscribe();
}

export async function unsubscribeFromPushNotifications() {
  return pushNotificationService.unsubscribe();
}

export async function showTestNotification() {
  return pushNotificationService.testNotification();
}

export async function getNotificationSubscription() {
  return pushNotificationService.getSubscription();
}

export function createNotificationFromBookFairy(notification: Notification) {
  return pushNotificationService.createNotificationPayload(notification);
}