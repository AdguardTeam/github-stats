const prepareGeneralRepoStats = require('./general-repo-stat');
const prepareContributorStat = require('./contributor-stat');
const { getEventsFromCollection } = require('../tools/fs-utils');
const { isNewlyCreated, countEventsByType } = require('../tools/events-utils');

const prepareStats = async (requestData, searchTime) => {
    const collection = getEventsFromCollection();
    const eventsBySearchDate = collection.filter((event) => isNewlyCreated(event, searchTime));

    const generalRepoStats = await prepareGeneralRepoStats(eventsBySearchDate, requestData);
    const contributors = prepareContributorStat(eventsBySearchDate);

    const generalContributorStats = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const name of Object.keys(contributors)) {
        generalContributorStats[name] = contributors[name].countTotalActivity();
    }

    const detailedContributorStats = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const name of Object.keys(contributors)) {
        const contributor = contributors[name];
        const detailedStats = {
            resolvedIssues: countEventsByType(contributor, 'IssuesEvent'),
            newMergedPulls: countEventsByType(contributor, 'PullRequestEvent'),
            pullRequestsReview: countEventsByType(contributor, 'PullRequestReviewEvent'),
            totalCommits: countEventsByType(contributor, 'PushEvent'),
        };

        // Skip users who only comment in ussues
        const isActive = Object.values(detailedStats).some((stat) => stat !== 0);
        if (isActive) {
            detailedContributorStats[name] = detailedStats;
        }
    }

    return {
        generalRepoStats,
        generalContributorStats,
        detailedContributorStats,
    };
};

module.exports = prepareStats;
