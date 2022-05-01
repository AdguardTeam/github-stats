const {
    isStale,
    getCommitsCount,
} = require('../tools/events-utils');
const {
    EVENT_TYPES,
} = require('../constants');

const prepareContributorStat = (events) => {
    const contributors = {};

    class Contributor {
        addActivityEvent(event) {
            const { type } = event;
            if (!this[type]) {
                // Init event type if there is no such type already
                this[type] = [];
            }
            this[type].push(event);
        }

        countTotalActivity() {
            let activityCount = 0;
            // eslint-disable-next-line no-restricted-syntax
            for (const eventType of Object.keys(this)) {
                if (eventType === EVENT_TYPES.PUSH_EVENT) {
                    // Extract commits from PushEvents to count them separately
                    const commitsCount = getCommitsCount(this[eventType]);
                    activityCount += commitsCount;
                } else {
                    activityCount += this[eventType].length;
                }
            }
            return activityCount;
        }
    }

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
            case EVENT_TYPES.PUSH_EVENT: {
                contributorName = username;
                break;
            }
            case EVENT_TYPES.ISSUES_EVENT: {
                if (payload.action === 'closed' && !isStale(payload.issue)) {
                    contributorName = username;
                }
                break;
            }
            case EVENT_TYPES.PULL_REQUEST_EVENT: {
                // count only newly opened & merged pulls
                if (payload.action === 'opened'
                    || (payload.action === 'closed' && typeof payload.pull_request.merged_at === 'string')) {
                    // merged pull request count for the one who opened it
                    contributorName = payload.pull_request.user.login;
                }
                break;
            }
            case EVENT_TYPES.ISSUE_COMMENT_EVENT: {
                contributorName = username;
                break;
            }
            case EVENT_TYPES.PULL_REQUEST_REVIEW_EVENT: {
                contributorName = username;
                break;
            }
            default:
                break;
        }

        return contributorName;
    };

    events.forEach((event) => {
        const contributorName = getActivityAuthor(event);
        // Events that don't count as activity are not saved anywhere
        if (!contributorName) {
            return;
        }
        // Init contributor if there isn't one
        if (!contributors[contributorName]) {
            contributors[contributorName] = new Contributor();
        }
        contributors[contributorName].addActivityEvent(event);
    });
    return contributors;
};

module.exports = prepareContributorStat;
