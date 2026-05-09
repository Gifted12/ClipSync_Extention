import { Link } from 'react-router-dom';
import { useStore } from '../store';
import styles from './NotFound.module.css';

export default function NotFound() {
  const { user } = useStore();

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <div className={styles.glitch} aria-hidden>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.desc}>
          This page doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className={styles.actions}>
          <Link to={user ? '/dashboard' : '/login'} className="btn btn-primary btn-lg">
            {user ? '← Back to Dashboard' : '← Go to Sign in'}
          </Link>
          <Link to="/" className="btn btn-secondary btn-lg">Home</Link>
        </div>
      </div>
      <div className={styles.grid} aria-hidden>
        {Array.from({ length: 64 }).map((_, i) => (
          <div key={i} className={styles.cell} style={{ animationDelay: `${(i * 37) % 2000}ms` }} />
        ))}
      </div>
    </div>
  );
}
