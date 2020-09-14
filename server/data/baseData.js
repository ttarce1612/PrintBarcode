var mongoose = require("mongoose");
var _ = require("underscore");

// Huy Nghiem - 12/11/2019 - Establish SMTDataImportSchema
module.exports = {
    getSchema: function(configs) {
        return new mongoose.Schema(_.extend({
            lastModified: Date,
            keygen: String
        }, configs));
    },
    getModel: function (collectionName, schema) {
        return mongoose.model(collectionName, schema);
    },
    destroy: function(model) {
        if(mongoose.connection.models[model]) {
            delete mongoose.connection.models[model];
        }
    }
};