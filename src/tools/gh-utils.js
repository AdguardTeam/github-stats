const core = require('@actions/core');
const github = require('@actions/github');
const { ENDPOINTS } = require('../constants');

const token = core.getInput('TOKEN', { required: true });
const octokit = github.getOctokit(token);

/**
 * Get GitHub events from with pagination
 * @return {Promise<Array<Object>>} array with GitHub event objects
 */
const getGithubEvents = async (requestData = {}) => {
    const collectedPages = [];

    let currentLink = 'rel="next"';
    let pageNumber = 1;
    while (currentLink && currentLink.includes('rel="next"')) {
        // eslint-disable-next-line no-await-in-loop
        const { headers, data } = await octokit.request(ENDPOINTS.GITHUB_EVENTS, {
            ...requestData,
            page: pageNumber,
        });

        collectedPages.push(data);

        currentLink = headers.link;
        pageNumber += 1;
    }

    return collectedPages.flat();
};

/**
 * Get open issues with pagination
 * @return {Promise<Array<Object>>} array with open issues
 */
const getOpenIssues = async (requestData = {}) => {
    const collectedPages = [];

    let currentLink = 'rel="next"';
    let pageNumber = 1;
    while (currentLink && currentLink.includes('rel="next"')) {
        // eslint-disable-next-line no-await-in-loop
        const { headers, data } = await octokit.request(ENDPOINTS.ISSUES, {
            ...requestData,
            state: 'open',
            page: pageNumber,
        });

        collectedPages.push(data);

        currentLink = headers.link;
        pageNumber += 1;
    }

    return collectedPages.flat();
};

module.exports = {
    getGithubEvents,
    getOpenIssues,
};
