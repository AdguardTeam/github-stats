const { prepareRepoStat } = require('./prepare-repo-stat');
const { prepareContributors } = require('./prepare-contributors');
const { prepareActivityStat } = require('./prepare-contributors-stat');
const { prepareDetailedActivityStat } = require('./prepare-detailed-activity-stat');
const { getEventsFromCollection } = require('../tools/fs-utils');

/**
 * Process all stored events to compose statistics object
 *
 * @param {string} collectionPath path to events collection
 * @param {Object} commonRequestData
 * @param {string} searchTime timestamp from which to get events
 * @return {Object}
 */
const prepareStats = async (collectionPath, commonRequestData, timePeriod) => {
    const eventsFromPeriod = await getEventsFromCollection(collectionPath, timePeriod);

    const repoStat = await prepareRepoStat(eventsFromPeriod, commonRequestData, timePeriod);

    const contributors = prepareContributors(eventsFromPeriod);
    const activityStat = prepareActivityStat(contributors);
    const detailedActivityStat = prepareDetailedActivityStat(contributors);

    return {
        repoStat,
        activityStat,
        ...detailedActivityStat,
    };
};

exports.prepareStats = prepareStats;
