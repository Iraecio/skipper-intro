let hostname = window.location.hostname;
let isAmazon = /amazon|primevideo/i.test(hostname);
const version = "1.0.0";

if (isAmazon) {
  // global variables in localStorage
  const defaultSettings = {
    settings: {
      Amazon: { skipIntro: true, skipCredits: true, skipAd: true, blockFreevee: true, speedSlider: true, filterPaid: false },
    },
  };
  let settings = defaultSettings.settings;
  let lastAdTimeText = "";
  resetBadge();

  chrome.storage.sync.get("settings", function (result) {
    settings = result.settings;
    console.info("Prime Auto-Skip Ver:", version);
    console.info("Settings", settings);
    if (typeof settings !== "object") {
      chrome.storage.sync.set(defaultSettings);
    } else {
      if (settings.Amazon?.skipIntro) startAmazonSkipIntroObserver();
      if (settings.Amazon?.skipCredits) startAmazonSkipCreditsObserver();
      if (settings.Amazon?.skipAd) startAmazonSkipAdObserver();
      if (settings.Amazon?.blockFreevee) {
        // timeout of 100 ms because the ad is not loaded fast enough and the video will crash
        setTimeout(function () {
          startAmazonBlockFreeveeObserver();
        }, 200);
      }
      if (settings.Amazon?.speedSlider) startAmazonSpeedSliderObserver();
      if (settings.Amazon?.filterPaid) startAmazonFilterPaidObserver();

      // if there is an undefined setting, set it to the default
      let changedSettings = false;
      for (const key in defaultSettings.settings) {
        if (typeof settings[key] === "undefined") {
          console.log("undefined Setting:", key);
          changedSettings = true;
          settings[key] = defaultSettings.settings[key];
        } else {
          for (const subkey in defaultSettings.settings[key]) {
            if (typeof settings[key][subkey] === "undefined") {
              console.log("undefined Setting:", key, subkey);
              changedSettings = true;
              settings[key][subkey] = defaultSettings.settings[key][subkey];
            }
          }
        }
      }
      if (changedSettings) {
        chrome.storage.sync.set({ settings });
      }
    }
  });

  chrome.storage.sync.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key == "settings") {
        settings = newValue;
        console.log(key, "Old value:", oldValue, ", new value:", newValue);
        if (oldValue === undefined || newValue.Amazon.skipIntro !== oldValue.Amazon.skipIntro) startAmazonSkipIntroObserver();
        if (oldValue === undefined || newValue.Amazon.skipCredits !== oldValue.Amazon.skipCredits) startAmazonSkipCreditsObserver();
        if (oldValue === undefined || newValue.Amazon.skipAd !== oldValue.Amazon.skipAd) startAmazonSkipAdObserver();
        if (oldValue === undefined || newValue.Amazon.blockFreevee !== oldValue.Amazon.blockFreevee) startAmazonBlockFreeveeObserver();
        if (oldValue === undefined || newValue.Amazon.speedSlider !== oldValue.Amazon.speedSlider) startAmazonSpeedSliderObserver();
        if (oldValue === undefined || newValue.Amazon.filterPaid !== oldValue.Amazon.filterPaid) startAmazonFilterPaidObserver();
      }
    }
  });

  function addIntroTimeSkipped(startTime, endTime) {
    if (typeof startTime === "number" && typeof endTime === "number" && endTime > startTime) {
      console.log("Intro Time skipped", endTime - startTime);
      increaseBadge();
    }
  }

  function addRecapTimeSkipped(startTime, endTime) {
    if (typeof startTime === "number" && typeof endTime === "number" && endTime > startTime) {
      console.log("Recap Time skipped", endTime - startTime);
      increaseBadge();
    }
  }

  // Observers
  // default Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Amazon Observers
  const AmazonSpeedSliderConfig = { attributes: true, attributeFilter: ["video"], subtree: true, childList: true, attributeOldValue: false };
  const AmazonSpeedSliderObserver = new MutationObserver(Amazon_SpeedSlider);
  function Amazon_SpeedSlider(mutations, observer) {
    let video = document.querySelector("#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video");
    let alreadySlider = document.querySelector("#videoSpeedSlider");

    // remove bad background hue which is annoying
    //document.querySelector(".fkpovp9.f8hspre").style.background = "rgba(0, 0, 0, 0.25)";
    let b = document.querySelector(".fkpovp9.f8hspre");
    if (b && b.style.background != "rgba(0, 0, 0, 0.25)") {
      b.style.background = "rgba(0, 0, 0, 0.25)";
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
        speed.setAttribute("textContent", "1.0x");

        svg.onclick = function () {
          if (slider.style.display === "block") slider.style.display = "none";
          else slider.style.display = "block";
        };

        position.insertBefore(speed, position.firstChild);

        slider.addEventListener("input", updatePlaybackRate.bind(this, video, speed), false);

        speed.onclick = toggleSliderDisplay;
        slider.oninput = updatePlaybackRate;

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
  // const AmazonSkipIntro = new RegExp("skipelement", "i");
  const AmazonSkipIntroObserver = new MutationObserver(Amazon_Intro);
  function Amazon_Intro(mutations, observer) {
    let button = document.querySelector("[class*=skipelement]");
    if (button) {
      let video = document.querySelector("#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video");
      const time = video.currentTime;
      button.click();
      console.log("Intro skipped", button);
      //delay where the video is loaded
      setTimeout(function () {
        AmazonGobackbutton(video, time, video.currentTime);
        addIntroTimeSkipped(time, video.currentTime);
      }, 50);
    }
  }
  reverseButton = false;
  function AmazonGobackbutton(video, startTime, endTime) {
    if (!reverseButton) {
      reverseButton = true;
      // go back button
      const button = document.createElement("button");
      button.style = "padding: 0px 22px; line-height: normal; min-width: 0px";
      button.setAttribute("class", "fqye4e3 f1ly7q5u fk9c3ap fz9ydgy f1xrlb00 f1hy0e6n fgbpje3 f1uteees f1h2a8xb  f1cg7427 fiqc9rt fg426ew f1ekwadg");
      button.setAttribute("data-uia", "reverse-button");
      button.textContent = "Watch skipped ?";
      document.querySelector(".f18oq18q.f6suwnu.fhxjtbc.f1ngx5al").appendChild(button);
      buttonInHTML = document.querySelector('[data-uia="reverse-button"]');
      function goBack() {
        video.currentTime = startTime;
        buttonInHTML.remove();
        console.log("stopped observing| Intro");
        AmazonSkipIntroObserver.disconnect();
        waitTime = endTime - startTime + 2;
        // console.log("waiting for:", waitTime);
        setTimeout(function () {
          console.log("restarted observing| Intro");
          AmazonSkipIntroObserver.observe(document, AmazonSkipIntroConfig);
        }, waitTime * 1000);
      }
      buttonInHTML.addEventListener("click", goBack);
      setTimeout(() => {
        buttonInHTML.remove();
        reverseButton = false;
      }, 5000);
    }
  }

  const AmazonSkipCreditsConfig = { attributes: true, attributeFilter: [".nextupcard"], subtree: true, childList: true, attributeOldValue: false };
  const AmazonSkipCredits = new RegExp("nextupcard", "i");
  const AmazonSkipCredits2 = new RegExp("nextupcard-button", "i");
  const AmazonSkipCreditsObserver = new MutationObserver(Amazon_Credits);
  function Amazon_Credits(mutations, observer) {
    for (let mutation of mutations) {
      if (AmazonSkipCredits.test(mutation.target.classList.toString())) {
        for (let button of mutation?.target?.firstChild?.childNodes) {
          if (button && AmazonSkipCredits2.test(button.classList.toString())) {
            // only skipping to next episode not an entirely new series
            let newEpNumber = document.querySelector("[class*=nextupcard-episode]");
            if (newEpNumber && !newEpNumber.textContent.match(/(?<!\S)1(?!\S)/)) {
              button.click();
              increaseBadge();
              console.log("skipped Credits", button);
            }
            return;
          }
        }
      }
    }
  }

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
        increaseBadge();
      }
    }
  }

  async function Amazon_FreeveeTimeout() {
    // set loop every 1 sec and check if ad is there
    let AdInterval = setInterval(function () {
      if (!settings.Amazon.blockFreevee) {
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
      if (!settings.Amazon.skipAd) {
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
                  increaseBadge();
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
    if (settings.Amazon.speedSlider === undefined || settings.Amazon.speedSlider) {
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
    if (settings.Amazon.filterPaid === undefined || settings.Amazon.filterPaid) {
      console.log("started filtering| Paid films");

      AmazonFilterPaidObserver.observe(document, AmazonFilterPaidConfig);
    } else {
      console.log("stopped filtering| Paid films");
      AmazonFilterPaidObserver.disconnect();
    }
  }
  async function startAmazonSkipIntroObserver() {
    if (settings.Amazon.skipIntro === undefined || settings.Amazon.skipIntro) {
      console.log("started observing| Intro");
      let button = document.querySelector("[class*=skipelement]");
      if (button) {
        let video = document.querySelector("#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video");
        const time = video.currentTime;
        button.click();
        console.log("Intro skipped", button);
        //delay where the video is loaded
        setTimeout(function () {
          addIntroTimeSkipped(time, video.currentTime);
        }, 50);
      }
      AmazonSkipIntroObserver.observe(document, AmazonSkipIntroConfig);
    } else {
      console.log("stopped observing| Intro");
      AmazonSkipIntroObserver.disconnect();
    }
  }
  async function startAmazonSkipCreditsObserver() {
    if (settings.Amazon.skipCredits === undefined || settings.Amazon.skipCredits) {
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
    if (settings.Amazon.skipAd === undefined || settings.Amazon.skipAd) {
      console.log("started observing| Self Ad");
      Amazon_AdTimeout();
    }
  }
  async function startAmazonBlockFreeveeObserver() {
    if (settings.Amazon.blockFreevee === undefined || settings.Amazon.blockFreevee) {
      console.log("started observing| FreeVee Ad");
      // AmazonFreeVeeObserver.observe(document, FreeVeeConfig);
      Amazon_FreeveeTimeout();
    }
  }

  // Badge functions
  function setBadgeText(text) {
    chrome.runtime.sendMessage({
      type: "setBadgeText",
      content: text,
    });
  }

  function increaseBadge() {
    chrome.storage.sync.set({ settings });
    chrome.runtime.sendMessage({
      type: "increaseBadge",
    });
  }

  function resetBadge() {
    chrome.runtime.sendMessage({
      type: "resetBadge",
    });
  }

}
