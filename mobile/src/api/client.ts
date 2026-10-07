import { Platform } from 'react-native';
import { getToken, saveToken, deleteToken } from '../utils/storage';
import { DashboardData, Project, Task, User } from '../types';

// Default host: Android emulator uses 10.0.2.2, iOS / Web uses localhost
// You can also change this to your computer's LAN IP (e.g. http://192.168.1.X:5000/api)
export let API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});

export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
};

class MobileApiClient {
  private onUnauthorizedCallback: (() => void) | null = null;

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        await deleteToken();
        if (this.onUnauthorizedCallback) {
          this.onUnauthorizedCallback();
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Session expired. Please log in again.');
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data.errors && Array.isArray(data.errors)
            ? data.errors.map((e: any) => e.message).join(', ')
            : data.message || `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return data;
    } catch (error: any) {
      if (
        error.message?.includes('Network request failed') ||
        error.message?.includes('Failed to fetch')
      ) {
        throw new Error(
          'No network connection or backend server is unreachable. Please verify your connection.'
        );
      }
      throw error;
    }
  }

  async register(data: { name: string; email: string; password: string }) {
    const res = await this.request<{ success: boolean; token: string; user: User }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (res.token) await saveToken(res.token);
    return res;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) await saveToken(res.token);
    return res;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      await deleteToken();
    }
  }

  async getMe() {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  async getProjects(params?: { search?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: Project[] }>(`/projects${queryString}`);
  }

  async getProjectById(id: string) {
    return this.request<{ success: boolean; data: Project }>(`/projects/${id}`);
  }

  async createProject(data: {
    name: string;
    description?: string;
    status?: string;
    startDate?: string | null;
    endDate?: string | null;
  }) {
    return this.request<{ success: boolean; data: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      status?: string;
      startDate?: string | null;
      endDate?: string | null;
    }
  ) {
    return this.request<{ success: boolean; data: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ success: boolean; message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getTasks(params?: {
    projectId?: string;
    search?: string;
    status?: string;
    priority?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.projectId) query.append('projectId', params.projectId);
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.priority && params.priority !== 'ALL') query.append('priority', params.priority);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: Task[] }>(`/tasks${queryString}`);
  }

  async getTaskById(id: string) {
    return this.request<{ success: boolean; data: Task }>(`/tasks/${id}`);
  }

  async createTask(data: {
    name: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate?: string | null;
    projectId: string;
  }) {
    return this.request<{ success: boolean; data: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      priority?: string;
      status?: string;
      dueDate?: string | null;
      projectId?: string;
    }
  ) {
    return this.request<{ success: boolean; data: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request<{ success: boolean; message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboard() {
    return this.request<{ success: boolean; data: DashboardData }>('/dashboard');
  }
}

export const mobileApi = new MobileApiClient();
