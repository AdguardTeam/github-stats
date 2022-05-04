const {
    getCommitsCount,
} = require('../tools/events-utils');
const {
    EVENT_TYPES,
} = require('../constants');

class Contributor {
    addActivityEvent(event) {
        const { type } = event;
        if (!this[type]) {
            // Init event type if there is no such type already
            this[type] = [];
        }
        this[type].push(event);
    }

    countTotalActivity() {
        let activityCount = 0;
        // eslint-disable-next-line no-restricted-syntax
        for (const eventType of Object.keys(this)) {
            if (eventType === EVENT_TYPES.PUSH_EVENT) {
                // Extract commits from PushEvents to count them separately
                const commitsCount = getCommitsCount(this[eventType]);
                activityCount += commitsCount;
            } else {
                activityCount += this[eventType].length;
            }
        }
        return activityCount;
    }
}

module.exports = Contributor;
