import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Project, Task, TaskPriority, TaskStatus } from '../types';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import {
  Search,
  Plus,
  Calendar,
  Filter,
  Edit2,
  Trash2,
  CheckSquare,
  AlertCircle,
  FolderKanban,
} from 'lucide-react';

interface TasksPageProps {
  projects: Project[];
  onOpenCreateTask: () => void;
  onOpenEditTask: (task: Task) => void;
  onOpenDeleteTask: (task: Task) => void;
  onSelectProject: (projectId: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  projects,
  onOpenCreateTask,
  onOpenEditTask,
  onOpenDeleteTask,
  onSelectProject,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTasks({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        projectId: projectFilter !== 'ALL' ? projectFilter : undefined,
      });
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, projectFilter]);

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.updateTask(task.id, { status: newStatus });
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search and Filters Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.875rem',
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
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <button onClick={onOpenCreateTask} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>

        {/* Filter Dropdowns row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            <Filter size={15} />
            <span>Filters:</span>
          </div>

          {/* Project filter */}
          <select
            className="select-field"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ minWidth: '150px', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '130px', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority filter */}
          <select
            className="select-field"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ minWidth: '130px', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {(search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || projectFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setProjectFilter('ALL');
              }}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

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
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
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
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: 'var(--text-muted)',
          }}
        >
          <CheckSquare size={48} color="var(--text-faint)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No tasks found
          </h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
            {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || projectFilter !== 'ALL'
              ? 'No tasks match your selected search or filter criteria.'
              : 'You have not created any tasks yet. Create one to begin tracking action items.'}
          </p>
          <button onClick={onOpenCreateTask} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="glass-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              {/* Checkbox and Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px', flex: 1 }}>
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
                  title="Toggle task completion"
                />

                <div style={{ minWidth: 0 }}>
                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: task.status === 'COMPLETED' ? 'var(--text-faint)' : 'var(--text-main)',
                      textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                    }}
                  >
                    {task.name}
                  </h4>
                  {task.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {task.description}
                    </p>
                  )}
                  {task.project && (
                    <button
                      onClick={() => onSelectProject(task.project!.id)}
                      className="btn-ghost"
                      style={{
                        padding: '0.125rem 0',
                        fontSize: '0.75rem',
                        color: 'var(--accent-indigo)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      <FolderKanban size={12} />
                      <span>{task.project.name}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status, Priority, Due Date, Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {task.dueDate && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.75rem',
                      color:
                        new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                          ? 'var(--status-danger)'
                          : 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
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
  );
};
