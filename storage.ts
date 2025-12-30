
const KV_REST_API_URL = (process.env as any).KV_REST_API_URL;
const KV_REST_API_TOKEN = (process.env as any).KV_REST_API_TOKEN;

/**
 * Lưu ý: Để tính năng này hoạt động, bạn cần:
 * 1. Tạo một Storage KV trên Vercel.
 * 2. Copy 'KV_REST_API_URL' và 'KV_REST_API_TOKEN' vào Environment Variables của project trên Vercel.
 */

export const cloudStorage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
      console.warn("KV Environment variables missing. Falling back to localStorage.");
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : defaultValue;
    }

    try {
      const response = await fetch(`${KV_REST_API_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
      });
      const data = await response.json();
      if (data.result) {
        return JSON.parse(data.result) as T;
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error fetching ${key} from KV:`, error);
      return defaultValue;
    }
  },

  async set(key: string, value: any): Promise<void> {
    // Luôn lưu local để dự phòng (Offline-first)
    localStorage.setItem(key, JSON.stringify(value));

    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return;

    try {
      await fetch(`${KV_REST_API_URL}/set/${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
        body: JSON.stringify(value),
      });
    } catch (error) {
      console.error(`Error saving ${key} to KV:`, error);
    }
  }
};
