const platforms = {
  NETFLIX: "netflix",
  PRIME_VIDEO: "primevideo",
  DISNEY_PLUS: "disneyplus",
  STAR_PLUS: "starplus",
};

const selectors = {
  [platforms.NETFLIX]: [
    {
      info: "Skipping credits.",
      selector: '[aria-label="Skip Credits"]',
      option: "skipRecapSequence",
    },
    {
      info: "Playing next episode.",
      selector: '[data-uia="next-episode-seamless-button"]',
      option: "autoPlayNext",
    },
    {
      info: "Continue playing.",
      selector: '[aria-label="Continue Playing"]',
      option: "skipRecapSequence",
    },
    {
      info: "Skipping recap.",
      selector: '[aria-label="Skip Recap"]',
      option: "skipRecapSequence",
    },
    {
      info: "Skipping intro.",
      selector: '[aria-label="Skip Intro"]',
      option: "skipIntroSequence",
    },
  ],
  [platforms.PRIME_VIDEO]: [
    {
      info: "Skipping intro.",
      selector: '[aria-label="Skip Intro"]',
      option: "skipIntroSequence",
    },
    {
      info: "Skipping resume.",
      selector: ".atvwebplayersdk-skipelement-button",
      option: "skipRecapSequence",
    },
    {
      info: "Playing next episode.",
      selector: ".atvwebplayersdk-nextupcard-button",
      option: "autoPlayNext",
    },
    {
      info: "Next episode.",
      selector: ".atvwebplayersdk-nexttitle-button",
      option: "skipCredits",
    },
  ],
  [platforms.DISNEY_PLUS]: [
    {
      info: "Skipping credits.",
      selector: ".skip__button",
      option: "skipRecapSequence",
    },
    {
      info: "Playing next episode.",
      selector: "button.sc-gipzik.play",
      option: "autoPlayNext",
    },
  ],
  [platforms.STAR_PLUS]: [
    {
      info: "Skipping credits.",
      selector: ".skip__button",
      option: "skipRecapSequence",
    },
    {
      info: "Playing next episode.",
      selector: '[data-gv2elementkey="playNext"]',
      option: "autoPlayNext",
    },
  ],
};

// Defina o objeto "options" fora da função "checkForElements"
let options;
const DEFAULT_OPTIONS = {
  skipIntroSequence: true,
  skipRecapSequence: true,
  autoPlayNext: true,
  skipCredits: "0",
};
const CHECK_INTERVAL_MS = 1000;

function detectPlatform() {
  const site = location.hostname;

  if (site.includes("netflix")) {
    return platforms.NETFLIX;
  } else if (site.includes("primevideo")) {
    return platforms.PRIME_VIDEO;
  } else if (site.includes("disneyplus")) {
    return platforms.DISNEY_PLUS;
  } else if (site.includes("starplus")) {
    return platforms.STAR_PLUS;
  } else {
    return "unknown";
  }
}

// Função que verifica periodicamente se um dos elementos a serem clicados está presente na página
function checkForElements() {
  const platform = detectPlatform();
  for (const element of selectors[platform]) {
    if (element.option === "skipCredits") continue;
    const target = document.querySelector(element.selector);
    if (!target) continue;
    if (options[element.option]) target.click();
    return;
  }
}

function checkTime(userTime, videoTime) {
  const timeRegex = /^([0-5]?[0-9])$/;

  // Verifica se as entradas possuem o formato "mm:ss"
  if (!timeRegex.test(userTime) || !timeRegex.test(videoTime)) {
    throw new Error("Formato de tempo inválido");
  }

  const totalSegundos1 = parseInt(userTime);
  const totalSegundos2 = parseInt(videoTime);

  return totalSegundos1 <= totalSegundos2;
}

//primevideo
function skipCredit() {
  const platform = detectPlatform();
  const skipCreditsOption = options.skipCredits;
  const timeIndicatorText = document.querySelector(
    ".atvwebplayersdk-timeindicator-text"
  );

  for (const { option, selector } of selectors[platform]) {
    if (
      option !== "skipCredits" ||
      skipCreditsOption === DEFAULT_OPTIONS.skipCredits
    ) {
      continue;
    }

    const durationText = timeIndicatorText
      ?.querySelector("span")
      ?.textContent?.trim();
    if (!durationText || null) {
      continue;
    }

    const [videoTime, videoSeconds] = durationText.substring(2).split(":");
    const skip = checkTime(skipCreditsOption, videoTime);

    if (skip) {
      const target = document.querySelector(selector);
      if (target) {
        target.click();
        return;
      }
    }
  }
}

// Carregue as opções na inicialização e sempre que houver alterações no armazenamento
chrome.storage.sync.get("options", function (data) {
  options = data?.options ?? DEFAULT_OPTIONS;
  console.log("Loaded options:", options);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && "options" in changes) {
    options = changes.options.newValue;
    console.log("Updated options:", options);
  }
});

window.addEventListener("load", (event) => {
  setInterval(checkForElements, CHECK_INTERVAL_MS);

  if (detectPlatform() === platforms.PRIME_VIDEO) {
    setInterval(skipCredit, 1500);
  }
});
