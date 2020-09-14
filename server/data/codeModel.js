/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */
const mongoose = require("mongoose");
module.exports = mongoose.model('codemanagement', mongoose.Schema({
        name: String,
        prefix: String,
        nextindex: Number,
        lastmodified: {
            type: Date,
            default: new Date()
        },
        modifiedby: String,
        isdeleted: {
            type: Number,
            default: 0
        }
    }), 'codemanagement');