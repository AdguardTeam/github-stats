#!/usr/bin/env node

require('dotenv').config();
const yargs = require('yargs');
const prepareStats = require('../src/prepare-stats/prepare-stats');
const printStats = require('../src/print-stats');

const { COLLECTION_PATH } = process.env;

const options = yargs
    .options({
        repo: {
            alias: 'r',
            demandOption: true,
            type: 'string',
        },
        since: {
            alias: 's',
            demandOption: true,
            type: 'string',
        },
    })
    .argv;
const searchTime = options.since;
const defaultRequestData = {
    owner: options.repo.split('/')[0],
    repo: options.repo.split('/')[1],
};

(async () => {
    const statistics = await prepareStats(COLLECTION_PATH, defaultRequestData, searchTime);
    printStats(statistics);
})();
