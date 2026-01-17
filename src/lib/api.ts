// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Generic fetch wrapper with auth
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401/403 authentication errors
  if (response.status === 401 || response.status === 403) {
    // Clear invalid token
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Only throw auth error if we're not on login/register endpoints
    if (!endpoint.includes('/login') && !endpoint.includes('/registration')) {
      window.location.href = '/login';
      throw new Error('Authentication required. Please log in.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.detail || error.error || 'Request failed');
  }

  return response.json();
}

// Auth Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  key?: string;
  access?: string;
  refresh?: string;
  user: User;
}

// Relief Types
export interface ReliefSite {
  id: number;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  coordinates?: string;
  status: 'open' | 'full' | 'completed';
  capacity?: number;
  current_occupancy?: number;
  contact_phone?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
  // Optional fields from serializer
  tasks?: any[];
  pin_status?: string;
  google_maps_url?: string;
  google_maps_directions_url?: string;
}

export interface Task {
  id: number;
  site: number;
  site_name?: string;
  title: string;
  description: string;
  category: 'medical' | 'logistics' | 'food' | 'shelter' | 'transport' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  volunteers_needed: number;
  volunteers_signed_up: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface Volunteer {
  id: number;
  task: number;
  user?: User;
  name: string;
  email: string;
  phone?: string;
  cancel_token: string;
  signed_up_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_sites: number;
  active_sites: number;
  total_tasks: number;
  open_tasks: number;
  total_volunteers: number;
  tasks_by_priority: Record<string, number>;
  tasks_by_category: Record<string, number>;
}

// Auth API
export const authApi = {
  register: (data: RegisterData) =>
    fetchWithAuth<AuthResponse>('/api/accounts/registration/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (credentials: LoginCredentials) =>
    fetchWithAuth<AuthResponse>('/api/accounts/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: () =>
    fetchWithAuth<User>('/api/accounts/profile/'),

  updateProfile: (data: Partial<User>) =>
    fetchWithAuth<User>('/api/accounts/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { old_password: string; new_password1: string; new_password2: string }) =>
    fetchWithAuth<{ detail: string }>('/api/accounts/password/change/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  googleLogin: (accessToken: string) =>
    fetchWithAuth<AuthResponse>('/api/accounts/google/', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    }),

  facebookLogin: (accessToken: string) =>
    fetchWithAuth<AuthResponse>('/api/accounts/facebook/', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    }),
};

// Relief Sites API
export const reliefApi = {
  getSites: () =>
    fetchWithAuth<ReliefSite[]>('/api/relief/sites/'),

  getSite: (id: number) =>
    fetchWithAuth<ReliefSite>(`/api/relief/sites/${id}/`),

  createSite: (data: Partial<ReliefSite>) =>
    fetchWithAuth<ReliefSite>('/api/relief/sites/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSite: (id: number, data: Partial<ReliefSite>) =>
    fetchWithAuth<ReliefSite>(`/api/relief/sites/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSite: (id: number) =>
    fetchWithAuth<void>(`/api/relief/sites/${id}/`, {
      method: 'DELETE',
    }),
};

// Tasks API
export const tasksApi = {
  getTasks: (siteId?: number) =>
    siteId
      ? fetchWithAuth<Task[]>(`/api/relief/sites/${siteId}/tasks/`)
      : fetchWithAuth<Task[]>('/api/relief/tasks/'),

  getTask: (id: number) =>
    fetchWithAuth<Task>(`/api/relief/tasks/${id}/`),

  createTask: (siteId: number, data: Partial<Task>) =>
    fetchWithAuth<Task>(`/api/relief/sites/${siteId}/tasks/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (id: number, data: Partial<Task>) =>
    fetchWithAuth<Task>(`/api/relief/tasks/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTask: (id: number) =>
    fetchWithAuth<void>(`/api/relief/tasks/${id}/`, {
      method: 'DELETE',
    }),

  signUp: (taskId: number) =>
    fetchWithAuth<Volunteer>(`/api/relief/tasks/${taskId}/signup/`, {
      method: 'POST',
    }),

  volunteerJoin: (taskId: number, data: { name: string; email: string; phone?: string }) =>
    fetchWithAuth<Volunteer>(`/api/relief/tasks/${taskId}/join/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  volunteerCancel: (token: string) =>
    fetchWithAuth<{ detail: string }>(`/api/relief/volunteer/cancel/${token}/`, {
      method: 'POST',
    }),
};

// Map API
export const mapApi = {
  getSites: () =>
    fetchWithAuth<ReliefSite[]>('/api/map/sites/'),
};

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    fetchWithAuth<DashboardStats>('/api/dashboard/'),

  markTaskCompleted: (taskId: number) =>
    fetchWithAuth<Task>(`/api/dashboard/task/${taskId}/complete/`, {
      method: 'POST',
    }),

  exportVolunteers: () =>
    fetch(`${API_BASE_URL}/api/dashboard/export/volunteers/`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }).then((res) => res.blob()),
};