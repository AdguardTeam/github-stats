#!/usr/bin/env node

require('dotenv').config();

const { prepareStats } = require('../src/prepare-stats/prepare-stats');
const { printStats } = require('../src/print-stats');

const { COLLECTION_PATH, REPO, SINCE } = process.env;

const commonRequestData = {
    owner: REPO.split('/')[0],
    repo: REPO.split('/')[1],
};

(async () => {
    const statistics = await prepareStats(COLLECTION_PATH, commonRequestData, SINCE);
    printStats(statistics);
})();
