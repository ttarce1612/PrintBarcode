/**
 * Copyright (c) 2019 OVTeam
 * Exception Log collection
 * Modified by: Huy Nghiem
 * Modified date: 2019/11/11
 * 
 * @type Module mongoose|Module mongoose
 */

var mongoose = require("mongoose");

var exceptionLogSchema = new mongoose.Schema({
    logid: String,
    message: mongoose.Schema.Types.Mixed,
    priority: Number,
    lastmodified: Date
});

module.exports = mongoose.model("exceptionlog", exceptionLogSchema, 'exceptionlog');