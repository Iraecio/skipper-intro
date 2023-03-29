console.log("badge.js loaded");
chrome.action.setBadgeBackgroundColor({ color: "#d90000" });

const Badges = {};

async function increaseBadge(tabId = null) {
  Badges[tabId] = (Badges[tabId] ?? 0) + 1;
  await chrome.storage.local.set({ Badges });
  chrome.action.setBadgeText({ text: Badges[tabId]?.toString(), tabId });
}

async function setBadgeText(text, tabId = null) {
  Badges[tabId] = text;
  await chrome.storage.local.set({ Badges });
  chrome.action.setBadgeText({ text: Badges[tabId], tabId });
}
 
chrome.runtime.onMessage.addListener(function (message, sender) {
  chrome.storage.local.get("Badges", function ({ Badges: storedBadges = {} }) {
    Badges = storedBadges;
    if (message.type === "setBadgeText") {
      setBadgeText(message.content, sender.tab.id);
    } else if (message.type === "increaseBadge") {
      increaseBadge(sender.tab.id);
    } else if (message.type === "resetBadge") {
      delete Badges[sender.tab.id];
      chrome.storage.local.set({ Badges });
      chrome.action.setBadgeText({ text: "", tabId: sender.tab.id });
    }
  });
});
