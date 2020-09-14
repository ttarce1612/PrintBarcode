var _ = require("underscore");
const requestAPI = require("request");

const Sites = [];

function apiRequest(uri, params, method, options) {
    return new Promise(function (resolve, reject) {
        requestAPI(_.extend({
            uri: uri,
            method: method || "post",
            body: params || {},
            json: true
        }, options || {}), function (err, res, body) {
            resolve(body);
        });
    });
}

module.exports = {
    transferObject: function (destinyObj, sourceObj) {
        validObj = (_.keys(destinyObj).length <= _.keys(sourceObj).length) ? destinyObj : sourceObj;
        _.each(_.keys(validObj), function (key) {
            _.extend(destinyObj, (key in destinyObj) ? _.pick(sourceObj, key) : {});
        });
        return destinyObj;
    },
    sendNotification: function (contents) {
        var messageData = {
            app_id: "209ddabe-399c-443a-9ff7-77e828168f20",
            contents: { "en": contents },
            included_segments: ['All']
        };
        var headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic NjI1NWEzYTItZTgzYS00ZjM1LTgzZDAtMGY5YWQ3MzRmYmU3"
        };
        var options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };
        var https = require('https');
        var req = https.request(options, function (res) {
            res.on('messageData', function (messageData) {
                console.log("Response:");
                console.log(JSON.parse(messageData));
            });
        });
        req.on('error', function (e) {
            console.log(e);
        });
        req.write(JSON.stringigy(messageData));
        req.end();
    },
    parseAccountInfo: function (account) {
        let _account = {};
        if (account && Object.keys(account).length) {
            Object.assign(_account, account);
            delete _account.password;
            delete _account.isdeleted;
            delete _account.lastmodified;
            delete _account.locked;

            _account.authenticated = true;
            if (_account.is2fa && typeof (_account.is2fa) !== "boolean") {
                _account.is2fa = false;
            }
        }
        return _account;
    },
    invokeAPI: apiRequest,
    checkCaseInsensitive: function (value) {
        return new RegExp("^(" + value + ")$", "i");
    }
}