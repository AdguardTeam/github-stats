#!/usr/bin/env node

const yargs = require("yargs");
const { Octokit } = require("@octokit/core");

const options = yargs
    .options({
        'repo': {
            type: "string",
            demandOption: true
        },
        'since': {
            type: "string",
            demandOption: true
        },
    })
    .argv;

const OCTO_ACCESS_TOKEN = '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'; // Github personal access token
const SEARCH_TIME = options.since;
const SEARCH_TIME_FORMATTED = Number(new Date(options.since));
const REQUEST_DATA = {
    owner: options.repo.split('/')[0],
    repo: options.repo.split('/')[1],
    since: SEARCH_TIME,
    state: 'all',
    per_page: 100,
};

const octokit = new Octokit({ auth: OCTO_ACCESS_TOKEN });

function Table(newIssues, resolvedIssues, staleIssues) {
    this['* New issues:'] = newIssues;
    this['* Resolved issues:'] = resolvedIssues;
    this['* Stale issues:'] = staleIssues;
};

const getUpdatedIssues = async (currentPage = 1) => {
    let collectedIssues = [];
    const { status, url, headers, data } = await octokit.request('GET /repos/{owner}/{repo}/issues', {
        ...REQUEST_DATA,
        page: currentPage,
    });
    if (status !== 200) {
        console.log(`getNewIssues response status in not 200: ${status}`);
        throw (new Error('GET REQUEST FAILED'));
    }
    console.log(url);
    if (data) {
        collectedIssues.push(data);
    }

    // Iterate through all pages
    if (headers.link.includes('rel="next"')) {
        collectedIssues.push(await getUpdatedIssues(currentPage + 1));
    }

    return collectedIssues.flat();
};

const getNewIssues = (issues) => {
    // Filter out issues that were created before search date
    const newIssues = issues
        .filter((issue) => {
            const createTime = Number(new Date(issue.created_at));
            return SEARCH_TIME_FORMATTED < createTime;
        });

    return newIssues;
};

const getClosedIssues = (issues) => {
    const closedIssues = issues.filter((issue) => issue.closed_at);
    const isStale = (issue) => {
        const labels = issue.labels;
        const staleLabel = labels.find(label => label.name === 'Stale');
        return typeof staleLabel !== 'undefined';
    };
    // Split closed issues by stale condition
    const sortedClosedIssues = closedIssues.reduce((accum, currentIssue) => {
        isStale(currentIssue) ? accum[1].push(currentIssue) : accum[0].push(currentIssue);
        return accum;
    }, [[], []])
    
    return sortedClosedIssues;
};

const getGRS = async () => {
    const allIssues = await getUpdatedIssues();
    const newIssues = getNewIssues(allIssues);
    const [ resolvedIssues, staleIssues ] = getClosedIssues(allIssues);

    const githubStats = {
        newIssues,
        resolvedIssues,
        staleIssues,
    };
    return githubStats;
};

(async () => {
    const generalRepoStatistics = await getGRS();

    console.log('## General repo statistics');
    console.table(new Table(generalRepoStatistics.newIssues.length, generalRepoStatistics.resolvedIssues.length, generalRepoStatistics.staleIssues.length));
})();

