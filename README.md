# GitHub Stats CLI App

CLI App that polls data from GitHub REST API, stores it and gives analysis on contributors activity for given repository.

Examples of Github Actions for these scripts can be found in `examples` folder.

## How to install

```
npm i -g @adguard/github-stats
```

## How to run

### Poll events

```
env \
    COLLECTION_PATH=stats-data \
    GITHUB_TOKEN=token \
    REPO=AdguardTeam/AdguardFilters \
    github-poll
```
### Print stats

```
env \
    COLLECTION_PATH=events_collection.jsonl \
    GITHUB_TOKEN=token \
    REPO=AdguardTeam/AdguardFilters \
    UNTIL=2022-05-25T15:00:00Z \
    SINCE=2022-05-01T00:00:00Z \
    github-stats
```
### Params

* `COLLECTION_PATH` — required, path to a jsonl file that stores events
* `GITHUB_TOKEN` — optional, Github Personal Access Token. API rate is limited to 60 requests an hour if not provided.
* `REPO` — required, path to a Github repository as `{owner}/{repo_name}`
* `UNTIL` — optional, timestamp in ISO 8601 format: `YYYY-MM-DDTHH:MM:SS`. Defaults to now.
* `SINCE` — optional, timestamp in ISO 8601 format: `YYYY-MM-DDTHH:MM:SS`. All stored events will be used if not provided.