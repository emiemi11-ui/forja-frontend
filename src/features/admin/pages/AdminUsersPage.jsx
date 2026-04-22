import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminUsers, deleteUser } from '../../../shared/api/index.js';
import { AdminPanel, EmptyState, StatusPill } from '../components/AdminUi.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function roleTone(role) {
  if (role === 'ADMIN') return 'alert';
  if (role === 'COACH') return 'info';
  if (role === 'NUTRITIONIST') return 'purple';
  return 'success';
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [data, setData] = useState({ total: 0, users: [] });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const confirm = useConfirm();

  useEffect(() => {
    let mounted = true;
    getAdminUsers({ q: query, role, limit: 120 })
      .then(({ data: response }) => {
        if (!mounted) return;
        setData(response);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.error || 'Eroare la încărcare.');
      });
    return () => {
      mounted = false;
    };
  }, [query, role, refreshKey]);

  const grouped = useMemo(() => data.users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {}), [data.users]);

  const handleDelete = async (userId, userName) => {
    if (busy) return;
    confirm(`Sigur vrei să ștergi userul "${userName}"? Această acțiune este ireversibilă.`, async () => {
      setBusy(userId);
      try {
        await deleteUser(userId);
        setRefreshKey((current) => current + 1);
      } catch (err) {
        alert(err.response?.data?.error || 'Eroare la ștergere.');
      } finally {
        setBusy('');
      }
    });
  };

  return (
    <div className="admin-page">
      <AdminPanel title="Filtre">
        <div className="admin-filter-row">
          <div className="admin-field">
            <label>Caută</label>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="nume / email / echipă" />
          </div>
          <div className="admin-field" style={{ maxWidth: 220 }}>
            <label>Rol</label>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="">Toate</option>
              <option value="USER">USER</option>
              <option value="COACH">COACH</option>
              <option value="NUTRITIONIST">NUTRITIONIST</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>
        <div className="admin-kpis-inline">
          <StatusPill tone="info">Total: {data.total}</StatusPill>
          <StatusPill tone="success">USER: {grouped.USER || 0}</StatusPill>
          <StatusPill tone="purple">COACH: {grouped.COACH || 0}</StatusPill>
          <StatusPill tone="info">NUT: {grouped.NUTRITIONIST || 0}</StatusPill>
          <StatusPill tone="alert">ADMIN: {grouped.ADMIN || 0}</StatusPill>
        </div>
      </AdminPanel>

      <AdminPanel title="Utilizatori">
        {error ? <EmptyState title="Eroare" text={error} /> : data.users.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nume</th>
                  <th>Rol</th>
                  <th>Plan</th>
                  <th>Streak</th>
                  <th>Echipa</th>
                  <th>Creat</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                      <div className="admin-caption">{user.email}</div>
                    </td>
                    <td>
                      <StatusPill tone={roleTone(user.role)}>{user.role}</StatusPill>
                      <div className="admin-caption" style={{ marginTop: 4 }}>rol informativ</div>
                    </td>
                    <td>{user.plan || 'FREE'}</td>
                    <td>{user.streak || 0} zile</td>
                    <td>{user.teamName || '—'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <button
                          style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--c-lime)', background: 'var(--c-lime-bg)', cursor: 'pointer', fontWeight: 600 }}
                          onClick={() => { navigate('/admin/dm'); }}
                        >
                          💬
                        </button>
                        <button
                          style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--c-coral)', background: 'var(--c-coral-bg)', cursor: 'pointer', fontWeight: 600, color: 'var(--c-coral)' }}
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={busy === user.id}
                        >
                          🗑
                        </button>
                      </div>
                      {user.blocked ? <div style={{ fontSize: 9, color: 'var(--c-coral)', fontWeight: 700, marginTop: 2 }}>BLOCAT</div> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="Niciun utilizator" text="Schimbă filtrele sau creează conturi noi." />}
      </AdminPanel>
    </div>
  );
}
