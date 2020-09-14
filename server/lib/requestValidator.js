/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */
'use strict';
const { verifyAuthState } = require("./baseController");
const { retrieve, getTopSecret } = require("./authCookie");
let authSocket = require("./../sockets/authSocket");
module.exports = function (req, res, next) {
    verifyAuthState(req, function (result) {
        let _account = getTopSecret(req), _token = retrieve(req, "APISID");
        if (result.status) {
            let uriPath = (req.baseUrl + req.path).replace(/[\\\/]+/g, "");
            if (uriPath !== "apioviotauthlogout") {
                let { createSession } = require("./../handles/authHandle");
                createSession(_account, _token).then(function (value) {
                    authSocket.sendNotification("auth_update_session_client", { account: _account, token: _token });
                });
            }
            next();
        } else {
            authSocket.sendNotification("token_expired", { token: _token, message: result.message });
            res.status(200);
            res.json(result);
        }
    });
};