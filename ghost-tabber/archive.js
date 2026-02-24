// Ghost Tabber - Archive Page Logic

let allArchivedTabs = [];

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    await loadArchivedTabs();
    setupEventListeners();
});

// Load archived tabs from storage
async function loadArchivedTabs() {
    const { archivedTabs } = await chrome.storage.local.get('archivedTabs');
    allArchivedTabs = archivedTabs || [];
    displayArchivedTabs(allArchivedTabs);
    updateStats();
}

// Display archived tabs
function displayArchivedTabs(tabs) {
    const archiveList = document.getElementById('archiveList');
    const emptyState = document.getElementById('emptyState');
    const clearAllBtn = document.getElementById('clearAllBtn');

    archiveList.innerHTML = '';

    if (tabs.length === 0) {
        emptyState.style.display = 'block';
        archiveList.style.display = 'none';
        if (clearAllBtn) {
            clearAllBtn.style.opacity = '0.5';
            clearAllBtn.style.pointerEvents = 'none';
        }
        return;
    }

    emptyState.style.display = 'none';
    archiveList.style.display = 'flex';
    if (clearAllBtn) {
        clearAllBtn.style.opacity = '1';
        clearAllBtn.style.pointerEvents = 'auto';
    }

    tabs.forEach((tab, index) => {
        const delay = index * 0.05; // staggered animation

        const card = document.createElement('div');
        card.className = 'tab-card';
        card.dataset.id = tab.id;
        card.style.animationDelay = `${delay}s`;

        const timeString = formatRelativeTime(tab.archivedAt);

        card.innerHTML = `
            <div class="tab-favicon">
                ${tab.favicon ? `<img src="${tab.favicon}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: ${tab.favicon ? 'none' : 'block'}; margin: auto;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </div>
            <div class="tab-info">
                <div class="tab-title" title="${escapeHtml(tab.title)}">${escapeHtml(tab.title)}</div>
                <div class="tab-meta">
                    <span>${timeString}</span>
                    <span>•</span>
                    <span class="tab-url" title="${escapeHtml(tab.url)}">${escapeHtml(tab.url)}</span>
                </div>
            </div>
            <div class="tab-actions" style="display: flex; gap: 8px;">
                <button class="btn btn-revive" data-id="${tab.id}">Revive</button>
                <button class="btn btn-banish" data-id="${tab.id}">Banish</button>
            </div>
        `;
        archiveList.appendChild(card);
    });

    // Add event listeners for buttons inside cards
    archiveList.querySelectorAll('.btn-revive').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleAction(e.target.dataset.id, 'revive');
        });
    });

    archiveList.querySelectorAll('.btn-banish').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleAction(e.target.dataset.id, 'banish');
        });
    });
}

// Handle Revive/Banish clicks with animations
function handleAction(tabId, action) {
    if (action === 'banish' && !confirm('Banish this tab from the archive?')) {
        return;
    }

    const archiveList = document.getElementById('archiveList');
    const cardToRemove = archiveList.querySelector(`.tab-card[data-id="${tabId}"]`);

    if (cardToRemove) {
        cardToRemove.style.transform = action === 'revive' ? 'translateY(-20px) scale(1.05)' : 'translateX(50px)';
        cardToRemove.style.opacity = '0';
        cardToRemove.style.pointerEvents = 'none';

        setTimeout(() => {
            if (action === 'revive') {
                restoreTab(tabId);
            } else {
                deleteTab(tabId);
            }
        }, 300);
    }
}

// Restore a tab
async function restoreTab(tabId) {
    const tab = allArchivedTabs.find(t => String(t.id) === String(tabId));
    if (!tab) return;

    try {
        await chrome.tabs.create({ url: tab.url });

        // Remove from archive
        allArchivedTabs = allArchivedTabs.filter(t => String(t.id) !== String(tabId));
        await chrome.storage.local.set({ archivedTabs: allArchivedTabs });

        // Update display
        const searchInput = document.getElementById('searchInput');
        const filteredTabs = searchArchive(searchInput ? searchInput.value : '');
        displayArchivedTabs(filteredTabs);
        updateStats();
    } catch (error) {
        console.error('Error restoring tab:', error);
        alert('Failed to revive the tab');
    }
}

// Delete a tab from archive
async function deleteTab(tabId) {
    allArchivedTabs = allArchivedTabs.filter(t => String(t.id) !== String(tabId));
    await chrome.storage.local.set({ archivedTabs: allArchivedTabs });

    // Update display
    const searchInput = document.getElementById('searchInput');
    const filteredTabs = searchArchive(searchInput ? searchInput.value : '');
    displayArchivedTabs(filteredTabs);
    updateStats();
}

// Update stats
function updateStats() {
    const totalCount = document.getElementById('totalCount');
    if (totalCount) {
        const count = allArchivedTabs.length;
        totalCount.textContent = `${count} archived tab${count !== 1 ? 's' : ''}`;
    }
}

// Search archived tabs
function searchArchive(query) {
    if (!query.trim()) {
        return allArchivedTabs;
    }

    const lowerQuery = query.toLowerCase();
    return allArchivedTabs.filter(tab =>
        (tab.title || '').toLowerCase().includes(lowerQuery) ||
        (tab.url || '').toLowerCase().includes(lowerQuery)
    );
}

// Clear all archived tabs
async function clearAll() {
    if (!confirm('Exorcise all archived tabs? This cannot be undone.')) return;

    const archiveList = document.getElementById('archiveList');
    const cards = archiveList.querySelectorAll('.tab-card');

    cards.forEach((card, i) => {
        setTimeout(() => {
            card.style.transform = 'translateY(20px)';
            card.style.opacity = '0';
        }, i * 50);
    });

    setTimeout(async () => {
        allArchivedTabs = [];
        await chrome.storage.local.set({ archivedTabs: [] });

        displayArchivedTabs([]);
        updateStats();
    }, cards.length * 50 + 300);
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const clearAllBtn = document.getElementById('clearAllBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const filteredTabs = searchArchive(e.target.value);
            displayArchivedTabs(filteredTabs);
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAll);
    }
}

// Utility: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility: Format relative time
function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Unknown time';
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'just now';
}
