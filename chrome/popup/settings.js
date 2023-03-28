// global variables in localStorage
const defaultSettings = {
  settings: {
    Amazon: { skipIntro: true, skipCredits: true, skipAd: true, blockFreevee: true, speedSlider: true, filterPaid: false },
  },
};

let settings = defaultSettings.settings;

function setDefaultSettings(settings, defaultSettings) {
  let changedSettings = false;
  for (const key in defaultSettings) {
    if (typeof settings[key] === "undefined") {
      console.log("undefined Setting:", key);
      changedSettings = true;
      settings[key] = defaultSettings[key];
    } else if (typeof defaultSettings[key] === "object") {
      setDefaultSettings(settings[key], defaultSettings[key]);
    }
  }
  return changedSettings;
}

function handleSettings(result) {
  settings = result.settings;
  if (typeof settings !== "object") {
    chrome.storage.sync.set(defaultSettings);
  } else {
    console.log("settings:", settings);
    let changedSettings = setDefaultSettings(settings, defaultSettings.settings);
    setCheckboxesToSettings();
    if (changedSettings) {
      chrome.storage.sync.set({ settings });
    }
  }
}

chrome.storage.sync.get("settings", handleSettings);

chrome.storage.sync.onChanged.addListener(function (changes, namespace) {
  for (const key in changes) {
    if (key === "settings") {
      const { oldValue, newValue } = changes[key];
      console.log(key, "Old value:", oldValue, ", new value:", newValue);
      settings = newValue;
      setCheckboxesToSettings();
    }
  }
});

// Set checkbox
function setCheckboxToSetting(id, setting) {
  const button = document.querySelector(`#${id}`);
  if (button) button.checked = setting;
}

function setCheckboxesToSettings() {
  const amazonSettings = settings?.Amazon;
  setCheckboxToSetting("AmazonIntro", amazonSettings?.skipIntro);
  setCheckboxToSetting("AmazonCredits", amazonSettings?.skipCredits);
  setCheckboxToSetting("AmazonAds", amazonSettings?.skipAd);
  setCheckboxToSetting("AmazonFreevee", amazonSettings?.blockFreevee);
  setCheckboxToSetting("AmazonSpeedSlider", amazonSettings?.speedSlider);
  setCheckboxToSetting("AmazonfilterPaid", amazonSettings?.filterPaid);
}

// open and close the Amazon Individual Settings
const settingsContainer = document.getElementById("AmazonSettings");
const downArrow = document.getElementsByClassName("AmazonDownArrow")[0];
const upArrow = document.getElementsByClassName("AmazonUpArrow")[0];

function AmazonSettings(open = true) {
  if (open) {
    settingsContainer.classList.add("visible");
    settingsContainer.classList.remove("hidden");
    downArrow.classList.add("hidden");
    upArrow.classList.remove("hidden");
  } else {
    settingsContainer.classList.add("hidden");
    settingsContainer.classList.remove("visible");
    downArrow.classList.remove("hidden");
    upArrow.classList.add("hidden");
  }
}

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  const listener = document.addEventListener("click", (e) => {
    const { Amazon } = settings;
    if (e.target.classList.contains("reset")) {
      console.log("settings reset to", defaultSettings);
      chrome.storage.sync.set(defaultSettings);
    } else if (e.target.id === "openAmazonSettings") {
      AmazonSettings(document.getElementById("AmazonSettings").style.display === "none");
    } else if (e.target.id === "AmazonCredits") {
      Amazon.skipCredits = !Amazon.skipCredits;
      console.log(`settings.Amazon.skipCredits: ${Amazon.skipCredits}`);
      chrome.storage.sync.set({ settings });
    } else if (e.target.id === "AmazonIntro") {
      Amazon.skipIntro = !Amazon.skipIntro;
      console.log(`settings.Amazon.skipIntro: ${Amazon.skipIntro}`);
      chrome.storage.sync.set({ settings });
    } else if (e.target.id === "AmazonAds") {
      Amazon.skipAd = !Amazon.skipAd;
      console.log(`settings.Amazon.skipAd: ${Amazon.skipAd}`);
      chrome.storage.sync.set({ settings });
    } else if (e.target.id === "AmazonFreevee") {
      Amazon.blockFreevee = !Amazon.blockFreevee;
      console.log(`settings.Amazon.blockFreevee: ${Amazon.blockFreevee}`);
      chrome.storage.sync.set({ settings });
    } else if (e.target.id === "AmazonSpeedSlider") {
      Amazon.speedSlider = !Amazon.speedSlider;
      console.log(`settings.Amazon.speedSlider: ${Amazon.speedSlider}`);
      chrome.storage.sync.set({ settings });
    } else if (e.target.id === "AmazonfilterPaid") {
      Amazon.filterPaid = !Amazon.filterPaid;
      console.log(`settings.Amazon.filterPaid: ${Amazon.filterPaid}`);
      chrome.storage.sync.set({ settings });
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  const popupContent = document.querySelector("#popup-content");
  popupContent.classList.add("hidden");

  const errorContent = document.querySelector("#error-content");
  errorContent.classList.remove("hidden");

  console.error(`Primeskip content script failed to execute: ${error.message}`);
  console.error(`Error stack: ${error.stack}`);
  console.error(`Error name: ${error.name}`);
  console.error(`Error filename: ${error.filename}`);
  console.error(`Error line number: ${error.lineno}`);
  console.error(`Error column number: ${error.colno}`);
}

/**
 * When the popup loads, add a click handler.
 * If we couldn't inject the script, handle the error.
 */
try {
  listenForClicks();
} catch (e) {
  reportExecuteScriptError(e);
}
