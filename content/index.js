import { isIgnoredPage, extractPageContent, getPageMeta } from './utils.js';
import { sendPageContent } from './messenger.js';

const { url, title } = getPageMeta();

console.log('[TabMind] Content script loaded on:', url);

if (!isIgnoredPage(url)) {
  const text = extractPageContent();
  if (text) {
    console.log('[TabMind] Extracted text:', text.substring(0, 100) + '...');
    sendPageContent({ url, title, text });
    console.log('[TabMind] Sent page content to background worker');
  } else {
    console.log('[TabMind] No text content found on this page');
  }
} else {
  console.log('[TabMind] Ignoring this page (system page)');
}