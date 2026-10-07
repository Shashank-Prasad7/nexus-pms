import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TasksPage } from './pages/TasksPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectModal } from './components/ProjectModal';
import { TaskModal } from './components/TaskModal';
import { ConfirmModal } from './components/ConfirmModal';
import { api } from './api/client';
import { Project, Task, ProjectStatus, TaskPriority, TaskStatus } from './types';

export const App: React.FC = () => {
  const { user, loading } = useAuth();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'projects' | 'tasks'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Project list (for modals, selectors)
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskProjectId, setDefaultTaskProjectId] = useState<string | undefined>(undefined);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'project' | 'task';
    id: string;
    title: string;
  } | null>(null);

  // Toast / notification banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load projects list for modal dropdowns
  useEffect(() => {
    if (user) {
      api
        .getProjects()
        .then((res) => {
          if (res.success && res.data) {
            setProjectsList(res.data);
          }
        })
        .catch(() => {});
    }
  }, [user, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Project Actions
  const handleSaveProject = async (data: {
    name: string;
    description?: string;
    status: ProjectStatus;
    startDate?: string | null;
    endDate?: string | null;
  }) => {
    if (editingProject) {
      await api.updateProject(editingProject.id, data);
      showToast('Project updated successfully');
    } else {
      await api.createProject(data);
      showToast('Project created successfully');
    }
    setProjectModalOpen(false);
    setEditingProject(null);
    handleRefresh();
  };

  // Task Actions
  const handleSaveTask = async (data: {
    name: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    projectId: string;
  }) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, data);
      showToast('Task updated successfully');
    } else {
      await api.createTask(data);
      showToast('Task created successfully');
    }
    setTaskModalOpen(false);
    setEditingTask(null);
    handleRefresh();
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'project') {
        await api.deleteProject(itemToDelete.id);
        showToast('Project deleted successfully');
        if (selectedProjectId === itemToDelete.id) {
          setSelectedProjectId(null);
        }
      } else {
        await api.deleteTask(itemToDelete.id);
        showToast('Task deleted successfully');
      }
      handleRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete operation failed', 'error');
    } finally {
      setItemToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: '3px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: 'var(--accent-indigo)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.5rem',
            }}
          />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Nexus PMS</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Initializing application session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 200,
            fontSize: '0.875rem',
            fontWeight: 600,
            animation: 'slideUp 0.25s ease-out',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedProjectId(null);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Header
          title={
            selectedProjectId
              ? 'Project Details'
              : currentTab === 'dashboard'
              ? 'Workspace Dashboard'
              : currentTab === 'projects'
              ? 'Projects'
              : 'Tasks'
          }
          subtitle={
            selectedProjectId
              ? 'Track progress and project deliverables'
              : currentTab === 'dashboard'
              ? `Welcome back, ${user.name}`
              : currentTab === 'projects'
              ? 'Organize, manage and deliver your initiatives'
              : 'Track and complete items across all projects'
          }
          onOpenSidebar={() => setSidebarOpen(true)}
          onRefresh={handleRefresh}
          onNewProject={() => {
            setEditingProject(null);
            setProjectModalOpen(true);
          }}
          onNewTask={() => {
            setEditingTask(null);
            setDefaultTaskProjectId(selectedProjectId || undefined);
            setTaskModalOpen(true);
          }}
        />

        <div className="content-body" key={refreshTrigger}>
          {selectedProjectId ? (
            <ProjectDetailPage
              projectId={selectedProjectId}
              onBack={() => setSelectedProjectId(null)}
              onOpenEditProject={(project) => {
                setEditingProject(project);
                setProjectModalOpen(true);
              }}
              onOpenDeleteProject={(project) => {
                setItemToDelete({
                  type: 'project',
                  id: project.id,
                  title: project.name,
                });
                setDeleteConfirmOpen(true);
              }}
              onOpenCreateTask={(pId) => {
                setEditingTask(null);
                setDefaultTaskProjectId(pId);
                setTaskModalOpen(true);
              }}
              onOpenEditTask={(task) => {
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
              onOpenDeleteTask={(task) => {
                setItemToDelete({
                  type: 'task',
                  id: task.id,
                  title: task.name,
                });
                setDeleteConfirmOpen(true);
              }}
            />
          ) : currentTab === 'dashboard' ? (
            <DashboardPage
              onNavigateToProjects={() => setCurrentTab('projects')}
              onNavigateToTasks={() => setCurrentTab('tasks')}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onOpenNewProject={() => {
                setEditingProject(null);
                setProjectModalOpen(true);
              }}
              onOpenNewTask={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
            />
          ) : currentTab === 'projects' ? (
            <ProjectsPage
              onSelectProject={(id) => setSelectedProjectId(id)}
              onOpenCreateModal={() => {
                setEditingProject(null);
                setProjectModalOpen(true);
              }}
              onOpenEditModal={(project) => {
                setEditingProject(project);
                setProjectModalOpen(true);
              }}
              onOpenDeleteModal={(project) => {
                setItemToDelete({
                  type: 'project',
                  id: project.id,
                  title: project.name,
                });
                setDeleteConfirmOpen(true);
              }}
            />
          ) : (
            <TasksPage
              projects={projectsList}
              onOpenCreateTask={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
              onOpenEditTask={(task) => {
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
              onOpenDeleteTask={(task) => {
                setItemToDelete({
                  type: 'task',
                  id: task.id,
                  title: task.name,
                });
                setDeleteConfirmOpen(true);
              }}
              onSelectProject={(id) => {
                setSelectedProjectId(id);
              }}
            />
          )}
        </div>
      </main>

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSaveProject}
        initialData={editingProject}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        projects={projectsList}
        defaultProjectId={defaultTaskProjectId}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${itemToDelete?.type === 'project' ? 'Project' : 'Task'}`}
        message={`Are you sure you want to delete "${itemToDelete?.title}"? ${
          itemToDelete?.type === 'project'
            ? 'This will also permanently delete all tasks associated with this project.'
            : 'This action cannot be undone.'
        }`}
        confirmLabel="Yes, Delete"
      />
    </div>
  );
};
