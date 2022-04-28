/* eslint-disable no-console */
const printGeneralRepoStats = (repoStats) => {
    console.log('## General repo statistics \n');
    console.log(`* New issues: ${repoStats.newIssues}`);
    console.log(`* Resolved issues: ${repoStats.resolvedIssues}`);
    console.log(`* Closed as stale: ${repoStats.closedAsStaleIssues}`);
    console.log(`* New pull requests: ${repoStats.newPulls}`);
    console.log(`* Merged pull requests: ${repoStats.mergedPulls}`);
    console.log(`* Remaining issues: ${repoStats.remainingIssues}\n\n`);
};

const printByGeneralActivity = (generalActivity) => {
    const statArray = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(generalActivity)) {
        statArray.push([key, value]);
    }

    const sortedByActivity = statArray.sort((a, b) => {
        if (a[1] > b[1]) {
            return -1;
        }
        if (a[1] > b[1]) {
            return 1;
        }
        return 0;
    });

    console.log('## General contributors statistics \n');
    sortedByActivity.forEach((contributor, index) => {
        const close = index === sortedByActivity.length - 1 ? '\n\n' : '';
        console.log(`${index + 1}. ${contributor[0]}: ${contributor[1]}${close}`);
    });
};

const printByDetailedActivity = (detailedActivity) => {
    console.log('## Detailed contributor statistics \n');
    // eslint-disable-next-line no-restricted-syntax
    for (const [name, activities] of Object.entries(detailedActivity)) {
        console.log(`### ${name} \n`);
        console.log(`* Resolved issues: ${activities.resolvedIssues}`);
        console.log(`* New pull requests (merged): ${activities.newMergedPulls} (FIX)`);
        console.log(`* Pull requests review activity: ${activities.pullRequestsReview}`);
        console.log(`* Total commits: ${activities.totalCommits} \n\n`);
    }
};

module.exports = {
    printGeneralRepoStats,
    printByGeneralActivity,
    printByDetailedActivity,
};
