const {
    getEventsFromCollection,
    getGithubData,
    isOpened,
    isClosed,
    isStale,
    isMerged,
} = require('../src/utils');
const {
    STORAGE_PATH,
    ENDPOINTS,
} = require('../src/constants');

const collection = getEventsFromCollection(STORAGE_PATH);

const issuesEvents = collection.filter((e) => e.type === 'IssuesEvent');
const newIssues = issuesEvents.filter((e) => isOpened(e));
const resolvedIssues = issuesEvents.filter((e) => isClosed(e) && !isStale(e));
const closedAsStaleIssues = issuesEvents.filter((e) => isClosed(e) && isStale(e));

const pullsEvents = collection.filter((e) => e.type === 'PullRequestEvent');
const newPulls = pullsEvents.filter((e) => isOpened(e));
const mergedPulls = pullsEvents.filter((e) => isMerged(e));

(async () => {
    const openIssues = await getGithubData(ENDPOINTS.ISSUES, {
        state: 'open',
    });
    // Remove pull requests from issues
    const remainingIssues = openIssues.filter((issue) => {
        const pullRequest = issue.pull_request;
        return typeof pullRequest === 'undefined';
    });

    const generalRepoStats = {
        newIssues: newIssues.length,
        resolvedIssues: resolvedIssues.length,
        closedAsStaleIssues: closedAsStaleIssues.length,
        newPulls: newPulls.length,
        mergedPulls: mergedPulls.length,
        remainingIssues: remainingIssues.length,
    };
    console.log(generalRepoStats);
})();
