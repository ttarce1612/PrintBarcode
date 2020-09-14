let mongoose = require("mongoose");

let smslogSchema = mongoose.Schema({ 
    loginname: String,
    daterequest: Date,
    requesttime: Number,
    errormsg: Array,
    lastmodified: Date
});

module.exports = mongoose.model("smslog", smslogSchema, "smslog");