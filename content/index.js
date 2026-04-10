import { isIgnoredPage, extractPageContent, getPageMeta } from './utils.js';
import { sendPageContent } from './messenger.js';

const { url, title } = getPageMeta();

if (!isIgnoredPage(url)) {
  const text = extractPageContent();
  if (text) {
    sendPageContent({ url, title, text });
  }
}