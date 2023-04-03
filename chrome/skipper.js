const isPrimeVideo = window.location.hostname.includes("primevideo");
const version = "1.0.0";

if (isPrimeVideo) {
  // global variables in localStorage
  const defaultSettings = {
    settings: {
      PrimeVideo: { skipIntro: true, skipCredits: true, skipAd: true, blockFreevee: true, speedSlider: true, filterPaid: false },
    },
  };

  let settings = defaultSettings.settings;
  let lastAdTimeText = "";

  chrome.storage.sync.get("settings", ({ settings }) => {
    console.info("Prime Auto-Skip Ver:", version);
    console.info("Settings", settings);

    if (typeof settings !== "object") {
      chrome.storage.sync.set(defaultSettings);
    } else {
      settings.PrimeVideo?.skipIntro && startPrimeVideoSkipIntroObserver();
      settings.PrimeVideo?.skipCredits && startPrimeVideoSkipCreditsObserver();
      settings.PrimeVideo?.skipAd && startPrimeVideoSkipAdObserver();
      settings.PrimeVideo?.blockFreevee && setTimeout(() => startPrimeVideoBlockFreeveeObserver(), 200);
      settings.PrimeVideo?.speedSlider && startPrimeVideoSpeedSliderObserver();
      settings.PrimeVideo?.filterPaid && startPrimeVideoFilterPaidObserver();

      // set any undefined setting to the default
      let changedSettings = false;
      for (const [key, value] of Object.entries(defaultSettings.settings)) {
        if (!settings[key]) {
          console.log("undefined Setting:", key);
          settings[key] = value;
          changedSettings = true;
        } else {
          for (const [subkey, subvalue] of Object.entries(defaultSettings.settings[key])) {
            if (typeof settings[key][subkey] === "undefined") {
              console.log("undefined Setting:", key, subkey);
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
  });

  chrome.storage.sync.onChanged.addListener(function ({ settings: { oldValue, newValue } }) {
    console.log("Old value:", oldValue, ", new value:", newValue);
    if (!oldValue || newValue.PrimeVideo.skipIntro !== oldValue.PrimeVideo.skipIntro) startPrimeVideoSkipIntroObserver();
    if (!oldValue || newValue.PrimeVideo.skipCredits !== oldValue.PrimeVideo.skipCredits) startPrimeVideoSkipCreditsObserver();
    if (!oldValue || newValue.PrimeVideo.skipAd !== oldValue.PrimeVideo.skipAd) startPrimeVideoSkipAdObserver();
    if (!oldValue || newValue.PrimeVideo.blockFreevee !== oldValue.PrimeVideo.blockFreevee) startPrimeVideoBlockFreeveeObserver();
    if (!oldValue || newValue.PrimeVideo.speedSlider !== oldValue.PrimeVideo.speedSlider) startPrimeVideoSpeedSliderObserver();
    if (!oldValue || newValue.PrimeVideo.filterPaid !== oldValue.PrimeVideo.filterPaid) startPrimeVideoFilterPaidObserver();
  });

  // Observers
  // default Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  //************************************************************************* */
  //**             Adiciona o slide para definir velocidade do video          */
  //************************************************************************* */
  const PrimeVideoSpeedSliderConfig = { attributes: true, attributeFilter: ["video"], subtree: true, childList: true, attributeOldValue: false };
  const PrimeVideoSpeedSliderObserver = new MutationObserver(PrimeVideo_SpeedSlider);
  function PrimeVideo_SpeedSlider(mutations, observer) {
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
  }
  //************************************************************************* */

  //************************************************************************* */
  //**             Remove conteudos pagos                                     */
  //************************************************************************* */
  const PrimeVideoFilterPaidConfig = { attributes: true, attributeFilter: [".DVWebNode-storefront-wrapper"], subtree: true, childList: true, attributeOldValue: false };
  const PrimeVideoFilterPaidObserver = new MutationObserver(PrimeVideo_FilterPaid);
  function PrimeVideo_FilterPaid(mutations, observer) {
    console.log("trabalhando");
    document.querySelectorAll(".o86fri").forEach((e) => {
      a = e;
      SectionCount = 0;
      while (a.parentElement && SectionCount < 2) {
        a = a.parentElement;
        if (a.tagName == "SECTION") {
          SectionCount++;
        }
      }
      console.log("Filtered paid Element", a.parentElement);
      a.remove();
    });
  }
  //************************************************************************* */

  //************************************************************************* */
  //**             Pula a introdução do video, em cada episódio               */
  //************************************************************************* */
  const PrimeVideoSkipIntroConfig = { attributes: true, attributeFilter: [".f18oq18q"], subtree: true, childList: true, attributeOldValue: false };
  const PrimeVideoSkipIntroObserver = new MutationObserver(PrimeVideo_Intro);
  function PrimeVideo_Intro(mutations, observer) {
    // Percorre cada mutação que ocorreu
    for (let { target } of mutations) {
      let button = target.querySelector("button.atvwebplayersdk-skipelement-button");
      // Se o botão foi encontrado
      if (button) {
        const waitForButton = () =>
          new Promise((resolve) => {
            const checkButton = () => {
              if (button.disabled === false) {
                resolve();
              } else {
                setTimeout(checkButton, 100);
              }
            };
            checkButton();
          });

        waitForButton().then(() => {
          button.click();
          console.info("Intro skipped");
        });
      }
    }
  }

  PrimeVideoSkipIntroObserver.observe(document.body, PrimeVideoSkipIntroConfig);
  //************************************************************************* */

  //************************************************************************* */
  //**              Pula os creditos do video, em cada episódio               */
  //************************************************************************* */
  const PrimeVideoSkipCreditsConfig = { attributes: true, attributeFilter: [".atvwebplayersdk-nextupcard-show"], subtree: true, childList: true, attributeOldValue: false };
  const PrimeVideoSkipCreditsObserver = new MutationObserver(PrimeVideo_Credits);
  function PrimeVideo_Credits(mutations, observer) {
    // Percorre cada mutação que ocorreu
    for (let { target } of mutations) {
      // Encontra o botão de "próximo episódio"
      let nextButton = target.querySelector(".atvwebplayersdk-nextupcard-button");
      // Se o botão foi encontrado
      if (nextButton) {
        // Encontra o número do próximo episódio
        let nextEpNumber = target.querySelector(".atvwebplayersdk-nextupcard-episode");
        // Se o número do próximo episódio não for 1, clica no botão
        if (nextEpNumber && /\d+/.test(nextEpNumber.textContent) && parseInt(nextEpNumber.textContent.trim()) !== 1) {
          nextButton.click();
          console.info("Skipped credits for next episode.", nextButton);
        }
        return;
      }
    }
  }
  // Inicia o observador
  PrimeVideoSkipCreditsObserver.observe(document.body, PrimeVideoSkipCreditsConfig);
  //************************************************************************* */

  function skipAd(video) {
    let adContainer = document.querySelector(".fu4rd6c.f1cw2swo");
    let adTimeText = document.querySelector(".atvwebplayersdk-adtimeindicator-text");
    if (adContainer && adTimeText) {
      const adTime = parseInt(adTimeText.textContent.match(/\d+/)[0]);
      if (Number.isFinite(adTime) && adTime > 1 && lastAdTimeText != adTime) {
        resetLastATimeText();
        let skipTime = Math.min(adTime - 1, 20);
        video.currentTime += skipTime;
        console.info("FreeVee Ad skipped, length:", skipTime, "s");
      }
    }
  }

  async function PrimeVideo_FreeveeTimeout() {
    // set loop every 1 sec and check if ad is there
    let AdInterval = setInterval(function () {
      if (!settings.PrimeVideo.blockFreevee) {
        console.log("stopped observing| FreeVee Ad");
        clearInterval(AdInterval);
        return;
      }
      let video = document.querySelector("#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video");
      if (video && !video.paused && video.currentTime > 0) {
        // && !video.paused
        skipAd(video);
      }
    }, 100);
  }

  async function resetLastATimeText(time = 1000) {
    // timeout of 1 second to make sure the button is not pressed too fast, it will crash or slow the website otherwise
    setTimeout(() => {
      lastAdTimeText = "";
    }, time);
  }

  async function PrimeVideo_AdTimeout() {
    // set loop every 1 sec and check if ad is there
    let AdInterval = setInterval(function () {
      if (!settings.PrimeVideo.skipAd) {
        console.log("stopped observing| Self Ad");
        clearInterval(AdInterval);
        return;
      }
      let video = document.querySelector("#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video");
      if (video) {
        video.onplay = function () {
          // console.log("started playing video");
          // if video is playing
          if (getComputedStyle(document.querySelector("#dv-web-player")).display != "none") {
            let button = document.querySelector(".fu4rd6c.f1cw2swo");
            if (button) {
              // only getting the time after :08
              let adTime = parseInt(
                document
                  .querySelector(".atvwebplayersdk-adtimeindicator-text")
                  .innerHTML.match(/[:]\d+/)[0]
                  .substring(1)
              );
              // wait for 100ms before skipping to make sure the button is not pressed too fast, or there will be inifinite loading
              setTimeout(() => {
                if (button) {
                  button.click();
                  console.log("Self Ad skipped, length:", adTime, button);
                }
              }, 100);
            }
          }
        };
      }
    }, 100);
  }

  // start/stop the observers depending on settings
  async function startPrimeVideoSpeedSliderObserver() {
    if (settings.PrimeVideo.speedSlider === undefined || settings.PrimeVideo.speedSlider) {
      let video = document.querySelector("#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video");
      let alreadySlider = document.querySelector("#videoSpeedSlider");

      // remove bad background document.querySelector(".fkpovp9.f8hspre").style.background = "rgba(0, 0, 0, 0.25)";
      let b = document.querySelector(".fkpovp9.f8hspre");
      if (b && b.style.background != "rgba(0, 0, 0, 0.25)") {
        b.style.background = "rgba(0, 0, 0, 0.25)";
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
      console.log("started adding | SpeedSlider");
      PrimeVideoSpeedSliderObserver.observe(document, PrimeVideoSpeedSliderConfig);
    } else {
      console.log("stopped adding| SpeedSlider");
      PrimeVideoSpeedSliderObserver.disconnect();
      document.querySelector("#videoSpeed")?.remove();
      document.querySelector("#videoSpeedSlider")?.remove();
      document.querySelector("#speedbutton")?.remove();
    }
  }

  async function startPrimeVideoFilterPaidObserver() {
    console.log(settings.PrimeVideo.filterPaid);
    if (settings.PrimeVideo.filterPaid === undefined || settings.PrimeVideo.filterPaid) {
      console.log("started filtering| Paid films");
      PrimeVideoFilterPaidObserver.observe(document.body, PrimeVideoFilterPaidConfig);
    } else {
      console.log("stopped filtering| Paid films");
      PrimeVideoFilterPaidObserver.disconnect();
    }
  }

  //chatgpt
  async function startPrimeVideoSkipIntroObserver() {
    const skipIntroSetting = settings.PrimeVideo.skipIntro;
    if (skipIntroSetting === undefined || skipIntroSetting) {
      console.info("started observing| Intro");
      PrimeVideoSkipIntroObserver.observe(document.body, PrimeVideoSkipIntroConfig);
    } else {
      console.info("stopped observing| Intro");
      PrimeVideoSkipIntroObserver.disconnect();
    }
  }

  //************************************************************************* */
  //**              Inicia Observador para Pula os creditos                   */
  //************************************************************************* */
  async function startPrimeVideoSkipCreditsObserver() {
    if (settings.PrimeVideo.skipCredits === undefined || settings.PrimeVideo.skipCredits) {
      PrimeVideoSkipCreditsObserver.observe(document.body, PrimeVideoSkipCreditsConfig);
    } else {
      console.info("stopped observing| Credits");
      PrimeVideoSkipCreditsObserver.disconnect();
    }
  }
  //************************************************************************* */

  async function startPrimeVideoSkipAdObserver() {
    if (settings.PrimeVideo.skipAd === undefined || settings.PrimeVideo.skipAd) {
      console.log("started observing| Self Ad");
      PrimeVideo_AdTimeout();
    }
  }

  async function startPrimeVideoBlockFreeveeObserver() {
    if (settings.PrimeVideo.blockFreevee === undefined || settings.PrimeVideo.blockFreevee) {
      console.log("started observing| FreeVee Ad");
      // PrimeVideoFreeVeeObserver.observe(document, FreeVeeConfig);
      PrimeVideo_FreeveeTimeout();
    }
  }

  //pip
   
}
