#!/usr/bin/env node

require('dotenv').config();
const { pollEvents } = require('../src/poll-events');

const { COLLECTION_PATH, REPO } = process.env;

const commonRequestData = {
    owner: REPO.split('/')[0],
    repo: REPO.split('/')[1],
};

(async () => {
    await pollEvents(COLLECTION_PATH, commonRequestData);
})();
