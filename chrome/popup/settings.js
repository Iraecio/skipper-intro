// Default settings
const defaultSettings = {
  settings: {
    PrimeVideo: {
      skipIntro: { status: true, attributeFilter: ".f18oq18q" },
      skipCredits: { status: true, attributeFilter: ".atvwebplayersdk-nextupcard-show" },
      skipAd: { status: true, attributeFilter: "#dv-web-player" },
      blockFreevee: { status: true, attributeFilter: "#dv-web-player" },
      speedSlider: { status: true, attributeFilter: "video" },
      filterPaid: { status: true, attributeFilter: ".DVWebNode-storefront-wrapper" },
    },
  },
};

let settings = {};

// Retrieve and update settings
chrome.storage.sync.get(["settings"], (result) => {
  settings = result.settings;
  if (typeof settings !== "object") {
    chrome.storage.sync.set(defaultSettings);
    settings = defaultSettings.settings;
  } else {
    let changedSettings = false;
    for (const [key, value] of Object.entries(defaultSettings.settings)) {
      if (!settings[key]) {
        settings[key] = value;
        changedSettings = true;
      } else {
        for (const [subkey, subvalue] of Object.entries(defaultSettings.settings[key])) {
          if (typeof settings[key][subkey] === "undefined") {
            settings[key][subkey] = subvalue;
            changedSettings = true;
          }
        }
      }
    }
    if (changedSettings) {
      chrome.storage.sync.set({ settings });
    }
  }
  setCheckboxesToSettings(settings);
});

// Update settings on change
chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.settings) {
    settings = changes.settings.newValue;
    setCheckboxesToSettings(settings);
  }
});

// Set checkbox
function setCheckboxToSetting(key, status) {
  const button = document.querySelector(`#${key}`);
  if (button) button.checked = status;
}

// Set checkboxes
function setCheckboxesToSettings(settings) {
  if (!settings || !settings.PrimeVideo) return;
  for (const [key, settingObj] of Object.entries(settings.PrimeVideo)) {
    setCheckboxToSetting(key, settingObj?.status);
  }
}

// Toggle setting
function toggleSetting(key) {
  if (settings.PrimeVideo[key]) {
    settings.PrimeVideo[key].status = !settings.PrimeVideo[key].status;
    chrome.storage.sync.set({ settings });
  }
}

// Handle button clicks
try {
  document.addEventListener("click", (e) => {
    const validIds = ["skipCredits", "skipIntro", "skipAd", "blockFreevee", "speedSlider", "filterPaid"];
    if (validIds.includes(e.target.id)) toggleSetting(e.target.id);
  });
} catch (error) {
  displayErrorContent(error);
}

// Display error content
function displayErrorContent(error) {
  const popupContent = document.querySelector("#popup-content");
  popupContent.classList.add("hidden");

  const errorContent = document.querySelector("#error-content");
  errorContent.classList.remove("hidden");

  console.error(`Prime skip content script failed to execute: ${error.message}`);
  console.error(`Error stack: ${error.stack}`);
  console.error(`Error name: ${error.name}`);
  console.error(`Error filename: ${error.filename}`);
  console.error(`Error line number: ${error.lineno}`);
  console.error(`Error column number: ${error.colno}`);
}
