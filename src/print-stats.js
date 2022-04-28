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
    } = statistics;

    printGeneralRepoStats(generalRepoStats);
    printByGeneralActivity(generalContributorStats);
    printByDetailedActivity(detailedContributorStats);
    //console.log(detailedContributorStats);
};

module.exports = printStats;
