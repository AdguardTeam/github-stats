const EVENT_EXPIRATION_DAYS = 30;
const STORAGE_PATH = './storage/event-storage.txt';
const ENDPOINTS = {
    GITHUB_EVENTS: 'GET /repos/{owner}/{repo}/events',
};

module.exports = {
    EVENT_EXPIRATION_DAYS,
    STORAGE_PATH,
    ENDPOINTS,
};
