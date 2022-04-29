const {
    printGeneralRepoStats,
    printByGeneralActivity,
    printByDetailedActivity,
} = require('./tools/print-utils');

const printStats = (statistics) => {
    const {
        generalRepoStats,
        generalContributorStats,
        detailedContributorStats,
        hourlyContributorActivity,
    } = statistics;

    printGeneralRepoStats(generalRepoStats);
    printByGeneralActivity(generalContributorStats);
    printByDetailedActivity(detailedContributorStats, hourlyContributorActivity);
};

module.exports = printStats;
