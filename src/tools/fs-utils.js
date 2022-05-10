const {
    appendFile,
    readFile,
    writeFile,
    access,
} = require('fs').promises;
const { constants } = require('fs');

/**
 * Gets array of GitHub event objects from file
 * @param {string} path path to the file to read from
 * @return {Array.<Object>} array with GitHub event objects
 */
const getEventsFromCollection = async (path) => {
    const file = await readFile(path, 'utf8');
    if (file.length === 0) {
        return [];
    }
    const eventsArray = JSON.parse(file);

    return eventsArray;
};

/**
 * Writes event objects from array to file
 * @param {Array.<Object>} events array with GitHub event objects
 */
const writeEventsToCollection = async (path, events) => {
    await writeFile(path, JSON.stringify(events));
};

/**
 * Create file on a given path if there is none
 * @param {string} path path to the file
 * @return {boolean}
 */
const createFileAccess = async (path) => {
    try {
        /* eslint-disable no-bitwise */
        await access(path, constants.F_OK
            | constants.R_OK
            | constants.W_OK);
        /* eslint-enable no-bitwise */
    } catch {
        await appendFile(path, '', 'utf8');
    }
};

module.exports = {
    getEventsFromCollection,
    writeEventsToCollection,
    createFileAccess,
};
