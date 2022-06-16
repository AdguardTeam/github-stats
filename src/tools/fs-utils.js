const {
    createWriteStream,
    createReadStream,
    pathExists,
    remove,
    readdir,
    ensureDir,
} = require('fs-extra');
const {
    format,
    endOfYesterday,
    eachDayOfInterval,
} = require('date-fns');
const { Readable } = require('stream');
const { chain } = require('stream-chain');
const { parser } = require('stream-json/jsonl/Parser');
const { reduceStream } = require('./stream-utils');
const {
    isCreatedSince,
    isCreatedUntil,
    sortEventsByDate,
} = require('./events-utils');
const { MILLISECONDS_IN_DAY } = require('../constants');

/**
 * Gets array of GitHub event objects from file and by timePeriod
 * @param {string} path path to the file to read from
 * @param {object} timePeriod
 * @return {Promise<Array<Object>>} array with GitHub event objects
 */
const getEventsFromFile = async (path, timePeriod) => {
    const { until, since } = timePeriod;
    const fileEventsStream = createReadStream(path, {
        flags: 'r',
    });
    const collectionStream = fileEventsStream.pipe(parser());

    const callback = (data, accArray) => {
        // Remove parser() wrapping
        const event = data.value;
        const createdUntil = isCreatedUntil(event, until);
        const createdSince = isCreatedSince(event, since);
        if (createdSince && createdUntil) {
            accArray.push(event);
        } else if (!createdSince) {
            // Return null to stop the stream
            return null;
        }
        return undefined;
    };

    const eventsBySearchDate = await reduceStream(collectionStream, callback);

    return eventsBySearchDate;
};

/**
 * Gets array of GitHub event objects from collection and by search time
 * @param {string} path path to collection dir
 * @param {object} timePeriod
 * @return {Promise<Array<Object>>} array with GitHub event objects
 */
const getEventsFromCollection = async (path, timePeriod) => {
    const hasDir = await pathExists(path);
    if (!hasDir) {
        return [];
    }

    const wantedDates = eachDayOfInterval({
        start: new Date(timePeriod.since),
        end: new Date(timePeriod.until),
    });
    const wantedFilenames = wantedDates.map((date) => `${format(date, 'yyy-MM-dd')}.jsonl`);
    const ownedFilenames = await readdir(path);
    const filenamesInStock = wantedFilenames.filter((wantedFilename) => {
        const dupeIndex = ownedFilenames.findIndex((ownedFilename) => {
            return wantedFilename === ownedFilename;
        });
        return dupeIndex !== -1;
    });

    const eventsFromPeriod = await Promise.all(filenamesInStock.map(async (filename) => {
        return getEventsFromFile(`${path}/${filename}`, timePeriod);
    }));

    return eventsFromPeriod.flat();
};

/**
 * Writes events from array to path as a stream, path is created if there is none
 * @param {string} path path to a file
 * @param {Array.<Object>} events array with GitHub event objects
 * @param {string} flag node flag for write stream
 */
const writeEventsToFile = async (path, events, flag) => {
    if (events.length === 0) {
        return;
    }

    const readable = new Readable({
        objectMode: true,
        read: () => { },
    });

    chain([
        readable,
        (event) => `${JSON.stringify(event)}\n`,
        createWriteStream(path, {
            flags: flag,
        }),
    ]);

    events.forEach((event) => {
        readable.push(event);
    });
};

/**
 * Sort events by date of creation and write them to a corresponding file
 * @param {string} path path to collection dir
 * @param {Array<Object>} events array with GitHub event objects
 */
const writePollToCollection = async (path, events) => {
    await ensureDir(path);
    const sortedPoll = sortEventsByDate(events);

    await Promise.all(Object.keys(sortedPoll).map((date) => {
        return writeEventsToFile(`${path}/${date}.jsonl`, sortedPoll[date], 'a');
    }));
};

/**
 * Remove duplicate events from a file
 * @param {string} path path to a file
 */
const removeDupesFromFile = async (path) => {
    const hasFile = await pathExists(path);
    if (!hasFile) {
        return;
    }

    const fileEventsStream = createReadStream(path, {
        flags: 'r',
    });
    const fileStream = fileEventsStream.pipe(parser());

    const callback = (data, accArray) => accArray.push(data.value);
    const fileArray = await reduceStream(fileStream, callback);

    const dedupedArray = [];
    fileArray.forEach((event) => {
        const dupeIndex = dedupedArray.findIndex((e) => {
            return e.id === event.id;
        });
        if (dupeIndex === -1) {
            dedupedArray.push(event);
        }
    });

    await writeEventsToFile(path, dedupedArray, 'w');
};

/**
 * Remove duplicate events from collection
 * @param {string} path path to a collection
 */
const removeDupesFromCollection = async (path) => {
    const hasCollection = await pathExists(path);
    if (!hasCollection) {
        return;
    }

    const currentDate = format(new Date(), 'yyy-MM-dd');
    const previousDate = format(endOfYesterday(), 'yyy-MM-dd');

    await removeDupesFromFile(`${path}/${currentDate}.jsonl`);
    await removeDupesFromFile(`${path}/${previousDate}.jsonl`);
};

/**
 * Deletes files that are older than specified
 * @param {string} path path to a collection
 * @param {number} expirationDays number of days representing events lifespan
 */
const removeOldFilesFromCollection = async (path, expirationDays) => {
    const filenames = await readdir(path);
    const expirationTime = expirationDays * MILLISECONDS_IN_DAY;

    const oldFilenames = filenames.filter((filename) => {
        const date = filename.split('.')[0];
        const daysOld = new Date(date).getTime();
        return Date.now() - daysOld > expirationTime;
    });

    oldFilenames.forEach(async (filename) => {
        // eslint-disable-next-line no-await-in-loop
        await remove(`${path}/${filename}`);
    });
};

module.exports = {
    getEventsFromCollection,
    writePollToCollection,
    removeDupesFromCollection,
    removeOldFilesFromCollection,
};
