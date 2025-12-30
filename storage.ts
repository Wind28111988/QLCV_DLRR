
// Các biến này được Vite inject từ Environment Variables của Vercel thông qua vite.config.ts
const KV_REST_API_URL = (process.env as any).KV_REST_API_URL;
const KV_REST_API_TOKEN = (process.env as any).KV_REST_API_TOKEN;

/**
 * Dịch vụ lưu trữ Cloud sử dụng Vercel KV (Redis REST API)
 * Giúp đồng bộ dữ liệu giữa Máy tính và Điện thoại.
 */
export const cloudStorage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    // Nếu chưa cấu hình biến môi trường, dùng tạm localStorage
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
      console.warn(`[CloudStorage] Thiếu cấu hình KV cho key: ${key}. Đang sử dụng dữ liệu cục bộ.`);
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : defaultValue;
    }

    try {
      const response = await fetch(`${KV_REST_API_URL}/get/${key}`, {
        headers: { 
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
          'Cache-Control': 'no-cache'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Vercel KV trả về kết quả trong trường 'result'
      if (data.result) {
        // Lưu lại bản local để hỗ trợ offline sau này
        localStorage.setItem(key, data.result);
        return JSON.parse(data.result) as T;
      }
      
      return defaultValue;
    } catch (error) {
      console.error(`[CloudStorage] Lỗi khi tải ${key}:`, error);
      // Nếu lỗi mạng, ưu tiên dùng dữ liệu local cũ
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : defaultValue;
    }
  },

  async set(key: string, value: any): Promise<void> {
    const stringifiedValue = JSON.stringify(value);
    
    // Luôn lưu local để đảm bảo tốc độ phản hồi UI
    localStorage.setItem(key, stringifiedValue);

    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
      return;
    }

    try {
      const response = await fetch(`${KV_REST_API_URL}/set/${key}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: stringifiedValue,
      });

      if (!response.ok) {
        console.error(`[CloudStorage] Không thể lưu ${key} lên Cloud. Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`[CloudStorage] Lỗi kết nối khi lưu ${key}:`, error);
    }
  }
};
