let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');

let sessionSchema = mongoose.Schema({
    account: {
        type: String,
        required: [true, 'Account name required']
    },
    expired: {
        type: Date,
        required: [true, 'Expired date required']
    },
    token: {
        type: String,
        required: [true, 'Token required']
    },
    lastmodified: {
        type: Date,
        default: Date.now()
    }
});
sessionSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in Session list' });

module.exports = mongoose.model("usersessions", sessionSchema, "usersessions");