/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */
'use strict';
let cRedis = require("redis").createClient();
const { AuthKeys } = require("./constants");

function get(key) {
    return new Promise(function (resolve, reject) {
        cRedis.get(key, function (err, data) {
            if (data !== undefined && data !== "" && data !== null) {
                resolve(data);
            } else {
                reject(null);
            }
        });
    });
}

function setex(key, value, seconds, func) {
    cRedis.setex(key, seconds, value, func);
}

function deltex(key) {
    cRedis.del(key);
}

function setSeedStr(token, seedstr) {
    setex(AuthKeys.OTP_SEED + token, seedstr, 60 * 60);
}

function setCodePsw(opt) {
    setex(opt.toString(), opt.toString(), AuthKeys.OTP_PSW_EXPIRED);
}

function setCode4Mail(token, otp) {
    // setex(AuthKeys.OTP_MAIL + token, otp, AuthKeys.OTP_MAIL_EXPIRED * 60);
    // Set timeout for OTP Code - Email
    setex(AuthKeys.OTP_MAIL + token, otp, AuthKeys.OTP_MAIL_EXPIRED);
}

function setCode4SMS(token, otp) {
    // Set timeout for OTP Code - SMS
    setex(AuthKeys.OTP_SMS + token, otp, AuthKeys.OTP_SMS_EXPIRED);
}

function setUsedCode(opt) {
    setex(opt.toString(), opt.toString(), AuthKeys.OTP_EXPIRED);
}

function setLimittedCount(token, del) {
    if (del === true) {
        deltex(AuthKeys.OTP_COUNTS_NAME + token);
    } else {
        cRedis.get(AuthKeys.OTP_COUNTS_NAME + token, function (err, count) {
            count = count || 1;
            cRedis.set(AuthKeys.OTP_COUNTS_NAME + token, ++count);
        });
    }
}

function setAppToken(token, value, func) {
    setex(AuthKeys.TOKEN_APP_NAME + token, value, AuthKeys.TOKEN_APP_EXPIRED * 60, func);
}

function getSeedStr(token) {
    return get(AuthKeys.OTP_SEED + token);
}

function getCodePsw(code) {
    return get(code.toString());
}

function getUsedCode(code) {
    return get(code.toString());
}

function getCode4Mail(token) {
    return get(AuthKeys.OTP_MAIL + token);
}

function getCode4SMS(token) {
    return get(AuthKeys.OTP_SMS + token);
}

function getLimittedCount(token) {
    return new Promise(function (resolve, reject) {
        cRedis.get(AuthKeys.OTP_COUNTS_NAME + token, function (err, data) {
            data = data || 0;
            resolve(data);
        });
    });
}

function getAppToken(token) {
    return get(AuthKeys.TOKEN_APP_NAME + token);
}

function delSeedStr(token) {
    deltex(AuthKeys.OTP_SEED + token);
}

function delCodePsw(code) {
    deltex(code.toString());
}

function delUsedCode(code) {
    deltex(code.toString());
}

function delCode4Mail(token) {
    deltex(AuthKeys.OTP_MAIL + token);
}

function delCode4SMS(token) {
    deltex(AuthKeys.OTP_SMS + token);
}

function delAppToken(token) {
    deltex(AuthKeys.TOKEN_APP_NAME + token);
}

exports.setSeedStr = setSeedStr;
exports.setCodePsw = setCodePsw;
exports.setUsedCode = setUsedCode;
exports.setCode4Mail = setCode4Mail;
exports.setCode4SMS = setCode4SMS;
exports.setLimittedCount = setLimittedCount;
exports.setAppToken = setAppToken;

exports.getSeedStr = getSeedStr;
exports.getCodePsw = getCodePsw;
exports.getUsedCode = getUsedCode;
exports.getCode4Mail = getCode4Mail;
exports.getCode4SMS = getCode4SMS;
exports.getLimittedCount = getLimittedCount;
exports.getAppToken = getAppToken;

exports.delSeedStr = delSeedStr;
exports.delCodePsw = delCodePsw;
exports.delUsedCode = delUsedCode;
exports.delCode4Mail = delCode4Mail;
exports.delCode4SMS = delCode4SMS;
exports.delAppToken = delAppToken;

exports.delTokenBasedKey = function (token) {
    delSeedStr(token);
    delCodePsw(token);
    delUsedCode(token);
    delCode4Mail(token);
    delCode4SMS(token);
    delAppToken(token);
    setLimittedCount(token, true);
};