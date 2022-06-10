#!/usr/bin/env node

require('dotenv').config();

const { prepareStats } = require('../src/prepare-stats/prepare-stats');
const { printStats } = require('../src/print-stats');

const {
    COLLECTION_PATH,
    REPO,
    SINCE,
    UNTIL,
} = process.env;

const commonRequestData = {
    owner: REPO.split('/')[0],
    repo: REPO.split('/')[1],
};

const timePeriod = {
    until: UNTIL || new Date().toISOString(),
    since: SINCE,
};

(async () => {
    const statistics = await prepareStats(COLLECTION_PATH, commonRequestData, timePeriod);

    printStats(statistics);
})();
