import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext.jsx';

const PLAN_LEVEL = { FREE: 0, PRO: 1, TEAM: 2 };

const PLAN_LABEL = {
  PRO: 'PRO',
  TEAM: 'TEAM',
};

const PLAN_PRICE = {
  PRO: '29 lei/lună',
  TEAM: '49 lei/lună',
};

const PLAN_FEATURES = {
  PRO: [
    '✓ Tot ce include FREE',
    '✓ Mesaje directe (DM)',
    '✓ Coach 1:1',
    '✓ Realizări & badges',
    '✓ Statistici avansate',
  ],
  TEAM: [
    '✓ Tot ce include PRO',
    '✓ Echipe nelimitate',
    '✓ Chat de echipă',
    '✓ Coaching 1:1 cu profesionist',
    '✓ Echipele mele',
  ],
};

/**
 * Wraps a page/section. If user's plan is below requiredPlan, shows
 * a semi-transparent overlay with an Upgrade button on top of the
 * dimmed real content (so user sees what they would unlock).
 *
 * Usage:
 *   <PlanLock requiredPlan="PRO">
 *     <DirectMessagesPage />
 *   </PlanLock>
 */
export default function PlanLock({ requiredPlan = 'PRO', children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Profesionalii (COACH/NUT/ADMIN) bypass plan locks
  const isProfessional = ['COACH', 'NUTRITIONIST', 'ADMIN'].includes(user?.role);
  const userLevel = PLAN_LEVEL[user?.plan] ?? 0;
  const required = PLAN_LEVEL[requiredPlan] ?? 0;
  const hasAccess = isProfessional || userLevel >= required;

  if (hasAccess) return children;

  // Lock UI — overlay semi-transparent peste continutul real (dimmed)
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Real content, blurred + non-interactive */}
      <div style={{ filter: 'blur(4px) grayscale(0.6)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none' }} aria-hidden>
        {children}
      </div>

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '8vh',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.55) 100%)',
        backdropFilter: 'blur(2px)',
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 460,
          width: '100%',
          margin: '0 20px',
          background: 'var(--c-surface, #fff)',
          borderRadius: 20,
          padding: 32,
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          border: '2px solid var(--c-lime, #B8ED00)',
          fontFamily: 'var(--fb, "Plus Jakarta Sans", sans-serif)',
        }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🔒</div>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: requiredPlan === 'TEAM' ? '#7B2FBE' : 'var(--c-lime, #B8ED00)',
            color: requiredPlan === 'TEAM' ? '#fff' : '#000',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
            fontFamily: 'var(--fm, monospace)',
            marginBottom: 12,
          }}>
            {PLAN_LABEL[requiredPlan]} REQUIRED
          </div>
          <h2 style={{
            fontFamily: 'var(--fd, "Barlow Condensed", sans-serif)',
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: 0.5,
            margin: '0 0 8px',
            color: 'var(--c-ink, #111)',
          }}>
            Funcționalitate Premium
          </h2>
          <p style={{ color: 'var(--c-ink3, #666)', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
            Această secțiune este disponibilă doar pentru membrii planului <strong>{PLAN_LABEL[requiredPlan]}</strong>.
          </p>
          <div style={{
            background: 'var(--c-bg, #f5f5f5)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            textAlign: 'left',
          }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
              Cu {PLAN_LABEL[requiredPlan]} primești:
            </div>
            {(PLAN_FEATURES[requiredPlan] || []).map((line) => (
              <div key={line} style={{ fontSize: 12, color: 'var(--c-ink2, #333)', padding: '3px 0' }}>
                {line}
              </div>
            ))}
          </div>
          <div style={{
            fontFamily: 'var(--fd)',
            fontSize: 24,
            fontWeight: 900,
            color: 'var(--c-ink)',
            marginBottom: 4,
          }}>
            {PLAN_PRICE[requiredPlan]}
          </div>
          <div style={{ fontSize: 11, color: 'var(--c-ink3)', marginBottom: 16 }}>
            Anulează oricând
          </div>
          <button
            onClick={() => navigate('/app/profile?upgrade=' + requiredPlan)}
            style={{
              padding: '14px 28px',
              background: 'var(--c-ink, #111)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: '100%',
              letterSpacing: 0.5,
            }}
          >
            ⚡ Upgrade la {PLAN_LABEL[requiredPlan]}
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 8,
              padding: '8px 16px',
              background: 'none',
              color: 'var(--c-ink3)',
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ← Înapoi
          </button>
        </div>
      </div>
    </div>
  );
}
