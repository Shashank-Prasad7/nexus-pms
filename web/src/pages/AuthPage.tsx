import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, Layers, Smartphone } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, sessionError, clearSessionError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearSessionError();

    if (!email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Full name is required for registration');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setIsLogin(true);
    setEmail('demo@example.com');
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
      >
        {/* Logo and Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sparkles size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isLogin
              ? 'Access your projects, sprints, and team deliverables'
              : 'Start orchestrating projects seamlessly across web & mobile'}
          </p>
        </div>

        {/* Global error banners */}
        {(sessionError || error) && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--status-danger-bg)',
              color: 'var(--status-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            {sessionError || error}
          </div>
        )}

        {/* Tab switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-app)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            style={{
              padding: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              background: isLogin ? 'var(--bg-surface-elevated)' : 'transparent',
              color: isLogin ? '#ffffff' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            style={{
              padding: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              background: !isLogin ? 'var(--bg-surface-elevated)' : 'transparent',
              color: !isLogin ? '#ffffff' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label" htmlFor="register-name">
                Full Name
              </label>
              <input
                id="register-name"
                className="input-field"
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="auth-email">
              Email Address
            </label>
            <input
              id="auth-email"
              className="input-field"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Workspace' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Button */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={autofillDemo}
            className="btn-ghost"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--accent-cyan)',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'underline',
            }}
          >
            ⚡ Click here to Autofill Demo Credentials
          </button>
        </div>

        {/* Highlights info */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            textAlign: 'center',
          }}
        >
          <div>
            <ShieldCheck size={18} color="var(--accent-indigo)" style={{ margin: '0 auto 0.25rem' }} />
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>Bcrypt & JWT</p>
          </div>
          <div>
            <Layers size={18} color="var(--accent-purple)" style={{ margin: '0 auto 0.25rem' }} />
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>Prisma Postgres</p>
          </div>
          <div>
            <Smartphone size={18} color="var(--accent-cyan)" style={{ margin: '0 auto 0.25rem' }} />
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>Web & Mobile</p>
          </div>
        </div>
      </div>
    </div>
  );
};
