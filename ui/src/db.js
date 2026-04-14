import Dexie from "dexie";
import { getActiveProjectId, saveActiveProjectId } from "./storage.js";

// Create the database and define schema
export const db = new Dexie("TabMindDB");

// Version 1: Original schema
db.version(1).stores({
  entries: "++id, url, title, timestamp",
  // vector is stored but not indexed (too large)
});

// Version 2: Add projects table and update entries
db.version(2).stores({
  entries: "++id, url, title, timestamp, projectId",
  projects: "++id, name, createdAt",
}).upgrade(async (tx) => {
  // Create default project for existing entries
  const defaultProject = await tx.table("projects").add({
    name: "Default",
    createdAt: Date.now(),
  });

  // Update all existing entries to belong to default project
  await tx.table("entries").toCollection().modify((entry) => {
    entry.projectId = defaultProject;
    entry.text = ""; // Add text field for existing entries
  });
});

// Save a new page entry
export async function saveEntry({ url, title, vector, timestamp, projectId, text }) {
  // Avoid duplicates — delete existing entry for same URL
  await db.entries.where("url").equals(url).delete();
  await db.entries.add({
    url,
    title,
    vector,
    timestamp,
    projectId: projectId || await getActiveProjectId() || 1,
    text: text || ""
  });
}

// Fetch all entries for similarity search
export async function getAllEntries() {
  return await db.entries.toArray();
}

// Get entries for a specific project
export async function getEntriesByProject(projectId) {
  return await db.entries.where("projectId").equals(projectId).toArray();
}

// Clear everything
export async function clearAll() {
  await db.entries.clear();
}

// ==================== Project Management ====================

// Create a new project
export async function createProject(name) {
  const projectId = await db.projects.add({
    name,
    createdAt: Date.now(),
  });
  console.log(`[TabMind DB] Created project: ${name} (ID: ${projectId})`);
  return projectId;
}

// Get all projects
export async function getAllProjects() {
  return await db.projects.toArray();
}

// Get a single project by ID
export async function getProject(id) {
  return await db.projects.get(id);
}

// Update project name
export async function updateProject(id, name) {
  await db.projects.update(id, { name });
  console.log(`[TabMind DB] Updated project ${id} to: ${name}`);
}

// Delete a project and its entries
export async function deleteProject(id) {
  // Delete all entries in this project
  await db.entries.where("projectId").equals(id).delete();
  // Delete the project
  await db.projects.delete(id);
  console.log(`[TabMind DB] Deleted project ${id} and its entries`);
}

// Get entry count for a project
export async function getProjectEntryCount(projectId) {
  return await db.entries.where("projectId").equals(projectId).count();
}

// Initialize default project if none exists
export async function ensureDefaultProject() {
  const projects = await getAllProjects();

  if (projects.length === 0) {
    const defaultId = await createProject("Default");
    await saveActiveProjectId(defaultId);
    console.log(`[TabMind DB] Created default project (ID: ${defaultId})`);
    return defaultId;
  }

  // If no active project is set, set it to the first project
  const activeId = await getActiveProjectId();
  if (!activeId) {
    await saveActiveProjectId(projects[0].id);
    console.log(`[TabMind DB] Set active project to: ${projects[0].name}`);
  }

  return activeId || projects[0].id;
}
