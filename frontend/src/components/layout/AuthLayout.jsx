import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <div className={styles.leftInner}>
          <Link to="/" className={styles.brand}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--accent)" />
              <path d="M9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16" stroke="var(--bg-primary)" strokeWidth="2.5" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="3s" repeatCount="indefinite" />
              </path>
              <circle cx="16" cy="16" r="3" fill="var(--accent-2)" />
            </svg>
            <span>ClipSync</span>
          </Link>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>Your clipboard,<br />everywhere.</h1>
            <p className={styles.heroSub}>Paste text, drop files, share images — access everything from your Chrome extension, desktop, or mobile.</p>
            <div className={styles.features}>
              {['Sync in real-time', 'End-to-end secure', 'Chrome Extension', 'Works on mobile'].map(f => (
                <div key={f} className={styles.feature}>
                  <span className={styles.featureDot} />
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.tagline}>Built for speed. Designed for clarity.</div>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>{title}</h2>
            {subtitle && <p className={styles.formSubtitle}>{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
