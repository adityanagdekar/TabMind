# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TabMind is a Chrome extension (Manifest V3) that provides semantic search over your browsing history using OpenAI embeddings. Users can search their previously visited pages using natural language queries instead of exact keyword matches.

## Build & Development Commands

```bash
# Build the extension for production
npm run build

# Development mode with hot reload
npm run dev

# Preview the build
npm run preview

# Lint the UI code (run from ui/ directory)
cd ui && npm run lint
```

After building, load the `dist/` folder as an unpacked extension in Chrome.

## Architecture

The extension consists of three main components that work together:

### 1. Content Script ([content/index.js](content/index.js))
- Runs on all web pages (matches: `<all_urls>`)
- Extracts page metadata (URL, title) and text content (first 5000 chars)
- Filters out Chrome system pages (chrome://, chrome-extension://, about:)
- Sends extracted content to background worker via `chrome.runtime.sendMessage`

### 2. Background Service Worker ([background.js](background.js))
- Listens for `PAGE_CONTENT` messages from content script
- Generates OpenAI embeddings using `text-embedding-3-small` model
- Stores page data in IndexedDB with structure: `{ url, title, vector, timestamp }`
- Handles deduplication by URL

### 3. Popup UI ([ui/src/](ui/src/))
- React-based popup interface (400px width)
- Search functionality computes cosine similarity between query embedding and stored page embeddings
- Returns top 6 most relevant results
- Uses Dexie (IndexedDB wrapper) for local data storage

## Data Flow

1. User visits a web page
2. Content script extracts text → sends to background worker
3. Background worker generates embedding (1536-dimensional vector) → saves to IndexedDB
4. User opens popup and enters search query
5. Query is converted to embedding → compared against all stored page embeddings
6. Results ranked by cosine similarity and displayed

## Key Technical Details

### Vite Build Configuration
- Multi-entry bundling: popup UI, background worker, content script
- Output structure:
  - `dist/background.js` - background service worker
  - `dist/content.js` - content script
  - `dist/ui/index.html` - popup HTML
  - `dist/manifest.json` - generated manifest with corrected paths
- Custom plugin copies and modifies manifest.json for dist folder
- Alias: `@` → `ui/src/`

### Environment Variables
- `VITE_OPENAI_API_KEY` must be set in root `.env` file
- API key is embedded at build time via Vite's `define` config
- **Security Note:** The .env file contains an exposed API key that should be rotated

### IndexedDB Schema
```javascript
db.version(1).stores({
  entries: "++id, url, title, timestamp"
  // vector field stored but not indexed (too large for indexing)
});
```

### OpenAI API Integration
- Model: `text-embedding-3-small`
- Input truncation: 8000 characters (to stay within token limits)
- Embedding dimension: 1536
- Located in [ui/src/embeddings.js](ui/src/embeddings.js)

### Content Extraction
- Uses `document.body.innerText` with whitespace normalization
- Limited to first 5000 characters per page
- Ignores system pages and empty content

## File Structure

```
TabMind/
├── vite.config.js          # Build configuration with multi-entry setup
├── package.json            # Root dependencies (Dexie, React, Vite)
├── manifest.json           # Source manifest (points to dist/ paths)
├── .env                    # OpenAI API key (VITE_OPENAI_API_KEY)
├── background.js           # Service worker entry point
├── content/
│   ├── index.js           # Content script entry point
│   ├── utils.js           # Page filtering and text extraction
│   └── messenger.js       # Chrome messaging wrapper
├── ui/
│   ├── src/
│   │   ├── App.jsx        # Main popup component
│   │   ├── db.js          # IndexedDB/Dexie wrapper
│   │   ├── embeddings.js  # OpenAI API + similarity search
│   │   └── components/
│   │       ├── SearchBar.jsx
│   │       └── ResultsList.jsx
│   ├── index.html         # Popup HTML entry
│   └── package.json       # UI-specific dependencies
└── dist/                   # Build output (load this in Chrome)
```

## Development Workflow

1. Make code changes
2. Run `npm run build` to rebuild the extension
3. Click "Reload" on the extension in Chrome's extension management page
4. Test functionality by visiting pages and searching in the popup

## Common Modifications

### Changing the embedding model
Edit `MODEL` constant in [ui/src/embeddings.js](ui/src/embeddings.js:1)

### Adjusting search result count
Modify `topN` parameter in `searchHistory()` call in [ui/src/App.jsx](ui/src/App.jsx:21)

### Modifying content extraction limits
- Page text limit: [content/utils.js](content/utils.js:12) (currently 5000 chars)
- API input limit: [ui/src/embeddings.js](ui/src/embeddings.js:17) (currently 8000 chars)

### Adding new Chrome permissions
Update both:
- [manifest.json](manifest.json:6) (source)
- [vite.config.js](vite.config.js:23) (build-time generation)
