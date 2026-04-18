# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TabMind is a Chrome extension (Manifest V3) that transforms your browsing history into an intelligent, searchable knowledge base using AI embeddings and RAG (Retrieval-Augmented Generation).

**Core Features:**
- **Semantic Search**: Search browsing history using natural language queries powered by vector embeddings
- **AI Chat Assistant**: Ask questions about visited pages and get AI-powered answers using RAG
- **Project Organization**: Create separate workspaces for different browsing contexts (e.g., "Research", "Work")
- **Memories Timeline**: Chronological view of all indexed pages organized by project

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
- React-based popup interface (400px width) with tab-based navigation
- **Search View**: Computes cosine similarity between query embedding and stored page embeddings, returns top 6 results
- **Chat View**: RAG-based Q&A interface with relevance filtering (prevents off-topic queries)
- **Memories View**: Timeline display of indexed pages organized by project
- **Settings View**: API key configuration
- Uses Dexie (IndexedDB wrapper) for local data storage (3 tables: entries, projects, messages)
- Project-based organization with dropdown selector and management UI

## Data Flow

### Automatic Indexing
1. User visits a web page
2. Content script extracts text (first 5000 chars) → sends to background worker
3. Background worker generates embedding (1536-dimensional vector) → saves to IndexedDB
4. Page data stored with project association

### Search Flow
1. User opens popup and enters search query
2. Query is converted to embedding → compared against all stored page embeddings
3. Top 6 results ranked by cosine similarity and displayed

### Chat Flow (RAG)
1. User asks a question in Chat view
2. Question is converted to embedding
3. Top 5 most relevant pages retrieved from browsing history (RAG context retrieval)
4. Relevance score checked (must be ≥ 0.2 threshold to proceed)
5. If relevant, context + question sent to OpenAI Chat Completions API (gpt-4o-mini)
6. AI responds using **only** information from browsing history context
7. Conversation saved to IndexedDB (messages table) for later reference

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

### IndexedDB Schema (Version 3)
```javascript
// Version 1: Original schema (entries table)
db.version(1).stores({
  entries: "++id, url, title, timestamp"
  // vector field stored but not indexed (too large for indexing)
});

// Version 2: Added projects table and projectId to entries
db.version(2).stores({
  entries: "++id, url, title, timestamp, projectId",
  projects: "++id, name, createdAt"
});

// Version 3: Added messages table for chat
db.version(3).stores({
  entries: "++id, url, title, timestamp, projectId",
  projects: "++id, name, createdAt",
  messages: "++id, projectId, role, timestamp"
});
```

**Table Details:**
- **entries**: Indexed web pages with embeddings
  - Fields: `id`, `url`, `title`, `text`, `timestamp`, `projectId`, `vector` (1536-dim array)
- **projects**: Workspace organization
  - Fields: `id`, `name`, `createdAt`
- **messages**: Chat conversation history
  - Fields: `id`, `projectId`, `role` (user/assistant), `content`, `timestamp`

### OpenAI API Integration

**Embeddings API** ([ui/src/embeddings.js](ui/src/embeddings.js))
- Model: `text-embedding-3-small`
- Input truncation: 8000 characters (to stay within token limits)
- Embedding dimension: 1536
- Used for: Page indexing, search queries, chat question embeddings

**Chat Completions API** ([ui/src/chat.js](ui/src/chat.js))
- Model: `gpt-4o-mini`
- Temperature: 0.7
- System prompt: Strictly instructs AI to ONLY use browsing history context
- Used for: RAG-based chat responses
- Error handling: Rate limits (429), invalid API key (401), network errors

**RAG Implementation** ([ui/src/chat.js](ui/src/chat.js))
- `getRelevantContext(query, projectId)`: Retrieves top 5 relevant pages using cosine similarity
- `RELEVANCE_THRESHOLD`: 0.2 minimum similarity score (prevents off-topic queries)
- Context formatting: Title, URL, and 200-character excerpts from each page

### Content Extraction
- Uses `document.body.innerText` with whitespace normalization
- Limited to first 5000 characters per page
- Ignores system pages and empty content

## File Structure

```
TabMind/
├── vite.config.js              # Build configuration with multi-entry setup
├── package.json                # Root dependencies (Dexie, React, Vite)
├── manifest.json               # Source manifest (points to dist/ paths)
├── .env                        # OpenAI API key (VITE_OPENAI_API_KEY)
├── background.js               # Service worker entry point
├── content/
│   ├── index.js               # Content script entry point
│   ├── utils.js               # Page filtering and text extraction
│   └── messenger.js           # Chrome messaging wrapper
├── ui/
│   ├── src/
│   │   ├── App.jsx            # Main popup component with tab navigation
│   │   ├── db.js              # IndexedDB/Dexie wrapper (3 tables)
│   │   ├── embeddings.js      # OpenAI embeddings API + cosine similarity
│   │   ├── chat.js            # RAG implementation & Chat Completions API
│   │   ├── storage.js         # Chrome storage utilities
│   │   └── components/
│   │       ├── views/
│   │       │   ├── SearchView.jsx    # Semantic search interface
│   │       │   ├── MemoriesView.jsx  # Timeline view
│   │       │   ├── ChatView.jsx      # AI chat interface with RAG
│   │       │   └── SettingsView.jsx  # API key configuration
│   │       ├── SearchBar.jsx         # Shared search input
│   │       ├── ResultsList.jsx       # Search results display
│   │       ├── ProjectSelector.jsx   # Project dropdown & switcher
│   │       ├── CreateProjectModal.jsx # New project dialog
│   │       └── ManageProjectsModal.jsx # Project management UI
│   ├── style/                 # CSS files for all components
│   │   ├── App.css
│   │   ├── SearchView.css
│   │   ├── MemoriesView.css
│   │   ├── ChatView.css
│   │   ├── SettingsView.css
│   │   ├── ProjectSelector.css
│   │   ├── CreateProjectModal.css
│   │   └── ManageProjectsModal.css
│   ├── index.html             # Popup HTML entry
│   └── package.json           # UI-specific dependencies
└── dist/                       # Build output (load this in Chrome)
```

