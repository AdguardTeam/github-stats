# GitHub Stats CLI App

CLI App that polls data from GitHub REST API, stores it and gives analysis on contributors activity for given repository.
* [API](#API)
* [How to run locally](#how-to-run-locally)
* [Results](#results)
* [Notes](#notes)

## <a id="API"></a> API
* Issues endpoint: 'GET /repos/{owner}/{repo}/issues'
* GitHub Events endpoint: 'GET /repos/{owner}/{repo}/events'
* [GitHub Event Types](https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#pullrequestevent)

## <a id="how-to-run-locally"></a> How to run locally
Create `.env` file with Github personal access token (PAT)
```
OCTO_ACCESS_TOKEN=github_personal_token
```
Enable env in `github-poll.js` or `github-stats.js`
> `yarn add dotenv`
```
require('dotenv').config();
```

Enable `octokit` i n `gh-utils.js` like this
> `yarn add @actions/core` & `yarn add @actions/github`
```
const { Octokit } = require("@octokit/core");

const { OCTO_ACCESS_TOKEN } = process.env;
const octokit = new Octokit({ auth: OCTO_ACCESS_TOKEN });
```

You can now poll new batch of GitHub events and add them to events-collection.json
```
yarn poll
```
or get statistics from polled events.
```
yarn stats
```
## <a id="results"></a> Results

General repository statistics on Issues and Pull requests,
```
## General repo statistics

* New issues: 125               // newly opened issues
* Resolved issues: 120          // closed w/o Stale label
* Closed as stale: 25           // closed with Stale label
* New pull requests: 12         // newly opened pulls
* Merged pull requests: 5       // merged pulls
* Remaining issues: 123         // issues that remain open
```

followed by the list of top contributors sorted by the repo activity,

```
## General contributors statistics

1. ContributorName: *123*
2. OtherContributorName: *122*
3. OtherContributor: *121*
```
>Here's what counts as activity: a commit, a closed issue (not marked as `Stale`), a comment in an Issue or a Pull request, review of a Pull request >(regardless of whether it's approved or rejected), merge of a Pull request.

and detailed statistics by each contributor.
```
## Detailed contributor statistics

### ContributorName

* Resolved issues: 120
* New pull requests (merged): 25 (10)
* Pull requests review activity: 15
* Total commits: 120

*Daily activity*

*2022-04-01*

hour	activity	
00		0   		|
01		0   		|
02		2   		|██
03		5   		|█████
04		0   		|
05		0   		|
06		0   		|
07		0   		|
08		0   		|
09		12   		|█████████████
10		15   		|███████████████
11		20   		|████████████████████
12		25   		|██████████████████████
13		35   		|█████████████████████████
14		45   		|████████████████████████████
15		15   		|████████████
16		15   		|████████████
17		1   		|█
18		5   		|██
19		0   		|
20		0   		|
21		0   		|
22		0   		|
23		0   		|
24		0   		|

```

## <a id="notes"></a> Notes
> Only <b>author of pull request should perform merge of said pull request</b>, otherwise app won't be able to count activity adequately.

> 'since' command argument should be a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SS (without offseet flags like YYYY-MM-DDTHH:MM:SSZ)