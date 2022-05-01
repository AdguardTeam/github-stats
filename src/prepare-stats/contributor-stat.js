const {
    isStale,
    getCommitsCount,
} = require('../tools/events-utils');

const prepareContributorStat = (events) => {
    const contributors = {};

    class Contributor {
        addActivityEvent(event) {
            const { type } = event;
            if (typeof this[type] === 'undefined') {
                // Init event type if there is no such type already
                this[type] = [];
            }
            this[type].push(event);
        }

        countTotalActivity() {
            let activityCount = 0;
            // eslint-disable-next-line no-restricted-syntax
            for (const eventType of Object.keys(this)) {
                if (eventType === 'PushEvent') {
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
            case 'PushEvent': {
                contributorName = username;
                break;
            }
            case 'IssuesEvent': {
                if (payload.action === 'closed' && !isStale(payload.issue)) {
                    contributorName = username;
                }
                break;
            }
            case 'PullRequestEvent': {
                // count only newly opened & merged pulls
                if (payload.action === 'opened'
                    || (payload.action === 'closed' && typeof payload.pull_request.merged_at === 'string')) {
                    // merged pull request count for the one who opened it
                    contributorName = payload.pull_request.user.login;
                }
                break;
            }
            case 'IssueCommentEvent': {
                contributorName = username;
                break;
            }
            case 'PullRequestReviewEvent': {
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
        if (typeof contributorName === 'undefined') {
            return;
        }
        // Init contributor if there isn't one
        if (typeof contributors[contributorName] === 'undefined') {
            contributors[contributorName] = new Contributor();
        }
        contributors[contributorName].addActivityEvent(event);
    });
    return contributors;
};

module.exports = prepareContributorStat;
