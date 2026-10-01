// Web Notification Manager & 10-Hour Proactive AI Prompt Scheduler
// Generates persistent Notification ID and handles real browser push notifications

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  type: 'system' | 'ai-prompt' | 'feedback' | 'video' | 'mido-orb';
}

const NOTIFICATION_DEVICE_ID_KEY = 'mido_device_notification_id';
const LAST_PROACTIVE_PROMPT_KEY = 'mido_last_proactive_prompt_time';
const NOTIFICATIONS_STORAGE_KEY = 'mido_in_app_notifications_history';
const PROACTIVE_INTERVAL_MS = 10 * 60 * 60 * 1000; // 10 Hours

class NotificationService {
  private deviceId: string = '';
  private listeners: ((notifs: AppNotification[]) => void)[] = [];

  constructor() {
    this.initDeviceId();
    this.checkAndTriggerProactiveNotification();
    // Schedule check every minute
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.checkAndTriggerProactiveNotification();
      }, 60 * 1000);
    }
  }

  public initDeviceId(): string {
    if (typeof window === 'undefined') return 'MIDO-NOTIF-SRV-001';
    let id = localStorage.getItem(NOTIFICATION_DEVICE_ID_KEY);
    if (!id) {
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timeHex = Date.now().toString(36).toUpperCase();
      id = `MIDO-NOTIF-${timeHex}-${rand}`;
      localStorage.setItem(NOTIFICATION_DEVICE_ID_KEY, id);
    }
    this.deviceId = id;
    return id;
  }

  public getDeviceId(): string {
    if (!this.deviceId) {
      return this.initDeviceId();
    }
    return this.deviceId;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        this.sendRealNotification(
          "Notifications Enabled! 🔔",
          `Device ID: ${this.getDeviceId()} - You will receive AI updates & proactive problem solver prompts every 10h.`
        );
      }
      return perm;
    } catch (e) {
      console.warn("Notification permission request failed:", e);
      return 'denied';
    }
  }

  public sendRealNotification(title: string, body: string, type: AppNotification['type'] = 'system'): boolean {
    const notifItem: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title,
      body,
      timestamp: Date.now(),
      read: false,
      type,
    };

    this.saveInAppNotification(notifItem);

    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: 'mido-ai-studio-' + Date.now(),
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      } catch (e) {
        console.warn("Native Notification failed, stored in-app:", e);
      }
    }
    return false;
  }

  public checkAndTriggerProactiveNotification() {
    if (typeof window === 'undefined') return;
    const lastTimeStr = localStorage.getItem(LAST_PROACTIVE_PROMPT_KEY);
    const now = Date.now();
    const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;

    if (!lastTime || now - lastTime >= PROACTIVE_INTERVAL_MS) {
      // Trigger the 10-hour proactive AI prompt
      localStorage.setItem(LAST_PROACTIVE_PROMPT_KEY, now.toString());
      
      this.sendRealNotification(
        "Wanna talk to AI to solve problems? 🤖💡",
        "Mido AI is ready! Open your studio to brainstorm, solve coding bugs, edit videos, or create next-gen ideas.",
        'ai-prompt'
      );
    }
  }

  public getNextProactivePromptTime(): { hoursLeft: number; minutesLeft: number } {
    if (typeof window === 'undefined') return { hoursLeft: 10, minutesLeft: 0 };
    const lastTimeStr = localStorage.getItem(LAST_PROACTIVE_PROMPT_KEY);
    const now = Date.now();
    const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : now;
    const elapsed = now - lastTime;
    const remainingMs = Math.max(0, PROACTIVE_INTERVAL_MS - elapsed);
    const totalMinutes = Math.floor(remainingMs / (60 * 1000));
    return {
      hoursLeft: Math.floor(totalMinutes / 60),
      minutesLeft: totalMinutes % 60,
    };
  }

  public triggerTest10HourPrompt(): boolean {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_PROACTIVE_PROMPT_KEY, Date.now().toString());
    }
    return this.sendRealNotification(
      "Wanna talk to AI to solve problems? 🤖💡",
      "Mido AI is ready! Open your studio to brainstorm, solve coding bugs, edit videos, or create next-gen ideas.",
      'ai-prompt'
    );
  }

  public getHistory(): AppNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveInAppNotification(notif: AppNotification) {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      const updated = [notif, ...history].slice(0, 50);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      this.notifyListeners(updated);
    } catch (e) {
      console.warn("Failed to save in-app notification:", e);
    }
  }

  public markAllAsRead() {
    if (typeof window === 'undefined') return;
    const history = this.getHistory().map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(history));
    this.notifyListeners(history);
  }

  public clearAll() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    this.notifyListeners([]);
  }

  public subscribe(fn: (notifs: AppNotification[]) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notifyListeners(notifs: AppNotification[]) {
    this.listeners.forEach(fn => fn(notifs));
  }
}

export const notificationService = new NotificationService();
