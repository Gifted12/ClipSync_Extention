// ClipSync Extension - Background Service Worker

const API_BASE = 'http://localhost:5000/api'; // Change to your production URL

// ── Context menu setup ────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'clipsync-save-text',
    title: 'Save to ClipSync',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'clipsync-save-image',
    title: 'Save image to ClipSync',
    contexts: ['image'],
  });
  console.log('ClipSync extension installed');
});

// ── Context menu click handler ────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const result = await chrome.storage.local.get('token');
  const token = result.token;

  if (!token) {
    chrome.action.openPopup();
    return;
  }

  if (info.menuItemId === 'clipsync-save-text' && info.selectionText) {
    try {
      await fetch(`${API_BASE}/clips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'text',
          title: info.selectionText.slice(0, 50),
          content: info.selectionText,
          tags: '[]',
        }),
      });
      // Notify the tab
      chrome.tabs.sendMessage(tab.id, { action: 'clipsync-saved', message: 'Text saved to ClipSync!' });
    } catch (err) {
      console.error('ClipSync save failed:', err);
    }
  }

  if (info.menuItemId === 'clipsync-save-image' && info.srcUrl) {
    // For images, open popup so user can confirm
    await chrome.storage.local.set({ pendingImageUrl: info.srcUrl });
    chrome.action.openPopup();
  }
});

// ── Message listener ──────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getToken') {
    chrome.storage.local.get('token', (data) => {
      sendResponse({ token: data.token || null });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'saveClip') {
    chrome.storage.local.get('token', async (data) => {
      const token = data.token;
      if (!token) { sendResponse({ error: 'Not authenticated' }); return; }
      try {
        const res = await fetch(`${API_BASE}/clips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(request.payload),
        });
        const clip = await res.json();
        sendResponse({ success: true, clip });
      } catch (err) {
        sendResponse({ error: err.message });
      }
    });
    return true;
  }
});

// ── Alarm for periodic sync ───────────────────────────────
chrome.alarms.create('sync', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'sync') return;
  const result = await chrome.storage.local.get('token');
  if (!result.token) return;
  // Could do background sync tasks here
  console.log('ClipSync background sync tick');
});
