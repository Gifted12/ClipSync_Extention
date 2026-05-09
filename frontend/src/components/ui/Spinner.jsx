export default function Spinner({ fullscreen, size = 'md', label = 'Loading…' }) {
  const cls = size === 'lg' ? 'spinner spinner-lg' : 'spinner';

  if (fullscreen) {
    return (
      <div className="spinner-overlay" role="status" aria-label={label}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ marginBottom: 4 }}>
            <rect width="40" height="40" rx="10" fill="var(--accent)" />
            <path d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20" stroke="var(--bg-primary)" strokeWidth="3" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.8s" repeatCount="indefinite" />
            </path>
          </svg>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
        </div>
      </div>
    );
  }

  return <span className={cls} role="status" aria-label={label} />;
}
