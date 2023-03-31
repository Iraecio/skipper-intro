const isPrimeVideo = window.location.hostname.includes('primevideo');
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
      // Percorre todos os campos do objeto settings 
      if (JSON.stringify(Object.keys(defaultSettings.settings)) !== JSON.stringify(Object.keys(settings))) {
        for (let key in settings) {
          if (key !== 'PrimeVideo') {
            delete settings[key];
          }
        }
        chrome.storage.sync.set({ settings });
      }


      settings.PrimeVideo?.skipIntro && startAmazonSkipIntroObserver();
      settings.PrimeVideo?.skipCredits && startAmazonSkipCreditsObserver();
      settings.PrimeVideo?.skipAd && startAmazonSkipAdObserver();
      settings.PrimeVideo?.blockFreevee && setTimeout(() => startAmazonBlockFreeveeObserver(), 200);
      settings.PrimeVideo?.speedSlider && startAmazonSpeedSliderObserver();
      settings.PrimeVideo?.filterPaid && startAmazonFilterPaidObserver();

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
    if (!oldValue || newValue.PrimeVideo.skipIntro !== oldValue.PrimeVideo.skipIntro) startAmazonSkipIntroObserver();
    if (!oldValue || newValue.PrimeVideo.skipCredits !== oldValue.PrimeVideo.skipCredits) startAmazonSkipCreditsObserver();
    if (!oldValue || newValue.PrimeVideo.skipAd !== oldValue.PrimeVideo.skipAd) startAmazonSkipAdObserver();
    if (!oldValue || newValue.PrimeVideo.blockFreevee !== oldValue.PrimeVideo.blockFreevee) startAmazonBlockFreeveeObserver();
    if (!oldValue || newValue.PrimeVideo.speedSlider !== oldValue.PrimeVideo.speedSlider) startAmazonSpeedSliderObserver();
    if (!oldValue || newValue.PrimeVideo.filterPaid !== oldValue.PrimeVideo.filterPaid) startAmazonFilterPaidObserver();
  });

  // Observers
  // default Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Amazon Observers
  const AmazonSpeedSliderConfig = { attributes: true, attributeFilter: ["video"], subtree: true, childList: true, attributeOldValue: false };
  const AmazonSpeedSliderObserver = new MutationObserver(Amazon_SpeedSlider);
  function Amazon_SpeedSlider(mutations, observer) {
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

        const infobar = document.querySelector("[class*=infobar-container]");
        // infobar position for the slider to be added
        const position = infobar.firstChild.children[2];
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const slider = document.createElement("input");
        const speed = document.createElement("p");

        svg.setAttribute("style", "width:1.2vw;height:1.2vw");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("id", "speedbutton");

        path.setAttribute(
          "d",
          "M17.6427 7.43779C14.5215 4.1874 9.47851 4.1874 6.35734 7.43779C3.21422 10.711 3.21422 16.0341 6.35734 19.3074L4.91474 20.6926C1.02842 16.6454 1.02842 10.0997 4.91474 6.05254C8.823 1.98249 15.177 1.98249 19.0853 6.05254C22.9716 10.0997 22.9716 16.6454 19.0853 20.6926L17.6427 19.3074C20.7858 16.0341 20.7858 10.711 17.6427 7.43779ZM14 14C14 15.1046 13.1046 16 12 16C10.8954 16 10 15.1046 10 14C10 12.8954 10.8954 12 12 12C12.1792 12 12.3528 12.0236 12.518 12.0677L15.7929 8.79289L17.2071 10.2071L13.9323 13.482C13.9764 13.6472 14 13.8208 14 14Z"
        );
        path.setAttribute("fill", "rgb(221, 221, 221)");

        svg.setAttribute("fill", "rgb(221, 221, 221)");
        svg.appendChild(path);

        slider.setAttribute("id", "videoSpeedSlider");
        slider.setAttribute("type", "range");
        slider.setAttribute("min", "5");
        slider.setAttribute("max", "15");
        slider.setAttribute("value", "10");
        slider.setAttribute("step", "1");
        slider.setAttribute("style", "height: 0.1875vw;background: rgb(221, 221, 221);display: none;");

        position.insertBefore(svg, position.firstChild);
        position.insertBefore(slider, position.firstChild);

        speed.setAttribute("id", "videoSpeed");
        speed.textContent = "1.0x";

        svg.onclick = function () {
          if (slider.style.display === "block") slider.style.display = "none";
          else slider.style.display = "block";
        };

        position.insertBefore(speed, position.firstChild);

        slider.addEventListener("click", toggleSliderDisplay.bind(this, video, speed), false);
        slider.addEventListener("input", updatePlaybackRate.bind(this, video, speed), false);

      } else {
        // need to resync the slider with the video sometimes
        speed = document.querySelector("#videoSpeed");
        if (video.playbackRate != alreadySlider.value / 10) {
          video.playbackRate = alreadySlider.value / 10;
        }
        alreadySlider.oninput = function () {
          speed.textContent = this.value / 10 + "x";
          video.playbackRate = this.value / 10;
        };
      }
    }
  }

  function updatePlaybackRate() {
    try {
      const speedText = `${this.value / 10}x`;
      speed.textContent = speedText;
      video.playbackRate = this.value / 10;
    } catch (err) {
      console.error(`An error occurred while updating the playback rate: ${err.message}`);
    }
  }

  function toggleSliderDisplay() {
    try {
      slider.style.display = (slider.style.display === "block") ? "none" : "block";
    } catch (err) {
      console.error(`An error occurred while toggling the slider display: ${err.message}`);
    }
  }

  const AmazonFilterPaidConfig = { attributes: true, attributeFilter: [".o86fri"], subtree: true, childList: true, attributeOldValue: false };
  const AmazonFilterPaidObserver = new MutationObserver(Amazon_FilterPaid);
  function Amazon_FilterPaid(mutations, observer) {
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

  const AmazonSkipIntroConfig = { attributes: true, attributeFilter: [".skipelement"], subtree: true, childList: true, attributeOldValue: false };
  const AmazonSkipIntroObserver = new MutationObserver(Amazon_Intro);
  function Amazon_Intro(mutations, observer) {
    for (let mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        const button = mutation.addedNodes[0].querySelector('.atvwebplayersdk-skipelement-button');
        if (button) {
          const waitForButton = () => new Promise(resolve => {
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
  }

  AmazonSkipIntroObserver.observe(document.body, AmazonSkipIntroConfig);


  const AmazonSkipCreditsConfig = { attributes: true, attributeFilter: [".nextupcard"], subtree: true, childList: true, attributeOldValue: false };
  const AmazonSkipCreditsObserver = new MutationObserver(Amazon_Credits);
  function Amazon_Credits(mutations, observer) {
    // Percorre cada mutação que ocorreu
    for (let { target } of mutations) {
      // Se o elemento mutado corresponde à classe ".nextupcard"
      if (target.matches(".nextupcard")) {
        // Encontra o botão de "próximo episódio"
        let nextButton = target.querySelector(".nextupcard-button");
        // Se o botão foi encontrado
        if (nextButton) {
          // Encontra o número do próximo episódio
          let nextEpNumber = target.querySelector(".nextupcard-episode");
          // Se o número do próximo episódio não for 1, clica no botão
          if (nextEpNumber && /\d+/.test(nextEpNumber.textContent) && parseInt(nextEpNumber.textContent.trim()) !== 1) {
            nextButton.click();
            console.info("Skipped credits for next episode.", nextButton);
          }
          return;
        }
      }
    }
  }
  // Inicia o observador
  AmazonSkipCreditsObserver.observe(document.body, AmazonSkipCreditsConfig);



  const MAX_SKIP_TIME = 20;
  function skipAd(video) {
    let adContainer = document.querySelector(".fu4rd6c.f1cw2swo");
    let adTimeText = document.querySelector(".atvwebplayersdk-adtimeindicator-text");
    if (adContainer && adTimeText) {
      const adTime = parseInt(adTimeText.textContent.match(/\d+/)[0]);
      if (Number.isFinite(adTime) && adTime > 1 && lastAdTimeText != adTime) {
        resetLastATimeText();
        let skipTime = Math.min(adTime - 1, MAX_SKIP_TIME);
        video.currentTime += skipTime;
        console.info("FreeVee Ad skipped, length:", skipTime, "s");
      }
    }
  }

  async function Amazon_FreeveeTimeout() {
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

  async function Amazon_AdTimeout() {
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
  async function startAmazonSpeedSliderObserver() {
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
          // infobar position for the slider to be added
          let position = document.querySelector("[class*=infobar-container]").firstChild.children[2];

          let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("style", "width:1.2vw;height:1.2vw");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("id", "speedbutton");
          let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute(
            "d",
            "M17.6427 7.43779C14.5215 4.1874 9.47851 4.1874 6.35734 7.43779C3.21422 10.711 3.21422 16.0341 6.35734 19.3074L4.91474 20.6926C1.02842 16.6454 1.02842 10.0997 4.91474 6.05254C8.823 1.98249 15.177 1.98249 19.0853 6.05254C22.9716 10.0997 22.9716 16.6454 19.0853 20.6926L17.6427 19.3074C20.7858 16.0341 20.7858 10.711 17.6427 7.43779ZM14 14C14 15.1046 13.1046 16 12 16C10.8954 16 10 15.1046 10 14C10 12.8954 10.8954 12 12 12C12.1792 12 12.3528 12.0236 12.518 12.0677L15.7929 8.79289L17.2071 10.2071L13.9323 13.482C13.9764 13.6472 14 13.8208 14 14Z"
          );
          path.setAttribute("fill", "rgb(221, 221, 221)");
          svg.setAttribute("fill", "rgb(221, 221, 221)");
          svg.appendChild(path);
          position.insertBefore(svg, position.firstChild);

          let slider = document.createElement("input");
          slider.id = "videoSpeedSlider";
          slider.type = "range";
          slider.min = "5";
          slider.max = "15";
          slider.value = "10";
          slider.step = "1";
          // slider.setAttribute("list", "markers");
          slider.style = "height: 0.1875vw;background: rgb(221, 221, 221);display: none;";
          position.insertBefore(slider, position.firstChild);

          svg.onclick = function () {
            if (slider.style.display === "block") slider.style.display = "none";
            else slider.style.display = "block";
          };

          let speed = document.createElement("p");
          speed.id = "videoSpeed";
          speed.textContent = "1.0x";
          position.insertBefore(speed, position.firstChild);
          speed.onclick = function () {
            if (slider.style.display === "block") slider.style.display = "none";
            else slider.style.display = "block";
          };
          slider.oninput = function () {
            speed.textContent = this.value / 10 + "x";
            video.playbackRate = this.value / 10;
          };
        }
      }
      console.log("started adding | SpeedSlider");
      AmazonSpeedSliderObserver.observe(document, AmazonSpeedSliderConfig);
    } else {
      console.log("stopped adding| SpeedSlider");
      AmazonSpeedSliderObserver.disconnect();
      document.querySelector("#videoSpeed")?.remove();
      document.querySelector("#videoSpeedSlider")?.remove();
      document.querySelector("#speedbutton")?.remove();
    }
  }

  async function startAmazonFilterPaidObserver() {
    if (settings.PrimeVideo.filterPaid === undefined || settings.PrimeVideo.filterPaid) {
      console.log("started filtering| Paid films");

      AmazonFilterPaidObserver.observe(document, AmazonFilterPaidConfig);
    } else {
      console.log("stopped filtering| Paid films");
      AmazonFilterPaidObserver.disconnect();
    }
  }

  //chatgpt
  async function startAmazonSkipIntroObserver() {
    const skipIntroSetting = settings.PrimeVideo.skipIntro;
    if (skipIntroSetting === undefined || skipIntroSetting) {
      console.info("started observing| Intro");
      AmazonSkipIntroObserver.observe(document.body, AmazonSkipIntroConfig);
    } else {
      console.info("stopped observing| Intro");
      AmazonSkipIntroObserver.disconnect();
    }
  }

  async function startAmazonSkipCreditsObserver() {
    if (settings.PrimeVideo.skipCredits === undefined || settings.PrimeVideo.skipCredits) {
      console.log("started observing| Credits");
      let button = document.querySelector("[class*=nextupcard-button]");
      if (button) {
        // only skipping to next episode not an entirely new series
        // this not skipping between seasons, which is fine i think because amazon is still doing it
        let newEpNumber = document.querySelector("[class*=nextupcard-episode]");
        if (newEpNumber && !newEpNumber.textContent.match(/(?<!\S)1(?!\S)/)) {
          button.click();
          console.log("Credits skipped", button);
        }
      }
      AmazonSkipCreditsObserver.observe(document, AmazonSkipCreditsConfig);
    } else {
      console.log("stopped observing| Credits");
      AmazonSkipCreditsObserver.disconnect();
    }
  }

  async function startAmazonSkipAdObserver() {
    if (settings.PrimeVideo.skipAd === undefined || settings.PrimeVideo.skipAd) {
      console.log("started observing| Self Ad");
      Amazon_AdTimeout();
    }
  }

  async function startAmazonBlockFreeveeObserver() {
    if (settings.PrimeVideo.blockFreevee === undefined || settings.PrimeVideo.blockFreevee) {
      console.log("started observing| FreeVee Ad");
      // AmazonFreeVeeObserver.observe(document, FreeVeeConfig);
      Amazon_FreeveeTimeout();
    }
  }

}
