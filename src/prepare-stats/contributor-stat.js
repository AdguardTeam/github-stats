const { Contributor } = require('./Contributor');
const { getActivityAuthor } = require('../tools/events-utils');

/**
 * Sorts events by contributor name and event type
 *
 * @param {Array<Object>} events array of Github events objects
 * @return {Object}
 */
const prepareContributorStat = (events) => {
    const contributors = events.reduce((acc, event) => {
        const contributorName = getActivityAuthor(event);
        // Events that don't count as activity are not saved anywhere
        if (!contributorName) {
            return acc;
        }
        // Init contributor if there isn't one
        if (!acc[contributorName]) {
            acc[contributorName] = new Contributor();
        }
        acc[contributorName].addActivityEvent(event);

        return acc;
    }, {});

    return contributors;
};

exports.prepareContributorStat = prepareContributorStat;
