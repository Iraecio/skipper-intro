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
        attributeFilter: ".f18oq18q",
      },
      [Stream.StarPlus]: {
        attributeFilter: ".f18oq18q",
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
        attributeFilter: ".atvwebplayersdk-nextupcard-show",
      },
      [Stream.StarPlus]: {
        attributeFilter: ".atvwebplayersdk-nextupcard-show",
      },
    },
    skipAd: {
      [Stream.PrimeVideo]: {
        attributeFilter: "#dv-web-player",
      },
      [Stream.NetFlix]: {
        attributeFilter: "#dv-web-player",
      },
      [Stream.DisneyPlus]: {
        attributeFilter: "#dv-web-player",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#dv-web-player",
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
        attributeFilter: "#dv-web-player",
      },
      [Stream.StarPlus]: {
        attributeFilter: "#dv-web-player",
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
        attributeFilter: "video",
      },
      [Stream.StarPlus]: {
        attributeFilter: "video",
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
        attributeFilter: ".DVWebNode-storefront-wrapper",
      },
      [Stream.StarPlus]: {
        attributeFilter: ".DVWebNode-storefront-wrapper",
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
      console.log("video rodando");
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
    const targetMutations = mutations.filter(({ target }) => target.querySelector("div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video"));
    for (let { target } of targetMutations) {
      if (target) {
        target.onplay = function () {
          let button = document.querySelector(".fu4rd6c.f1cw2swo");
          clickButton(button, "Self Ad skipped, length");
        };
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
const netFlixFunctions = {
  skipIntro: function (mutations, observer) {
    const targetMutations = mutations.filter(({ target }) => target.querySelector("button.atvwebplayersdk-skipelement-button"));
    for (let { target } of targetMutations) {
      console.log("video rodando");
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
    const targetMutations = mutations.filter(({ target }) => target.querySelector("div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video"));
    for (let { target } of targetMutations) {
      if (target) {
        target.onplay = function () {
          let button = document.querySelector(".fu4rd6c.f1cw2swo");
          clickButton(button, "Self Ad skipped, length");
        };
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
const disneyPlusFunctions = {
  skipIntro: function (mutations, observer) {
    const targetMutations = mutations.filter(({ target }) => target.querySelector("button.atvwebplayersdk-skipelement-button"));
    for (let { target } of targetMutations) {
      console.log("video rodando");
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
    const targetMutations = mutations.filter(({ target }) => target.querySelector("div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video"));
    for (let { target } of targetMutations) {
      if (target) {
        target.onplay = function () {
          let button = document.querySelector(".fu4rd6c.f1cw2swo");
          clickButton(button, "Self Ad skipped, length");
        };
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
const starPlusFunctions = {
  skipIntro: function (mutations, observer) {
    const targetMutations = mutations.filter(({ target }) => target.querySelector("button.atvwebplayersdk-skipelement-button"));
    for (let { target } of targetMutations) {
      console.log("video rodando");
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
    const targetMutations = mutations.filter(({ target }) => target.querySelector("div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video"));
    for (let { target } of targetMutations) {
      if (target) {
        target.onplay = function () {
          let button = document.querySelector(".fu4rd6c.f1cw2swo");
          clickButton(button, "Self Ad skipped, length");
        };
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

function setObserves() {
  const host = getHost();
  const functionsMap = {
    [Stream.PrimeVideo]: primeVideoFunctions,
    [Stream.NetFlix]: netFlixFunctions,
    [Stream.DisneyPlus]: disneyPlusFunctions,
    [Stream.StarPlus]: starPlusFunctions,
  };

  const functions = functionsMap[host];
  if (functions) {
    createObserversFromSettings(functions);
    startOrStopbservers();
  }
}

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
  console.log("changed ");
  if (changes.settings) {
    Settings = changes.settings.newValue;
    startOrStopbservers();
  }
});

/**
 * Cria observadores com base nas configurações e ações fornecidas.
 */
function createObserversFromSettings(actionsToPerform = {}) {
  const observers = {};
  const settingsKeys = Object.keys(Settings);

  if (!settingsKeys?.length || !actionsToPerform?.length) {
    return observers;
  }

  for (const [key, value] of Object.entries(Settings)) {
    if (value) {
      const attributeFilter = sysConfig.settings[key]?.[getHost()]?.attributeFilter ?? [];
      if (attributeFilter) {
        observers[key] = createObserver(attributeFilter, actionsToPerform[key]);
      }
    }
  }

  Observers[getHost()] = observers;
  console.log(Observers[getHost()]);

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

function startOrStopbservers() {
  const settings = Settings;
  const host = getHost();
  console.log(Observers);
  if (!Object.keys(Observers).length) return;

  for (const [stream, value] of Object.entries(Observers)) {
    if (stream !== host) return;
    for (const [key, observer] of Object.entries(Observers[stream])) {
      if (settings[key]) {
        const attributeFilter = sysConfig.settings[key]?.[host]?.attributeFilter ?? "";
        if (!attributeFilter) return;

        observer.observe(document.body, {
          attributes: true,
          attributeFilter: [attributeFilter],
          subtree: true,
          childList: true,
          attributeOldValue: false,
        });

        console.log(key, "On");
      } else {
        console.log(key, "OFF");
        observer.disconnect();
      }
    }
  }
}

//PIP
function isPlayerPage() {
  const url = new URL(window.location);
  const pattern = /^\/?([A-Za-z-]*)?\/video\//i;
  return pattern.test(url.pathname) ? true : false;
}

function togglePiP() {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  } else {
    if (document.pictureInPictureEnabled) {
      this.element.requestPictureInPicture();
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

  pip.addEventListener("click", () => this.togglePiP());

  return pip;
}

function hasPipControls() {
  return document.getElementById("pip-btn") ? true : false;
}

function injectPipControls() {
  if (this.hasPipControls()) {
    return true;
  }

  this.element = document.getElementsByTagName("video")[0];

  if (!this.isPlayerPage() || !this.element) {
    return false;
  }

  this.element.disablePictureInPicture = false;

  const target = document.querySelector("#hudson-wrapper .controls__right");
  target.insertAdjacentElement("afterbegin", this.createPipButton());
}
