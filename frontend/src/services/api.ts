import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://teamtaskmanagerethara-fnhmeedjd7dfd0h4.westindia-01.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────
export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface AuthResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export const authApi = {
  login: (data: AuthRequest) => api.post<AuthResponse>('/auth/login', data),
  signup: (data: RegisterRequest) => api.post<AuthResponse>('/auth/signup', data),
};

// ─── Dashboard ───────────────────────────────────────────
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
};

// ─── Projects ────────────────────────────────────────────
export interface ProjectDto {
  id: number | null;
  name: string;
  description: string;
  createdById: number | null;
  createdByName: string | null;
  createdAt: string | null;
}

export const projectsApi = {
  getAll: () => api.get<ProjectDto[]>('/projects'),
  getById: (id: number) => api.get<ProjectDto>(`/projects/${id}`),
  create: (data: Partial<ProjectDto>) => api.post<ProjectDto>('/projects', data),
};

// ─── Tasks ───────────────────────────────────────────────
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface SubtaskDto {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  taskId: number;
  assignedToId: number | null;
  assignedToName: string | null;
  createdById: number | null;
  createdByName: string | null;
  createdAt: string | null;
}

export interface TaskDto {
  id: number | null;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  projectId: number | null;
  projectName: string | null;
  assignedToId: number | null;
  assignedToName: string | null;
  createdById: number | null;
  createdByName: string | null;
  createdAt: string | null;
  subtasks?: SubtaskDto[];
}

export const tasksApi = {
  getByProject: (projectId: number) => api.get<TaskDto[]>(`/tasks/project/${projectId}`),
  getById: (id: number) => api.get<TaskDto>(`/tasks/${id}`),
  getMyTasks: () => api.get<TaskDto[]>('/tasks/my-tasks'),
  create: (data: Partial<TaskDto>) => api.post<TaskDto>('/tasks', data),
  updateStatus: (id: number, status: TaskStatus) =>
    api.patch<TaskDto>(`/tasks/${id}/status`, null, { params: { status } }),
};

export const subtasksApi = {
  getByTask: (taskId: number) => api.get<SubtaskDto[]>(`/subtasks/task/${taskId}`),
  getByUser: (userId: number) => api.get<SubtaskDto[]>(`/subtasks/user/${userId}`),
  getMySubtasks: () => api.get<SubtaskDto[]>('/subtasks/my-subtasks'),
  getById: (id: number) => api.get<SubtaskDto>(`/subtasks/${id}`),
  create: (taskId: number, data: Partial<SubtaskDto>) => api.post<SubtaskDto>(`/subtasks/task/${taskId}`, data),
  updateStatus: (id: number, status: TaskStatus) =>
    api.patch<SubtaskDto>(`/subtasks/${id}/status`, null, { params: { status } }),
  delete: (id: number) => api.delete<void>(`/subtasks/${id}`),
};

// ─── Users (Team) ────────────────────────────────────────
export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: string;
}

export const usersApi = {
  getAll: () => api.get<UserDto[]>('/users'),
};

export default api;
