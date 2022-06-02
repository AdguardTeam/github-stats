const {
    readFile,
    createWriteStream,
    createReadStream,
} = require('fs-extra');
const { Readable } = require('stream');
const { chain } = require('stream-chain');
const { parser } = require('stream-json/jsonl/Parser');
const Stringer = require('stream-json/jsonl/Stringer');
const { isOldEvent } = require('./events-utils');

/**
 * Gets array of GitHub event objects from file
 * @param {string} path path to the file to read from
 * @return {Promise<Array<Object>>} array with GitHub event objects
 */
const getEventsFromCollection = async (path) => {
    let collection;
    try {
        const file = await readFile(path, 'utf8');
        if (file.length === 0) {
            collection = [];
        } else {
            collection = JSON.parse(file);
        }
    } catch {
        collection = [];
    }

    return collection;
};

// /**
//  * Writes event objects from array to path, path is created if there is none
//  * @param {Array.<Object>} events array with GitHub event objects
//  */
// const writeEventsToCollection = async (path, events) => {
//     await ensureFile(path);
//     await writeFile(path, JSON.stringify(events));
// };

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

    const pushToChain = () => {
        events.forEach((event) => {
            readable.push(`${JSON.stringify(event)}\n`);
        });
    };

    readable.pipe(createWriteStream(path, {
        flags: 'a',
    }));

    pushToChain();
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
