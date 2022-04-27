#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const yargs = require('yargs');
const { unionBy } = require('lodash/array');
const { Octokit } = require('@octokit/core');

const EVENT_EXPIRATION_DAYS = 30;
const STORAGE_PATH = './storage/event-storage.txt';
const ENDPOINTS = {
    GITHUB_EVENTS: 'GET /repos/{owner}/{repo}/events',
};

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

const { OCTO_ACCESS_TOKEN } = process.env; // Github personal access token
const octokit = new Octokit({ auth: OCTO_ACCESS_TOKEN });

/**
 * Get GitHub events with pagination
 * @return {Array.<Object>} array with GitHub event objects
 */
const pollGithubEvents = async () => {
    const collectedPages = [];

    let currentLink = 'rel="next"';
    let pageNumber = 1;
    while (currentLink && currentLink.includes('rel="next"')) {
        // eslint-disable-next-line no-await-in-loop
        const { headers, data } = await octokit.request(ENDPOINTS.GITHUB_EVENTS, {
            ...defaultRequestData,
            page: pageNumber,
        });

        collectedPages.push(data);

        currentLink = headers.link;
        pageNumber += 1;
    }

    return collectedPages.flat();
};

/**
 * Gets array of GitHub event objects from storage
 * @return {Array.<Object>} array with GitHub event objects
 */
const getEventsFromStorage = () => {
    const storage = fs.readFileSync(`${STORAGE_PATH}`, 'utf8');
    if (storage.length === 0) {
        return [];
    }
    const eventsArray = JSON.parse(storage);
    return eventsArray;
};

/**
 * Writes event objects from array to storage
 * @param {Array.<Object>} events array with GitHub event objects
 */
const writeEventsToStorage = (events) => {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(events));
};

/**
 * Removes events that are older than specified date
 * @param {Array.<Object>} events array with GitHub event objects
 * @param {number} expirationDays number of days representing events lifespan
 * @return {Array.<Object>} array with GitHub event objects
 */
const removeOldEvents = (events, expirationDays) => {
    return events.filter((event) => {
        const createdTime = new Date(event.created_at).getTime();
        const daysAlive = (Date.now() - createdTime) / (1000 * 3600 * 24);
        return daysAlive <= expirationDays;
    });
};

(async () => {
    const events = await pollGithubEvents();
    let storage = getEventsFromStorage();
    console.log(storage.length);
    storage = removeOldEvents(storage, EVENT_EXPIRATION_DAYS);
    console.log(storage.length);
    // Merge polled events with storage and de-duplicate by id
    const mergedEvents = unionBy(storage, events, 'id');

    writeEventsToStorage(mergedEvents);
})();
