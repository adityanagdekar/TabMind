import { getApiKey } from "./storage.js";
import { getEmbedding, cosineSimilarity } from "./embeddings.js";
import { getEntriesByProject } from "./db.js";

const MODEL = "gpt-4o-mini";

// Minimum similarity score threshold for relevance (0-1 scale)
// Queries below this threshold will be rejected as unrelated
const RELEVANCE_THRESHOLD = 0.5;

// Get relevant context from browsing history using RAG
export async function getRelevantContext(query, projectId) {
  const entries = await getEntriesByProject(projectId);

  if (entries.length === 0) {
    return { context: "No browsing history available.", maxScore: 0, isRelevant: false };
  }

  // Embed the query
  const queryVector = await getEmbedding(query);

  // Score all entries by similarity
  const scored = entries.map((entry) => ({
    ...entry,
    score: cosineSimilarity(queryVector, entry.vector),
  }));

  // Get top 5 most relevant entries
  const topEntries = scored.sort((a, b) => b.score - a.score).slice(0, 5);

  // Get the highest similarity score
  const maxScore = topEntries[0]?.score || 0;

  // Check if query is relevant to browsing history
  const isRelevant = maxScore >= RELEVANCE_THRESHOLD;

  // Format as context string
  const contextParts = topEntries.map((entry, index) => {
    const excerpt = entry.text ? entry.text.slice(0, 200) : "";
    return `[${index + 1}] ${entry.title}\nURL: ${entry.url}\n${excerpt}`;
  });

  return {
    context: contextParts.join("\n\n"),
    maxScore,
    isRelevant,
  };
}

// Send chat message to OpenAI
export async function sendChatMessage(userMessage, context) {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error("OpenAI API key not found. Please configure it in Settings.");
  }

  const systemPrompt = `You are a helpful assistant that ONLY answers questions based on the user's browsing history.

Context from browsing history:
${context}

IMPORTANT RULES:
- You must ONLY answer questions using information from the context above
- Do NOT use any knowledge outside of the provided browsing history
- If the context doesn't contain relevant information, say: "I don't have information about that in your browsing history."
- Keep your answers concise and reference specific pages when helpful`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();

      // Handle rate limits
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }

      // Handle invalid API key
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your settings.");
      }

      // Generic error
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    // Network errors (no internet, etc)
    if (err.message.includes("fetch")) {
      throw new Error("Network error. Please check your internet connection.");
    }
    // Re-throw API errors
    throw err;
  }
}
