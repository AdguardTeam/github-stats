/* eslint-disable no-console */
const { makeGeneralRepoStatsString, makeGeneralActivityString, makeDetailedActivityString } = require('./tools/print-utils');

/**
 * Prepares statistics strings and prints them to console
 *
 * @param {Object} statistics
 */
const printStats = (statistics) => {
    const {
        generalRepoStats,
        generalContributorStats,
        detailedContributorStats,
        contributorActivityByTime,
    } = statistics;

    const generalRepoStatsString = makeGeneralRepoStatsString(generalRepoStats);
    const generalActivityString = makeGeneralActivityString(generalContributorStats);
    // eslint-disable-next-line max-len
    const detailedActivityString = makeDetailedActivityString(detailedContributorStats, contributorActivityByTime);

    console.log(generalRepoStatsString);
    console.log(generalActivityString);
    console.log(detailedActivityString);
};

exports.printStats = printStats;
