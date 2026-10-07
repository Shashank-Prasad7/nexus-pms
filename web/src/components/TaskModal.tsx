import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Project, Task, TaskPriority, TaskStatus } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    projectId: string;
  }) => Promise<void>;
  initialData?: Task | null;
  projects: Project[];
  defaultProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  projects,
  defaultProjectId,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setProjectId(initialData.projectId);
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setDueDate(
        initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''
      );
    } else {
      setName('');
      setDescription('');
      setProjectId(defaultProjectId || (projects.length > 0 ? projects[0].id : ''));
      setPriority('MEDIUM');
      setStatus('PENDING');
      setDueDate('');
    }
    setError(null);
  }, [initialData, isOpen, projects, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Task name is required');
      return;
    }

    if (!projectId) {
      setError('Please select a project for this task');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        dueDate: dueDate || null,
        projectId,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--status-danger-bg)',
              color: 'var(--status-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label" htmlFor="task-name">
            Task Name *
          </label>
          <input
            id="task-name"
            className="input-field"
            type="text"
            placeholder="e.g. Implement OAuth login flow"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="task-project">
            Project *
          </label>
          <select
            id="task-project"
            className="select-field"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a project
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="task-desc">
            Description
          </label>
          <textarea
            id="task-desc"
            className="textarea-field"
            placeholder="Key details, acceptance criteria, notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              className="select-field"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              className="select-field"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="task-due-date">
            Due Date
          </label>
          <input
            id="task-due-date"
            className="input-field"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
