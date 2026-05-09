// ClipSync content script — shows in-page toast when text is saved via context menu

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'clipsync-saved') {
    showToast(request.message || 'Saved to ClipSync!');
  }
});

function showToast(message) {
  // Remove existing
  const existing = document.getElementById('clipsync-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'clipsync-toast';
  toast.textContent = '📋 ' + message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #1A1A2E;
    color: #F8F7F4;
    padding: 10px 18px;
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    z-index: 2147483647;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.25s ease;
    pointer-events: none;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
