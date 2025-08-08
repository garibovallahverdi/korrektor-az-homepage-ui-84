
import { Endpoints } from './endpoints';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  email: string;
  fullname: string;
  username: string;
  plan: string;
}

export interface TextCheckRequest {
  text: string;
}

export interface TextCheckResponse {
  corrected_text: {
    errors: TextError[];
    output_sentence: string;
  };
}

export interface TextError {
  type: string;
  original_fragment: string;
  start_index: number;
  end_index: number;
  explanation: string;
  suggestions: string[];
}

export interface Suggestion {
  word: string;
  suggestions: string[];
  position: number;
  type: string;
}

// Custom API Error class
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
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

    // Response body'yi her durumda parse et
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = {};
    }

    if (!response.ok) {
      if (response.status === 401) {
        try {
          await this.refreshToken();
          // Retry the request with new token
          return this.request<T>(url, options);
        } catch (refreshError) {
          // Refresh token de başarısız olursa, orijinal hatayı fırlat
          throw new ApiError(
            `HTTP error! status: ${response.status}`,
            response.status,
            responseData
          );
        }
      }
      
      // API Error olarak fırlat - response data dahil
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        responseData
      );
    }

    return responseData;
  }


  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>(Endpoints.login, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      return response;
    } catch (error) {
      console.error('Login API Error:', error);
      throw error; // Re-throw to be handled by AuthContext
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>(Endpoints.register, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      return response;
    } catch (error) {
      console.error('Register API Error:', error);
      throw error; // Re-throw to be handled by AuthContext
    }
  }

  async verifyAccount(token: string, verifyToken: string): Promise<void> {
    const url = Endpoints.verifyAccount(token, verifyToken);
    const response = await fetch(url, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const responseData = await response.json().catch(() => ({}));
      throw new ApiError(
        `Doğrulama başarısız! Status: ${response.status}`,
        response.status,
        responseData
      );
    }
 
    return response.json();
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

async googleAuth(code: string): Promise<AuthResponse> {
  try {
    const response = await this.request<AuthResponse>(Endpoints.googleAuth, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    // Tokenları kaydet
    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    
    return response;
  } catch (error) {
    console.error('Google Auth API Error:', error);
    throw error;
  }
}

    async passwordResetRequest(email:string):Promise<any>{
    const response = await fetch(Endpoints.passwordResetRequest,{
      method:"POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email}),

    })

    console.log(await response.json(),"xetaaa");
    
    return response
  }

    async passwordResetConfirm(token:string, new_password :string, re_new_password :string):Promise<any>{
    const response = await fetch(Endpoints.passwordResetConfirm,{
      method:"POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({token, new_password , re_new_password }),

    })

    console.log(await response.json(),"xetaaa");
    
    return response
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

  async updateUser(data: {
    fullname?: string;
    username?: string;
    email?: string;
    plan?: string;
  }): Promise<User> {
    return this.request<User>(Endpoints.me, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async checkText(text: string): Promise<TextCheckResponse> {
    return this.request<TextCheckResponse>(Endpoints.checkText, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
}

export const apiService = new ApiService();