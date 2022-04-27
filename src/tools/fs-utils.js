const fs = require('fs');
const { COLLECTION_PATH } = require('../constants');

/**
 * Gets array of GitHub event objects from file
 * @return {Array.<Object>} array with GitHub event objects
 */
const getEventsFromCollection = () => {
    const file = fs.readFileSync(`${COLLECTION_PATH}`, {
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
const writeEventsToCollection = (events) => {
    fs.writeFileSync(COLLECTION_PATH, JSON.stringify(events));
};

module.exports = {
    getEventsFromCollection,
    writeEventsToCollection,
};
