# Ghost Tabber - Installation & Testing Guide

## Quick Install (5 minutes)

### 1. Load Extension in Chrome/Edge

1. Open your browser and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Navigate to and select the `ghost-tabber` folder
5. The Ghost Tabber extension should now appear in your extensions list

### 2. Verify Installation

- Look for the Ghost Tabber icon (👻) in your browser toolbar
- If you don't see it, click the extensions puzzle icon and pin Ghost Tabber
- Click the icon to open the popup - you should see the settings interface

### 3. Initial Configuration

1. Click the Ghost Tabber icon
2. Verify "Auto-close tabs" is toggled **ON** (blue)
3. Set "Close tabs after" to **5 minutes** (for quick testing)
4. Keep both checkboxes enabled:
   - ✅ Keep pinned tabs open
   - ✅ Keep tabs with audio open
5. Settings are saved automatically

## Testing (10 minutes)

### Test 1: Basic Tab Tracking

**Goal:** Verify the extension tracks tab activity

1. Open the browser console for the service worker:
   - Go to `chrome://extensions`
   - Find Ghost Tabber
   - Click "Inspect views: service worker"
2. Open 5-10 new tabs with different websites
3. Switch between tabs randomly
4. Check the console - you should see logs like:
   ```
   Updated activity for tab 123
   ```

### Test 2: Auto-Close Functionality

**Goal:** Verify tabs are automatically archived and closed

1. Make sure timeout is set to **5 minutes**
2. Open 3 test tabs (e.g., Wikipedia, GitHub, Stack Overflow)
3. Switch to a different tab (make it active)
4. **Wait 6 minutes** without touching the 3 test tabs
5. Check the console - after ~6 minutes you should see:
   ```
   Alarm triggered: checking inactive tabs
   Archived tab: [Tab Title]
   Closed inactive tab: [Tab Title]
   Closed 3 inactive tabs
   ```
6. The 3 test tabs should now be closed
7. Click the Ghost Tabber icon - it should show "3 Archived Tabs"

### Test 3: Archive Page

**Goal:** Verify the archive displays and works correctly

1. Click the Ghost Tabber icon
2. Click **📚 Open Archive** button
3. You should see your 3 archived tabs listed with:
   - Tab favicon and title
   - Full URL
   - "Archived X minutes ago" timestamp
4. **Test search:**
   - Type "wiki" in the search box
   - Only Wikipedia tab should show
   - Clear the search - all tabs reappear
5. **Test restore:**
   - Click **↗️ Restore** on any tab
   - A new tab should open with that URL
   - The tab disappears from the archive
6. **Test delete:**
   - Click **🗑️** on any tab
   - Confirm deletion
   - The tab disappears from the archive

### Test 4: Pinned Tab Protection

**Goal:** Verify pinned tabs are not closed

1. Open a new tab
2. Right-click the tab → **Pin tab**
3. Wait for the timeout (5+ minutes)
4. The pinned tab should **NOT** be closed
5. Check the console - you should see:
   ```
   Skipping pinned tab: [Tab Title]
   ```

### Test 5: Active Tab Protection

**Goal:** Verify the currently active tab is never closed

1. Open a new tab and keep it active
2. Wait for the timeout (5+ minutes)
3. The active tab should **NOT** be closed
4. Console should show it was checked but skipped

### Test 6: Settings Persistence

**Goal:** Verify settings are saved across browser restarts

1. Change the timeout to **1 hour**
2. Uncheck "Keep pinned tabs open"
3. Close the popup
4. Close and reopen the browser
5. Click the Ghost Tabber icon
6. Settings should still show:
   - Timeout: 1 hour
   - Keep pinned tabs open: unchecked

### Test 7: Clear All Archive

**Goal:** Verify bulk deletion works

1. Archive several tabs (open them and wait)
2. Open the archive page
3. Click **Clear All** button
4. Confirm the action
5. Archive should now be empty
6. Should show "👻 No archived tabs yet"

## Common Issues & Solutions

### Issue: Tabs aren't being closed

**Possible causes:**
- Extension is disabled (check toggle in popup)
- Timeout hasn't elapsed yet (wait longer or reduce timeout)
- Tabs are pinned/active/audible (check exclusion settings)
- Service worker crashed (check `chrome://extensions` for errors)

**Solution:**
1. Verify "Auto-close tabs" is ON
2. Set timeout to 5 minutes for testing
3. Check service worker console for errors
4. Reload the extension if needed

### Issue: Archive page is empty

**Possible causes:**
- No tabs have been archived yet
- Tabs haven't reached the inactivity timeout
- Archive was cleared

**Solution:**
1. Check popup stats - does it show archived tabs?
2. Wait for the full timeout duration
3. Check service worker logs for "Archived tab" messages

### Issue: Extension won't load

**Possible causes:**
- Missing icon files
- Syntax errors in code
- Manifest errors

**Solution:**
1. Check `chrome://extensions` for error messages
2. Verify all files are present (11 files total)
3. Check icon files exist: `icons/icon-16.png`, `icons/icon-48.png`, `icons/icon-128.png`
4. Click "Errors" button on the extension card for details

### Issue: Service worker not running

**Symptom:** No console logs, tabs not closing

**Solution:**
1. Go to `chrome://extensions`
2. Find Ghost Tabber
3. Click "Inspect views: service worker" to start it
4. Check for errors in the console
5. Reload the extension

## Performance Notes

- **Storage usage:** ~1KB per archived tab (very light)
- **Max archive size:** 1000 tabs (configurable in code)
- **Check interval:** Every 1 minute (configurable in code)
- **Service worker:** Automatically stops when idle (normal behavior)
- **Alarms persist:** Checks continue even when service worker is stopped

## Next Steps

After successful testing:

1. **Adjust timeout** to a realistic value (30 minutes - 2 hours)
2. **Configure exclusions** based on your workflow
3. **Monitor archive size** - periodically clear old tabs
4. **Check stats** to see how many tabs you're saving

## Advanced Testing

### Test Service Worker Persistence

1. Archive some tabs
2. Close all browser windows
3. Wait 5 minutes
4. Reopen browser
5. Open more tabs
6. After timeout, they should still be archived (alarm persists)

### Test Storage Limits

1. Set timeout to 5 minutes
2. Open 100+ tabs in batches
3. Let them all get archived
4. Check archive page loads quickly
5. Search should still be fast

### Test Edge Cases

- URLs with special characters
- Very long tab titles (>200 chars)
- Tabs with no favicon
- Tabs that fail to load (about:blank)
- Rapid tab switching

## Debugging Tips

**View service worker logs:**
```
chrome://extensions → Ghost Tabber → Inspect views: service worker
```

**View storage data:**
```javascript
// In service worker console:
chrome.storage.local.get(null, console.log)
chrome.storage.sync.get(null, console.log)
```

**Manual check trigger:**
```javascript
// In service worker console:
checkAndCloseInactiveTabs()
```

**View alarm status:**
```javascript
// In service worker console:
chrome.alarms.getAll(console.log)
```

## Success Criteria ✅

- [ ] Extension loads without errors
- [ ] Popup displays correctly
- [ ] Settings can be changed and persist
- [ ] Tab activity is tracked accurately
- [ ] Inactive tabs are archived after timeout
- [ ] Archived tabs appear in archive page
- [ ] Search filters tabs correctly
- [ ] Restore opens tabs correctly
- [ ] Pinned tabs are excluded (if enabled)
- [ ] Active tab is never closed
- [ ] Service worker alarm persists across restarts
- [ ] Clear all removes all archived tabs

Once all criteria pass, the extension is ready to use! 🎉
