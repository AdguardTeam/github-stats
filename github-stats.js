const core = require('@actions/core');
const yargs = require('yargs');
const prepareStats = require('./src/prepare-stats/prepare-stats');
const printStats = require('./src/print-stats');

const collectionPath = core.getInput('PATH', { required: true });
const options = yargs
    .options({
        repo: {
            demandOption: true,
            type: 'string',
        },
        since: {
            demandOption: false,
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
    const statistics = await prepareStats(collectionPath, defaultRequestData, searchTime);
    printStats(statistics);
})();
