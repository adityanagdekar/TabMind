const MODEL = "text-embedding-3-small";
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Converts any text into a vector
export async function getEmbedding(text) {
  if (!API_KEY) {
    throw new Error("OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      input: text.slice(0, 8000), // OpenAI has token limits
      model: MODEL,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding; // array of 1536 numbers
}

// Cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

// Given a query, find top N matching entries
export async function searchHistory(query, entries, topN = 6) {
  const queryVector = await getEmbedding(query);

  const scored = entries.map((entry) => ({
    ...entry,
    score: cosineSimilarity(queryVector, entry.vector),
  }));

  // Sort by score descending, return top N
  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
