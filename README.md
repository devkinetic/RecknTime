# RecknTime
Integrates various Timelogging APIs into an aggregated interface. Ability to sync reconciled entries with each other based on Jira project ID matching, and distinguish when hours do not match.

Developed as an experiment to improve portability between different timelogging applications. Supports both Jira and Harvest in a weekly timelogging table task by day. Could certainly be expanded to others.

<p align="center" width="100%">
  <img src="https://raw.githubusercontent.com/devkinetic/RecknTime/refs/heads/main/public/icon.svg" width="300"/>
</p>

<img src="https://raw.githubusercontent.com/devkinetic/RecknTime/refs/heads/main/public/screenshot.png"/>

## Installation
 1. Install [Pode](https://badgerati.github.io/Pode/Getting-Started/Installation/)
 2. Setup your integrations in `config.json`, thats really it.

By default the `authType` is set to file which will default to `./integrations/XXX-data/demo/` folder. You can navigate to the date in those files in the UI to see the demo.

After you add your tokens set the authType to "token", and restart pode.

# Usage
 1. Run `pode start` in the project repo from powershell.
 2. Open `localhost:8081` in your web browser.
 3. Install the PWA from your browser to add an icon to your desktop.

**Limitations:** You need a powershell window open with the command running first.
