const introsTrigger = document.querySelector("#Intros");
const recapsTrigger = document.querySelector("#Recaps");
const nextEpisodeTrigger = document.querySelector("#NextEpisode");

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const options = await loadOptionsOrSetDefaults();
    setCheckbox(options);
  } catch (error) {
    console.error("Failed to load options: ", error);
  }
});

async function loadOptionsOrSetDefaults() {
  try {
    const data = await chrome.storage.sync.get("options");
    const options = data?.options ?? {
      skipIntroSequence: true,
      skipRecapSequence: true,
      autoPlayNext: true,
    };
    await chrome.storage.sync.set({ options });
    return options;
  } catch (error) {
    throw new Error("Failed to load or set options: ", error);
  }
}

introsTrigger.addEventListener("change", setOptions);
recapsTrigger.addEventListener("change", setOptions);
nextEpisodeTrigger.addEventListener("change", setOptions);

async function setOptions() {
  try {
    const options = {
      skipIntroSequence: introsTrigger.checked,
      skipRecapSequence: recapsTrigger.checked,
      autoPlayNext: nextEpisodeTrigger.checked,
    };
    await saveOptions(options);
  } catch (error) {
    console.error("Failed to save options: ", error);
  }
}

function setCheckbox(options) {
  introsTrigger.checked = options.skipIntroSequence;
  recapsTrigger.checked = options.skipRecapSequence;
  nextEpisodeTrigger.checked = options.autoPlayNext;
}

async function saveOptions(options) {
  await chrome.storage.sync.set({ options });
}
