# 👻 Ghost Tabber - Quick Testing Guide

## Testing Features Added

I've added special testing features so you can test this **in seconds** instead of waiting minutes!

### New Features:

1. **⚡ Super Short Timeouts:**
   - 10 seconds (instant testing!)
   - 30 seconds
   - 1 minute

2. **⚡ "Check Now" Button:**
   - Manually trigger a check immediately
   - No waiting for the 1-minute alarm!

3. **Enhanced Logging:**
   - See exactly what's happening in the console

## 🚀 30-Second Test (Fastest!)

### Step 1: Install & Setup (10 seconds)
```
1. Go to chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the ghost-tabber folder
```

### Step 2: Configure for Testing (5 seconds)
```
1. Click the 👻 icon
2. Set timeout to: "⚡ 10 seconds (testing)"
3. Make sure "Auto-close tabs" is ON
```

### Step 3: Open Console (5 seconds)
```
1. Go to chrome://extensions
2. Find "Ghost Tabber"
3. Click "Inspect views: service worker"
4. You now see the console - watch for logs here
```

### Step 4: Test It! (10 seconds)
```
1. Open 2-3 test tabs (Wikipedia, GitHub, anything)
2. Switch to a different tab (make it active)
3. Wait 10 seconds OR click "⚡ Check Now" button
4. Watch the console - you should see:
   ✅ "Archived tab: [Title]"
   ✅ "Closed inactive tab: [Title]"
5. Tabs should close automatically!
6. Click 👻 → "📚 Open Archive" to see them
```

## 📊 Testing Methods

### Method 1: Manual "Check Now" Button (Instant!)

**Best for:** Quick testing without any waiting

```
1. Open some tabs
2. Click 👻 icon
3. Click "⚡ Check Now (Testing)" button
4. Watch button change to "⏳ Checking..."
5. Then "✓ Check Complete!"
6. Tabs should be closed instantly (if past timeout)
```

**Console will show:**
```
Manual check triggered from popup
Checking 5 tabs for inactivity...
Archived tab: Example Page
Closed inactive tab: Example Page
Closed 2 inactive tabs
```

### Method 2: 10-Second Timeout (Automatic)

**Best for:** Testing the automatic alarm system

```
1. Set timeout to "⚡ 10 seconds"
2. Open test tabs
3. Switch away from them
4. Wait 10 seconds
5. Next alarm check (within 1 minute) will close them
```

### Method 3: 30-Second Timeout

**Best for:** More realistic but still quick testing

```
1. Set timeout to "⚡ 30 seconds"
2. Open test tabs
3. Do something else for 30 seconds
4. Alarm will close them on next check
```

## 🔍 What to Watch in Console

### When opening tabs:
```
Updated activity for tab 123
Updated activity for tab 124
```

### When alarm triggers (every 1 minute):
```
Alarm triggered: checking inactive tabs
Checking 5 tabs for inactivity (cutoff: Sat Feb 22 2026 14:30:00)
```

### When tabs are closed:
```
Archived tab: Wikipedia
Closed inactive tab: Wikipedia
Archived tab: GitHub
Closed inactive tab: GitHub
Closed 2 inactive tabs
```

### When tabs are skipped:
```
Skipping active tab: Current Tab
Skipping pinned tab: Gmail
Skipping audible tab: YouTube
```

## ✅ Complete Test Checklist

Run through these tests to verify everything works:

### Test 1: Basic Auto-Close ✓
```
□ Set timeout to 10 seconds
□ Open 3 tabs
□ Switch away and wait 11 seconds
□ Click "Check Now" button
□ Verify tabs are closed
□ Check archive shows 3 tabs
```

### Test 2: Active Tab Protection ✓
```
□ Set timeout to 10 seconds
□ Open 2 tabs
□ Keep one tab active (current)
□ Wait 11 seconds + click "Check Now"
□ Verify active tab stays open
□ Verify other tab is closed
```

### Test 3: Pinned Tab Protection ✓
```
□ Set timeout to 10 seconds
□ Enable "Keep pinned tabs open"
□ Open 2 tabs, pin one
□ Wait 11 seconds + click "Check Now"
□ Verify pinned tab stays open
□ Verify unpinned tab is closed
□ Console shows "Skipping pinned tab"
```

### Test 4: Archive & Search ✓
```
□ Archive 5+ tabs
□ Open archive page
□ Verify all tabs shown
□ Type "wiki" in search
□ Verify filtering works
□ Clear search, all tabs return
```

### Test 5: Restore Tab ✓
```
□ Open archive page
□ Click "↗️ Restore" on any tab
□ Verify new tab opens with correct URL
□ Verify tab removed from archive
```

### Test 6: Delete Tab ✓
```
□ Open archive page
□ Click "🗑️" on any tab
□ Confirm deletion
□ Verify tab removed from archive
```

