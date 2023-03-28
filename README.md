<div align="center">

<img src="icons/Auto-Skip--400.png" width="10%">

# Prime Auto-Skip

Automatically skip Ads, intros, Credits, etc. on Prime video.

</div>

## Installation

Download the extension here for [Firefox](https://addons.mozilla.org/firefox/addon/netflix-prime-auto-skip/) or [Chrome](https://chrome.google.com/webstore/detail/netflixprime-auto-skip/akaimhgappllmlkadblbdknhbfghdgle).

It will work with other skippers, but it may behave unexpectedly.

## What it does

The script, "skipper.js", is injected into all urls containing "amazon.\*/\*/video" or "netflix.com".

It automatically skips Ads, intros, Credits, recaps, and anything else you don't want to watch on Netflix and Prime video.
<table>
<tr>
<td valign="top">

## ✨ Features
Automatically skipping:
* Intros
* Recaps
* Credits&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: automatically goes to the next episode
* Ads
  
Netflix:

* Recaps
* Inactivity Warning&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: automatically resuming the video
* Basic tier Ads

Prime video:
* Self promoting ads
* Freevee Ads&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Watch series for free without ads
* Adding playback speed control to UI
* Filtering paid content (movies, series)
* Remove annoying blur when hovering over video (same option as add playback speed slider)

## Contributing

Everyone is welcome to contribute!

If you have any suggestions or Bugs, please open an issue.

Buy me a coffee! [PayPal](https://paypal.me/MarvinKrebber)


## Settings

Configure what is skipped in the settings Page.

Import and Export all Settings.

See Statistics.
  
</td>
<td>

![Alt text](Publish/Screenshots/settingsFoldedOut.png?raw=true)
</td>
</tr>
</table>

## How it works

The addon is observing every mutation of the dom Tree of the Website.

On Netflix it matches the buttons with the data-uia tag containing:

* Intro: player-skip-intro
* Recap: player-skip-recap, player-skip-preplay
* Credits: next-episode-seamless-button
* Inactivity Warning: interrupt-autoplay-continue
* Basic tier ads: matched by css class .ltr-puk2kp and the speed is set to 16x until the ad is over

On Prime video it matches buttons with the Css Classes:

* Intro: skipelement
* Credits: nextupcard-button
* Self promoting ads: .fu4rd6c.f1cw2swo
* Paid Content: .o86fri (yallow text indicates paid films)
  
The freevee ad text contains the ad length which is matched by 

* Freevee ads: .atvwebplayersdk-adtimeindicator-text

and then skipped by forwarding by the ad length -1 second which will fix a lot of issues.

## Run the Extension
```cd firefox```
### Install web-ext
```npm install --global web-ext```
### Run
```web-ext run --devtools```
### Build
copy firefox files to chrome and replace "browser" with "chrome"

```web-ext build --overwrite-dest```

## Disclaimer

Netflix and Amazon Prime videos are trademarks and the author of this addon is not affiliated with these companies.
