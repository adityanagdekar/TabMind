import { saveEntry } from "./ui/src/db.js";
import { getEmbedding } from "./ui/src/embeddings.js";

// Listens for page text sent by content.js
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "PAGE_CONTENT") {
    const { url, title, text } = message;

    try {
      // Step 1: generate embedding for this page
      const vector = await getEmbedding(`${title} ${text}`);

      // Step 2: save to IndexedDB
      await saveEntry({ url, title, vector, timestamp: Date.now() });

      console.log("TabMind: saved entry for", title);
    } catch (err) {
      console.error("TabMind: failed to save entry", err);
    }
  }
});
