/**
 * Chrome storage helpers for persistent data
 * Uses chrome.storage.local for API keys and settings
 */

const STORAGE_KEYS = {
  API_KEY: 'openai_api_key',
  ACTIVE_PROJECT_ID: 'active_project_id',
};

/**
 * Save OpenAI API key to chrome.storage
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<void>}
 */
export async function saveApiKey(apiKey) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEYS.API_KEY]: apiKey }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log('[TabMind Storage] API key saved');
        resolve();
      }
    });
  });
}

/**
 * Get OpenAI API key from chrome.storage
 * @returns {Promise<string|null>} The API key or null if not set
 */
export async function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEYS.API_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[STORAGE_KEYS.API_KEY] || null);
      }
    });
  });
}

/**
 * Remove API key from chrome.storage
 * @returns {Promise<void>}
 */
export async function removeApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([STORAGE_KEYS.API_KEY], () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log('[TabMind Storage] API key removed');
        resolve();
      }
    });
  });
}

/**
 * Save active project ID to chrome.storage
 * @param {number} projectId - The active project ID
 * @returns {Promise<void>}
 */
export async function saveActiveProjectId(projectId) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_PROJECT_ID]: projectId }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log('[TabMind Storage] Active project ID saved:', projectId);
        resolve();
      }
    });
  });
}

/**
 * Get active project ID from chrome.storage
 * @returns {Promise<number|null>} The active project ID or null if not set
 */
export async function getActiveProjectId() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEYS.ACTIVE_PROJECT_ID], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[STORAGE_KEYS.ACTIVE_PROJECT_ID] || null);
      }
    });
  });
}
