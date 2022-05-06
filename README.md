# GitHub Stats CLI App

CLI App that polls data from GitHub REST API, stores it and gives analysis on contributors activity for given repository.

## How to run
### Poll events
```
COLLECTION_PATH=events_collection.json TOKEN=token ./github-poll.js --repo AdguardTeam/AdguardFilters 
```
### Print stats
```
COLLECTION_PATH=events_collection.json TOKEN=token ./github-stats.js --repo AdguardTeam/AdguardFilters --since 2022-05-01T00:00:00Z
```
### Params
* PATH — required, path to a file that stores events
* TOKEN — required, Github Personal Access Token
* repo — required, path to a Github repository as `{owner}/{repo_name}`
* since — required, timestamp in ISO 8601 format: `YYYY-MM-DDTHH:MM:SS`