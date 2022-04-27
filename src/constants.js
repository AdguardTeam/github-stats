const EVENT_EXPIRATION_DAYS = 30;
const STORAGE_PATH = './events-collection.json';
const ENDPOINTS = {
    GITHUB_EVENTS: 'GET /repos/{owner}/{repo}/events',
};

module.exports = {
    EVENT_EXPIRATION_DAYS,
    STORAGE_PATH,
    ENDPOINTS,
};
