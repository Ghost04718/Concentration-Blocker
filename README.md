# README.md
# Focus Blocker - Chrome Extension

A minimal but powerful Chrome extension for blocking distracting websites with advanced scheduling capabilities.

## Features

- 🎯 Block websites by categories
- 📅 Schedule blocking times for each category
- 🔄 Enable/disable categories with one click
- ⚡ Quick blocking from extension popup
- 🕒 Multiple time ranges per schedule
- 📱 Responsive and clean UI
- 💾 Sync settings across devices

## Installation

1. Clone this repository or download as ZIP
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Project Structure

```
focus-blocker/
├── icons/
│   ├── icon16.png
│   └── icon128.png
├── background.js      # Service worker for blocking and scheduling
├── blocked.html      # Blocked page template
├── blocked.js        # Blocked page functionality
├── manifest.json     # Extension manifest
├── popup.html        # Extension popup UI
├── popup.js         # Popup functionality
├── scheduling.js    # Time scheduling utilities
└── README.md        # Documentation
```

## Usage

1. Click the extension icon in Chrome toolbar
2. Create categories for different types of sites
3. Add sites to categories
4. Optionally set schedules for each category
5. Enable/disable categories as needed

## Technical Details

- Built for Manifest V3
- Uses Chrome Storage Sync API
- Modular design with separate scheduling logic
- Clean, responsive UI with CSS variables
- Efficient background service worker

## Development

To modify the extension:

1. Make changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Test changes in a new Chrome window

## Data Privacy

All users' data are stored locally.
