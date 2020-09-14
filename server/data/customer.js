/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */
const mongoose = require("mongoose");
const _schema = mongoose.Schema({
    id: Number,
    custid: String,
    company: String,
    lastmodified: {
        type: Date,
        default: new Date()
    },
    modifiedby: String,
    isdeleted: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('customer', _schema);