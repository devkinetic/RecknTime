# RecknTime
Integrates various Timelogging APIs into an aggregated interface. Ability to sync reconciled entries with each other.

Currently we use Powershell's Pode web server to run a PWA. It was developed as an experiment to improve portability between different timelogging applications.
Supports a Jira to Harvest workflow, but could certainly be expanded to others.

## Installation
Install [Pode](https://badgerati.github.io/Pode/Getting-Started/Installation/) and setup your integrations in `config.json`, thats it!

# Usage
 1. Run `pode start` in the project repo from powershell.
 2. Open `localhost:8081` in your web browser.
 3. Install the PWA from your browser to add an icon to your desktop.

**Limitations:** You need a powershell window open with the command running first.
