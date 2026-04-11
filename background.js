import { saveEntry } from "./ui/src/db.js";
import { getEmbedding } from "./ui/src/embeddings.js";

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

      // Step 2: save to IndexedDB
      await saveEntry({ url, title, vector, timestamp: Date.now() });

      console.log("[TabMind Background] ✓ Saved entry for:", title);
    } catch (err) {
      console.error("[TabMind Background] ✗ Failed to save entry:", err);
    }
  }
});
