export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  progressPercentage: number;
}

export interface Task {
  id: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt?: string;
  projectId: string;
  userId: string;
  project?: {
    id: string;
    name: string;
    status: ProjectStatus;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  taskStats?: TaskStats;
  tasks?: Task[];
}

export interface DashboardMetrics {
  totalProjects: number;
  projectsInProgress: number;
  projectsCompleted: number;
  projectsNotStarted: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
}

export interface RecentProject {
  id: string;
  name: string;
  status: ProjectStatus;
  updatedAt: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentProjects: RecentProject[];
  upcomingTasks: Task[];
}
