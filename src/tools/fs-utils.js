const { createWriteStream, createReadStream } = require('fs-extra');
const { Readable } = require('stream');
const { chain } = require('stream-chain');
const { parser } = require('stream-json/jsonl/Parser');
const Stringer = require('stream-json/jsonl/Stringer');
const toArray = require('stream-to-array');
const { isOldEvent, isCreatedSince } = require('./events-utils');

/**
 * Gets array of GitHub event objects from file and by search time
 * @param {string} path path to the file to read from
 * @param {string} searchTime timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SS
 * @return {Promise<Array<Object>>} array with GitHub event objects
 */
const getEventsFromCollection = async (path, searchTime) => {
    const eventsChain = chain([
        createReadStream(path),
        parser(),
        (data) => {
            const event = data.value;
            return isCreatedSince(event, searchTime) ? event : null;
        },
    ]);

    const eventsBySearchDate = await toArray(eventsChain);
    return eventsBySearchDate;
};

/**
 * Writes event objects from array to path as a stream, path is created if there is none
 * @param {string} path path to a collection
 * @param {Array.<Object>} events array with GitHub event objects
 */
const writeEventsToCollection = async (path, events) => {
    const readable = new Readable({
        objectMode: true,
        read: () => { },
    });

    const pushToStream = () => {
        events.forEach((event) => {
            readable.push(`${JSON.stringify(event)}\n`);
        });
    };

    readable.pipe(createWriteStream(path, {
        flags: 'a',
    }));

    pushToStream();
};

/**
 * Removes events that are older than specified date from file
 * @param {Array.<Object>} events array with GitHub event objects
 * @param {number} expirationDays number of days representing events lifespan
 */
const removeOldEventsFromCollection = async (path, expirationDays) => {
    chain([
        createReadStream(path),
        parser(),
        (data) => {
            const event = data.value;
            return isOldEvent(event, expirationDays) ? null : event;
        },
        new Stringer(),
        createWriteStream(path),
    ]);
};

module.exports = {
    getEventsFromCollection,
    writeEventsToCollection,
    removeOldEventsFromCollection,
};
