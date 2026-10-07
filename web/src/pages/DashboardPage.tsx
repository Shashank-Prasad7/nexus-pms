import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { DashboardData, Project, Task } from '../types';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  CheckCircle2,
  Calendar,
  ArrowRight,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateToProjects: () => void;
  onNavigateToTasks: () => void;
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToProjects,
  onNavigateToTasks,
  onSelectProject,
  onOpenNewProject,
  onOpenNewTask,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.updateTask(task.id, { status: newStatus });
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: 'var(--accent-indigo)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalProjects: 0,
    projectsInProgress: 0,
    projectsCompleted: 0,
    projectsNotStarted: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'var(--status-danger-bg)',
            color: 'var(--status-danger)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Projects */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Projects
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {metrics.totalProjects}
              </h3>
            </div>
            <div
              style={{
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-indigo)',
              }}
            >
              <FolderKanban size={22} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--status-inprogress)', fontWeight: 600 }}>
              {metrics.projectsInProgress} In Progress
            </span>
            {' • '}
            <span style={{ color: 'var(--status-completed)', fontWeight: 600 }}>
              {metrics.projectsCompleted} Done
            </span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Tasks
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {metrics.totalTasks}
              </h3>
            </div>
            <div
              style={{
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(139, 92, 246, 0.15)',
                color: 'var(--accent-purple)',
              }}
            >
              <CheckSquare size={22} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Completion rate:{' '}
            <span style={{ color: '#ffffff', fontWeight: 700 }}>
              {metrics.completionRate}%
            </span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Completed Tasks
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--status-completed)' }}>
                {metrics.completedTasks}
              </h3>
            </div>
            <div
              style={{
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-completed-bg)',
                color: 'var(--status-completed)',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            All finished task goals
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Pending Tasks
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--status-pending)' }}>
                {metrics.pendingTasks}
              </h3>
            </div>
            <div
              style={{
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-pending-bg)',
                color: 'var(--status-pending)',
              }}
            >
              <Clock size={22} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Waiting for execution
          </div>
        </div>

        {/* Projects In Progress */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Projects
              </p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--status-inprogress)' }}>
                {metrics.projectsInProgress}
              </h3>
            </div>
            <div
              style={{
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-inprogress-bg)',
                color: 'var(--status-inprogress)',
              }}
            >
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Currently in motion
          </div>
        </div>
      </div>

      {/* Main Split: Recent Projects and Upcoming Tasks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Projects Section */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Projects</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Active project milestones and task completion
              </p>
            </div>
            <button
              onClick={onNavigateToProjects}
              className="btn btn-ghost"
              style={{ fontSize: '0.8125rem', gap: '0.375rem' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {(!data?.recentProjects || data.recentProjects.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '1rem' }}>No projects created yet.</p>
              <button onClick={onOpenNewProject} className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
                <Plus size={16} />
                <span>Create Your First Project</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {data.recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{project.name}</h4>
                    <StatusBadge status={project.status} />
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <span>{project.completedTasks} / {project.totalTasks} Tasks Done</span>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>{project.progress}%</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${project.progress}%`,
                          background: 'var(--accent-gradient)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority / Upcoming Tasks Section */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Upcoming Tasks</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Action items requiring your attention
              </p>
            </div>
            <button
              onClick={onNavigateToTasks}
              className="btn btn-ghost"
              style={{ fontSize: '0.8125rem', gap: '0.375rem' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {(!data?.upcomingTasks || data.upcomingTasks.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '1rem' }}>No pending tasks! You are all caught up.</p>
              <button onClick={onOpenNewTask} className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
                <Plus size={16} />
                <span>Create a Task</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {data.upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: '0.875rem 1rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <input
                      type="checkbox"
                      checked={task.status === 'COMPLETED'}
                      onChange={() => handleToggleTaskStatus(task)}
                      style={{
                        width: 18,
                        height: 18,
                        accentColor: 'var(--accent-indigo)',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: task.status === 'COMPLETED' ? 'var(--text-faint)' : 'var(--text-main)',
                          textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {task.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {task.project?.name || 'Project'}
                        {task.dueDate && (
                          <span style={{ marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <PriorityBadge priority={task.priority} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
