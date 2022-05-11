const { unionBy } = require('lodash/array');
const { removeOldEvents } = require('./tools/events-utils');
const { getGithubEvents } = require('./tools/gh-utils');
const { EVENT_EXPIRATION_DAYS } = require('./constants');
const { getEventsFromCollection, writeEventsToCollection } = require('./tools/fs-utils');

/**
 * Polls events from Github Events API and stores them on a given path
 *
 * @param {string} collectionPath path to events collection
 * @param {Object} commonRequestData
 */
const pollEvents = async (collectionPath, commonRequestData) => {
    const newEvents = await getGithubEvents(commonRequestData);
    let collection = await getEventsFromCollection(collectionPath);
    collection = removeOldEvents(collection, EVENT_EXPIRATION_DAYS);
    // Merge polled events with storage and de-duplicate by id
    const mergedEvents = unionBy(collection, newEvents, 'id');
    await writeEventsToCollection(collectionPath, mergedEvents);
};

module.exports = pollEvents;
