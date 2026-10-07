import { DashboardData, Project, Task, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;
  private onUnauthorizedCallback: (() => void) | null = null;

  constructor() {
    this.token = localStorage.getItem('pms_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('pms_auth_token', token);
    } else {
      localStorage.removeItem('pms_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);

      if (response.status === 401) {
        this.setToken(null);
        if (this.onUnauthorizedCallback) {
          this.onUnauthorizedCallback();
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Session expired. Please log in again.');
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.errors && Array.isArray(data.errors)
            ? data.errors.map((e: any) => `${e.field ? e.field + ': ' : ''}${e.message}`).join(', ')
            : data.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your network connection.');
      }
      throw error;
    }
  }

  // Auth Endpoints
  async register(data: { name: string; email: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe() {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  // Project Endpoints
  async getProjects(params?: { search?: string; status?: string; sortBy?: string; order?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.order) query.append('order', params.order);

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

  // Task Endpoints
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

  // Dashboard Endpoints
  async getDashboard() {
    return this.request<{ success: boolean; data: DashboardData }>('/dashboard');
  }
}

export const api = new ApiClient();
