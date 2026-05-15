import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext.jsx';
import { PEOPLE_PHOTOS } from './helpers.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { Zap, Dumbbell, Apple, Moon, MessageCircle, Mail, Users, Search, User, LayoutDashboard, ClipboardList, FileText, Trophy, BookOpen, UserCircle, History } from 'lucide-react';
import '../styles/sidebar.css';

const I = (Icon) => <Icon size={18} strokeWidth={2} />;

const USER_NAV = [
  { section: 'Principal' },
  { to: '/app',                 icon: I(Zap),            label: 'Overview'    },
  { to: '/app/workout',         icon: I(Dumbbell),       label: 'Antrenament' },
  { to: '/app/workout/history', icon: I(History),        label: 'Istoric Antrenamente' },
  { to: '/app/nutrition',       icon: I(Apple),           label: 'Nutriție'    },
  { to: '/app/nutrition/history', icon: I(History),      label: 'Istoric Nutriție' },
  { to: '/app/sleep',           icon: I(Moon),            label: 'Somn'        },
  { to: '/app/achievements',    icon: I(Trophy),          label: 'Realizări'   },
  { to: '/app/my-plans',        icon: I(BookOpen),        label: 'Planurile mele', planOnly: true },
  { section: 'Comunitate' },
  { to: '/app/chat',      icon: I(MessageCircle),   label: 'Chat',        badge: true },
  { to: '/app/dm',        icon: I(Mail),            label: 'Mesaje'      },
  { to: '/app/teams',     icon: I(Users),           label: 'Echipe'      },
  { to: '/app/discover',  icon: I(Search),          label: 'Descoperă'   },
  { section: 'Cont' },
  { to: '/app/profile',        icon: I(User),            label: 'Profil'      },
  { to: '/app/public-profile', icon: I(Users),           label: 'Echipele mele' },
];

const COACH_NAV = [
  { section: 'Dashboard' },
  { to: '/coach',          icon: I(LayoutDashboard), label: 'Overview'  },
  { to: '/coach/athletes', icon: I(Users),           label: 'Atleți'    },
  { to: '/coach/workouts', icon: I(Dumbbell),        label: 'Planuri'   },
  { section: 'Comunitate' },
  { to: '/coach/chat',     icon: I(MessageCircle),   label: 'Chat',      badge: true },
  { to: '/coach/dm',       icon: I(Mail),            label: 'Mesaje'    },
  { to: '/coach/teams',    icon: I(Users),           label: 'Echipe'    },
  { to: '/coach/discover', icon: I(Search),          label: 'Descoperă' },
  { section: 'Cont' },
  { to: '/coach/profile',  icon: I(UserCircle),      label: 'Profil Public' },
];

const NUT_NAV = [
  { section: 'Dashboard' },
  { to: '/nutritionist',           icon: I(LayoutDashboard), label: 'Overview'     },
  { to: '/nutritionist/clients',   icon: I(Users),           label: 'Clienți'      },
  { to: '/nutritionist/templates', icon: I(FileText),        label: 'Template-uri' },
  { section: 'Comunitate' },
  { to: '/nutritionist/chat',      icon: I(MessageCircle),   label: 'Chat',         badge: true },
  { to: '/nutritionist/dm',        icon: I(Mail),            label: 'Mesaje'       },
  { to: '/nutritionist/teams',     icon: I(Users),           label: 'Echipe'       },
  { to: '/nutritionist/discover',  icon: I(Search),          label: 'Descoperă' },
  { section: 'Cont' },
  { to: '/nutritionist/profile',  icon: I(UserCircle),      label: 'Profil Public' },
];

const PLAN_COLOR = {
  PRO: 'var(--c-lime)', COACH: 'var(--c-blue)',
  'NUT.': 'var(--c-purple)', FREE: 'var(--c-ink3)',
};

// ── BOTTOM NAV (mobile only) ─────────────────────────────────────────────────
function BottomNav({ nav, chatUnread, user }) {
  const location = useLocation();
  const mobileItems = nav.filter(item => !item.section).slice(0, 5);

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {mobileItems.map(item => {
          const isActive = item.to === '/app' || item.to === '/coach' || item.to === '/nutritionist'
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          const unread = item.badge ? chatUnread : 0;
          return (
            <NavLink key={item.to} to={item.to}
              end={item.to === '/app' || item.to === '/coach' || item.to === '/nutritionist'}
              className={({ isActive: ia }) => `bn-tab${ia ? ' active' : ''}`}>
              <span className="bn-icon">{item.icon}</span>
              <span className="bn-label">{item.label}</span>
              {unread > 0 && <span className="bn-badge" />}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({ chatUnread = 0, msgUnread = 0, open, onClose }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const rawNav    = user?.role === 'COACH' ? COACH_NAV : user?.role === 'NUTRITIONIST' ? NUT_NAV : USER_NAV;
  const nav       = rawNav.filter(item => !item.planOnly || (user?.plan && user.plan !== 'FREE'));
  const photoUrl  = PEOPLE_PHOTOS[user?.avatar] || PEOPLE_PHOTOS['M'];
  const planColor = PLAN_COLOR[user?.plan] || 'var(--c-lime)';

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNav    = () => { if (onClose) onClose(); };

  return (
    <>
      <aside id="sidebar" className={open ? 'open' : ''}>
        <div className="sb-logo">
          <span className="sb-logo-text">F<em>O</em>RJA</span>
          <span className="sb-pro" style={{
            background: planColor + '20',
            borderColor: planColor + '4D',
            color: planColor,
          }}>
            {user?.plan || 'FREE'}
          </span>
        </div>

        <nav className="sb-nav">
          {nav.map((item, i) => {
            if (item.section) return (
              <div key={i} className="sb-section" style={i > 0 ? { marginTop: 8 } : {}}>
                {item.section}
              </div>
            );
            const unread = (item.badge && user?.role === 'USER') ? chatUnread
              : (item.badge && user?.role === 'COACH') ? msgUnread : 0;
            return (
              <NavLink key={item.to} to={item.to} onClick={handleNav}
                end={item.to === '/app' || item.to === '/coach' || item.to === '/nutritionist'}
                className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}>
                <span className="si-icon">{item.icon}</span>
                <span className="si-label">{item.label}</span>
                {unread > 0 && <span className="si-badge">{unread}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle size={30} />
          <span style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Tema</span>
        </div>

        <div className="sb-user">
          <div className="sb-user-inner" onClick={handleLogout} title="Click pentru logout">
            <div className="sb-av" id="sbAv">
              {photoUrl
                ? <img src={photoUrl} alt="" />
                : user?.avatar || 'U'}
            </div>
            {/* Online dot */}
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 9, height: 9, borderRadius: '50%',
              background: '#15803D',
              border: '2px solid var(--c-ink)',
              animation: 'onlinePulse 2.5s ease-in-out infinite',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sb-user-name">{user?.name}</div>
              <div className="sb-user-sub">{user?.plan} · Click → Logout</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Bottom nav — mobile */}
      <BottomNav nav={nav} chatUnread={chatUnread} user={user} />

      
    </>
  );
}
