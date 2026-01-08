import { HOST } from './config';

export interface UserInfo {
  id: string;
  fullName: string;
  role: string;
  maCuaHang: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserInfo;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${HOST}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();
      
      if (response.ok && data.success && data.token && data.user) {
        // Lưu Token và thông tin User vào LocalStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login Error:', error);
      return {
        success: false,
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Chuyển hướng về trang login
    window.location.href = '#/login';
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getUser: (): UserInfo | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Hàm helper tạo Header chứa Token
  getAuthHeaders: (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }
};