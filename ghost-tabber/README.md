# 👻 Ghost Tabber

A browser extension that automatically archives and closes inactive tabs to keep your browser clean.

## Features

- 🔄 **Auto-close inactive tabs** - Set a timeout (5 minutes to 4 hours)
- 💾 **Searchable archive** - Never lose an important tab
- 🎯 **Smart exclusions** - Keep pinned tabs and tabs with audio
- 🎨 **Clean interface** - Simple popup and archive page
- 🚀 **Zero dependencies** - Pure vanilla JavaScript, no build process

## Installation

### For Development

1. Clone or download this repository
2. **Create icons** (see below)
3. Open Chrome/Edge and navigate to `chrome://extensions`
4. Enable "Developer mode" (top right)
5. Click "Load unpacked"
6. Select the `ghost-tabber` folder
7. The extension is now installed!

### Creating Icons

The extension requires three icon files in the `icons/` directory:
- `icon-16.png` (16x16)
- `icon-48.png` (48x48)
- `icon-128.png` (128x128)

**Quick option:** Use a ghost emoji screenshot:
1. Take screenshots of the 👻 emoji at different sizes
2. Resize to 16x16, 48x48, and 128x128 pixels
3. Save as `icon-16.png`, `icon-48.png`, `icon-128.png` in the `icons/` folder

**Or:** Use any icon creation tool to make simple ghost-themed icons with a purple/indigo color scheme.

## Usage

### Quick Start

1. Click the Ghost Tabber icon in your toolbar
2. Configure your settings:
   - Set the inactivity timeout
   - Choose whether to keep pinned tabs
   - Choose whether to keep tabs with audio
3. Toggle "Auto-close tabs" ON
4. That's it! Tabs will be automatically archived

### Archive Page

- Click "Open Archive" in the popup
- Search archived tabs by title or URL
- Click "Restore" to reopen a tab
- Click "Delete" to delete from archive
- Click "Clear All" to remove all archived tabs

## How It Works

1. **Tracking:** The extension tracks when you last interacted with each tab
2. **Checking:** Every minute, it checks which tabs are inactive
3. **Archiving:** Inactive tabs are saved (URL, title, favicon, timestamps)
4. **Closing:** Archived tabs are automatically closed
5. **Restoring:** Click any archived tab to reopen it

## Settings

- **Close tabs after:** 5 min, 10 min, 30 min, 1 hour, 2 hours, or 4 hours
- **Keep pinned tabs open:** Never close pinned tabs
- **Keep tabs with audio open:** Never close tabs playing audio
- **Max archive size:** 1000 tabs (oldest are removed first)

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- No tracking or analytics

## Technical Details

- **Manifest Version:** V3
- **Permissions:** tabs, alarms, storage, host permissions
- **Storage:** Chrome Storage API (local + sync)
- **Background:** Service worker with alarm-based checks
- **UI:** Vanilla JavaScript, no frameworks


## Troubleshooting

### Tabs aren't being closed

- Check that the extension is enabled (toggle in popup)
- Verify the timeout is reasonable (try 5 minutes for testing)
- Check browser console for errors (inspect the service worker)
- Active, pinned, or audible tabs won't be closed (check settings)

### Archive page is empty

- Tabs may not have reached the inactivity timeout yet
- Check service worker logs: `chrome://extensions` → "Inspect views: service worker"

### Extension not loading

- Make sure all files are present
- **Create the icon files** (see "Creating Icons" above)
- Check for errors in `chrome://extensions`

## License

MIT License - feel free to use and modify as needed.

## Credits

Built with vanilla JavaScript - no frameworks, no build process, just simple code.
