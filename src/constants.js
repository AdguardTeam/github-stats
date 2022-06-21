const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
const EVENT_EXPIRATION_DAYS = 30;
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
const LABEL_NAMES = {
    STALE: 'Stale',
};
const ACTION_NAMES = {
    OPENED: 'opened',
    CLOSED: 'closed',
};

const COLLECTION_FILE_EXTENSION = '.jsonl';

module.exports = {
    MILLISECONDS_IN_DAY,
    EVENT_EXPIRATION_DAYS,
    ENDPOINTS,
    EVENT_TYPES,
    LABEL_NAMES,
    ACTION_NAMES,
    COLLECTION_FILE_EXTENSION,
};
