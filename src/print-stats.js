/* eslint-disable no-console */
const {
    makeGeneralRepoStatsString,
    makeGeneralActivityString,
    makeDetailedActivityString,
} = require('./tools/print-utils');

const printStats = (statistics) => {
    const {
        generalRepoStats,
        generalContributorStats,
        detailedContributorStats,
        hourlyContributorActivity,
    } = statistics;

    const generalRepoStatsString = makeGeneralRepoStatsString(generalRepoStats);
    const generalActivityString = makeGeneralActivityString(generalContributorStats);
    // eslint-disable-next-line max-len
    const detailedActivityString = makeDetailedActivityString(detailedContributorStats, hourlyContributorActivity);

    console.log(generalRepoStatsString);
    console.log(generalActivityString);
    console.log(detailedActivityString);
};

module.exports = printStats;
