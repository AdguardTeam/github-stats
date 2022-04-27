const fs = require('fs');
const { Octokit } = require('@octokit/core');

const { OCTO_ACCESS_TOKEN } = process.env; // Github personal access token
const octokit = new Octokit({ auth: OCTO_ACCESS_TOKEN });

/**
 * Get GitHub events with pagination
 * @return {Array.<Object>} array with GitHub event objects
 */
const pollGithubEvents = async (endpoint, requestData) => {
    const collectedPages = [];

    let currentLink = 'rel="next"';
    let pageNumber = 1;
    while (currentLink && currentLink.includes('rel="next"')) {
        // eslint-disable-next-line no-await-in-loop
        const { headers, data } = await octokit.request(endpoint, {
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

module.exports = {
    pollGithubEvents,
    getEventsFromCollection,
    writeEventsToCollection,
    removeOldEvents,
};
