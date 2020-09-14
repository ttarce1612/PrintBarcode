/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */
const authendashboardHandel = require('../../handles/authendashboardHandle');

const request = require('request');

module.exports = {
    getList(req, res) {
        authendashboardHandel.getList(req.query).then((result) => {
            res.json(result);
        });
    }
};