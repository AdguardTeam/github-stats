#!/usr/bin/env node

require('dotenv').config();
const { unionBy } = require('lodash/array');
const {
    getGithubData,
    getEventsFromCollection,
    writeEventsToCollection,
    removeOldEvents,
} = require('../src/utils');
const {
    EVENT_EXPIRATION_DAYS,
    STORAGE_PATH,
    ENDPOINTS,
} = require('../src/constants');

(async () => {
    const newEvents = await getGithubData(ENDPOINTS.GITHUB_EVENTS);
    let collection = getEventsFromCollection(STORAGE_PATH);

    collection = removeOldEvents(collection, EVENT_EXPIRATION_DAYS);

    // Merge polled events with storage and de-duplicate by id
    const mergedEvents = unionBy(collection, newEvents, 'id');

    writeEventsToCollection(STORAGE_PATH, mergedEvents);
})();
