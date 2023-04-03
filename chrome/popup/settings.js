// global variables in localStorage
const defaultSettings = {
  settings: {
    PrimeVideo: { skipIntro: true, skipCredits: true, skipAd: true, blockFreevee: true, speedSlider: true, filterPaid: false },
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
  const primevideoSettings = settings?.PrimeVideo;
  setCheckboxToSetting("PrimeVideoIntro", primevideoSettings?.skipIntro);
  setCheckboxToSetting("PrimeVideoCredits", primevideoSettings?.skipCredits);
  setCheckboxToSetting("PrimeVideoAds", primevideoSettings?.skipAd);
  setCheckboxToSetting("PrimeVideoFreevee", primevideoSettings?.blockFreevee);
  setCheckboxToSetting("PrimeVideoSpeedSlider", primevideoSettings?.speedSlider);
  setCheckboxToSetting("PrimeVideofilterPaid", primevideoSettings?.filterPaid);
}

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {
    const { PrimeVideo } = settings;

    switch (e.target.id) {
      case "openPrimeVideoSettings":
        // Toggle PrimeVideoSettings display
        PrimeVideoSettings(document.getElementById("PrimeVideoSettings").style.display === "none");
        break;
      case "PrimeVideoCredits":
        // Toggle skipCredits setting
        PrimeVideo.skipCredits = !PrimeVideo.skipCredits;
        console.info(`settings.PrimeVideo.skipCredits: ${PrimeVideo.skipCredits}`);
        chrome.storage.sync.set({ settings });
        break;
      case "PrimeVideoIntro":
        // Toggle skipIntro setting
        PrimeVideo.skipIntro = !PrimeVideo.skipIntro;
        console.info(`settings.PrimeVideo.skipIntro: ${PrimeVideo.skipIntro}`);
        chrome.storage.sync.set({ settings });
        break;
      case "PrimeVideoAds":
        // Toggle skipAd setting
        PrimeVideo.skipAd = !PrimeVideo.skipAd;
        console.info(`settings.PrimeVideo.skipAd: ${PrimeVideo.skipAd}`);
        chrome.storage.sync.set({ settings });
        break;
      case "PrimeVideoFreevee":
        // Toggle blockFreevee setting
        PrimeVideo.blockFreevee = !PrimeVideo.blockFreevee;
        console.info(`settings.PrimeVideo.blockFreevee: ${PrimeVideo.blockFreevee}`);
        chrome.storage.sync.set({ settings });
        break;
      case "PrimeVideoSpeedSlider":
        // Toggle speedSlider setting
        PrimeVideo.speedSlider = !PrimeVideo.speedSlider;
        console.info(`settings.PrimeVideo.speedSlider: ${PrimeVideo.speedSlider}`);
        chrome.storage.sync.set({ settings });
        break;
      case "PrimeVideofilterPaid":
        // Toggle filterPaid setting
        PrimeVideo.filterPaid = !PrimeVideo.filterPaid;
        console.info(`settings.PrimeVideo.filterPaid: ${PrimeVideo.filterPaid}`);
        chrome.storage.sync.set({ settings });
        break;
      case "reset":
        // Reset settings to default
        console.info("settings reset to", defaultSettings);
        chrome.storage.sync.set(defaultSettings);
        break;
      default:
        // Do nothing for other clicks
        break;
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

  console.error(`Prime skip content script failed to execute: ${error.message}`);
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
