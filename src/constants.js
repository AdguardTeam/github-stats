const EVENT_EXPIRATION_DAYS = 30;
const STORAGE_PATH = './events-collection.json';
const ENDPOINTS = {
    ISSUES: 'GET /repos/{owner}/{repo}/issues',
    GITHUB_EVENTS: 'GET /repos/{owner}/{repo}/events',
};

module.exports = {
    EVENT_EXPIRATION_DAYS,
    STORAGE_PATH,
    ENDPOINTS,
};
