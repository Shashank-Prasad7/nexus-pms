import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Project, Task, TaskPriority, TaskStatus } from '../types';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
  onOpenEditProject: (project: Project) => void;
  onOpenDeleteProject: (project: Project) => void;
  onOpenCreateTask: (projectId: string) => void;
  onOpenEditTask: (task: Task) => void;
  onOpenDeleteTask: (task: Task) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  onBack,
  onOpenEditProject,
  onOpenDeleteProject,
  onOpenCreateTask,
  onOpenEditTask,
  onOpenDeleteTask,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task filtering within project
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProjectById(projectId);
      if (res.success && res.data) {
        setProject(res.data);
        setTasks(res.data.tasks || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.updateTask(task.id, { status: newStatus });
      fetchProjectDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  if (loading && !project) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--accent-indigo)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--status-danger)', marginBottom: '1rem' }}>{error || 'Project not found.'}</p>
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>
      </div>
    );
  }

  // Filter tasks locally
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = !search || task.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Navigation Back Link */}
      <div>
        <button
          onClick={onBack}
          className="btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Projects</span>
        </button>
      </div>

      {/* Project Overview Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{project.name}</h2>
              <StatusBadge status={project.status} />
            </div>
            <p style={{ color: 'var(--text-muted)', maxWidth: '700px', lineHeight: 1.6 }}>
              {project.description || 'No description provided for this project.'}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => onOpenEditProject(project)} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
              <Edit2 size={15} />
              <span>Edit</span>
            </button>
            <button onClick={() => onOpenDeleteProject(project)} className="btn btn-danger" style={{ fontSize: '0.8125rem' }}>
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Project Metadata Stats Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
              Start Date
            </span>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={14} color="var(--accent-indigo)" />
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not Set'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
              Target Deadline
            </span>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={14} color="var(--accent-purple)" />
              {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not Set'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
              Tasks Progress
            </span>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent-cyan)' }}>
              {completedTasks} / {totalTasks} Completed ({progressPercent}%)
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
              Created
            </span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Section for this Project */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Project Tasks</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Manage individual deliverables under {project.name}
            </p>
          </div>
          <button onClick={() => onOpenCreateTask(project.id)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Task to Project</span>
          </button>
        </div>

        {/* Task Filters */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search tasks by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="select-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.875rem', minWidth: '130px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              className="select-field"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ fontSize: '0.875rem', minWidth: '130px' }}
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckSquare size={40} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>No tasks found</p>
            <p style={{ fontSize: '0.8125rem' }}>Add your first task to start tracking deliverables.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="glass-card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={task.status === 'COMPLETED'}
                    onChange={() => handleToggleTaskStatus(task)}
                    style={{
                      width: 20,
                      height: 20,
                      accentColor: 'var(--accent-indigo)',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <h4
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: task.status === 'COMPLETED' ? 'var(--text-faint)' : 'var(--text-main)',
                        textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                      }}
                    >
                      {task.name}
                    </h4>
                    {task.description && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {task.dueDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Calendar size={13} />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => onOpenEditTask(task)}
                      className="btn-ghost"
                      style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
                      title="Edit task"
                    >
                      <Edit2 size={15} color="var(--text-muted)" />
                    </button>
                    <button
                      onClick={() => onOpenDeleteTask(task)}
                      className="btn-ghost"
                      style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
                      title="Delete task"
                    >
                      <Trash2 size={15} color="var(--status-danger)" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
