const core = require('@actions/core');
const yargs = require('yargs');
const pollEvents = require('./src/poll-events');

const collectionPath = core.getInput('PATH', { required: true });
const options = yargs
    .option({
        repo: {
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
    await pollEvents(collectionPath, defaultRequestData);
})();
