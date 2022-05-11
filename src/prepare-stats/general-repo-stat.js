const { getOpenIssues } = require('../tools/gh-utils');
const {
    isStale,
    isMerged,
    isClosedAction,
    isOpenedAction,
} = require('../tools/events-utils');
const { EVENT_TYPES } = require('../constants');

/**
 * Make general repo stats object from input events
 *
 * @param {Array<Object>} events array of Github events objects
 * @param {Object} commonRequestData
 * @return {Object}
 */
const prepareGeneralRepoStats = async (events, commonRequestData) => {
    const issuesEvents = events.filter((e) => e.type === EVENT_TYPES.ISSUES_EVENT);
    const newIssueEvents = issuesEvents.filter((e) => isOpenedAction(e));
    const resolvedIssueEvents = issuesEvents
        .filter((e) => isClosedAction(e) && !isStale(e.payload.issue));
    const closedAsStaleIssueEvents = issuesEvents
        .filter((e) => isClosedAction(e) && isStale(e.payload.issue));

    const pullsEvents = events.filter((e) => e.type === EVENT_TYPES.PULL_REQUEST_EVENT);
    const newPullEvents = pullsEvents.filter((e) => isOpenedAction(e));
    const mergedPullEvents = pullsEvents.filter((e) => isMerged(e));

    /* Compose general repository statistics */
    const openIssues = await getOpenIssues(commonRequestData);

    // Remove pull requests from issues
    const remainingIssues = openIssues.filter((issue) => {
        return !issue.pull_request;
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
