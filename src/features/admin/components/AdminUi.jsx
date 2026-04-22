export function AdminPanel({ title, eyebrow, actions, children, className = '' }) {
  return (
    <section className={`admin-panel ${className}`.trim()}>
      {(title || eyebrow || actions) && (
        <div className="admin-panel-head">
          <div>
            {eyebrow && <div className="admin-eyebrow">{eyebrow}</div>}
            {title && <h2>{title}</h2>}
          </div>
          {actions ? <div className="admin-panel-actions">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function AdminStatCard({ label, value, sub, tone = 'default' }) {
  return (
    <div className={`admin-stat-card tone-${tone}`}>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
      {sub ? <div className="admin-stat-foot">{sub}</div> : null}
    </div>
  );
}

export function MeterBar({ label, value, max, color = 'var(--c-lime)', suffix = '' }) {
  const safeMax = Math.max(1, Number(max) || 1);
  const pct = Math.max(0, Math.min(100, Math.round(((Number(value) || 0) / safeMax) * 100)));
  return (
    <div className="meter-row">
      <div className="meter-meta">
        <span>{label}</span>
        <strong>{value}{suffix}</strong>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function EmptyState({ title, text }) {
  return (
    <div className="admin-empty">
      <div className="admin-empty-icon">—</div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

export function StatusPill({ children, tone = 'default' }) {
  return <span className={`admin-pill tone-${tone}`}>{children}</span>;
}
