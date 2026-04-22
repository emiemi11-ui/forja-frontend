import { useEffect, useState } from 'react';
import { getAdminSettings, updateAdminSettings } from '../../../shared/api/index.js';
import { AdminPanel, EmptyState } from '../components/AdminUi.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    allowPublicSignup: true,
    allowWaitlist: true,
    allowContact: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getAdminSettings()
      .then(({ data }) => {
        if (!mounted) return;
        const s = data.settings || {};
        setForm({
          allowPublicSignup: s.allowPublicSignup ?? true,
          allowWaitlist: s.allowWaitlist ?? true,
          allowContact: s.allowContact ?? true,
          maintenanceMode: s.maintenanceMode ?? false,
        });
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.error || 'Eroare la incarcare.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const toggle = (key) => setForm((current) => ({ ...current, [key]: !current[key] }));

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const { data } = await updateAdminSettings(form);
      setMessage('Salvat.');
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la salvare.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-page"><AdminPanel><EmptyState title="Se incarca..." text="" /></AdminPanel></div>;
  }

  return (
    <div className="admin-page">
      <AdminPanel title="Feature flags" actions={<button className="admin-btn primary" onClick={save} disabled={saving}>{saving ? 'Salvez...' : 'Salveaza'}</button>}>
        <div className="admin-switch-row">
          <div className="admin-switch-copy"><strong>Public signup</strong><p>Permite inregistrari noi fara invitatie.</p></div>
          <div className={`admin-toggle${form.allowPublicSignup ? ' active' : ''}`} onClick={() => toggle('allowPublicSignup')} />
        </div>
        <div className="admin-switch-row">
          <div className="admin-switch-copy"><strong>Waitlist</strong><p>Formularul de inscriere din landing.</p></div>
          <div className={`admin-toggle${form.allowWaitlist ? ' active' : ''}`} onClick={() => toggle('allowWaitlist')} />
        </div>
        <div className="admin-switch-row">
          <div className="admin-switch-copy"><strong>Contact</strong><p>Formularul de contact din landing.</p></div>
          <div className={`admin-toggle${form.allowContact ? ' active' : ''}`} onClick={() => toggle('allowContact')} />
        </div>
        <div className="admin-switch-row">
          <div className="admin-switch-copy"><strong>Maintenance mode</strong><p>Semnaleaza ca platforma e in mentenanta.</p></div>
          <div className={`admin-toggle${form.maintenanceMode ? ' active' : ''}`} onClick={() => toggle('maintenanceMode')} />
        </div>
        {message ? <div className="admin-caption" style={{ marginTop: 12, color: 'var(--c-green)' }}>{message}</div> : null}
        {error ? <div className="admin-caption" style={{ marginTop: 12, color: 'var(--c-coral)' }}>{error}</div> : null}
      </AdminPanel>
    </div>
  );
}
