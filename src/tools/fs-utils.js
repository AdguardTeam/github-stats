const { ensureFile } = require('fs-extra');
const {
    readFile,
    writeFile,
} = require('fs-extra').promises;

/**
 * Gets array of GitHub event objects from file
 * @param {string} path path to the file to read from
 * @return {Array.<Object>} array with GitHub event objects
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

/**
 * Writes event objects from array to file
 * @param {Array.<Object>} events array with GitHub event objects
 */
const writeEventsToCollection = async (path, events) => {
    await ensureFile(path);
    await writeFile(path, JSON.stringify(events));
};

module.exports = {
    getEventsFromCollection,
    writeEventsToCollection,
};
