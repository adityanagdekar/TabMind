import { saveEntry, ensureDefaultProject } from "./ui/src/db.js";
import { getEmbedding } from "./ui/src/embeddings.js";
import { getActiveProjectId } from "./ui/src/storage.js";

// Initialize default project on extension startup
ensureDefaultProject().catch((err) => {
  console.error("[TabMind Background] Failed to initialize default project:", err);
});

// Listens for page text sent by content.js
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "PAGE_CONTENT") {
    const { url, title, text } = message;

    console.log("[TabMind Background] Received page content:", { url, title, textLength: text?.length });

    try {
      // Step 1: generate embedding for this page
      console.log("[TabMind Background] Generating embedding...");
      const vector = await getEmbedding(`${title} ${text}`);
      console.log("[TabMind Background] Embedding generated, length:", vector?.length);

      // Step 2: get active project ID
      const projectId = await getActiveProjectId();

      // Step 3: save to IndexedDB
      await saveEntry({
        url,
        title,
        vector,
        timestamp: Date.now(),
        projectId,
        text: text || ""
      });

      console.log("[TabMind Background] ✓ Saved entry for:", title);
    } catch (err) {
      console.error("[TabMind Background] ✗ Failed to save entry:", err);
    }
  }
});
