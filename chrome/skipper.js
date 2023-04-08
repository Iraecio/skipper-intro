const isPrimeVideo = window.location.hostname.includes("primevideo");
const version = "1.0.0";
console.info("Auto-Skip Ver:", version);

if (isPrimeVideo) {
  // global variables in localStorage
  const defaultSettings = {
    settings: {
      PrimeVideo: {
        skipIntro: {
          status: true,
          attributeFilter: ".f18oq18q",
        },
        skipCredits: {
          status: true,
          attributeFilter: ".atvwebplayersdk-nextupcard-show",
        },
        skipAd: {
          status: true,
          attributeFilter: "#dv-web-player",
        },
        blockFreevee: {
          status: true,
          attributeFilter: "#dv-web-player",
        },
        speedSlider: {
          status: true,
          attributeFilter: "video",
        },
        filterPaid: {
          status: true,
          attributeFilter: ".DVWebNode-storefront-wrapper",
        },
      },
    },
  };

  let settings = {};
  let primeVideoObservers = {};

  chrome.storage.sync.get(["settings"], ({ settings }) => {
    if (typeof settings !== "object") {
      chrome.storage.sync.set(defaultSettings);
    } else {
      primeVideoObservers = createObserversFromSettings(settings.PrimeVideo);
      startObservers(primeVideoObservers, settings.PrimeVideo);
    }
  });

  chrome.storage.sync.onChanged.addListener((changes) => {
    if (changes.settings) {
      settings = changes.settings.newValue;
      startObservers(primeVideoObservers, settings.PrimeVideo);
    }
  });

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

  function createObserversFromSettings(settings) {
    const observers = {};
    for (const [key, value] of Object.entries(settings)) {
      if (value.status) {
        const observer = createObserver(value.attributeFilter, primeVideoFunctions[key]);
        observers[key] = observer;
      }
    }
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

  function startObservers(observers, settings) {
    for (const [key, observer] of Object.entries(observers)) {
      if (settings[key].status) {
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: [settings[key].attributeFilter],
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
