const yargs = require('yargs');
const {
    getEventsFromCollection,
    getGithubData,
    isOpenedAction,
    isClosedAction,
    isStale,
    isMerged,
    isNewlyCreated,
} = require('../src/utils');
const {
    STORAGE_PATH,
    ENDPOINTS,
} = require('../src/constants');

const options = yargs
    .options({
        since: {
            demandOption: false,
            type: 'string',
        },
    })
    .argv;
const searchTime = options.since;

const collection = getEventsFromCollection(STORAGE_PATH);
const eventsBySearchDate = collection.filter((event) => isNewlyCreated(event, searchTime));

const issuesEvents = eventsBySearchDate.filter((e) => e.type === 'IssuesEvent');
const newIssueEvents = issuesEvents.filter((e) => isOpenedAction(e));
const resolvedIssueEvents = issuesEvents
    .filter((e) => isClosedAction(e) && !isStale(e.payload.issue));
const closedAsStaleIssueEvents = issuesEvents
    .filter((e) => isClosedAction(e) && isStale(e.payload.issue));

const pullsEvents = eventsBySearchDate.filter((e) => e.type === 'PullRequestEvent');
const newPullEvents = pullsEvents.filter((e) => isOpenedAction(e));
const mergedPullEvents = pullsEvents.filter((e) => isMerged(e));

/* Compose general repository statistics */
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
        newIssues: newIssueEvents.length,
        resolvedIssues: resolvedIssueEvents.length,
        closedAsStaleIssues: closedAsStaleIssueEvents.length,
        newPulls: newPullEvents.length,
        mergedPulls: mergedPullEvents.length,
        remainingIssues: remainingIssues.length,
    };
    console.log(generalRepoStats);
})();

/* Compose general contributorsr statistics */
const generalContributorsStats = {};

const distributeActivity = (event) => {
    const addActivity = (username) => {
        if (typeof generalContributorsStats[username] === 'undefined') {
            generalContributorsStats[username] = 1;
        } else {
            generalContributorsStats[username] += 1;
        }
    };

    const { type, payload, actor } = event;
    const username = actor.login;
    switch (type) {
        case 'PushEvent': {
            addActivity(username);
            break;
        }
        case 'IssuesEvent': {
            if (payload.action === 'closed' && !isStale(payload.issue)) {
                addActivity(username);
            }
            break;
        }
        case 'PullRequestEvent': {
            if (payload.action === 'closed' && typeof payload.pull_request.merged_at === 'string') {
                addActivity(payload.pull_request.user.login);
            }
            break;
        }
        case 'IssueCommentEvent': {
            addActivity(username);
            break;
        }
        case 'PullRequestReviewEvent': {
            addActivity(username);
            break;
        }
        default:
            break;
    }
};

eventsBySearchDate.forEach((event) => distributeActivity(event));
console.log(generalContributorsStats);
