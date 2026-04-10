import Dexie from "dexie";

// Create the database and define schema
export const db = new Dexie("TabMindDB");

db.version(1).stores({
  entries: "++id, url, title, timestamp",
  // vector is stored but not indexed (too large)
});

// Save a new page entry
export async function saveEntry({ url, title, vector, timestamp }) {
  // Avoid duplicates — delete existing entry for same URL
  await db.entries.where("url").equals(url).delete();
  await db.entries.add({ url, title, vector, timestamp });
}

// Fetch all entries for similarity search
export async function getAllEntries() {
  return await db.entries.toArray();
}

// Clear everything
export async function clearAll() {
  await db.entries.clear();
}
