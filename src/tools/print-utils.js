const makeGeneralRepoStatsString = (repoStats) => {
    const statString = `
    ## General repo statistics \n
    * New issues: ${repoStats.newIssues}
    * Resolved issues: ${repoStats.resolvedIssues}
    * Closed as stale: ${repoStats.closedAsStaleIssues}
    * New pull requests: ${repoStats.newPulls}
    * Merged pull requests: ${repoStats.mergedPulls}
    * Remaining issues: ${repoStats.remainingIssues}
    `.replace(/  +/g, '');

    return statString;
};

const makeGeneralActivityString = (generalActivity) => {
    const statArray = Object.entries(generalActivity);

    const sortedByActivity = statArray.sort((a, b) => {
        if (a[1] > b[1]) {
            return -1;
        }
        if (a[1] > b[1]) {
            return 1;
        }
        return 0;
    });

    let statString = '\n## General contributors statistics \n\n';

    sortedByActivity.forEach((contributor, index) => {
        const statLine = `${index + 1}. ${contributor[0]}: ${contributor[1]}\n`;
        statString += statLine;
    });

    return statString;
};

const makeHourlyActivityString = (hourlyContributorActivity) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const totalActivity = hourlyContributorActivity.reduce((prev, current) => prev + current, 0);
    if (totalActivity <= 0) {
        return '';
    }
    let hourlyStatString = `
    *Daily activity*
    *${currentDate}*\n
    hour \t activity
    `.replace(/  +/g, '');

    hourlyContributorActivity.forEach((activity, hour) => {
        const percent = Math.floor((activity / totalActivity) * 100);
        const bar = `|${'█'.repeat(percent)}`;

        hourlyStatString += `\n${hour} \t ${activity} \t ${bar}`;
    });

    return hourlyStatString;
};

const makeDetailedActivityString = (detailedActivity, hourlyActivity) => {
    let statString = '\n## Detailed contributor statistics';

    // eslint-disable-next-line no-restricted-syntax
    for (const [name, activities] of Object.entries(detailedActivity)) {
        let contributorString = `
        \n\n### ${name}\n
        * Resolved issues: ${activities.resolvedIssues}
        * New pull requests (merged): ${activities.newPulls} (${activities.mergedPulls})
        * Pull requests review activity: ${activities.pullRequestsReview}
        * Total commits: ${activities.totalCommits}
        `.replace(/  +/g, '');

        contributorString += makeHourlyActivityString(hourlyActivity[name]);

        statString += contributorString;
    }

    return statString;
};

module.exports = {
    makeGeneralRepoStatsString,
    makeGeneralActivityString,
    makeDetailedActivityString,
};
