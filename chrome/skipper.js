const version = "1.0.0";
console.info("Auto-Skip Ver:", version);

// global variables in localStorage
const userSettings = {
  settings: {
    skipIntro: true,
    skipCredits: true,
    skipAd: true,
    blockFreevee: true,
    speedSlider: true,
    filterPaid: true,
    pip: true,
    cleanCatalog: false,
  },
};

//Streaming
const Stream = {
  PrimeVideo: "PrimeVideo",
  NetFlix: "NetFlix",
  DisneyPlus: "DisneyPlus",
  StarPlus: "StarPlus",
};

const sysConfig = {
  settings: {
    skipIntro: {
      [Stream.PrimeVideo]: {
        attributeFilter: ".f18oq18q",
      },
      [Stream.NetFlix]: {
        attributeFilter: ".f18oq18q",
      },
      [Stream.DisneyPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
    },
    skipCredits: {
      [Stream.PrimeVideo]: {
        attributeFilter: ".atvwebplayersdk-nextupcard-show",
      },
      [Stream.NetFlix]: {
        attributeFilter: ".atvwebplayersdk-nextupcard-show",
      },
      [Stream.DisneyPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
    },
    skipAd: {
      [Stream.PrimeVideo]: {
        attributeFilter: ".atvwebplayersdk-infobar-container",
      },
      [Stream.NetFlix]: {
        attributeFilter: "#dv-web-player",
      },
      [Stream.DisneyPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
    },
    blockFreevee: {
      [Stream.PrimeVideo]: {
        attributeFilter: "#dv-web-player",
      },
      [Stream.NetFlix]: {
        attributeFilter: "#dv-web-player",
      },
      [Stream.DisneyPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
    },
    speedSlider: {
      [Stream.PrimeVideo]: {
        attributeFilter: "video",
      },
      [Stream.NetFlix]: {
        attributeFilter: "video",
      },
      [Stream.DisneyPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
    },
    filterPaid: {
      [Stream.PrimeVideo]: {
        attributeFilter: ".DVWebNode-storefront-wrapper",
      },
      [Stream.NetFlix]: {
        attributeFilter: ".DVWebNode-storefront-wrapper",
      },
      [Stream.DisneyPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
    },
    pip: {
      [Stream.PrimeVideo]: {
        attributeFilter: ".DVWebNode-storefront-wrapper",
      },
      [Stream.NetFlix]: {
        attributeFilter: ".DVWebNode-storefront-wrapper",
      },
      [Stream.DisneyPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#hudson-wrapper",
      },
    },
    cleanCatalog: {
      [Stream.PrimeVideo]: {
        attributeFilter: ".DVWebNode-storefront-wrapper",
      },
      [Stream.NetFlix]: {
        attributeFilter: ".DVWebNode-storefront-wrapper",
      },
      [Stream.DisneyPlus]: {
        attributeFilter: "#home-collection",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#home-collection",
      },
    },
  },
};

let Settings = {};
let Observers = {};

/** Stop Config */
function clickButton(button, consoleText = "skipped") {
  if (!button) return;

  const checkButton = async () => {
    while (button.disabled) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    button.click();
    console.info(consoleText);
  };

  checkButton();
}

function getHost() {
  const host = window.location.hostname;
  for (const [key, value] of Object.entries(Stream)) {
    if (host.includes(key.toLowerCase())) {
      return value;
    }
  }
  return "PrimeVideo";
}

// Funções correspondentes às configurações
const primeVideoFunctions = {
  skipIntro: function (mutations, observer) {
    const targetMutations = mutations.filter(({ target }) => target.querySelector("button.atvwebplayersdk-skipelement-button"));
    for (let { target } of targetMutations) {
      let button = target.querySelector("button.atvwebplayersdk-skipelement-button");
      if (button) {
        const video = document.querySelector("#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video");
        // Verifique se o vídeo está sendo reproduzido
        if (video && !video.paused) {
          setTimeout(function () {
            clickButton(button, "Skipped intro");
            // Volte 1 segundo após pular a introdução
            setTimeout(function () {
              if (Number.isFinite(video.currentTime) && video.currentTime >= 1) {
                video.currentTime -= 1;
              }
            }, 3000);
          }, 1000);
        }
      }
    }
  },
  skipCredits: function (mutations, observer) {
    const targetMutations = mutations.filter(({ target }) => target.querySelector("div > div.atvwebplayersdk-nextupcard-button"));
    for (let { target } of targetMutations) {
      let nextButton = target.querySelector("div > div.atvwebplayersdk-nextupcard-button");
      if (nextButton) {
        let nextEpNumber = target.querySelector(".atvwebplayersdk-nextupcard-episode");
        if (nextEpNumber && /\d+/.test(nextEpNumber.textContent) && parseInt(nextEpNumber.textContent.trim()) !== 1) {
          nextButton.click();
          console.log("Skipped credits for next episode.");
        }
        return;
      }
    }
  },
  skipAd: function (mutations, observer) {
    const targetMutations = mutations.filter(({ target }) => target.querySelector(".fu4rd6c.f1cw2swo"));
    console.log(targetMutations);
    for (let { target } of targetMutations) {
      console.log(target);
      if (target) {
        console.log(target);
        clickButton(target, "Self Ad skipped");
      }
    }
  },
  blockFreevee: function (mutations, observer) {
    const targetMutations = mutations.filter(({ target }) => target.querySelector("div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video"));
    for (let { target } of targetMutations) {
      let video = target.querySelector("div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video");
      if (video && !video.paused && video.currentTime > 0) {
        let adContainer = document.querySelector(".fu4rd6c.f1cw2swo");
        let adTimeText = document.querySelector(".atvwebplayersdk-adtimeindicator-text");
        if (adContainer && adTimeText) {
          const adTime = parseInt(adTimeText.textContent.match(/\d+/)[0]);
          if (Number.isFinite(adTime) && adTime > 1) {
            let skipTime = Math.min(adTime - 1, 20);
            video.currentTime += skipTime;
            console.info("FreeVee Ad skipped, length:", skipTime, "s");
          }
        }
      }
    }
  },
  speedSlider: function (mutations, observer) {
    let video = document.querySelector("#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video");
    let alreadySlider = document.querySelector("#videoSpeedSlider");

    //remove bad background hue which is annoying
    const BACKGROUND_OPACITY = 0.25;
    let element = document.querySelector(".fkpovp9.f8hspre");
    if (element && element.style && element.style.background !== `rgba(0, 0, 0, ${BACKGROUND_OPACITY})`) {
      element.style.background = `rgba(0, 0, 0, ${BACKGROUND_OPACITY})`;
    }

    if (video) {
      if (!alreadySlider) {
        const infobarContainer = document.querySelector(".atvwebplayersdk-infobar-container");
        if (!infobarContainer || infobarContainer.length === 0) return;

        const position = infobarContainer.firstElementChild?.children[2];
        if (!position) return;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("style", "width:1.2vw;height:1.2vw");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("id", "speedbutton");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute(
          "d",
          "M17.6427 7.43779C14.5215 4.1874 9.47851 4.1874 6.35734 7.43779C3.21422 10.711 3.21422 16.0341 6.35734 19.3074L4.91474 20.6926C1.02842 16.6454 1.02842 10.0997 4.91474 6.05254C8.823 1.98249 15.177 1.98249 19.0853 6.05254C22.9716 10.0997 22.9716 16.6454 19.0853 20.6926L17.6427 19.3074C20.7858 16.0341 20.7858 10.711 17.6427 7.43779ZM14 14C14 15.1046 13.1046 16 12 16C10.8954 16 10 15.1046 10 14C10 12.8954 10.8954 12 12 12C12.1792 12 12.3528 12.0236 12.518 12.0677L15.7929 8.79289L17.2071 10.2071L13.9323 13.482C13.9764 13.6472 14 13.8208 14 14Z"
        );
        path.setAttribute("fill", "rgb(221, 221, 221)");

        svg.setAttribute("fill", "rgb(221, 221, 221)");
        svg.appendChild(path);
        position.insertBefore(svg, position.firstChild);

        const createSlider = () => {
          const slider = document.createElement("input");
          slider.id = "videoSpeedSlider";
          slider.type = "range";
          slider.min = "5";
          slider.max = "15";
          slider.value = "10";
          slider.step = "1";
          slider.style = "height: 0.1875vw;background: rgb(221, 221, 221);display: none;";
          position.insertBefore(slider, position.firstChild);
          slider.addEventListener("input", () => {
            speed.textContent = `${slider.value / 10}x`;
            video.playbackRate = slider.value / 10;
          });
          return slider;
        };
        svg.addEventListener("click", () => {
          slider.style.display = slider.style.display === "block" ? "none" : "block";
        });

        const speed = document.createElement("p");
        speed.id = "videoSpeed";
        speed.textContent = "1.0x";
        position.insertBefore(speed, position.firstChild);

        let slider = createSlider();

        speed.addEventListener("click", () => {
          slider.style.display = slider.style.display === "block" ? "none" : "block";
        });
      }
    }
  },
  filterPaid: function (mutations, observer) {
    const spans = document.querySelectorAll(`span.x5HxKQ`);

    for (const span of spans) {
      let parent = span.parentElement;
      while (parent && parent.tagName.toLowerCase() !== "li") {
        parent = parent.parentElement;
      }

      if (parent) {
        const ul = parent.parentElement;
        parent.remove();

        const liCount = ul.querySelectorAll("li").length;
        if (liCount <= 1) {
          let divParent = ul.parentElement;
          while (divParent && !divParent.classList.contains("+OSZzQ")) {
            divParent = divParent.parentElement;
          }

          if (divParent) {
            ul.remove();
            divParent.remove();
          }
        }
      }
    }
  },
};

const netFlixFunctions = {};

const disneyPlusFunctions = {
  skipIntro: function ([{ target }]) {
    const button = target.querySelector("button.skip__button");
    if (button && !document.querySelector("video")?.paused) {
      setTimeout(() => {
        clickButton(button, `Skipped intro`);
      }, 1000);
    }
  },
  skipCredits: function ([{ target }]) {
    const nextButton = target.querySelector(`[data-gv2elementkey="playNext"]`);
    if (nextButton) {
      clickButton(nextButton, `Skipped credits.`);
    }
  },
  speedSlider: function (mutations, observer) {
    const video = document.querySelector("video");
    const alreadySlider = document.querySelector("#videoSpeed");
    const settingEnabled = Settings["speedSlider"];

    if (!video) return;

    if (settingEnabled) {
      if (!alreadySlider) {
        addSpeedSliderControls(video);
      }
    } else {
      removeSpeedSliderControls();
    }
  },
  pip: function (mutations, observer) {
    const hasPipControls = document.getElementById("pip-btn") ? true : false;
    if (hasPipControls) {
      if (Settings["pip"] === false) {
        const pip = document.getElementById("pip-btn");
        if (pip) {
          pip.remove();
        }
      }
      return true;
    }

    if (Settings["pip"] === false) {
      return false;
    }

    const element = document.getElementsByTagName("video")[0];

    const url = new URL(window.location);
    const page = /^\/?[a-z-]*\/video\//i.test(url.pathname);

    if (!page || !element) {
      return false;
    }

    element.disablePictureInPicture = false;

    const target = document.querySelector("#hudson-wrapper .controls__right");
    const audioControlDiv = target.querySelector(".audio-control");

    const pipButton = createPipButton();
    target.insertBefore(pipButton, audioControlDiv);
  },
  cleanCatalog: function (mutations, observer) {
    const elements = document.querySelectorAll("a.sc-htoDjs");

    if (!elements || elements.length === 0) {
      return;
    }

    const elementValues = {};

    elements.forEach((element) => {
      const value = element.getAttribute("data-gv2elementvalue");

      if (elementValues[value]) {
        elementValues[value].push(element);
      } else {
        elementValues[value] = [element];
      }
    });

    for (const value in elementValues) {
      if (elementValues[value].length > 1) {
        elementValues[value].forEach((element) => {
          let currentElement = element;

          while (currentElement && !currentElement.classList.contains("slick-slide")) {
            currentElement = currentElement.parentElement;
          }

          if (currentElement) {
            currentElement.remove();
          }
        });
      } else {
        let currentElement = elementValues[value][0];

        while (currentElement && !currentElement.classList.contains("slick-slide")) {
          currentElement = currentElement.parentElement;
        }

        if (currentElement) {
          currentElement.classList.add("slick-active");
        }
      }
    }
  },
};

const functionsMap = {
  [Stream.PrimeVideo]: primeVideoFunctions,
  [Stream.NetFlix]: netFlixFunctions,
  [Stream.DisneyPlus]: disneyPlusFunctions,
  [Stream.StarPlus]: disneyPlusFunctions,
};

chrome.storage.sync.get(["settings"], ({ settings }) => {
  if (typeof settings !== "object") {
    chrome.storage.sync.set(userSettings);
  } else {
    Settings = settings;
    setObserves();
  }
});

// Update settings on change
chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.settings) {
    Settings = changes.settings.newValue;
    setObserves();
  }
});

function setObserves() {
  const functions = functionsMap[getHost()];
  if (functions) {
    createObserversFromSettings(functions);
    startOrStopObservers();
  }
}

/** Cria observadores com base nas configurações e ações fornecidas. */
function createObserversFromSettings(actionsToPerform = {}) {
  const observers = {};
  const settingsKeys = Object.keys(Settings);
  const actionsToPerformKeys = Object.keys(actionsToPerform);
  const host = getHost();

  if (!settingsKeys?.length || !actionsToPerformKeys?.length) {
    return observers;
  }

  if (!Observers[host]) {
    Observers[host] = {};
  }

  for (const [key, value] of Object.entries(Settings)) {
    if (Observers[host][key]) continue;
    if (value) {
      const attributeFilter = sysConfig.settings[key]?.[host]?.attributeFilter ?? [];
      if (attributeFilter && actionsToPerform.hasOwnProperty(key)) {
        observers[key] = createObserver(attributeFilter, actionsToPerform[key]);
      }
    }
  }

  Observers[host] = { ...Observers[host], ...observers };

  return observers;
}

function createObserver(attributeFilter, callback) {
  const config = {
    attributes: true,
    attributeFilter: [attributeFilter],
    subtree: true,
    childList: true,
    attributeOldValue: false,
  };

  const observer = new MutationObserver(callback);
  observer.observe(document.body, config);
  return observer;
}

function startOrStopObservers() {
  const functionsAddOrRemove = ["pip", "speedSlider"];
  const settings = Settings;
  const host = getHost();

  if (!Object.keys(Observers).length || !Observers[host]) return;

  for (const [key, observer] of Object.entries(Observers[host])) {
    const settingEnabled = settings[key];
    const attributeFilter = sysConfig.settings[key]?.[host]?.attributeFilter ?? "";

    if (settingEnabled && attributeFilter) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: [attributeFilter],
        subtree: true,
        childList: true,
        attributeOldValue: false,
      });
    } else {
      observer.disconnect();
    }

    if (functionsAddOrRemove.includes(key) && functionsMap[host].hasOwnProperty(key)) {
      functionsMap[host][key]();
    }
  }
}