### Test 7: Settings Persistence ✓
```
□ Change timeout to 1 minute
□ Uncheck "Keep pinned tabs open"
□ Close popup
□ Reopen popup
□ Verify settings are saved
```

### Test 8: Manual Check Button ✓
```
□ Open 2 tabs
□ Wait 11 seconds (with 10s timeout)
□ Click "⚡ Check Now" button
□ Button shows "⏳ Checking..."
□ Then "✓ Check Complete!"
□ Stats refresh automatically
□ Tabs are closed
```

## 🐛 Debugging Tips

### See what tabs are being tracked:
```javascript
// In service worker console:
chrome.storage.local.get('tabActivity', console.log)
```

### See archived tabs:
```javascript
// In service worker console:
chrome.storage.local.get('archivedTabs', console.log)
```

### See current settings:
```javascript
// In service worker console:
chrome.storage.sync.get('settings', console.log)
```

### Manually trigger check:
```javascript
// In service worker console:
checkAndCloseInactiveTabs()
```

### Check alarm status:
```javascript
// In service worker console:
chrome.alarms.getAll(console.log)
```

### Clear all storage (reset):
```javascript
// In service worker console:
chrome.storage.local.clear()
chrome.storage.sync.clear()
// Then reload the extension
```

## ⚠️ Important Notes

### Testing vs Production:

**FOR TESTING:**
- Use ⚡ 10-second or 30-second timeouts
- Use "Check Now" button for instant results
- Watch console logs to see what's happening

**FOR REAL USE:**
- Change to 30 minutes - 2 hours timeout
- Let it run automatically
- Don't need console open

### Why "Check Now" is powerful:

The "Check Now" button bypasses the 1-minute alarm wait. Normally:
1. Alarm runs every 1 minute
2. It checks tabs against the timeout
3. If inactive > timeout, closes them

With "Check Now":
1. You trigger the check immediately
2. No waiting for the next alarm
3. Perfect for testing!

### Understanding the Timeout:

- **Timeout = 10 seconds** means: "Close tabs that haven't been touched in 10 seconds"
- Opening a tab = timestamp recorded
- Switching to a tab = timestamp updated
- After 10 seconds of no activity + alarm check = closed

## 🎯 Expected Results

After running all tests:

- ✅ Extension loads without errors
- ✅ Popup UI works and shows stats
- ✅ Tabs are tracked when you interact with them
- ✅ Inactive tabs are auto-closed after timeout
- ✅ Active tab is never closed
- ✅ Pinned tabs are excluded (if enabled)
- ✅ Archive page displays closed tabs
- ✅ Search filters tabs correctly
- ✅ Restore opens tabs
- ✅ Delete removes tabs
- ✅ Settings persist
- ✅ "Check Now" button works instantly

## 🚨 Troubleshooting

### "Check Now" button does nothing
- Check service worker console for errors
- Make sure extension is enabled
- Try reloading the extension

### Tabs not closing
- Verify timeout has elapsed (10+ seconds with 10s setting)
- Check if tabs are active/pinned/audible
- Look at console logs - should say why skipping

### Archive empty after closing tabs
- Check service worker console - did archiving happen?
- Try: `chrome.storage.local.get('archivedTabs', console.log)`
- May have hit an error - check console

### Service worker not responding
- Go to chrome://extensions
- Find Ghost Tabber
- Click "Inspect views: service worker" to wake it up
- If errors shown, read them

## 📝 Sample Test Run

Here's what a successful test looks like:

```
[You] Open chrome://extensions → Load unpacked
[Extension] Ghost Tabber installed
[You] Click 👻 icon → Set timeout to "10 seconds"
[Extension] ✓ Saved
[You] Open 3 Wikipedia tabs
[Console] Updated activity for tab 123
[Console] Updated activity for tab 124
[Console] Updated activity for tab 125
[You] Switch to Gmail tab (make it active)
[You] Wait 11 seconds
[You] Click "⚡ Check Now" button
[Console] Manual check triggered from popup
[Console] Checking 4 tabs for inactivity...
[Console] Skipping active tab: Gmail
[Console] Archived tab: Wikipedia - Article 1
[Console] Closed inactive tab: Wikipedia - Article 1
[Console] Archived tab: Wikipedia - Article 2
[Console] Closed inactive tab: Wikipedia - Article 2
[Console] Archived tab: Wikipedia - Article 3
[Console] Closed inactive tab: Wikipedia - Article 3
[Console] Closed 3 inactive tabs
[Button] ✓ Check Complete!
[Stats] Shows "3 Archived Tabs"
[You] Click "📚 Open Archive"
[Archive] Shows 3 Wikipedia tabs
[You] Type "article 1" in search
[Archive] Shows only "Article 1"
[You] Click "↗️ Restore"
[Browser] Opens new tab with Article 1
[Archive] Now shows 2 tabs
✅ TEST PASSED
```

---

**Ready to test? Start with the 30-Second Test above!** 🚀
