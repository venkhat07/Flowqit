import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Zap, X, Menu,
  User, Settings, TrendingUp,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useState } from 'react';

const NAV = [
  { to: '/',       label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/tasks',  label: 'Task Manager',  icon: CheckSquare },
];

export default function Sidebar() {
  const { stats } = useTasks();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="mobile-header">
        <span className="mobile-logo">Flowqit</span>
        <button className="btn-icon" onClick={() => setOpen((o) => !o)} id="mobile-menu-btn" aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Overlay */}
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={close} />

      {/* Sidebar */}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="sidebar-logo-text">Flowqit</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Main</span>

          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={close}
              id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon size={18} />
              {label}
              {label === 'Task Manager' && stats.pending > 0 && (
                <span className="nav-item-count">{stats.pending}</span>
              )}
            </NavLink>
          ))}

          <span className="sidebar-nav-label" style={{ marginTop: 16 }}>Insights</span>
          <div className="nav-item" style={{ cursor: 'default', opacity: 0.5 }}>
            <TrendingUp size={18} />
            Analytics
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'var(--accent-subtle)', color: 'var(--accent-light)', padding: '2px 8px', borderRadius: 999 }}>Soon</span>
          </div>
          <div className="nav-item" style={{ cursor: 'default', opacity: 0.5 }}>
            <Settings size={18} />
            Settings
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'var(--accent-subtle)', color: 'var(--accent-light)', padding: '2px 8px', borderRadius: 999 }}>Soon</span>
          </div>
        </nav>

        {/* Stats mini strip */}
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Quick Stats</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[
                { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
                { label: 'Done', value: stats.completed, color: 'var(--low)' },
                { label: 'Overdue', value: stats.overdue, color: stats.overdue > 0 ? 'var(--high)' : 'var(--text-muted)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                <span>Completion</span>
                <span>{stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: stats.total ? `${(stats.completed / stats.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">F</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Flowqit User</div>
              <div className="sidebar-user-role">Pro Plan · AI Enabled</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
