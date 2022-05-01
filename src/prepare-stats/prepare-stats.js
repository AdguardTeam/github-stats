const prepareGeneralRepoStats = require('./general-repo-stat');
const prepareContributorStat = require('./contributor-stat');
const { getEventsFromCollection } = require('../tools/fs-utils');
const {
    isCreatedSince,
    countEventsByType,
    sortEventsByHour,
} = require('../tools/events-utils');

const prepareStats = async (requestData, searchTime) => {
    const collection = getEventsFromCollection();
    const eventsBySearchDate = collection.filter((event) => isCreatedSince(event, searchTime));

    const generalRepoStats = await prepareGeneralRepoStats(eventsBySearchDate, requestData);
    const contributors = prepareContributorStat(eventsBySearchDate);

    // Sort contributors events to get general activity
    const generalContributorStats = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const name of Object.keys(contributors)) {
        generalContributorStats[name] = contributors[name].countTotalActivity();
    }

    // Sort contributors events to get detailed stats by event type
    const detailedContributorStats = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [name, events] of Object.entries(contributors)) {
        const detailedStats = {
            resolvedIssues: countEventsByType(events, 'IssuesEvent'),
            newPulls: countEventsByType(events, 'newPullEvent'),
            mergedPulls: countEventsByType(events, 'mergePullEvent'),
            pullRequestsReview: countEventsByType(events, 'PullRequestReviewEvent'),
            totalCommits: countEventsByType(events, 'PushEvent'),
        };

        // Skip users who don't have activity that is needed for detailed stats
        const isActive = Object.values(detailedStats).some((stat) => stat !== 0);
        if (isActive) {
            detailedContributorStats[name] = detailedStats;
        }
    }

    //  Sort contributors events to get hourly activity by contrributor name
    const hourlyContributorActivity = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [name, events] of Object.entries(contributors)) {
        hourlyContributorActivity[name] = sortEventsByHour(events);
    }

    return {
        generalRepoStats,
        generalContributorStats,
        detailedContributorStats,
        hourlyContributorActivity,
    };
};

module.exports = prepareStats;
