const {
    MILLISECONDS_IN_DAY,
    EVENT_TYPES,
    LABEL_NAMES,
    ACTION_NAMES,
} = require('../constants');

/**
 * Removes events that are older than specified date
 * @param {Array.<Object>} events array with GitHub event objects
 * @param {number} expirationDays number of days representing events lifespan
 * @return {Array.<Object>} array with GitHub event objects
 */
const removeOldEvents = (events, expirationDays) => {
    const expirationTime = expirationDays * MILLISECONDS_IN_DAY;

    return events.filter((event) => {
        const createdAt = event.created_at;
        const createdTime = new Date(createdAt).getTime();
        return Date.now() - createdTime <= expirationTime;
    });
};

/**
 * Determines if Github event is 'opened'
 * @param {Object} e github event object
 * @return {boolean}
 */
const isOpenedAction = (e) => e.payload.action === ACTION_NAMES.OPENED;

/**
 * Determines if Github event is 'closed'
 * @param {Object} e github event object
 * @return {boolean}
 */
const isClosedAction = (e) => e.payload.action === ACTION_NAMES.CLOSED;

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
    return labels.some((label) => label.name === LABEL_NAMES.STALE);
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
 * @param {object} event GitHub API response object
 * @param {string} searchTime timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SS
 * @return {boolean}
 */
const isCreatedSince = (event, searchTime) => {
    if (!searchTime) {
        return true;
    }
    const createdAt = event.created_at;
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
    const commitsCount = pushEvents.reduce((acc, event) => {
        return acc + event.payload.commits.length;
    }, 0);

    return commitsCount;
};

/**
 * Counts events of specified type for contributor
 * @param {Object} contributor contributor events object
 * @param {string} eventType event type as per Github events doc
 * @return {number}
 */
const countEventsByType = (contributor, eventType) => {
    if (eventType === EVENT_TYPES.NEW_PULL_EVENT
        && contributor.events[EVENT_TYPES.PULL_REQUEST_EVENT]) {
        const newPullsCount = contributor
            .events
            .PullRequestEvent
            .filter((event) => !isMerged(event))
            .length;
        return newPullsCount;
    }
    if (eventType === EVENT_TYPES.MERGED_PULL_EVENT
        && contributor.events[EVENT_TYPES.PULL_REQUEST_EVENT]) {
        const mergedPullsCount = contributor
            .events
            .PullRequestEvent
            .filter((event) => !isMerged(event))
            .length;
        return mergedPullsCount;
    }
    if (!contributor.events[eventType]) {
        return 0;
    }
    if (eventType === EVENT_TYPES.PUSH_EVENT) {
        return getCommitsCount(contributor.events.PushEvent);
    }

    return contributor.events[eventType].length;
};

/**
 * Filter events from 00:00 to current time and sort them by hour
 * @param {Object} contributor contributor events object
 * @return {Object}
 */
const sortEventsByHour = (contributor) => {
    const allEvents = Object.values(contributor.events);

    const today = new Date().getDate();
    const todayEvents = allEvents
        .flat()
        .filter((event) => {
            const createdAt = event.created_at;
            const createdDay = new Date(createdAt).getDate();
            return createdDay === today;
        });

    const eventsByHour = [];
    for (let i = 0; i <= 23; i += 1) {
        eventsByHour[i] = [];
    }

    // Sort events by their creation hour
    todayEvents.forEach((event) => {
        const createdAt = event.created_at;
        const hour = new Date(createdAt).getHours();
        eventsByHour[hour].push(event);
    });

    // Modify events into activities by collapsing event subarrays into their length
    const activityByHour = eventsByHour.map((hourEvents) => hourEvents.length);

    return activityByHour;
};

/**
 * Checks if event counts as activity and returns corresponding contributor
 * @param {Object} events array with GitHub event objects
 * @return {string|undefined} returns author name for activities and undefined for other events
 */
const getActivityAuthor = (event) => {
    const { type, payload, actor } = event;
    const username = actor.login;
    let contributorName;
    switch (type) {
        case EVENT_TYPES.PULL_REQUEST_REVIEW_EVENT:
        case EVENT_TYPES.ISSUE_COMMENT_EVENT:
        case EVENT_TYPES.PUSH_EVENT: {
            contributorName = username;
            break;
        }
        case EVENT_TYPES.ISSUES_EVENT: {
            if (payload.action === ACTION_NAMES.CLOSED && !isStale(payload.issue)) {
                contributorName = username;
            }
            break;
        }
        case EVENT_TYPES.PULL_REQUEST_EVENT: {
            // count only newly opened & merged pulls
            if (payload.action === ACTION_NAMES.OPENED
                || (payload.action === ACTION_NAMES.CLOSED && typeof payload.pull_request.merged_at === 'string')) {
                // merged pull request count for the one who opened it
                contributorName = payload.pull_request.user.login;
            }
            break;
        }
        default:
            break;
    }

    return contributorName;
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
    getActivityAuthor,
};