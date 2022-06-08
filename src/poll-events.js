const { getGithubEvents } = require('./tools/gh-utils');
const { EVENT_EXPIRATION_DAYS } = require('./constants');
const {
    writeEventsToCollection,
    getUniquesFromPoll,
    removeOldEventsFromCollection,
} = require('./tools/fs-utils');

/**
 * Polls events from Github Events API and stores them on a given path
 *
 * @param {string} collectionPath path to events collection
 * @param {Object} commonRequestData
 */
const pollEvents = async (collectionPath, commonRequestData) => {
    const newPoll = await getGithubEvents(commonRequestData);
    const newEvents = await getUniquesFromPoll(collectionPath, newPoll);
    await writeEventsToCollection(collectionPath, newEvents);
    await removeOldEventsFromCollection(collectionPath, EVENT_EXPIRATION_DAYS);
};

exports.pollEvents = pollEvents;
