const prepareGeneralRepoStats = require('./general-repo-stat');
const prepareGeneralContributorStats = require('./general-contributor-stat');
const prepareDetailedContributorStatistics = require('./detailed-contributor-stat');
const { getEventsFromCollection } = require('../tools/fs-utils');
const { isNewlyCreated } = require('../tools/events-utils');

const prepareStats = async (requestData, searchTime) => {
    const collection = getEventsFromCollection();
    const eventsBySearchDate = collection.filter((event) => isNewlyCreated(event, searchTime));

    const generalRepoStats = await prepareGeneralRepoStats(eventsBySearchDate, requestData);
    const generalContributorStats = prepareGeneralContributorStats(eventsBySearchDate);
    const detailedContributorStats = prepareDetailedContributorStatistics(eventsBySearchDate);

    return {
        generalRepoStats,
        generalContributorStats,
    };
};

module.exports = prepareStats;
