/* eslint-disable no-param-reassign, no-use-before-define, func-names, consistent-return */

/**
 * Gets array of GitHub event objects from file and by search time
 * @param {Object} stream
 * @return {Promise<Array<Object>>} array with event objects
 */
const streamToArray = function (stream) {
    if (!stream) {
        return;
    }

    let deferred;
    if (!stream.readable) {
        deferred = Promise.resolve([]);
    } else {
        deferred = new Promise((resolve, reject) => {
            // stream is already ended
            if (!stream.readable) {
                resolve([]);
            }

            const resultArray = [];

            function cleanup() {
                stream.removeListener('data', onData);
                stream.removeListener('end', onEnd);
                stream.removeListener('error', onEnd);
                stream.removeListener('close', onClose);
            }

            function onData(data) {
                if (data === 'stop') {
                    // Stop stream to avoid excessive stream reading
                    stream.destroy();
                } else {
                    resultArray.push(data);
                }
            }

            function onEnd(err) {
                if (err) {
                    reject(err);
                }
                resolve(resultArray);
                cleanup();
            }

            function onClose() {
                resolve(resultArray);
                cleanup();
            }

            stream.on('data', onData);
            stream.on('end', onEnd);
            stream.on('error', onEnd);
            stream.on('close', onClose);
        });
    }

    return deferred;
};

const getUniquesFromStream = function (stream, poll) {
    return new Promise((resolve, reject) => {
        // stream is already ended
        if (!stream.readable) {
            resolve([]);
        }

        const resultArray = [...poll];

        function onData(data) {
            const eventFromFile = data.value;
            const dupeIndex = resultArray.findIndex((newEvent) => {
                return newEvent.id === eventFromFile.id;
            });
            if (dupeIndex !== -1) {
                resultArray.splice(dupeIndex, 1);
            }
        }

        function onEnd(err) {
            if (err) {
                reject(err);
            }
            resolve(resultArray);
            cleanup();
        }

        function cleanup() {
            stream.removeListener('data', onData);
            stream.removeListener('end', onEnd);
            stream.removeListener('error', onEnd);
        }

        stream.on('data', onData);
        stream.on('end', onEnd);
        stream.on('error', onEnd);
    });
};

module.exports = {
    streamToArray,
    getUniquesFromStream,
};
