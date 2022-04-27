const {
    isStale,
} = require('../tools/events-utils');

const prepareGeneralContributorsStats = (events) => {
    const generalContributorsStats = {};

    const distributeActivity = (event) => {
        const addActivity = (username) => {
            if (typeof generalContributorsStats[username] === 'undefined') {
                generalContributorsStats[username] = 1;
            } else {
                generalContributorsStats[username] += 1;
            }
        };

        const { type, payload, actor } = event;
        const username = actor.login;
        switch (type) {
            case 'PushEvent': {
                addActivity(username);
                break;
            }
            case 'IssuesEvent': {
                if (payload.action === 'closed' && !isStale(payload.issue)) {
                    addActivity(username);
                }
                break;
            }
            case 'PullRequestEvent': {
                if (payload.action === 'closed' && typeof payload.pull_request.merged_at === 'string') {
                    addActivity(payload.pull_request.user.login);
                }
                break;
            }
            case 'IssueCommentEvent': {
                addActivity(username);
                break;
            }
            case 'PullRequestReviewEvent': {
                addActivity(username);
                break;
            }
            default:
                break;
        }
    };

    events.forEach((event) => distributeActivity(event));

    return generalContributorsStats;
};

module.exports = prepareGeneralContributorsStats;
