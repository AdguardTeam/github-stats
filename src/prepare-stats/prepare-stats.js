const { prepareGeneralRepoStats } = require('./general-repo-stat');
const { prepareContributorStat } = require('./contributor-stat');
const { getEventsFromCollection } = require('../tools/fs-utils');
const { countEventsByType, sortEventsByHour } = require('../tools/events-utils');
const { EVENT_TYPES } = require('../constants');

/**
 * Process all stored events to compose statistics object
 *
 * @param {string} collectionPath path to events collection
 * @param {Object} commonRequestData
 * @param {string} searchTime timestamp from which to get events
 * @return {Object}
 */
const prepareStats = async (collectionPath, commonRequestData, searchTime) => {
    const eventsBySearchDate = await getEventsFromCollection(collectionPath, searchTime);

    const generalRepoStats = await prepareGeneralRepoStats(eventsBySearchDate, commonRequestData);
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
            resolvedIssues: countEventsByType(events, EVENT_TYPES.ISSUES_EVENT),
            newPulls: countEventsByType(events, EVENT_TYPES.NEW_PULL_EVENT),
            mergedPulls: countEventsByType(events, EVENT_TYPES.MERGED_PULL_EVENT),
            pullRequestsReview: countEventsByType(events, EVENT_TYPES.PULL_REQUEST_REVIEW_EVENT),
            totalCommits: countEventsByType(events, EVENT_TYPES.PUSH_EVENT),
            totalComments: countEventsByType(events, EVENT_TYPES.ISSUE_COMMENT_EVENT),
        };

        // Skip users who don't have activity that is needed for detailed stats
        const isActive = Object.values(detailedStats).some((stat) => stat !== 0);
        if (isActive) {
            detailedContributorStats[name] = detailedStats;
        }
    }

    //  Sort contributors events to get hourly activity by contributor name
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

exports.prepareStats = prepareStats;
