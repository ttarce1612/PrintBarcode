/**
 * Centralize System
 * Modified by: Duy Huynh
 * Modified date: 2020/01
 */
const authCookie = require("./authCookie");

exports.register = (httpServer) => {
    const authSocket = require("./../sockets/authSocket");
    require("./../utils/ovsocketUtility").init(httpServer);
    authSocket.initAuth();
}

exports.verifyAuthState = function verifyAuthState(req) {
    return new Promise(function (resolve, reject) {
        let result = {
            status: false,
            message: 'You are expired. Please sign-in again.',
            code: 403
        };
        let _token = authCookie.retrieve(req, "APISID"), _key = _authCookie.retrieve(req, "SID");  

        if (typeof (_token) === 'string' && typeof (_key) === 'string') {
            const loginName = authCookie.getTopSecret(req);

            let accountSession = require("./../data/userSessionModel");
            let hasSession = false;
            accountSession.findOne({ account: checkCaseInsensitive(account), token: token }, function (err, doc) {
                if (!err && doc && token === doc.token && doc.expired.toISOString() > moment().toISOString()) {
                    hasSession = true;
                }
                resolve(hasSession);
            });

            require("./../handles/authHandle").checkSession(loginName, _token).then(function (val) {
                result.status = val;
                if (val) {
                    result.code = 200;
                    result.message = "";
                }
                resolve(result);
            });
        } else {
            resolve(result);
        }
    });
}

