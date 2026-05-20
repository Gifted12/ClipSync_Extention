import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import { useStore } from '../store';
import Spinner from '../components/ui/Spinner';
import styles from './Dashboard.module.css';

const TABS = ['all', 'text', 'image', 'document'];


const ACCEPTED_TYPES = {
  'image/jpeg': [], 'image/png': [], 'image/gif': [], 'image/webp': [],
  'image/svg+xml': [], 'image/bmp': [], 'image/tiff': [],
  'application/pdf': [],
  'application/msword': [],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
  'application/vnd.ms-excel': [],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
  'application/vnd.ms-powerpoint': [],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [],
  'text/plain': [], 'text/csv': [], 'text/html': [],
  'text/css': [], 'text/javascript': [],
  'application/zip': [], 'application/x-rar-compressed': [],
  'application/x-7z-compressed': [], 'application/x-tar': [], 'application/gzip': [],
  'audio/mpeg': [], 'audio/wav': [], 'audio/ogg': [], 'audio/mp4': [], 'audio/flac': [],
  'application/json': [], 'application/xml': [],
  'font/ttf': [], 'font/otf': [], 'font/woff': [], 'font/woff2': [],
};

function getFileIcon(mimeType = '') {
  if (mimeType.startsWith('image/'))      return '🖼';
  if (mimeType === 'application/pdf')     return '📕';
  if (mimeType.includes('word'))          return '📘';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📗';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📙';
  if (mimeType.startsWith('audio/'))      return '🎵';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '🗜';
  if (mimeType.startsWith('font/'))       return '🔤';
  if (mimeType.includes('json'))          return '{}';
  if (mimeType.includes('xml'))           return '<>';
  if (mimeType.startsWith('text/'))       return '📄';
  return '📎';
}

