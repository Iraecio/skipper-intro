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
    hideAction: false,
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
    hideAction: {
      [Stream.PrimeVideo]: {
        attributeFilter: ".tHfREs",
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
    if (!targetMutations) return;
    for (let { target } of targetMutations) {
      if (target) {
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
  hideAction: function (mutations, observer) {
    const url = window.location.href;

    if (!url.includes("/detail/")) return;

    //verificar o estado do bloqueio
    //se tiver bloqueado escurecer a foto e alterar o nome para vermelho
    //task

    const hasHideButton = document.getElementById("hide-btn") ? true : false;
    if (hasHideButton) return;

    const parsedUrl = new URL(url);
    const urlId = parsedUrl.pathname.split("/")[2];

    const target = document.querySelector("div.JRTz81");
    if (target) {
      createHideButton(urlId)
        .then((result) => {
          if (result) {
            target.appendChild(result);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }

    console.log("HIDE 1");
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
    const slidersCard = document.querySelectorAll("div.slick-slide") ?? [];
    slidersCard.forEach((element) => {
      element.classList.add("slick-active");
    });

    const elements = document.querySelectorAll("a.sc-htoDjs") ?? [];

    if (!elements || elements.length === 0) {
      return;
    }

    const elementMap = new Map();

    elements.forEach((element) => {
      const value = element.getAttribute("data-gv2elementvalue");

      if (value) {
        if (elementMap.has(value)) {
          elementMap.get(value).push(element);
        } else {
          elementMap.set(value, [element]);
        }
      }
    });

    for (const [value, elements] of elementMap.entries()) {
      if (elements.length > 1) {
        elements.forEach((element) => {
          let currentElement = element;

          while (currentElement && !currentElement.classList.contains("slick-slide")) {
            currentElement = currentElement.parentElement;
          }

          if (currentElement) {
            currentElement.remove();
          }
        });
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
      chrome.storage.sync.set({ pipWindowsActive: true });
    }
  }
}

function toggleHide(urlId) {
  return new Promise((resolve, reject) => {
    // Verificar se o urlId é uma string válida
    if (!urlId || typeof urlId !== "string") {
      reject(new Error("urlId inválido."));
      return;
    }

    chrome.storage.sync.get("blockedUrls", (result) => {
      let blockedUrls = result.blockedUrls || {};

      const host = getHost();

      // Verificar se o host é uma string válida
      if (!host || typeof host !== "string") {
        reject(new Error("Host inválido."));
        return;
      }

      // Verificar se o objeto blockedUrls é válido
      if (typeof blockedUrls !== "object" || Array.isArray(blockedUrls)) {
        reject(new Error("Objeto blockedUrls inválido."));
        return;
      }

      if (!blockedUrls[host]) {
        blockedUrls[host] = [urlId];
        console.log(`URL ${urlId} bloqueada no host ${host}`);
      } else {
        const index = blockedUrls[host].indexOf(urlId);
        if (index > -1) {
          // Remove a URL da lista de bloqueios
          blockedUrls[host].splice(index, 1);
          console.log(`URL ${urlId} desbloqueada no host ${host}`);
        } else {
          // Adiciona a URL à lista de bloqueios
          blockedUrls[host].push(urlId);
          console.log(`URL ${urlId} bloqueada no host ${host}`);
        }
      }

      chrome.storage.sync.set({ blockedUrls: blockedUrls }, () => {
        // Verificar se chrome.storage.sync.set foi bem sucedido
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        createHideButton(urlId).then((result) => {
          const hideButton = document.getElementById("hide-btn");
          if (hideButton) {
            hideButton.remove();
            const target = document.querySelector("div.JRTz81");
            if (target) {
              if (result) {
                target.appendChild(result);
              }
            }
          }
          resolve(true);
        });
      });
    });
  });
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

function createHideButton(urlId) {
  let blockedUrls = {};
  const host = getHost();
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("blockedUrls", (result) => {
      blockedUrls = result.blockedUrls || {};

      const blocked = blockedUrls[host].includes(urlId);
      const buttonIcon = getHtmlButton(blocked);

      const type = "span";
      const hide = document.createElement(type);
      hide.type = type;
      hide.role = type;
      hide.tabindex = "0";
      hide.classList = "";
      hide.id = "hide-btn";
      hide.innerHTML = buttonIcon;
      hide.addEventListener("click", () => toggleHide(urlId));

      resolve(hide);
    });
  });
}

function getHtmlButton(active) {
  if (active) {
    console.log("Esta bloqueado mostrar botao para desbloquear");
    return `
    <div class="_2Yly53 _2Jh193">
    <button type="button" role="button" class="_16hnQU gWrHlr OLz56u">
    <svg class="_22qEau" viewBox="0 0 24 24" height="24" width="24" role="img" aria-hidden="true" style="height:var(--dvui-icon-height);width:var(--dvui-icon-width)">
      <title>Hide</title>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="24" width="24"><title>Hide</title>
        <path opacity="0.1" d="M6.29528 7.87634L5 9.17162C3.66667 10.505 3 11.1716 3 12C3 12.8285 3.66667 13.4951 5 14.8285L7.12132 16.9498C9.85499 19.6835 14.2871 19.6835 17.0208 16.9498L17.4322 16.5384L14.5053 14.2619C13.9146 14.8713 13.0873 15.2501 12.1716 15.2501C10.3766 15.2501 8.92157 13.795 8.92157 12.0001C8.92157 11.3746 9.09827 10.7904 9.40447 10.2946L6.29528 7.87634Z" fill="currentColor"></path> 
        <path d="M3.17139 5.12988L21.1714 19.1299" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14.3653 13.8456C13.8162 14.5483 12.9609 15 12 15C10.3431 15 9 13.6569 9 12C9 11.3256 9.22253 10.7032 9.59817 10.2021" stroke="currentColor" stroke-width="2"></path> <path d="M9 5.62667C11.5803 4.45322 14.7268 4.92775 16.8493 7.05025L19.8511 10.052C20.3477 10.5486 20.5959 10.7969 20.7362 11.0605C21.0487 11.6479 21.0487 12.3521 20.7362 12.9395C20.5959 13.2031 20.3477 13.4514 19.8511 13.948V13.948L19.799 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> 
        <path d="M7.01596 8.39827C7.40649 8.00774 7.40649 7.37458 7.01596 6.98406C6.62544 6.59353 5.99228 6.59353 5.60175 6.98406L7.01596 8.39827ZM7.65685 16.2427L5.53553 14.1213L4.12132 15.5356L6.24264 17.6569L7.65685 16.2427ZM16.1421 16.2427C13.799 18.5858 10 18.5858 7.65685 16.2427L6.24264 17.6569C9.36684 20.7811 14.4322 20.7811 17.5563 17.6569L16.1421 16.2427ZM5.53553 9.8787L7.01596 8.39827L5.60175 6.98406L4.12132 8.46449L5.53553 9.8787ZM16.7465 15.6383L16.1421 16.2427L17.5563 17.6569L18.1607 17.0526L16.7465 15.6383ZM5.53553 14.1213C4.84888 13.4347 4.40652 12.9893 4.12345 12.6183C3.85798 12.2704 3.82843 12.1077 3.82843 12H1.82843C1.82843 12.7208 2.1322 13.3056 2.53341 13.8315C2.917 14.3342 3.47464 14.8889 4.12132 15.5356L5.53553 14.1213ZM4.12132 8.46449C3.47464 9.11116 2.917 9.6658 2.53341 10.1686C2.1322 10.6944 1.82843 11.2792 1.82843 12H3.82843C3.82843 11.8924 3.85798 11.7297 4.12345 11.3817C4.40652 11.0107 4.84888 10.5654 5.53553 9.8787L4.12132 8.46449Z" fill="currentColor"></path>
      </svg>
    </svg>
    </button>
    <div>`;
  } else {
    console.log("Nao esta bloqueado mostrar botao para bloquear");
    return `
    <div class="_2Yly53 _2Jh193">
      <button type="button" role="button" class="_16hnQU gWrHlr OLz56u">
        <svg class="_22qEau" viewBox="0 0 24 24" height="24" width="24" role="img" aria-hidden="true" style="height:var(--dvui-icon-height);width:var(--dvui-icon-width)">
          <title>Show</title>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" stroke-width="2"></path>
            <path
              d="M6.94975 7.05025C9.68342 4.31658 14.1156 4.31658 16.8492 7.05025L18.9706 9.17157C20.3039 10.5049 20.9706 11.1716 20.9706 12C20.9706 12.8284 20.3039 13.4951 18.9706 14.8284L16.8492 16.9497C14.1156 19.6834 9.68342 19.6834 6.94975 16.9497L4.82843 14.8284C3.49509 13.4951 2.82843 12.8284 2.82843 12C2.82843 11.1716 3.49509 10.5049 4.82843 9.17157L6.94975 7.05025Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            ></path>
          </svg>
        </svg>
      </button>
    <div>`;
  }
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
