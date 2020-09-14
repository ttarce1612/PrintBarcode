// const watcher = new (require('events')).EventEmitter();

/**
 * Update status
 * @param {*} model 
 * @param {*} id 
 * @param {*} status 
 */
function updateStatus(model, id, status) {
    model.updateOne({_id: id}, {status: status}, () => {});
}

function connect(model, disableUpdate, watcher) {
    if (model && typeof model.watch === 'function') {
        model.watch(watcher.pipeline, watcher.options)
            .on('change', resp => {
                if (resp.fullDocument) {
                    watcher.emit('data', resp.fullDocument);
                    if(!disableUpdate) {
                        updateStatus(model, resp.fullDocument._id, "FINISHED");
                    }
                } 
            })
            .on('error', error => {
                if (error.name !== 'MongoNetworkError') {
                    throw error;
                }
                // updateStatus(model, resp.fullDocument._id, "FAILED");
                //connect(model);
            });
    }
}

/**
 * http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#watch
 * @param mongooseModel A mongoose model
 * @param pipeline An array of aggregation pipeline stages through which to pass change stream documents. 
 *   This allows for filtering (using $match) and manipulating the change stream documents.
 * @param options Optional settings
 */
module.exports = function create(mongooseModel, pipeline = null, options = null, disableUpdate = false) {
    let watcher = new (require('events')).EventEmitter();
    watcher.options = options || null;
    watcher.pipeline = pipeline || null;
    connect(mongooseModel, disableUpdate, watcher);
    return watcher;
};