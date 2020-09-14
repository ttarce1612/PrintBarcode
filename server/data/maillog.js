let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

let maillogSchema = mongoose.Schema({
    loginname: String,
    daterequest: String,
    adminreset: {
        type: String,
        default: 'none'
    },
    datereset: String,
    requesttime: Number,
    lastmodified: Date
});
maillogSchema.plugin(beautifyUnique); // Format error message for Demo 2 - Huy Nghiem 12/11/2019
maillogSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in Account list' });

module.exports = mongoose.model("maillog", maillogSchema, "maillog");