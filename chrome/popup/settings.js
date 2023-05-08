const defaultSettings = {
  settings: {
    skipIntro: true,
    skipCredits: true,
    skipAd: true,
    blockFreevee: true,
    speedSlider: true,
    filterPaid: true,
    pip: true,
    cleanCatalog: false,
    hideAction: false,
  },
};

let settings = {};

function mergeSettings(userSettings, defaultSettings) {
  const mergedSettings = { ...defaultSettings, ...userSettings };
  const defaultKeys = Object.keys(defaultSettings);
  const userKeys = Object.keys(userSettings);

  for (const key of defaultKeys) {
    if (!userKeys.includes(key)) {
      mergedSettings[key] = defaultSettings[key];
    }
  }

  for (const key of userKeys) {
    if (!defaultKeys.includes(key)) {
      delete mergedSettings[key];
    }
  }

  const changedSettings = JSON.stringify(mergedSettings) !== JSON.stringify(userSettings);
  return changedSettings ? mergedSettings : userSettings;
}

chrome.storage.sync.get(["settings"], (result) => {
  settings = result.settings ?? defaultSettings.settings;
  const changedSettings = mergeSettings(settings, defaultSettings.settings);
  if (changedSettings) {
    chrome.storage.sync.set({ settings });
  }
  setCheckboxesToSettings();
});

chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.settings) {
    const newSettings = changes.settings.newValue;
    if (JSON.stringify(settings) !== JSON.stringify(newSettings)) {
      settings = newSettings;
      setCheckboxesToSettings();
    }
  }
});

function setCheckboxesToSettings() {
  if (!Object.entries(settings).length) return;
  for (const [key, value] of Object.entries(settings)) {
    const button = document.querySelector(`#${key}`);
    if (button) {
      button.checked = value;
    }
  }
}

function toggleSetting(key) {
  const currentValue = settings[key];
  const newValue = !currentValue;
  if (currentValue !== newValue) {
    settings[key] = newValue;
    chrome.storage.sync.set({ settings });
  }
}

function handleButtonClick(e) {
  const keysId = Object.keys(defaultSettings.settings);
  const id = e.target.id;
  if (keysId.includes(id) && id) {
    toggleSetting(id);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", handleButtonClick);
});