//pip
function togglePiP() {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  } else {
    if (document.pictureInPictureEnabled) {
      const element = document.getElementsByTagName("video")[0];
      element.requestPictureInPicture();
    }
  }
}

function createPipButton() {
  const type = "button";

  const pip = document.createElement(type);
  pip.id = "pip-btn";
  pip.type = type;
  pip.role = type;
  pip.tabindex = "0";
  pip.classList = "control-icon-btn fullscreen-icon";
  pip.innerHTML = `<div class="focus-hack-div " tabindex="-1"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -1 27 27" tabindex="-1" focusable="false"><path fill="#ffffff" d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg></div>`;
  pip.addEventListener("click", () => togglePiP());

  return pip;
}

function createSpeedButton(id = "speedbutton", style = "margin-left:0px;", orientation = 1) {
  const type = "button";

  const speed = document.createElement(type);
  speed.id = id;
  speed.type = type;
  speed.role = type;
  speed.tabindex = "0";
  speed.style = style;
  speed.classList = "control-icon-btn";
  speed.innerHTML = `<div class="focus-hack-div " tabindex="-1"><svg fill="#f1f1f1" width="1em" height="1em" viewBox="-3.2 -3.2 38.40 38.40" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#f1f1f1" transform="matrix(${orientation}, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.32"></g><g id="SVGRepo_iconCarrier"> <path d="M17.935 6.184l-15.79 9.816 15.79 9.816v-7.718l12 7.718v-19.631l-12 7.718v-7.719zM17.852 4.185c0.334 0 0.71 0.083 1.013 0.252 0.635 0.353 1.070 1.022 1.070 1.748v4.12l9.319-5.819c0.323-0.2 0.668-0.301 1.035-0.301 0.334 0 0.491 0.083 0.794 0.252 0.635 0.353 0.851 1.022 0.851 1.748v19.631c0 0.727-0.227 1.395-0.861 1.748-0.302 0.168-0.554 0.252-0.889 0.252-0.366 0-0.649-0.101-0.972-0.302l-9.278-5.818v4.12c0 0.727-0.435 1.395-1.070 1.748-0.302 0.168-0.657 0.252-0.992 0.252-0.366 0-0.744-0.101-1.066-0.302l-15.796-9.816c-0.587-0.364-0.946-1.006-0.946-1.698s0.355-1.334 0.942-1.698l15.79-9.816c0.322-0.2 0.688-0.301 1.055-0.301z"></path> </g></svg></div>`;

  return speed;
}

