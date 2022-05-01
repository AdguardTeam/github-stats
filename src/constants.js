const EVENT_EXPIRATION_DAYS = 30;
const COLLECTION_PATH = './events-collection.json';
const ENDPOINTS = {
    ISSUES: 'GET /repos/{owner}/{repo}/issues',
    GITHUB_EVENTS: 'GET /repos/{owner}/{repo}/events',
};
const EVENT_TYPES = {
    ISSUES_EVENT: 'IssuesEvent',
    ISSUE_COMMENT_EVENT: 'IssueCommentEvent',
    PULL_REQUEST_EVENT: 'PullRequestEvent',
    PULL_REQUEST_REVIEW_EVENT: 'PullRequestReviewEvent',
    PUSH_EVENT: 'PushEvent',
    // These don't represent GitHub API event types
    NEW_PULL_EVENT: 'newPullEvent',
    MERGED_PULL_EVENT: 'mergePullEvent',
};

module.exports = {
    EVENT_EXPIRATION_DAYS,
    COLLECTION_PATH,
    ENDPOINTS,
    EVENT_TYPES,
};
