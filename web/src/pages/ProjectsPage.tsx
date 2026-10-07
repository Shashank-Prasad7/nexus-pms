import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Project, ProjectStatus } from '../types';
import { StatusBadge } from '../components/Badges';
import {
  Search,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  FolderKanban,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';

interface ProjectsPageProps {
  onSelectProject: (projectId: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (project: Project) => void;
  onOpenDeleteModal: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  onSelectProject,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDeleteModal,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProjects({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search and Filters Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
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
              placeholder="Search projects by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="select-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <button onClick={onOpenCreateModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Create Project</span>
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'var(--status-danger-bg)',
            color: 'var(--status-danger)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {error}
        </div>
      )}

      {/* Projects Grid */}
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
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: 'var(--text-muted)',
          }}
        >
          <FolderKanban size={48} color="var(--text-faint)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No projects found
          </h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
            {search || statusFilter !== 'ALL'
              ? 'No projects match your current filters. Try resetting search or status.'
              : 'You have not created any projects yet. Get started by organizing your goals.'}
          </p>
          <button onClick={onOpenCreateModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Your First Project</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {projects.map((project) => {
            const stats = project.taskStats || {
              total: 0,
              completed: 0,
              pending: 0,
              progressPercentage: 0,
            };

            return (
              <div
                key={project.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => onSelectProject(project.id)}
              >
                {/* Header: Title and Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      lineHeight: 1.3,
                    }}
                  >
                    {project.name}
                  </h3>
                  <StatusBadge status={project.status} />
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                    margin: '0.75rem 0 1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                    flex: 1,
                  }}
                >
                  {project.description || 'No description provided.'}
                </p>

                {/* Task progress bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.375rem',
                    }}
                  >
                    <span>
                      {stats.completed} of {stats.total} Tasks Completed
                    </span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>
                      {stats.progressPercentage}%
                    </span>
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
                        width: `${stats.progressPercentage}%`,
                        background: 'var(--accent-gradient)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Dates & Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.875rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    color: 'var(--text-faint)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Calendar size={13} />
                    <span>
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString()
                        : 'No start date'}{' '}
                      -{' '}
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString()
                        : 'No end date'}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onOpenEditModal(project)}
                      className="btn-ghost"
                      style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
                      title="Edit project"
                    >
                      <Edit2 size={15} color="var(--text-muted)" />
                    </button>
                    <button
                      onClick={() => onOpenDeleteModal(project)}
                      className="btn-ghost"
                      style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
                      title="Delete project"
                    >
                      <Trash2 size={15} color="var(--status-danger)" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
