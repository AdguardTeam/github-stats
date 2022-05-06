#!/usr/bin/env node

require('dotenv').config();
const yargs = require('yargs');
const pollEvents = require('../src/poll-events');

const { COLLECTION_PATH } = process.env;

const options = yargs
    .option({
        repo: {
            alias: 'r',
            demandOption: true,
            type: 'string',
        },
    })
    .argv;
const defaultRequestData = {
    owner: options.repo.split('/')[0],
    repo: options.repo.split('/')[1],
};

(async () => {
    await pollEvents(COLLECTION_PATH, defaultRequestData);
})();
