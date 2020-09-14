//let client = require('redis').createClient();
let _authCookie = require("../lib/authCookie");
let Account = require("./../data/userModel");

function verifyAccountState(searchParams) {
    return new Promise(function (resolve, reject) {
        if (!searchParams) {
            searchParams = {};
        }
        Object.assign(searchParams, {locked: false, isdeleted: 0});
        Account.findOne(searchParams, function (err, data) {
            let result = {
                code: 404,
                message: "Your account has been locked/deleted. Please contact the Administrator.",
                status: false
            };
            if (data) {
                result.code = 200;
                result.message = "";
                result.status = true;
            }
            resolve(result);
        });
    });
}

function verifyAuthState(req) {
    return new Promise(function (resolve, reject) {
        let result = {
            status: false,
            message: 'You are expired. Please sign-in again.',
            code: 403
        };
        let _token = _authCookie.retrieve(req, "APISID"), _key = _authCookie.retrieve(req, "SID");        
        if (typeof (_token) === 'string' && typeof (_key) === 'string') {
            const loginName = _authCookie.getTopSecret(req);
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

module.exports = {
    verifyAuthState: function (req, _callback) {
        verifyAuthState(req).then(function (result) {
            _callback(result);
        });
    },
    verifyAccountState: verifyAccountState,
    verifyState: function (req, callback) {
        verifyAuthState(req).then(function (result) {
            if (result.status) {
                let _token = _authCookie.retrieve(req, "APISID"),
                        _account = _authCookie.getTopSecret(req);
                if (_token && _account && typeof (_token) === "string" && typeof (_account) === "string") {
                    verifyAccountState({loginname: _account}).then(function (result2) {
                        callback(result2);
                    });
                } else {
                    callback({
                        status: false,
                        message: 'You are expired. Please sign-in again.',
                        code: 403
                    });
                }
            } else {
                callback(result);
            }
        });
    },
    verifyAccountHelps(req) {
        return new Promise(function (resolve, reject) {
            let result = {
                status: false,
                message: 'You are expired. Please sign-in again.',
                code: 403
            };
            let _loginName = req.body.loginname;
            let _token = req.body.token;
            require("./../handles/authHandle").checkSession(_loginName, _token).then(function (val) {
                result.status = val;
                if (val) {
                    result.code = 200;
                    result.message = "";
                }
                resolve(result);
            });
        });
    }
};