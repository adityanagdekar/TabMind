export function sendPageContent(payload) {
  chrome.runtime.sendMessage({
    type: "PAGE_CONTENT",
    ...payload,
  });
}
