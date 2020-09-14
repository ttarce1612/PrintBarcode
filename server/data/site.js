let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');

let siteSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        uppercase: true,
        required: [true, 'Name required']
    },
    title: {
        type: String,
        required: [true, 'Title required']
    },
    url: {
        type: String,
        unique: true,
        required: [true, 'URL required']
    },
    icon: {
        type: String,
        default: 'glyphicon glyphicon-th-large'
    },
    isdeleted: {
        type: Number,
        default: 0
    },
    lastmodified: {
        type: Date,
        default: Date.now()
    },
    modifiedby: {
        type: String,
        default: 'swadmin'
    }
});
siteSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in Site' });
module.exports = mongoose.model("sites", siteSchema, "sites");