import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext.jsx';
import { ThemeToggle } from '../../../shared/ui/ThemeToggle.jsx';

const PAGE_TITLES = {
  '/nutritionist': 'Overview', '/nutritionist/clients': 'Clienti', '/nutritionist/templates': 'Templates',
  '/nutritionist/chat': 'Chat', '/nutritionist/dm': 'Mesaje', '/nutritionist/teams': 'Echipe',
  '/nutritionist/discover': 'Descopera', '/nutritionist/profile': 'Profil Public',
};

const NAV = [
  { section: 'Dashboard' },
  { to: '/nutritionist', icon: '📊', label: 'Overview', end: true },
  { to: '/nutritionist/clients', icon: '👥', label: 'Clienti' },
  { to: '/nutritionist/templates', icon: '📋', label: 'Templates' },
  { section: 'Comunitate' },
  { to: '/nutritionist/chat', icon: '💬', label: 'Chat' },
  { to: '/nutritionist/dm', icon: '✉️', label: 'Mesaje' },
  { to: '/nutritionist/teams', icon: '👥', label: 'Echipe' },
  { to: '/nutritionist/discover', icon: '🔍', label: 'Descopera' },
  { section: 'Cont' },
  { to: '/nutritionist/profile', icon: '✏️', label: 'Profil Public' },
];

const BOTTOM_NAV = [
  { to: '/nutritionist', icon: '📊', label: 'Overview', end: true },
  { to: '/nutritionist/clients', icon: '👥', label: 'Clienti' },
  { to: '/nutritionist/templates', icon: '📋', label: 'Templates' },
  { to: '/nutritionist/chat', icon: '💬', label: 'Chat' },
  { to: '/nutritionist/dm', icon: '✉️', label: 'Mesaje' },
];

export default function NutLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [clock, setClock] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = PAGE_TITLES[location.pathname]
    || (/^\/nutritionist\/clients\/[^/]+\/nutrition-history$/.test(location.pathname) ? 'Istoric Client' : 'Nutritionist');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' · ' +
        now.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  const handleNav = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside id="sidebar" className={sidebarOpen ? 'open' : ''}>
        <div className="sb-logo">
          <span className="sb-logo-text">F<em>O</em>RJA</span>
          <span className="sb-pro" style={{ background: 'rgba(123,47,190,.15)', borderColor: 'rgba(123,47,190,.3)', color: '#7B2FBE' }}>NUT.</span>
        </div>
        <nav className="sb-nav">
          {NAV.map((item, i) => {
            if (item.section) return <div key={i} className="sb-section" style={i > 0 ? { marginTop: 8 } : {}}>{item.section}</div>;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={handleNav}
                className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}>
                <span className="si-icon">{item.icon}</span>
                <span className="si-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle size={30} />
          <span style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Tema</span>
        </div>
        <div className="sb-user">
          <div className="sb-user-inner" onClick={() => { logout(); navigate('/login'); }}>
            <div className="sb-av" style={{ background: '#7B2FBE' }}>N</div>
            <div><div className="sb-user-name">{user?.name}</div><div className="sb-user-sub">NUTRITIONIST · Logout</div></div>
          </div>
        </div>
      </aside>

      <div id="main" role="document">
        <header id="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Deschide meniul de navigare"><span /><span /><span /></button>
          <h1 className="tb-title">{title}</h1>
          <div className="tb-right">
            <time className="tb-clock" dateTime={new Date().toISOString()}>{clock}</time>
            <button className="tb-btn" onClick={() => { logout(); navigate('/login'); }} aria-label="Deconectare">↪️</button>
          </div>
        </header>
        <main id="content"><Outlet /></main>
      </div>

      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          {BOTTOM_NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `bn-tab${isActive ? ' active' : ''}`}>
              <span className="bn-icon">{item.icon}</span>
              <span className="bn-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