## Key Implementation Details

### Project Management
- **ProjectSelector.jsx**: Dropdown component with create/manage actions
- **CreateProjectModal.jsx**: Dialog for creating new projects
- **ManageProjectsModal.jsx**: UI for renaming/deleting projects with entry counts
- Projects are workspace containers that scope both indexed pages and chat conversations
- Active project stored in Chrome storage and persists across sessions
- Deleting a project removes all associated entries and messages

### Chat View Features
- **MessageContent component**: Renders URLs as clickable links using regex pattern
- **Auto-scroll**: Uses useRef + scrollIntoView to scroll to latest message
- **Typing indicator**: Animated dots while AI is thinking
- **Error handling**: Displays user-friendly errors (rate limits, network issues, relevance rejection)
- **Relevance filtering**: Prevents ChatGPT gateway misuse by checking similarity score before API call
- **Chat history**: Messages loaded on component mount and persisted per project

### RAG Architecture
- **Two-stage relevance check**:
  1. Cosine similarity threshold (0.2) filters queries before API call
  2. System prompt instructs AI to only use provided context
- **Context format**: Each of top 5 pages includes title, URL, and 200-char excerpt
- **Privacy**: User's browsing data only sent to OpenAI for embeddings/chat (no third-party servers)

### UI/UX Patterns
- Tab-based navigation (Search, Memories, Chat, Settings)
- Fixed height containers (450px) with scrollable content areas
- CSS variables for theming (--primary-600, --gray-100, etc.)
- Disabled states during loading operations
- Enter key submits forms (Shift+Enter for newlines in chat input)

## Development Workflow

1. Make code changes
2. Run `npm run build` to rebuild the extension
3. Click "Reload" on the extension in Chrome's extension management page (`chrome://extensions/`)
4. Test functionality:
   - Visit pages to populate browsing history
   - Try search queries in Search view
   - Ask questions in Chat view (test relevance filtering with off-topic queries)
   - Create/switch/manage projects
   - Check Memories timeline

## Common Modifications

### Changing the embedding model
Edit `MODEL` constant in [ui/src/embeddings.js](ui/src/embeddings.js:3)

### Changing the chat model
Edit `MODEL` constant in [ui/src/chat.js](ui/src/chat.js:5) (currently `gpt-4o-mini`)

### Adjusting search result count
Modify `topN` parameter in `searchHistory()` call in SearchView.jsx (currently returns top 6)

### Changing chat relevance threshold
Edit `RELEVANCE_THRESHOLD` in [ui/src/chat.js](ui/src/chat.js:9)
- Default: 0.2 (20% similarity)
- Lower = more permissive (accepts less related queries)
- Higher = more strict (only highly related queries)
- **Important**: This prevents the extension from being used as a general ChatGPT gateway

### Adjusting RAG context size
In [ui/src/chat.js](ui/src/chat.js:29):
- Change `.slice(0, 5)` to retrieve more/fewer pages for context
- Default: Top 5 most relevant pages

### Modifying content extraction limits
- Page text limit: [content/utils.js](content/utils.js) (currently 5000 chars)
- API input limit: [ui/src/embeddings.js](ui/src/embeddings.js:20) (currently 8000 chars)
- Context excerpt length: [ui/src/chat.js](ui/src/chat.js:39) (currently 200 chars per page)

### Adding new Chrome permissions
Update both:
- [manifest.json](manifest.json) (source)
- [vite.config.js](vite.config.js) (build-time generation)

## Development History & Architecture Decisions

### Phase 1: Core Search Functionality
- Basic semantic search with OpenAI embeddings
- Single-project setup with entries table
- SearchView component with similarity-based ranking

### Phase 2: Project Organization
- Added projects table (Version 2 schema migration)
- ProjectSelector dropdown with create/switch functionality
- ManageProjectsModal for project CRUD operations
- Scoped entries to projects (added projectId foreign key)

### Phase 3: Chat Feature (RAG)
- Added messages table (Version 3 schema migration)
- Created chat.js with RAG implementation:
  - `getRelevantContext()`: Top-5 retrieval with cosine similarity
  - `sendChatMessage()`: OpenAI Chat Completions API integration
- ChatView component with full conversation UI:
  - Message bubbles (user vs assistant styling)
  - Typing indicator animation
  - Clickable URLs in messages (MessageContent helper)
  - Error handling with user-friendly messages
- **Critical feature**: Relevance threshold filtering to prevent ChatGPT gateway misuse
  - Pre-API-call rejection of queries below 0.2 similarity
  - Strict system prompt enforcement

### Design Patterns Used
- **Separation of concerns**: db.js (data), embeddings.js (embeddings), chat.js (RAG/chat), components (UI)
- **React hooks**: useState, useEffect, useRef for state management and side effects
- **Cosine similarity**: Standard vector similarity metric for semantic search
- **RAG pattern**: Retrieve relevant documents → augment prompt → generate response
- **IndexedDB migrations**: Versioned schema with backward-compatible upgrades
- **Error boundaries**: Graceful error handling with specific messages (rate limits, auth, network)
