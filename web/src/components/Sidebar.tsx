import React from 'react';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: 'dashboard' | 'projects' | 'tasks';
  onSelectTab: (tab: 'dashboard' | 'projects' | 'tasks') => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as const, label: 'Projects', icon: FolderKanban },
    { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Nexus PMS
            </h1>
            <p style={{ fontSize: '0.6875rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              ENTERPRISE SUITE
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ padding: '1.25rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: active ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Icon size={18} color={active ? 'var(--accent-indigo)' : 'currentColor'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div
          style={{
            padding: '1.25rem 1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'var(--accent-indigo)',
                  flexShrink: 0,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || 'User'}
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-faint)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '0.5rem' }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
