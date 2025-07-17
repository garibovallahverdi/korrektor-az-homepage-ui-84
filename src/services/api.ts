import { Endpoints } from './endpoints';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface TextCheckRequest {
  text: string;
}

export interface TextCheckResponse {
  original_text: string;
  corrected_text: string;
  suggestions: Suggestion[];
}

export interface Suggestion {
  word: string;
  suggestions: string[];
  position: number;
  type: string;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await this.refreshToken();
        // Retry the request with new token
        return this.request<T>(url, options);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(Endpoints.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(Endpoints.register, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    return response;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await this.request(Endpoints.logout, {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async getMe(): Promise<User> {
    return this.request<User>(Endpoints.me);
  }

  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(Endpoints.tokenRefresh, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.access);
  }

  async checkText(text: string): Promise<TextCheckResponse> {
    return this.request<TextCheckResponse>(Endpoints.checkText, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
}

export const apiService = new ApiService();