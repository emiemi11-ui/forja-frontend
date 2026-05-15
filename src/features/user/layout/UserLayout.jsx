import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../../shared/ui/Sidebar.jsx';
import { useAuth } from '../../../features/auth/context/AuthContext.jsx';
import { LogOut } from 'lucide-react';

const PAGE_TITLES = {
  '/app': 'Overview',
  '/app/workout': 'Antrenament',
  '/app/workout/history': 'Istoric Antrenamente',
  '/app/nutrition': 'Nutriție',
  '/app/sleep': 'Somn',
  '/app/chat': 'Chat',
  '/app/teams': 'Echipe',
  '/app/profile': 'Profil',
};

export default function UserLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = PAGE_TITLES[location.pathname] || 'FORJA';

  const [clock, setClock] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);


  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' · ' +
        now.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' }),
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);





  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div id="main" role="document">
        <header id="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen((open) => !open)} aria-label="Deschide meniul de navigare">
            <span /><span /><span />
          </button>

          <h1 className="tb-title">{title}</h1>
          <div className="tb-streak" id="tbStreak" aria-label={`Serie de ${user?.streak || 0} zile`}>🔥 {user?.streak || 0} zile</div>

          <div className="tb-right">
            <time className="tb-clock" dateTime={new Date().toISOString()}>{clock}</time>
            <button className="tb-btn tb-logout" title="Logout" onClick={handleLogout} aria-label="Deconectare"><LogOut size={16} /></button>
          </div>
        </header>

        <main id="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
