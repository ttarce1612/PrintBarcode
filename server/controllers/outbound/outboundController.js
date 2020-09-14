/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */
const outboundHandle = require('../../handles/outboundHandle');

const request = require('request');

/**
 * Status
 * 0 ==> Mới
 * 1 ==> Đang Gói Hàng
 * 2 ==> Đã Gói Hàng
 * 3 ==> Đang Giao hàng
 * 4 ==> Hoàn tất
 */
function updateOrder(postData) {
    request.post({
        url: `${require('../../config').ovakaiURL}/api/order/update`,
        body: postData,
        json: true
    }, (err, httpRes, body) => {
        console.log("update Order", body)
    })
}

module.exports = {
    registerGatwayListener: () => {
        if (global.jsonCLIENT_APP === undefined)
            return false;

        CLIENT_APP.on('api_outbound_create', (data, requestid) => {
            outboundHandle.create(data)
                .then((result) => {
                    if (result) {
                        CLIENT_APP.emit("api_outbound_list_" + requestid, { Status: true, Data: result.code }, requestid);
                    } else {
                        CLIENT_APP.emit("api_outbound_list_" + requestid, { Status: false, Data: null }, requestid);
                    }
                })
        })
    },
    createOutbound: function (req, res) {
        outboundHandle.create(req.body)
            .then((result) => {
                if (result) {
                    res.json({ Status: true, Data: result.code });
                } else {
                    res.json({ Status: false, Data: "" });
                }
            });
    }, 
    updateOutbound(req, res) {
        let searchParams = {};

        if (req.body.code) {
            searchParams['code'] = req.body.code;
        }
        if (req.body.socode) {
            searchParams['socode'] = req.body.socode;
        }
        if (req.body._id) {
            searchParams['_id'] = req.body._id;
        }
        outboundHandle.save(searchParams, req.body)
            .then((result) => {
                if (result.Status) {
                    updateOrder({
                        socode: req.body && req.body.socode || "",
                        status: 'ĐÃ GÓI HÀNG'
                    });
                    res.json({ Status: true, Data: "Updated succesfully" });
                } else {
                    res.json(result);
                }
            });
    },
    getList(req, res) {
        outboundHandle.getList(req.query).then((result) => {
            res.json(result);
        });
    },
    getOne: function (req, res) {
        outboundHandle.getOne({ _id: req.params.id || "" }).then((err, record) => {
            if (err) {
                res.send(err);
            } else {
                res.json(record);
            }
        });
    }
};