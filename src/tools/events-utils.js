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
const isOpenedAction = (e) => e.payload.action === 'opened';

/**
 * Determines if Github event is 'closed'
 * @param {Object} e github event object
 * @return {boolean}
 */
const isClosedAction = (e) => e.payload.action === 'closed';

/**
 * Determines if Github issue has Stale label
 * @param {Object} issue github issue object
 * @return {boolean}
 */
const isStale = (issue) => {
    const { labels } = issue;
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

/**
 * Checks if GitHub object was created since time specified
 *
 * @param {object} ghObject GitHub API response object
 * @param {string} searchTime timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
 * @return {boolean}
 */
const isNewlyCreated = (ghObject, searchTime) => {
    if (typeof searchTime === 'undefined') {
        return true;
    }
    const searchTimeNum = Number(new Date(searchTime));
    const createTimeNum = Number(new Date(ghObject.created_at));

    return searchTimeNum < createTimeNum;
};

/**
 * Counts commits in given PushEvents
 *
 * @param {Array.<Object>} pushEvents array with PushEvents
 * @return {number}
 */
const getCommitsCount = (pushEvents) => {
    let commitsCount = 0;
    pushEvents.forEach((pushEvent) => {
        commitsCount += pushEvent.payload.commits.length;
    });
    return commitsCount;
};

/**
 * Counts events of specified type for contributor
 * @param {Object} contributor contributor object
 * @param {string} eventType event type as per Github events doc
 * @return {number}
 */
const countEventsByType = (contributor, eventType) => {
    if (typeof contributor[eventType] === 'undefined') {
        return 0;
    }
    if (contributor.eventType === 'PushEvent') {
        return getCommitsCount(contributor.PushEvent);
    }

    return contributor[eventType].length;
};

module.exports = {
    removeOldEvents,
    isOpenedAction,
    isClosedAction,
    isStale,
    isMerged,
    isNewlyCreated,
    getCommitsCount,
    countEventsByType,
};
