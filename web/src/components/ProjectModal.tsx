import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Project, ProjectStatus } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    status: ProjectStatus;
    startDate?: string | null;
    endDate?: string | null;
  }) => Promise<void>;
  initialData?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('NOT_STARTED');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setStatus(initialData.status);
      setStartDate(
        initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : ''
      );
      setEndDate(
        initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''
      );
    } else {
      setName('');
      setDescription('');
      setStatus('NOT_STARTED');
      setStartDate('');
      setEndDate('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Project' : 'Create New Project'}
    >
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
          <label className="input-label" htmlFor="project-name">
            Project Name *
          </label>
          <input
            id="project-name"
            className="input-field"
            type="text"
            placeholder="e.g. Mobile App Redesign"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="project-desc">
            Description
          </label>
          <textarea
            id="project-desc"
            className="textarea-field"
            placeholder="Brief overview of project scope and goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="project-status">
            Status
          </label>
          <select
            id="project-status"
            className="select-field"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="project-start-date">
              Start Date
            </label>
            <input
              id="project-start-date"
              className="input-field"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="project-end-date">
              End Date
            </label>
            <input
              id="project-end-date"
              className="input-field"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
