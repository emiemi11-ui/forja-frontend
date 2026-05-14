import { useState } from 'react';
import { createPortal } from 'react-dom';
import { requestUpgrade } from '../api/index.js';

/**
 * UpgradeModal — flow în 3 pași:
 *  1. user introduce email
 *  2. system afișează IBAN + sumă + instrucțiuni
 *  3. user așteaptă aprobare admin
 *
 * Folosit din PlanLock, ProfilePage, RegisterWizard (cu prop preData pentru Register).
 */
export default function UpgradeModal({ isOpen, onClose, targetPlan = 'PRO', currentEmail = '', preData = null, onSuccess }) {
  const [step, setStep] = useState(preData ? 2 : 1);
  const [email, setEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState(preData || null);

  const PLAN_PRICES = { PRO: 29, TEAM: 49 };
  const amount = PLAN_PRICES[targetPlan] || 29;

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Introdu un email valid.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await requestUpgrade(targetPlan, email.trim());
      setRequestData(data);
      setStep(2);
      onSuccess?.(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Eroare la trimiterea cererii.');
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setStep(preData ? 2 : 1);
    setEmail(currentEmail);
    setError('');
    onClose?.();
  };

  return createPortal(
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--c-surface, #fff)', borderRadius: 18, padding: 28, maxWidth: 480, width: '100%',
        maxHeight: '92vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '2px solid var(--c-lime)',
      }}>
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 8 }}>💎</div>
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 900, margin: '0 0 6px', textAlign: 'center' }}>
              Upgrade la {targetPlan}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--c-ink3)', textAlign: 'center', marginBottom: 22 }}>
              <strong>{amount} lei/lună</strong> · Anulează oricând
            </p>

            <div style={{ background: 'rgba(184,237,0,0.08)', border: '1px solid var(--c-lime)', borderRadius: 12, padding: 14, marginBottom: 18, fontSize: 13, lineHeight: 1.6 }}>
              <strong>Cum funcționează:</strong><br />
              1. Introduci emailul aici (vom trimite instrucțiunile de plată)<br />
              2. Faci transfer bancar la IBAN-ul primit<br />
              3. Adminul confirmă plata și activează planul tău<br />
              4. Primești email de confirmare
            </div>

            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--fm)' }}>
              Email pentru instrucțiuni
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 14, fontFamily: 'var(--fb)', background: 'var(--c-bg)', boxSizing: 'border-box', marginTop: 4, marginBottom: 12 }}
            />

            {error && <div style={{ background: 'rgba(255,68,34,0.08)', border: '1px solid var(--c-coral)', borderRadius: 8, padding: 10, fontSize: 12, color: 'var(--c-coral)', marginBottom: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={close} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1.5px solid var(--c-border)', background: 'transparent', color: 'var(--c-ink)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Anulează
              </button>
              <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: 'var(--c-lime)', color: '#000', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Trimit...' : '📧 Trimite instrucțiuni'}
              </button>
            </div>
          </>
        )}

        {step === 2 && requestData && (
          <>
            <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 8 }}>📧</div>
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 900, margin: '0 0 6px', textAlign: 'center' }}>
              Cerere trimisă!
            </h3>
            <p style={{ fontSize: 13, color: 'var(--c-ink3)', textAlign: 'center', marginBottom: 18 }}>
              Ți-am trimis instrucțiunile pe <strong>{requestData.email}</strong>
            </p>

            <div style={{ background: 'rgba(26,82,255,0.06)', border: '1.5px solid var(--c-blue)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-blue)', marginBottom: 10, fontWeight: 800 }}>
                💳 DETALII PLATĂ
              </div>
              <Row label="Beneficiar" value={requestData.beneficiar} />
              <Row label="IBAN" value={requestData.iban} mono />
              <Row label="Bancă" value={requestData.bank} />
              <Row label="Sumă" value={`${requestData.amount} lei`} highlight />
              <Row label="Detalii plată (mențiune)" value={`Abonament FORJA ${requestData.plan} - ${requestData.requestId}`} mono small />
            </div>

            <div style={{ background: 'rgba(184,237,0,0.06)', border: '1px solid var(--c-lime)', borderRadius: 10, padding: 12, fontSize: 12, lineHeight: 1.6 }}>
              <strong>📌 Pași următori:</strong><br />
              1. Fă transferul bancar cu detaliile de mai sus<br />
              2. Adminul verifică plata în 24h<br />
              3. Primești email de confirmare când contul/planul e activat<br />
              4. Poți închide pagina — nu se pierde nimic
            </div>

            <button onClick={close} style={{ width: '100%', marginTop: 18, padding: 12, borderRadius: 10, border: 'none', background: 'var(--c-ink)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Am înțeles
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

function Row({ label, value, mono, highlight, small }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px dashed rgba(255,255,255,0.08)' }}>
      <span style={{ fontSize: small ? 10 : 11, color: 'var(--c-ink3)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--fm)' }}>{label}</span>
      <span style={{
        fontSize: highlight ? 16 : (small ? 11 : 13),
        fontFamily: mono ? 'var(--fm)' : 'inherit',
        fontWeight: highlight ? 900 : 600,
        color: highlight ? 'var(--c-lime-d, #4d7a00)' : 'var(--c-ink)',
        textAlign: 'right',
        wordBreak: 'break-all',
      }}>{value}</span>
    </div>
  );
}
