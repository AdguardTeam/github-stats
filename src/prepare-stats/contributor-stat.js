const {
    isStale,
    getCommitsCount,
} = require('../tools/events-utils');

const prepareContributorStat = (events) => {
    const contributors = {};

    class Contributor {
        addActivityEvent(event) {
            if (typeof this[event.type] === 'undefined') {
                this[event.type] = [];
            }
            this[event.type].push(event);
        }

        countTotalActivity() {
            let activityCount = 0;
            // eslint-disable-next-line no-restricted-syntax
            for (const eventType of Object.keys(this)) {
                // Extract commits from PushEvents to count them separately
                if (eventType === 'PushEvent') {
                    const commitsCount = getCommitsCount(this[eventType]);
                    activityCount += commitsCount;
                } else {
                    activityCount += eventType.length;
                }
            }
            return activityCount;
        }
    }

    /**
     * Checks if event counts as activity and returns corresponding contributor
     * @param {Array.<Object>} events array with GitHub event objects
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
                if (payload.action === 'closed' && typeof payload.pull_request.merged_at === 'string') {
                    // merged pull request counts for the one who opened it
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
