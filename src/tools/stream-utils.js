/* eslint-disable no-param-reassign, no-use-before-define, func-names, consistent-return */

/**
 * Gets array of GitHub event objects from file and by search time
 * @param {Object} stream
 * @param {callback} done
 * @return {Array} array with event objects
 */
const streamToArray = function (stream, done) {
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

            let resultArray = [];

            function cleanup() {
                resultArray = null;
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
                if (resultArray.length === 0) {
                    // Return null if stream (file) was empty
                    resolve(null);
                } else {
                    resolve(resultArray);
                }
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

    if (typeof done === 'function') {
        deferred.then((resultArray) => {
            process.nextTick(() => {
                done(null, resultArray);
            });
        }, done);
    }

    return deferred;
};

module.exports = {
    streamToArray,
};
