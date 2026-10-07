import React from 'react';
import { Menu, Plus, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onNewProject?: () => void;
  onNewTask?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenSidebar,
  onRefresh,
  isRefreshing,
  onNewProject,
  onNewTask,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(13, 18, 31, 0.75)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onOpenSidebar}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
          }}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.75rem' }}
            title="Refresh data"
            disabled={isRefreshing}
          >
            <RefreshCw
              size={16}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
            <span style={{ display: 'none' }}>Refresh</span>
          </button>
        )}

        {onNewProject && (
          <button onClick={onNewProject} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
            <Plus size={16} />
            <span>New Project</span>
          </button>
        )}

        {onNewTask && (
          <button onClick={onNewTask} className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
            <Plus size={16} />
            <span>New Task</span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
