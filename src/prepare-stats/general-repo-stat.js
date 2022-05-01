const {
    isStale,
    isMerged,
    isClosedAction,
    isOpenedAction,
} = require('../tools/events-utils');
const { getOpenIssues } = require('../tools/gh-utils');

const prepareGeneralRepoStats = async (events, requestData) => {
    const issuesEvents = events.filter((e) => e.type === 'IssuesEvent');
    const newIssueEvents = issuesEvents.filter((e) => isOpenedAction(e));
    const resolvedIssueEvents = issuesEvents
        .filter((e) => isClosedAction(e) && !isStale(e.payload.issue));
    const closedAsStaleIssueEvents = issuesEvents
        .filter((e) => isClosedAction(e) && isStale(e.payload.issue));

    const pullsEvents = events.filter((e) => e.type === 'PullRequestEvent');
    const newPullEvents = pullsEvents.filter((e) => isOpenedAction(e));
    const mergedPullEvents = pullsEvents.filter((e) => isMerged(e));

    /* Compose general repository statistics */
    const openIssues = await getOpenIssues(requestData);

    // Remove pull requests from issues
    const remainingIssues = openIssues.filter((issue) => {
        const pullRequest = issue.pull_request;
        return !pullRequest;
    });

    const generalRepoStats = {
        newIssues: newIssueEvents.length,
        resolvedIssues: resolvedIssueEvents.length,
        closedAsStaleIssues: closedAsStaleIssueEvents.length,
        newPulls: newPullEvents.length,
        mergedPulls: mergedPullEvents.length,
        remainingIssues: remainingIssues.length,
    };

    return generalRepoStats;
};

module.exports = prepareGeneralRepoStats;
