const {
    isStale,
} = require('../tools/events-utils');

const prepareDetailedContributorStatistics = (events) => {
    const generalContributorStats = {};
    class Contributor {
        constructor() {
            this.resolvedIssues = [];
            this.newMergedPulls = [];
            this.pullReviews = [];
            this.totalCommits = [];
        }

        addActivity(activityName, activityObj) {
            this[activityName].push(activityObj);
        }
    }

    const initContributor = (name) => {
        generalContributorStats[name] = new Contributor();
    };

    events.forEach((event) => distributeActivity(event));


    return generalContributorStats;
};

module.exports = prepareDetailedContributorStatistics;
