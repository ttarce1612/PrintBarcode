var mongoose = require("mongoose");

var userlogSchema = mongoose.Schema({
    requestheader: mongoose.Schema.Types.Mixed,
    requestcontent: mongoose.Schema.Types.Mixed,
    username: String,
    requesttime: Date
});

module.exports = mongoose.model("userlog", userlogSchema);