# TabMind

A Chrome extension that transforms your browsing history into an intelligent, searchable knowledge base using AI embeddings and RAG (Retrieval-Augmented Generation).

## Overview

TabMind automatically indexes the content of web pages you visit, creating vector embeddings that enable semantic search and AI-powered chat interactions. Instead of relying on exact keyword matches, you can ask natural language questions and get relevant results from your browsing history.

## Screenshots

<img src="docs/screenshots/search-view.png" alt="Search View" width="350" height="400">

*Semantic search interface for natural language queries*

<img src="docs/screenshots/memories-view.png" alt="Memories View" width="350" height="400">

*Timeline view of all indexed pages organized by project*

## Features

### 🔍 Semantic Search
- Search your browsing history using natural language queries
- Vector similarity matching powered by OpenAI embeddings
- Results ranked by relevance, not just keyword matches
- Example: "machine learning tutorials" finds relevant pages even without exact text match

### 💬 AI Chat Assistant
- Ask questions about pages you've visited and get AI-powered answers
- RAG-based context retrieval from your browsing history
- Relevance filtering prevents off-topic queries (won't act as a general ChatGPT gateway)
- Chat history persisted per project
- Clickable URLs in AI responses

### 📁 Project Organization
- Create separate workspaces for different browsing contexts (e.g., "Research", "Work", "Hobbies")
- Each project maintains its own indexed pages and chat history
- Rename, switch, and manage projects via dropdown interface

### 📜 Memories Timeline
- Chronological view of all indexed pages
- Organized by project
- Shows titles, URLs, and timestamps

### ⚙️ Settings & Configuration
- OpenAI API key management
- Simple setup with environment variables

## Technical Implementation

**Architecture**
- Manifest V3 Chrome extension
- React-based popup UI (400px width) with tab navigation
- IndexedDB storage via Dexie (3 tables: entries, projects, messages)
- Vite build system with multi-entry bundling

**AI Models**
- Embeddings: OpenAI `text-embedding-3-small` (1536-dimensional vectors)
- Chat: OpenAI `gpt-4o-mini`
- Cosine similarity for relevance scoring

**RAG Implementation**
- Top-5 most relevant pages retrieved for each query
- Relevance threshold (0.5) filters out unrelated queries
- Context formatted with title, URL, and 200-character excerpts

**Data Flow**
1. Content script extracts text from visited pages (first 5000 chars)
2. Background worker generates embeddings via OpenAI API
3. Pages stored in IndexedDB with vectors
4. Search/chat queries converted to embeddings and compared via cosine similarity

## How It Works

### Automatic Indexing
As you browse the web, TabMind automatically:
1. Extracts page content (title, URL, and text content)
2. Generates a 1536-dimensional vector embedding via OpenAI
3. Stores the page data and embedding in your browser's local IndexedDB
4. All processing happens locally - your browsing data never leaves your machine except for the OpenAI API calls

### Semantic Search
When you search:
1. Your query is converted to a vector embedding
2. Cosine similarity is calculated between your query and all stored page embeddings
3. Top 6 most relevant results are returned, ranked by similarity score
4. No need for exact keyword matches - "ML tutorials" finds "machine learning guides"

### AI Chat
When you ask a question:
1. Your question is converted to a vector embedding
2. Top 5 most relevant pages are retrieved from your history (RAG)
3. Relevance score is checked (must be ≥ 0.5 to proceed)
4. Context from relevant pages is sent to GPT-4o-mini along with your question
5. AI responds using **only** information from your browsing history
6. Conversation is saved to IndexedDB for later reference

### Privacy & Security
- All browsing data stored locally in your browser's IndexedDB
- No data sent to external servers except OpenAI API calls for embeddings and chat
- Your API key is stored locally and never shared
- You control which pages are indexed (system pages like `chrome://` are filtered out)

## What's Coming

- **Summary View**: Generate markdown summaries of browsing sessions

## Quick Start

### Prerequisites
- Node.js and npm installed
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- Google Chrome browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/TabMind.git
cd TabMind
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure OpenAI API key**

Create a `.env` file in the root directory:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. **Build the extension**
```bash
npm run build
```

5. **Load in Chrome**
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode" (toggle in top-right)
- Click "Load unpacked"
- Select the `dist/` folder from the project directory

6. **Start browsing!**
- Visit web pages to build your indexed history
- Click the TabMind extension icon to search, chat, or view memories

## Project Structure

```
TabMind/
├── background.js              # Service worker for embedding generation
├── content/                   # Page content extraction
│   ├── index.js              # Content script entry point
│   ├── utils.js              # Text extraction & page filtering
│   └── messenger.js          # Chrome messaging wrapper
├── ui/
│   ├── src/
│   │   ├── App.jsx           # Main popup component with tab navigation
│   │   ├── db.js             # IndexedDB schema (Dexie wrapper)
│   │   ├── embeddings.js     # OpenAI embeddings API + similarity search
│   │   ├── chat.js           # RAG implementation & Chat Completions API
│   │   ├── storage.js        # Chrome storage utilities
│   │   └── components/
│   │       ├── views/
│   │       │   ├── SearchView.jsx    # Semantic search interface
│   │       │   ├── MemoriesView.jsx  # Timeline view
│   │       │   ├── ChatView.jsx      # AI chat interface
│   │       │   └── SettingsView.jsx  # API key configuration
│   │       ├── ProjectSelector.jsx   # Project dropdown & switcher
│   │       ├── CreateProjectModal.jsx
│   │       └── ManageProjectsModal.jsx
│   ├── style/                # CSS files for all components
│   └── index.html            # Popup HTML entry point
├── manifest.json             # Extension manifest (Manifest V3)
├── vite.config.js            # Build configuration
└── dist/                     # Build output (load this in Chrome)
```

**Key Files**
- [background.js](background.js) - Listens for page content, generates embeddings, stores in IndexedDB
- [ui/src/db.js](ui/src/db.js) - Database schema with 3 tables: entries, projects, messages
- [ui/src/embeddings.js](ui/src/embeddings.js) - OpenAI embedding generation & cosine similarity
- [ui/src/chat.js](ui/src/chat.js) - RAG context retrieval & Chat Completions API integration
- [ui/src/components/views/ChatView.jsx](ui/src/components/views/ChatView.jsx) - Chat UI with relevance filtering

## Development

### Building & Testing

```bash
# Rebuild after code changes
npm run build

# Development mode with hot reload
npm run dev

# Lint the UI code
cd ui && npm run lint
```

After building, reload the extension:
1. Go to `chrome://extensions/`
2. Click the reload icon on the TabMind extension card

### Common Development Tasks

**Changing the embedding model**
- Edit `MODEL` constant in [ui/src/embeddings.js](ui/src/embeddings.js)

**Adjusting search result count**
- Modify `topN` parameter in `searchHistory()` call in SearchView.jsx

**Changing relevance threshold for chat**
- Edit `RELEVANCE_THRESHOLD` in [ui/src/chat.js](ui/src/chat.js) (default: 0.5)

**Modifying content extraction limits**
- Page text limit: [content/utils.js](content/utils.js) (currently 5000 chars)
- API input limit: [ui/src/embeddings.js](ui/src/embeddings.js) (currently 8000 chars)

### Database Schema

IndexedDB stores three tables via Dexie:

**entries** - Indexed web pages
- `id`, `url`, `title`, `text`, `timestamp`, `projectId`, `vector` (1536-dim array)

**projects** - Workspace organization
- `id`, `name`, `createdAt`

**messages** - Chat conversation history
- `id`, `projectId`, `role` (user/assistant), `content`, `timestamp`

### Architecture Notes

- Content scripts run on all web pages (`<all_urls>`)
- Background service worker handles embedding generation
- Popup UI is a React SPA with tab-based navigation
- Vite bundles three entry points: background, content, and popup
- Manifest is copied and modified during build to adjust paths for dist/

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [OpenAI APIs](https://platform.openai.com/)
- Database via [Dexie.js](https://dexie.org/)
- Bundled with [Vite](https://vitejs.dev/)