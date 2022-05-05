const fs = require('fs').promises;

/**
 * Gets array of GitHub event objects from file
 * @param {string} path path to the file to read from
 * @return {Array.<Object>} array with GitHub event objects
 */
const getEventsFromCollection = async (path) => {
    const file = await fs.readFile(path, {
        encoding: 'utf8',
        flag: 'as+',
    });
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
    await fs.writeFile(path, JSON.stringify(events));
};

module.exports = {
    getEventsFromCollection,
    writeEventsToCollection,
};
