// Default settings
const defaultSettings = {
  settings: {
    skipIntro: true,
    skipCredits: true,
    skipAd: true,
    blockFreevee: true,
    speedSlider: true,
    filterPaid: true,
    pip: true,
  },
};

let settings = {};

// Merge default settings with user settings
function mergeSettings(userSettings, defaultSettings) {
  let changedSettings = false;

  for (const key in userSettings) {
    if (!defaultSettings.hasOwnProperty(key)) {
      delete userSettings[key];
      changedSettings = true;
    }
  }

  return changedSettings;
}

// Retrieve and update settings
chrome.storage.sync.get(["settings"], (result) => {
  if (typeof result.settings === "object") {
    settings = result.settings;
  } else {
    settings = defaultSettings.settings;
  }

  const changedSettings = mergeSettings(settings, defaultSettings.settings);

  if (changedSettings) {
    chrome.storage.sync.set({ settings });
  }
  setCheckboxesToSettings();
});

// Update settings on change
chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.settings) {
    settings = changes.settings.newValue;
    setCheckboxesToSettings();
  }
});

// Set checkbox
function setCheckboxToSetting(key, status) {
  const button = document.querySelector(`#${key}`);
  if (button) button.checked = status;
}

// Set checkboxes
function setCheckboxesToSettings() {
  if (!Object.entries(settings).length) return;
  for (const [key, value] of Object.entries(settings)) {
    setCheckboxToSetting(key, value);
  }
}

// Toggle setting
function toggleSetting(key) {
  if (settings[key]) {
    settings[key] = !settings[key];
    chrome.storage.sync.set({ settings });
  }
}

// Handle button clicks
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    const validIds = ["skipCredits", "skipIntro", "skipAd", "blockFreevee", "speedSlider", "filterPaid", "pip"];
    if (validIds.includes(e.target.id)) toggleSetting(e.target.id);
  });
});
