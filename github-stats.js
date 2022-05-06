const core = require('@actions/core');
const github = require('@actions/github');
const yargs = require('yargs');
const prepareStats = require('./src/prepare-stats/prepare-stats');
const printStats = require('./src/print-stats');
const { MILLISECONDS_IN_DAY } = require('./src/constants');

const collectionPath = core.getInput('PATH', { required: true });

const { since } = github.context.payload.inputs;
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
let searchTime = since;
if (!searchTime) {
    // Set timestamp to 24h ago if not provided
    const defaultDate = new Date(new Date().getTime() - MILLISECONDS_IN_DAY);
    searchTime = defaultDate.toISOString();
}
const defaultRequestData = {
    owner: options.repo.split('/')[0],
    repo: options.repo.split('/')[1],
};

(async () => {
    const statistics = await prepareStats(collectionPath, defaultRequestData, searchTime);
    printStats(statistics);
})();
