// Ghost Tabber - Service Worker
// Tracks tab activity and auto-closes inactive tabs

// Default settings
const DEFAULT_SETTINGS = {
  inactiveTimeout: 1800000,      // 30 minutes
  enabled: true,
  excludePinned: true,
  excludeAudible: true,
  maxArchiveSize: 1000,
  checkInterval: 1                // 1 minute
};

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Ghost Tabber installed');
  await initializeDefaultSettings();
  await ensureAlarmExists();
});

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Ghost Tabber startup');
  await ensureAlarmExists();
});

// Initialize default settings
async function initializeDefaultSettings() {
  const { settings } = await chrome.storage.sync.get('settings');
  if (!settings) {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  }

  // Initialize empty tab activity and archive if needed
  const { tabActivity } = await chrome.storage.local.get('tabActivity');
  if (!tabActivity) {
    await chrome.storage.local.set({ tabActivity: {} });
  }

  const { archivedTabs } = await chrome.storage.local.get('archivedTabs');
  if (!archivedTabs) {
    await chrome.storage.local.set({ archivedTabs: [] });
  }
}

// Ensure alarm exists
async function ensureAlarmExists() {
  const alarm = await chrome.alarms.get('checkInactiveTabs');
  if (!alarm) {
    console.log('Creating checkInactiveTabs alarm');
    chrome.alarms.create('checkInactiveTabs', { periodInMinutes: 1 });
  }
}

// Get settings
async function getSettings() {
  const { settings } = await chrome.storage.sync.get('settings');
  return settings || DEFAULT_SETTINGS;
}

// Get tab activity
async function getTabActivity() {
  const { tabActivity } = await chrome.storage.local.get('tabActivity');
  return tabActivity || {};
}

// Get archived tabs
async function getArchivedTabs() {
  const { archivedTabs } = await chrome.storage.local.get('archivedTabs');
  return archivedTabs || [];
}

// Update tab activity timestamp
async function updateTabActivity(tabId) {
  const tabActivity = await getTabActivity();
  tabActivity[tabId] = Date.now();
  await chrome.storage.local.set({ tabActivity });
  console.log(`Updated activity for tab ${tabId}`);
}

// Archive a tab before closing
async function archiveTab(tab, lastActive) {
  const archived = await getArchivedTabs();
  const settings = await getSettings();

  archived.unshift({
    id: crypto.randomUUID(),
    url: tab.url,
    title: tab.title || 'Untitled',
    favicon: tab.favIconUrl || '',
    archivedAt: Date.now(),
    lastActive: lastActive,
    pinned: tab.pinned || false
  });

  // Enforce size limit
  if (archived.length > settings.maxArchiveSize) {
    archived.length = settings.maxArchiveSize;
  }

  await chrome.storage.local.set({ archivedTabs: archived });
  console.log(`Archived tab: ${tab.title}`);
}

// Check and close inactive tabs
async function checkAndCloseInactiveTabs() {
  const settings = await getSettings();

  if (!settings.enabled) {
    console.log('Ghost Tabber is disabled, skipping check');
    return;
  }

  const now = Date.now();
  const cutoffTime = now - settings.inactiveTimeout;
  const tabActivity = await getTabActivity();
  const allTabs = await chrome.tabs.query({});

  console.log(`Checking ${allTabs.length} tabs for inactivity (cutoff: ${new Date(cutoffTime)})`);

  let closedCount = 0;

  for (const tab of allTabs) {
    // Get last active time (use tab creation time if no activity recorded)
    const lastActive = tabActivity[tab.id] || now;

    // Skip if not inactive yet
    if (lastActive > cutoffTime) {
      continue;
    }

    // Skip active tab (currently focused)
    if (tab.active) {
      console.log(`Skipping active tab: ${tab.title}`);
      continue;
    }

    // Skip pinned tabs if setting enabled
    if (tab.pinned && settings.excludePinned) {
      console.log(`Skipping pinned tab: ${tab.title}`);
      continue;
    }

    // Skip audible tabs if setting enabled
    if (tab.audible && settings.excludeAudible) {
      console.log(`Skipping audible tab: ${tab.title}`);
      continue;
    }

    // Skip special URLs (chrome://, about:, etc.)
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:') ||
        tab.url.startsWith('chrome-extension://')) {
      console.log(`Skipping special URL: ${tab.url}`);
      continue;
    }

    // Archive and close the tab
    try {
      await archiveTab(tab, lastActive);
      await chrome.tabs.remove(tab.id);
      closedCount++;
      console.log(`Closed inactive tab: ${tab.title}`);
    } catch (error) {
      console.error(`Error closing tab ${tab.id}:`, error);
    }
  }

  if (closedCount > 0) {
    console.log(`Closed ${closedCount} inactive tabs`);
  }
}

// Track tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateTabActivity(activeInfo.tabId);
});

// Track tab updates (URL changes, reloads)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    await updateTabActivity(tabId);
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      windowId: windowId
    });

    if (activeTab) {
      await updateTabActivity(activeTab.id);
    }
  } catch (error) {
    console.error('Error handling window focus change:', error);
  }
});

// Clean up tracking data when tabs are closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const tabActivity = await getTabActivity();
  delete tabActivity[tabId];
  await chrome.storage.local.set({ tabActivity });
});

// Handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkInactiveTabs') {
    console.log('Alarm triggered: checking inactive tabs');
    checkAndCloseInactiveTabs();
  }
});

// Handle manual check trigger from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkNow') {
    console.log('Manual check triggered from popup');
    checkAndCloseInactiveTabs().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('Error in manual check:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
});

console.log('Ghost Tabber background script loaded');
