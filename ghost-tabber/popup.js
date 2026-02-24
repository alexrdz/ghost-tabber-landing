// Ghost Tabber - Popup Logic

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadStats();
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  const { settings } = await chrome.storage.sync.get('settings');

  if (settings) {
    document.getElementById('enabledToggle').checked = settings.enabled;
    document.getElementById('timeoutSelect').value = settings.inactiveTimeout.toString();
    document.getElementById('excludePinnedCheck').checked = settings.excludePinned;
    document.getElementById('excludeAudibleCheck').checked = settings.excludeAudible;
  }
}

// Load and display stats
async function loadStats() {
  // Get archived tabs count
  const { archivedTabs } = await chrome.storage.local.get('archivedTabs');
  const archivedCount = (archivedTabs || []).length;
  document.getElementById('archivedCount').textContent = archivedCount;

  // Get monitored tabs count (all open tabs)
  const allTabs = await chrome.tabs.query({});
  document.getElementById('monitoredCount').textContent = allTabs.length;
}

// Save settings to storage
async function saveSettings() {
  const settings = {
    enabled: document.getElementById('enabledToggle').checked,
    inactiveTimeout: parseInt(document.getElementById('timeoutSelect').value),
    excludePinned: document.getElementById('excludePinnedCheck').checked,
    excludeAudible: document.getElementById('excludeAudibleCheck').checked,
    maxArchiveSize: 1000,
    checkInterval: 1
  };

  await chrome.storage.sync.set({ settings });
  console.log('Settings saved:', settings);
}

// Setup event listeners
function setupEventListeners() {
  // Toggle enabled state
  document.getElementById('enabledToggle').addEventListener('change', async (e) => {
    await saveSettings();
    updateStatusText();
    showSavedIndicator();
  });

  // Timeout select
  document.getElementById('timeoutSelect').addEventListener('change', async () => {
    await saveSettings();
    showSavedIndicator();
  });

  // Exclude pinned checkbox
  document.getElementById('excludePinnedCheck').addEventListener('change', async () => {
    await saveSettings();
    showSavedIndicator();
  });

  // Exclude audible checkbox
  document.getElementById('excludeAudibleCheck').addEventListener('change', async () => {
    await saveSettings();
    showSavedIndicator();
  });

  // Open archive button
  document.getElementById('openArchiveBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("archive.html") });
  });

  // Check now button (testing)
  document.getElementById('checkNowBtn').addEventListener('click', async () => {
    const btn = document.getElementById('checkNowBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Sweeping...';
    btn.disabled = true;
    btn.style.backgroundColor = 'var(--color-accent)';
    btn.style.color = 'var(--color-text)';

    try {
      // Send message to background to trigger check
      await chrome.runtime.sendMessage({ action: 'checkNow' });

      btn.textContent = 'Complete';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.backgroundColor = '';
        btn.style.color = '';
        loadStats(); // Refresh stats
      }, 1500);
    } catch (error) {
      console.error('Error triggering check:', error);
      btn.textContent = 'Error';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }, 1500);
    }
  });

  // Initialize status text
  updateStatusText();
}

// Show saved indicator
function showSavedIndicator() {
  const body = document.querySelector('body');
  const indicator = document.createElement('div');
  indicator.textContent = 'Saved';
  indicator.className = 'saved-indicator';
  body.appendChild(indicator);

  setTimeout(() => {
    indicator.remove();
  }, 2000);
}

// Update status text based on enabled state
function updateStatusText() {
  const enabled = document.getElementById('enabledToggle').checked;
  const statusText = document.getElementById('statusText');
  statusText.textContent = enabled ? 'Active' : 'Inactive';
}


// Simple visual feedback for the extension interface
const checkBtn = document.getElementById('checkNowBtn');
const statusText = document.getElementById('statusText');
const toggle = document.getElementById('enabledToggle');

// Force sweep animation
checkBtn.addEventListener('click', function() {
    const originalText = this.innerText;
    this.innerText = 'SPOOKING...';
    this.style.background = 'var(--ghost-glass-hover)';
    this.style.borderColor = 'var(--glow-cyan)';
    this.style.color = 'var(--glow-cyan)';

    setTimeout(() => {
        this.innerText = originalText;
        this.style.background = '';
        this.style.borderColor = '';
        this.style.color = '';
    }, 800);
});

// Toggle Status update
toggle.addEventListener('change', function() {
    if(this.checked) {
        statusText.innerText = 'Active';
        statusText.style.color = 'var(--glow-cyan)';
        statusText.style.textShadow = '0 0 12px rgba(0, 240, 255, 0.3)';
    } else {
        statusText.innerText = 'Dormant';
        statusText.style.color = 'var(--text-secondary)';
        statusText.style.textShadow = 'none';
    }
});
