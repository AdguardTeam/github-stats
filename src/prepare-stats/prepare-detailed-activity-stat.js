const { countEventsByType, eventsToActivityByTime } = require('../tools/events-utils');
const { EVENT_TYPES } = require('../constants');

/**
 * Count and sort activities
 * @param {Object<Object<Array>>} contributors Contributor instances by username
 * @return {Object<Object>}
 */
const prepareDetailedActivityStat = (contributors) => {
    // Activities amount by username and activity type
    const activitiesByType = {};
    // Activities amount by username, date and hour
    const activitiesByTime = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [name, events] of Object.entries(contributors)) {
        activitiesByTime[name] = eventsToActivityByTime(events);

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
            activitiesByType[name] = detailedStats;
        }
    }

    return {
        activitiesByType,
        activitiesByTime,
    };
};

exports.prepareDetailedActivityStat = prepareDetailedActivityStat;
