import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext.jsx';
import { LayoutDashboard, Users, Inbox, Settings, ShieldCheck, LogOut } from 'lucide-react';
import { ThemeToggle } from '../../../shared/ui/ThemeToggle.jsx';
import '../admin.css';

const NAV = [
  { section: 'Admin' },
  { to: '/admin', label: 'Overview', Icon: LayoutDashboard },
  { to: '/admin/users', label: 'Utilizatori', Icon: Users },
  { to: '/admin/inbox', label: 'Inbox', Icon: Inbox },
  { section: 'Moderare' },
  { to: '/admin/manage', label: 'Echipe & Postari', Icon: ShieldCheck },
  { section: 'Sistem' },
  { to: '/admin/security', label: 'Audit log', Icon: ShieldCheck },
];

const TITLES = {
  '/admin': 'Overview',
  '/admin/users': 'Utilizatori',
  '/admin/inbox': 'Inbox',
  '/admin/manage': 'Echipe & Postari',
  '/admin/security': 'Audit log',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = TITLES[location.pathname] || 'FORJA Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clock = new Date().toLocaleString('ro-RO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside id="sidebar" className={sidebarOpen ? 'open' : ''}>
        <div className="sb-logo">
          <span className="sb-logo-text">F<em>O</em>RJA</span>
          <span className="sb-pro" style={{ background: 'rgba(26,82,255,.16)', borderColor: 'rgba(26,82,255,.32)', color: 'var(--c-blue)' }}>ADMIN</span>
        </div>

        <nav className="sb-nav">
          {NAV.map((item, index) => item.section ? (
            <div key={`${item.section}-${index}`} className="sb-section" style={index > 0 ? { marginTop: 8 } : {}}>{item.section}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              end={item.to === '/admin'}
              className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
            >
              <span className="si-icon">{item.Icon && <item.Icon size={16} />}</span>
              <span className="si-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle size={30} />
          <span style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Tema</span>
        </div>

        <div className="admin-sidebar-user">
          <div className="sb-user-name" style={{ color: '#fff' }}>{user?.name || 'Administrator'}</div>
        </div>
      </aside>

      <div id="main" role="document">
        <header id="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen((open) => !open)} aria-label="Deschide meniul de navigare">
            <span /><span /><span />
          </button>

          <h1 className="tb-title">{title}</h1>
          <div className="tb-streak" aria-label="Rol administrator"><ShieldCheck size={14} /> Admin</div>

          <div className="tb-right">
            <time className="tb-clock" dateTime={new Date().toISOString()}>{clock}</time>
            <button className="tb-btn" title="Logout" onClick={handleLogout} aria-label="Deconectare"><LogOut size={16} /></button>
          </div>
        </header>

        <main id="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
