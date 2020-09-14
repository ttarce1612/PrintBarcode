/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */
const objectModel = require("../data/inboundModel");
const queryParser = require("./../queryparser/inbound");
const codeManager = require("./../lib/codeManager");

const baseHandle = require('./baseHandle');
function save(searchParam, data) {
    return new Promise(resolve => {
        if (data) {
            data.lastmodified = new Date();
            data.isdeleted = 0;
            // if (data._id) {
            //     searchParam["_id"] = { '$ne': data._id };
            // }
            baseHandle.save(objectModel, searchParam, data, { multi: false, upsert: true }).then(res => {
                resolve(res)
            });
        } else {
            resolve({ Status: false, Data: 'Data invalid' });
        }
    });
}

async function create(data) {
    data.code = await codeManager.generateCode("IB");
    return await objectModel.create(data);
}

async function getList(params) {
    let queryData = queryParser.filterParser(params);
    return await objectModel.paginate(queryData.query, queryData.options);
}

async function getOne(params) {
    return await objectModel.findOne(params);
}

module.exports = {
    save, create, getList, getOne
};