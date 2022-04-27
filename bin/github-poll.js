#!/usr/bin/env node

require('dotenv').config();

const yargs = require('yargs');
const { unionBy } = require('lodash/array');
const {
    pollGithubEvents,
    getEventsFromStorage,
    writeEventsToStorage,
    removeOldEvents,
} = require('../src/events-utils');
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
    const events = await pollGithubEvents(ENDPOINTS.GITHUB_EVENTS, defaultRequestData);
    let storage = getEventsFromStorage(STORAGE_PATH);
    console.log(storage.length);
    storage = removeOldEvents(storage, EVENT_EXPIRATION_DAYS);
    console.log(storage.length);
    // Merge polled events with storage and de-duplicate by id
    const mergedEvents = unionBy(storage, events, 'id');

    writeEventsToStorage(STORAGE_PATH, mergedEvents);
})();
