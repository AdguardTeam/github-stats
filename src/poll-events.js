const { unionBy } = require('lodash/array');
const { removeOldEvents } = require('./tools/events-utils');
const { getEventsFromCollection, writeEventsToCollection } = require('./tools/fs-utils');
const { getGithubEvents } = require('./tools/gh-utils');
const { EVENT_EXPIRATION_DAYS } = require('./constants');

const pollEvents = async (collectionPath, requestData) => {
    const newEvents = await getGithubEvents(requestData);
    let collection = await getEventsFromCollection(collectionPath);
    collection = removeOldEvents(collection, EVENT_EXPIRATION_DAYS);
    // Merge polled events with storage and de-duplicate by id
    const mergedEvents = unionBy(collection, newEvents, 'id');
    await writeEventsToCollection(collectionPath, mergedEvents);
};

module.exports = pollEvents;
