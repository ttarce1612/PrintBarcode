/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */

const serialPrintHandle = require('../../handles/printSerialListHandle');


module.exports = {
    createUniqueStringList: function (req, res) {
        let data = req.body
        let check = true
        for (let item in data) {
            if (!data[item]) {
                check = false
            }
        }
        if (check) {
            serialPrintHandle.createUniqueStringList(data).then((result) => {
                if (result.Status && result.Data) {
                    res.json(result)
                }
            })
        } else {
            res.json("Du lieu bi thieu")
        }
    },
    searchByClient: function (req, res) {
        let data = req.body
        let check = true
        if (check) {
            serialPrintHandle.searchByClient(data).then((result) => {
                res.json(result)
            })
        }
    },
    create: function (req, res) {
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
    },
    getLast: function (req, res) {
        inboundHandle.getLast({ _id: req.params.id || "" }).then((err, record) => {
            if (err) {
                res.send(err);
            } else {
                res.json(record);
            }
        });
    }
};