export default function Dashboard() {
  const { user, logout } = useStore();
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedClip, setSelectedClip] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const profileImage = user?.avatar?.url;
  const profileInitial = user?.name?.[0]?.toUpperCase() || 'U';

  const fetchClips = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: tab === 'all' ? undefined : tab, search: search || undefined };
      const { data } = await api.get('/clips', { params });
      setClips(data.clips);
    } catch {
      toast.error('Failed to load clips');
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => { fetchClips(); }, [fetchClips]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clips/${id}`);
      setClips(c => c.filter(cl => cl._id !== id));
      toast.success('Clip deleted');
    } catch { toast.error('Delete failed'); }
  };

  const togglePin = async (clip) => {
    try {
      const { data } = await api.put(`/clips/${clip._id}`, { isPinned: !clip.isPinned, tags: JSON.stringify(clip.tags) });
      setClips(c => c.map(cl => cl._id === clip._id ? data : cl));
    } catch { toast.error('Failed to update'); }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
  };

  return (
    <div className={styles.root}>
      
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--accent)" />
            <circle cx="16" cy="16" r="5" fill="none" stroke="var(--bg-primary)" strokeWidth="2.5" />
            <circle cx="16" cy="16" r="2" fill="var(--accent-2)" />
          </svg>
          <span>ClipSync</span>
        </div>
        <nav className={styles.nav}>
          {TABS.map(t => (
            <button key={t} className={`${styles.navItem} ${tab === t ? styles.navActive : ''}`}
              onClick={() => setTab(t)}>
              <span className={styles.navIcon}>{tabIcon(t)}</span>
              <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              {t === 'all' && <span className={styles.navBadge}>{clips.length}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <Link to="/settings" className={styles.settingsBtn}>
            <span  className="material-symbols-outlined">settings </span> Settings
          </Link>
          <button className={styles.logoutBtn} onClick={() => { logout(); window.location.href = '/login'; }}>
            <span  className="material-symbols-outlined">logout </span> Sign out
          </button>
        </div>
      </aside>

     
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {tab === 'all' ? 'All Clips' : tab.charAt(0).toUpperCase() + tab.slice(1) + 's'}
            </h1>
            <span className={styles.pageCount}>{clips.length} item{clips.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }} className={styles.headerRight}>
            <div className={styles.searchWrap}>
              <span  className={styles.searchIcon}><span className="material-symbols-outlined">search</span></span>
              <input className={styles.searchInput} placeholder="Search clips…"
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
            </div>
            <div className={styles.profileMenuWrap}>
              <button type="button" className={styles.avatarBtn}
                onClick={() => setProfileMenuOpen(open => !open)}
                aria-label="Profile menu">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className={styles.profileAvatar} />
                ) : (
                  <span className={styles.profileFallback}>{profileInitial}</span>
                )}
              </button>
              {profileMenuOpen && (
                <div className={styles.profileMenu} onMouseLeave={() => setProfileMenuOpen(false)}>
                  <Link to="/settings" className={`${styles.menuItem} ${styles.profileMenuItem}`} onClick={() => setProfileMenuOpen(false)}>
                    <span className="material-symbols-outlined">settings</span>Settings
                  </Link>
                  <button type="button" className={`${styles.menuItem} ${styles.profileMenuItem}`} onClick={() => { setProfileMenuOpen(false); logout(); window.location.href = '/login'; }}>
                    <span className="material-symbols-outlined">logout</span>Sign out
                  </button>
                </div>
              )}
            </div>
            <button  className={` btn-primary ${styles.headerAddButton}`} onClick={() => setShowAdd(true)}>
              + Add Clip
            </button>
          </div>
        </header>

        {showPreviewModal && selectedClip && (
          <PreviewModal clip={selectedClip} onClose={() => setShowPreviewModal(false)} onCopy={handleCopy} />
        )}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <Spinner size="lg" />
          </div>
        ) : clips.length === 0 ? (
          <EmptyState tab={tab} onAdd={() => setShowAdd(true)} />
        ) : (
          <>
            <div className={styles.mobileTop}>
              <div className={styles.mobileTabs}>
                {TABS.map(t => (
                  <button key={t}
                    type="button"
                    className={`${styles.navItem} ${styles.mobileTab} ${tab === t ? styles.navActive : ''}`}
                    onClick={() => setTab(t)}
                    title={t.charAt(0).toUpperCase() + t.slice(1)}>
                    <span className={styles.mobileTabIcon}>{tabIcon(t)}</span>
                    <span className={styles.mobileTabText}>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  </button>
                ))}
              </div>
             
            </div>
            <div className={styles.grid}>
              {clips.map(clip => (
                <ClipCard key={clip._id} clip={clip}
                  onDelete={handleDelete} onPin={togglePin} onCopy={handleCopy}
                  selected={selectedClip?._id === clip._id}
                  onSelect={(c) => { setSelectedClip(c); setShowPreviewModal(true); }} />
              ))}
            </div>
          </>
        )}
      </main>

      <button type="button" className={styles.fab} onClick={() => setShowAdd(true)} aria-label="Add clip">
        <span className="material-symbols-outlined">add</span>
      </button>
      {showAdd && <AddClipModal onClose={() => setShowAdd(false)} onSaved={fetchClips} />}
    </div>
  );
}

function ClipCard({ clip, onDelete, onPin, onCopy, selected, onSelect }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const badgeClass = { text: 'badge-text', image: 'badge-image', document: 'badge-document' }[clip.type];

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('Download started');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  return (
    <div className={`${styles.clipCard} ${clip.isPinned ? styles.pinned : ''} ${selected ? styles.clipCardSelected : ''}`}>
      <div className={styles.clipTop}>
        <span className={`badge ${badgeClass}`}>{clip.type}</span>
        {clip.isPinned && <span style={{ fontSize: 12 }}><span style={{fontSize:"1.2rem"}} className="material-symbols-outlined">keep </span></span>}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setMenuOpen(o => !o)}>⋯</button>
          {menuOpen && (
            <div className={styles.menu} onMouseLeave={() => setMenuOpen(false)} onClick={(e) => e.stopPropagation()}>
              {clip.type === 'text' && (
                <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); onCopy(clip.content); setMenuOpen(false); }}>
                  <span className="material-symbols-outlined">content_copy</span>Copy
                </button>
              )}
              <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); onPin(clip); setMenuOpen(false); }}>
                {clip.isPinned ? <p style={{display:"flex", alignContent:"center", gap:".5rem" }}><span  className="material-symbols-outlined">keep_off </span> Unpin</p>  : <p style={{display:"flex", alignContent:"center", gap:".5rem" }}><span  className="material-symbols-outlined">keep </span> Pin</p>  }
              </button>
              <button className={styles.menuItem} style={{ color: '#DC2626' }}
                onClick={(e) => { e.stopPropagation(); onDelete(clip._id); setMenuOpen(false); }}>
                <span className="material-symbols-outlined">delete</span> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.clipBody} onClick={(e) => { e.stopPropagation(); onSelect?.(clip); }}>
        {clip.type === 'image' ? (
          <img src={clip.fileUrl || clip.content} alt={clip.title} className={styles.clipImage} />
        ) : clip.type === 'document' ? (
          <div className={styles.docPreview}>
            <span  className={`material-symbols-outlined ${styles.docIcon}`} >docs</span>
            <div>
              <div className={styles.docName}>{clip.fileName || clip.title}</div>
              {clip.fileSize > 0 && (
                <div className={styles.docSize}>{(clip.fileSize / 1024).toFixed(1)} KB</div>
              )}
            </div>
          </div>
        ) : (
          <p className={styles.clipText}>{clip.content}</p>
        )}
      </div>

      <div className={styles.clipFooter}>
        <span className={styles.clipDate}>
          {formatDistanceToNow(new Date(clip.createdAt), { addSuffix: true })}
        </span>
        {(clip.type === 'document' || clip.type === 'image') && clip.fileUrl && (
          <button
            onClick={() => handleDownload(clip.fileUrl, clip.fileName || clip.title)}
            className={styles.downloadBtn}
            style={{  border: 'none', cursor: 'pointer'}}
          >
            ↓ Download
          </button>
        )}
      </div>
    </div>
  );
}

function AddClipModal({ onClose, onSaved }) {
  const [type, setType] = useState('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: f => setFile(f[0]),
    maxFiles: 1,
    accept: type === 'image'
      ? { 'image/jpeg': [], 'image/png': [], 'image/gif': [], 'image/webp': [],
          'image/svg+xml': [], 'image/bmp': [] }
      : ACCEPTED_TYPES,
    validator: f => f.type.startsWith('video/')
      ? { code: 'file-invalid-type', message: 'Video files are not supported' }
      : null,
  });
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('title', title || 'Untitled');
      fd.append('tags', '[]');
      if (type === 'text') fd.append('content', content);
      if (file) fd.append('file', file);

      await api.post('/clips', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Clip saved!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save clip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Add new clip</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.typeTabs}>
            {['text', 'image', 'document'].map(t => (
              <button style={{ display: 'flex', alignItems: 'center',justifyContent:"center", gap: '.5rem' }} key={t} type="button"
                className={`${styles.typeTab} ${type === t ? styles.typeTabActive : ''}`}
                onClick={() => setType(t)}>
                {t === 'text' ? <span className="material-symbols-outlined">text_fields</span> : t === 'image' ? <span  className="material-symbols-outlined">add_photo_alternate</span> : <span className="material-symbols-outlined">docs</span>} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.modalBody}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Title (optional)</label>
              <input className="form-input" placeholder="Give this clip a name…"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            {type === 'text' ? (
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea className="form-input" rows={6} placeholder="Paste your text here…"
                  value={content} onChange={e => setContent(e.target.value)} required
                  style={{ resize: 'none' }} />
              </div>
            ) : (
              <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}>
                <input {...getInputProps()} />
                {file ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28 }}>{type === 'image' ? <span style={{ fontSize:"1.3rem" }} className="material-symbols-outlined">add_photo_alternate</span> : <span className="material-symbols-outlined">docs</span>}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 8 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setFile(null); }}
                      style={{ marginTop: 8 }}>Remove</button> 
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36 }}>{type === 'image' ? <span style={{ fontSize:"3rem" }} className="material-symbols-outlined">add_photo_alternate</span> : <span style={{ fontSize:"3rem" }} className="material-symbols-outlined">difference</span>}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 8 }}>
                      {isDragActive ? 'Drop it here…' : `Drop ${type} here or click to browse`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Max 10MB</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Spinner /> : 'Save clip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewModal({ clip, onClose, onCopy }) {
  return (
    <div className={styles.previewModalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.previewModalContent}>
        <div className={styles.previewModalHeader}>
          <div>
            <span className={styles.previewLabel}>Clip preview</span>
            <h2 className={styles.previewTitle}>{clip.title || 'Untitled clip'}</h2>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className={styles.previewModalBody}>
          {clip.type === 'image' ? (
            <img src={clip.fileUrl || clip.content} alt={clip.title} className={styles.previewImage} />
          ) : clip.type === 'document' ? (
            <div className={styles.previewDocument}>
              <span className={`material-symbols-outlined ${styles.docIcon}`}>docs</span>
              <div>
                <div className={styles.docName}>{clip.fileName || clip.title}</div>
                <div className={styles.docSize}>{clip.fileSize > 0 ? `${(clip.fileSize / 1024).toFixed(1)} KB` : 'Document preview'}</div>
              </div>
            </div>
          ) : (
            <p className={styles.previewText}>{clip.content}</p>
          )}
        </div>
        <div className={styles.previewModalFooter}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          {clip.type === 'text' ? (
            <button type="button" className="btn btn-primary" onClick={() => onCopy(clip.content || '')}>Copy</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={async () => {
              try {
                const response = await fetch(clip.fileUrl);
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = clip.fileName || clip.title || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                toast.success('Download started');
              } catch (err) {
                toast.error('Download failed');
              }
            }}>Download</button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ tab, onAdd }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{tabIcon(tab)}</div>
      <h3>No {tab === 'all' ? '' : tab} clips yet</h3>
      <p>Add text, images, or documents to start syncing across your devices.</p>
      <button className="btn btn-primary" onClick={onAdd}>+ Add your first clip</button>
    </div>
  );
}

function tabIcon(t) {
  return { all: <span className="material-symbols-outlined">apps</span>, text: <span className="material-symbols-outlined">text_fields</span>, image: <span className="material-symbols-outlined">imagesmode</span>, document: <span className="material-symbols-outlined">docs</span> }[t] || <span className="material-symbols-outlined">apps</span>;
}
