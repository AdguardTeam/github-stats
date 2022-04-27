const fs = require('fs');
const yargs = require('yargs');
const { Octokit } = require('@octokit/core');

const { OCTO_ACCESS_TOKEN } = process.env; // Github personal access token
const octokit = new Octokit({ auth: OCTO_ACCESS_TOKEN });

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

/**
 * Get GitHub data from specified endpoint with pagination
 * @return {Array.<Object>} array with GitHub event objects
 */
const getGithubData = async (endpoint, requestData = {}) => {
    const collectedPages = [];

    let currentLink = 'rel="next"';
    let pageNumber = 1;
    while (currentLink && currentLink.includes('rel="next"')) {
        // eslint-disable-next-line no-await-in-loop
        const { headers, data } = await octokit.request(endpoint, {
            ...defaultRequestData,
            ...requestData,
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
const getEventsFromCollection = (storagePath) => {
    const storage = fs.readFileSync(`${storagePath}`, 'utf8');
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
const writeEventsToCollection = (storagePath, events) => {
    fs.writeFileSync(storagePath, JSON.stringify(events));
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

/**
 * Determines if Github event is 'opened'
 * @param {Object} e github event object
 * @return {boolean}
 */
const isOpened = (e) => e.payload.action === 'opened';

/**
 * Determines if Github event is 'closed'
 * @param {Object} e github event object
 * @return {boolean}
 */
const isClosed = (e) => e.payload.action === 'closed';

/**
 * Determines if Github issue has Stale label
 * @param {Object} issue github issue object
 * @return {boolean}
 */
const isStale = (issue) => {
    const { labels } = issue.payload.issue;
    if (!labels || labels.length === 0) {
        return false;
    }
    return labels.some((label) => label.name === 'Stale');
};

/**
 * Determines if pull request is merged
 * @param {Object} pull github pull object
 * @return {boolean}
 */
const isMerged = (pull) => {
    const mergeTime = pull.payload.pull_request.merged_at;
    return typeof mergeTime === 'string';
};

module.exports = {
    getGithubData,
    getEventsFromCollection,
    writeEventsToCollection,
    removeOldEvents,
    isOpened,
    isClosed,
    isStale,
    isMerged,
};
