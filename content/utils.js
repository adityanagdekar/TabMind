export function isIgnoredPage(url) {
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:") ||
    url === ""
  );
}

export function extractPageContent() {
  return (
    document.body?.innerText?.replace(/\s+/g, " ")?.trim()?.slice(0, 5000) ??
    null
  );
}

export function getPageMeta() {
  return {
    url: window.location.href,
    title: document.title,
  };
}