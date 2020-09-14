/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */

const inboundHandle = require('../../handles/inboundHandle');

module.exports = {
    registerGatwayListener: () => {
        if (global.CLIENT_APP === undefined)
            return false;

        CLIENT_APP.on('api_inbound_list', (data, requestid) => {
            if (data) {
                if (!data.limit) data.limit = 100;
                if (!data.page) data.page = 1;
                if (!data.keyword) data.keyword = "";
            }
            inboundHandle.getList(data).then((result) => {
                if (result) {
                    CLIENT_APP.emit("api_inbound_list_" + requestid, { Status: true, Data: result.docs || [] }, requestid);
                } else {
                    CLIENT_APP.emit("api_inbound_list_" + requestid, { Status: false, Data: null }, requestid);
                }
            });
        })
    },
    createInbound: function (req, res) {
        inboundHandle.create(req.body)
            .then((result) => {
                if (result) {
                    res.json({ Status: true, Data: result.code });
                } else {
                    res.json({ Status: false, Data: "" });
                }
            });
    },
    updateInbound(req, res) {
        inboundHandle.save({
            _id: req.body._id
        }, req.body)
            .then((result) => {
                res.send(result);
            });
    },
    getList(req, res) {
        inboundHandle.getList(req.query).then((result) => {
            res.json(result);
        });
    },
    getOne: function (req, res) {
        inboundHandle.getOne({ _id: req.params.id || "" }).then((err, record) => {
            if (err) {
                res.send(err);
            } else {
                res.json(record);
            }
        });
    }
};