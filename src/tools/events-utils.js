/**
 * Removes events that are older than specified date
 * @param {Array.<Object>} events array with GitHub event objects
 * @param {number} expirationDays number of days representing events lifespan
 * @return {Array.<Object>} array with GitHub event objects
 */
const removeOldEvents = (events, expirationDays) => {
    return events.filter((event) => {
        // Remove offset flag 'Z' from date
        const createdAt = event.created_at.slice(0, -1);
        const createdTime = new Date(createdAt).getTime();
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
 * @param {string} searchTime timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SS
 * @return {boolean}
 */
const isCreatedSince = (ghObject, searchTime) => {
    if (typeof searchTime === 'undefined') {
        return true;
    }
    // Remove offset flag 'Z' from create date
    const createdAt = ghObject.created_at.slice(0, -1);
    const searchTimeNum = Number(new Date(searchTime));
    const createTimeNum = Number(new Date(createdAt));

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
 * @param {Object} contributor contributor events object
 * @param {string} eventType event type as per Github events doc
 * @return {number}
 */
const countEventsByType = (contributor, eventType) => {
    if (eventType === 'newPullEvent' && contributor.PullRequestEvent) {
        const newPullsCount = contributor
            .PullRequestEvent
            .filter((event) => !isMerged(event))
            .length;
        return newPullsCount;
    }
    if (eventType === 'mergePullEvent' && contributor.PullRequestEvent) {
        const mergedPullsCount = contributor
            .PullRequestEvent
            .filter((event) => !isMerged(event))
            .length;
        return mergedPullsCount;
    }
    if (typeof contributor[eventType] === 'undefined') {
        return 0;
    }
    if (eventType === 'PushEvent') {
        return getCommitsCount(contributor.PushEvent);
    }

    return contributor[eventType].length;
};

/**
 * Filter events from 00:00 to current time and sort them by hour
 * @param {Object} contributor contributor events object
 * @return {Object}
 */
const sortEventsByHour = (contributor) => {
    const allEvents = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const value of Object.values(contributor)) {
        allEvents.push(value);
    }

    const todayEvents = allEvents
        .flat()
        .filter((event) => {
            // Remove offset flag 'Z' from date
            const createdAt = event.created_at.slice(0, -1);
            const createdDay = new Date(createdAt).getDate();
            const today = new Date().getDate();
            return createdDay === today;
        });

    const eventsByHour = [];
    for (let i = 0; i <= 23; i += 1) {
        eventsByHour[i] = [];
    }

    // Sort events by their creation hour
    todayEvents.forEach((event) => {
        // Remove offset flag 'Z' from date
        const createdAt = event.created_at.slice(0, -1);
        const hour = new Date(createdAt).getHours();
        eventsByHour[hour].push(event);
    });

    // Modify events into activities by collapsing event subarrays into their length
    const activityByHour = eventsByHour.map((hourEvents) => hourEvents.length);

    return activityByHour;
};

module.exports = {
    removeOldEvents,
    isOpenedAction,
    isClosedAction,
    isStale,
    isMerged,
    isCreatedSince,
    getCommitsCount,
    countEventsByType,
    sortEventsByHour,
};