function addSpeedSliderControls(video) {
  const infobarContainer = document.querySelector("#hudson-wrapper .controls__right");
  if (!infobarContainer) return;

  const position = infobarContainer;

  const svg = createSpeedButton("speedbutton", "margin-left:0px;", "-1");
  position.prepend(svg, position.firstChild);

  const svgBack = createSpeedButton("speedbackbutton", "margin-right:0px;", "1");
  position.prepend(svgBack, position.firstChild);

  const speed = document.createElement("div");
  speed.className = "time-display-label body-copy";
  speed.id = "videoSpeed";
  speed.textContent = "1.0x";
  speed.style = "color: #f1f1f1; font-size: var(--time-font-size, 15px); margin: 0; padding-bottom: 5px;";
  position.prepend(speed);

  const formatSpeed = (speed) => (speed === 1 ? `${speed}.0x` : `${speed}x`);

  const updateSpeed = () => {
    video.playbackRate = Math.min(video.playbackRate + 0.25, 2);
    speed.textContent = formatSpeed(video.playbackRate);
  };

  const updateBackSpeed = () => {
    video.playbackRate = Math.max(video.playbackRate - 0.25, 0.25);
    speed.textContent = formatSpeed(video.playbackRate);
  };

  svg.addEventListener("click", updateSpeed);
  svgBack.addEventListener("click", updateBackSpeed);
}

function removeSpeedSliderControls() {
  const button1 = document.querySelector("#speedbutton");
  const button2 = document.querySelector("#speedbackbutton");
  const alreadySlider = document.querySelector("#videoSpeed");

  if (button1) button1.remove();
  if (button2) button2.remove();
  if (alreadySlider) alreadySlider.remove();
}
