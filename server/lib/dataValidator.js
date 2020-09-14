/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */
'use strict';
function unique(entity, filterData, alive, idIgnored) {
    return new Promise(function (resolve, reject) {
        let resp = {
            status: true,
            message: ""
        };
        if (!entity || !filterData || !Object.keys(filterData).length) {
            resolve(resp);
        } else {
            let query = {};
            if (alive === true) {
                query.isdeleted = 0
            }
            if (idIgnored) {
                query["_id"] = { $ne: idIgnored };
            }
            let orQuery = [];
            for (let field in filterData) {
                let info = {};
                if (Array.isArray(filterData[field]) && filterData[field].length) {
                    let orQuery2 = [];
                    for (let idx in filterData[field]) {
                        let info2 = {}, tmp = {};
                        for (let field2 in filterData[field][idx]) {
                            info2[field2] = filterData[field][idx][field2];
                        }
                        if (!tmp[field]) {
                            tmp[field] = {};
                        }
                        tmp[field]["$elemMatch"] = info2;
                        orQuery2.push(tmp);
                    }
                    if (orQuery2.length) info["$or"] = orQuery2;
                } else {
                    info[field] = filterData[field];
                }
                if (Object.keys(info).length) orQuery.push(info);
            }
            query["$or"] = orQuery;
            entity.find(query, function (err, result) {
                if (result && result.length) {
                    let errors = [];
                    for (let field in filterData) {
                        for (let i in result) {
                            if (result[i][field] === filterData[field]) {
                                errors.push(filterData[field]);
                            }
                        }
                    }
                    if (errors.length) {
                        resp.message = "The value(s): [" + errors.join(", ") + "] must be unique in list.";
                    } else {
                        resp.message = "The Initial value(s)  must be unique in list.";
                    }
                    resp.site = (result[0] && result[0]['accesssite'] != undefined && result[0]['accesssite'].length > 0) ? result[0]['accesssite'] : [];
                    resp.status = false;
                }
                resolve(resp);
            });
        }
    });
}

module.exports = {
    unique: unique
};