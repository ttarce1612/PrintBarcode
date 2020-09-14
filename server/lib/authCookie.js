var _cookie = require("cookie");
var jsCrypto = require("crypto-js");
var config = require("../config");

var localCookie = {
    APISID: null,//token
    SID: null,//user name
    SSID: null,//ip
    _id: null,//user id
    _ref: null//undefined
};

function encrypt(plain, key) {
    return jsCrypto.AES.encrypt(plain, key).toString();
}

function decrypt(cipher, key) {
    return jsCrypto.AES.decrypt(cipher, key).toString(jsCrypto.enc.Utf8);
}

function reverseStr(str, separator, regex, replace) {
    return str.split(separator).reverse().join('').replace(regex, replace);
}

function createSalt(key) {
    return reverseStr(key, '', /\s/g, "").toLowerCase();
}

function generate(message, key, salt) {
    if (typeof (message) !== "string" || typeof (key) !== "string") {
        return null;
    }
    if (typeof (salt) !== 'string') {
        salt = createSalt(key);
    }
    return encrypt(message, salt + key);
}

function encodeBase64(str) {
    const key = require("./utils").generateKey();
    let text = "";
    for (let i in str) {
        let ex = key[i] || key.substr(0, 1);
        text += str[i] + ex;
    }
    return require("./utils").base64Encode(text);
}

function setup(data) {
    var __key__ = reverseStr(data.token, '', /\s\W\D/g, "");
    var _key = generate(data.loginname, __key__);
    var _token = generate(data.token, _key);
    var _id = generate(data._id.toString(), _key);
    var _ip = generate(data.ip, _key);
    var _ref = generate(new Date().toUTCString(), _key);
    return {
        APISID: _token,
        SID: _key,
        SSID: _ip,
        _id: _id,
        _ref: _ref,
        XREF: encodeBase64(data.loginname)
    };
}

function parse(cookie) {
    return _cookie.parse(cookie || '');
}

module.exports = {
    store: function (response, _data) {
        if (response && _data) {
            /*response.setHeader('Set-Cookie', _cookie.serialize('_ref', _data._ref, {
                httpOnly: true,
                expires: 60 * 60 * 24 * 7
            }));*/
            response.cookie("APISID", _data.APISID, {
                httpOnly: true,
                expires: config.cookieTimeout,
                sameSite: true,
                // secure: true
            });
            response.cookie("SID", _data.SID, {
                httpOnly: false,
                expires: config.cookieTimeout,
                sameSite: true,
                // secure: true
            });
            response.cookie("SSID", _data.SSID, {
                httpOnly: true,
                expires: config.cookieTimeout,
                sameSite: true,
                // secure: true
            });
            // response.cookie("_id", _data._id, {
            //     httpOnly: true,
            //     //domain: '.eton.vn',
            //     sameSite: true,
            //     //secure: true
            // });
            // response.cookie("_ref", _data._ref, {
            //     httpOnly: true,
            //     domain: '.devhost.com',
            //     expires: config.cookieTimeout,
            //     // sameSite: true,
            //     secure: true
            // });
        }
    },
    retrieve: function (request, name) {
        if (!request.headers.cookie && !request.body.cookie) {
            return null;
        }
        // Request Body Cookie is from c-Helps, Request Header Cookie is from OVAuthen
        var _json = request.body && request.body.cookie ? parse(request.body.cookie) : parse(request.headers.cookie);
        if (_json && name) {
            return _json[name];
        }
        return _json;
    },
    getObj: function (data) {
        return setup(data);
    },
    getRawVal: function (val, key) {
        return decrypt(val, createSalt(key) + key);
    },
    getSecretKey: function (_token, _key) {
        if (!_token || !_key) return false;
        let _salt = createSalt(_key),
            originalToken = decrypt(_token, _salt + _key),
            __key__ = reverseStr(originalToken, '', /\\/g, ''), __salt__ = createSalt(__key__);
        return decrypt(_key, __salt__ + __key__);
    },
    getTopSecret: function (request) {
        let _json = request.body && request.body.cookie ? parse(request.body.cookie) : parse(request.headers.cookie);
        let _token = _json["APISID"],
            _key = _json["SID"];
        if (!_token || !_key) return false;
        let _salt = createSalt(_key),
            originalToken = decrypt(_token, _salt + _key),
            __key__ = reverseStr(originalToken, '', /\\/g, ''), __salt__ = createSalt(__key__);
        return decrypt(_key, __salt__ + __key__);
    },
    getToken: function(request) {
        let _json = request.body && request.body.cookie ? parse(request.body.cookie) : parse(request.headers.cookie);
        return _json["APISID"]||"";
    },
    clear: function (response, name, opt) {
        if (name) {
            response.clearCookie(name, opt);
        } else {
            //code here
        }
    }
};