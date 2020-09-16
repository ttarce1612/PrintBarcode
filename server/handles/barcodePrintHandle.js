/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */
const objectModel = require("../data/barcodeModel");

const baseHandle = require('./baseHandle');

async function createUniqueStringList(data) {
    let response = { Status: false, Data: 'Data invalid' }
    if (data) {
        let result = {
            serialList: [],
            sucess: 0,
            failed: 0
        }
        for (let i = 0; i < data.quantity; i++) {
            data["serial"] = ""
            let create_data = await objectModel.create(data);
            if (create_data && create_data["id"]) {
                let serialString = "E" + create_data["id"].slice(-10, create_data["id"].length).toUpperCase()
                await objectModel.findOneAndUpdate({ _id: create_data["id"], isdeleted: 0 }, { serial: serialString }, (err, doc) => {
                    if (err) {
                        result.failed++
                    } else {
                        result.sucess++
                        result.serialList.push(serialString)
                    }
                });
            } else {
                result.failed++
            }
        }
        response.Status = true,
            response.Data = result
    }
    return new Promise(resolve => {
        {
            resolve(response);
        }
    });
}

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
    return await objectModel.create(data);
}

async function getList(params) {
    let queryData = queryParser.filterParser(params);
    return await objectModel.paginate(queryData.query, queryData.options);
}

async function getOne(params) {
    return await objectModel.findOne(params);
}

async function searchBySku(data) {
    if (data) {
        return await objectModel.find({ SKU: data["sku"] });
    }
}

module.exports = {
    save, create, getList, getOne, createUniqueStringList, searchBySku
};