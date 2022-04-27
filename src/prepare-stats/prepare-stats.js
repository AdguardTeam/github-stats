const prepareGeneralRepoStats = require('./general-repo-stat');
const prepareGeneralContributorsStats = require('./general-contributors-stat');
const { getEventsFromCollection } = require('../tools/fs-utils');
const { isNewlyCreated } = require('../tools/events-utils');

const prepareStats = async (requestData, searchTime) => {
    const collection = getEventsFromCollection();
    const eventsBySearchDate = collection.filter((event) => isNewlyCreated(event, searchTime));

    const generalRepoStats = await prepareGeneralRepoStats(eventsBySearchDate, requestData);
    const generalContributorsStats = prepareGeneralContributorsStats(eventsBySearchDate);

    return {
        generalRepoStats,
        generalContributorsStats,
    };
};

module.exports = prepareStats;
