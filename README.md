# GitHub Stats CLI App

CLI App that polls data from GitHub REST API, stores it and gives analysis on contributors activity for given repository.

## How to run
### Poll events
```
COLLECTION_PATH=events_collection.json TOKEN=token ./bin/github-poll.js --repo AdguardTeam/AdguardFilters 
```
### Print stats
```
COLLECTION_PATH=events_collection.json TOKEN=token ./bin/github-stats.js --repo AdguardTeam/AdguardFilters --since 2022-05-01T00:00:00Z
```
### Params
* COLLECTION_PATH — required, path to a file that stores events
* GITHUB_TOKEN — required, Github Personal Access Token
* REPO — required, path to a Github repository as `{owner}/{repo_name}`
* SINCE — required, timestamp in ISO 8601 format: `YYYY-MM-DDTHH:MM:SS`