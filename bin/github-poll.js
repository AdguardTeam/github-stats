#!/usr/bin/env node

require('dotenv').config();
const yargs = require('yargs');
const { unionBy } = require('lodash/array');
const {
    pollGithubEvents,
    getEventsFromCollection,
    writeEventsToCollection,
    removeOldEvents,
} = require('../src/poll-utils');
const {
    EVENT_EXPIRATION_DAYS,
    STORAGE_PATH,
    ENDPOINTS,
} = require('../src/constants');

const options = yargs
    .options({
        repo: {
            demandOption: true,
            type: 'string',
        },
    })
    .argv;
const defaultRequestData = {
    owner: options.repo.split('/')[0],
    repo: options.repo.split('/')[1],
};

(async () => {
    const newEvents = await pollGithubEvents(ENDPOINTS.GITHUB_EVENTS, defaultRequestData);
    let collection = getEventsFromCollection(STORAGE_PATH);

    collection = removeOldEvents(collection, EVENT_EXPIRATION_DAYS);

    // Merge polled events with storage and de-duplicate by id
    const mergedEvents = unionBy(collection, newEvents, 'id');

    writeEventsToCollection(STORAGE_PATH, mergedEvents);
})();
