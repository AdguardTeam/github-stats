# GitHub Stats CLI App

CLI App that polls data from GitHub REST API, stores it and gives analysis on contributors activity for given repository.

## How to run

### Poll events

```
env \
    COLLECTION_PATH=events_collection.json \
    GITHUB_TOKEN=token \
    REPO=AdguardTeam/AdguardFilters \
    ./bin/github-poll.js
```
### Print stats

```
env \
    COLLECTION_PATH=events_collection.json \
    GITHUB_TOKEN=token \
    REPO=AdguardTeam/AdguardFilters \
    SINCE=2022-05-01T00:00:00Z \
    ./bin/github-stats.js   
```
### Params

* `COLLECTION_PATH` — required, path to a file that stores events
* `GITHUB_TOKEN` — optional, Github Personal Access Token. API rate is limited to 60 requests an hour if not provided.
* `REPO` — required, path to a Github repository as `{owner}/{repo_name}`
* `SINCE` — optional, timestamp in ISO 8601 format: `YYYY-MM-DDTHH:MM:SS`. All stored events will be filtered if not provided.