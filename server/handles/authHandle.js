"use strict";
let config = require("../config");
let totp = require('../lib/totp');
let eMailer = require("../lib/mailer");
let utils = require("../lib/utils");
let authConst = require("../lib/constants");
let async = require("async");
let asyncLoop = require('node-async-loop');
let passwordHash = require('password-hash');
let generatePassword = require('generate-password');
let moment = require("moment");
let momentTimezone = require('moment-timezone');
let _ = require("underscore");
let UserLog = require("../data/userlog");
let User = require("./../data/userModel");
let MailLog = require("../data/maillog");
let SMSLog = require("../data/smslog");
let HyperlinkSession = require("../data/hyperlinksession");
let redisAuth = require("./../lib/authRedis");
var { checkCaseInsensitive } = require("./../utils/ovutility");

let generateOtpCode = function (seed) {
    let option = {
        timestep: authConst.AuthKeys.OTP_EXPIRED,
        sha: authConst.ShaVariant.SHA_512
    };
    return totp.otp(seed, option);
};

function getStrTimeRequest(reqTime) {
    let u = 'th';
    switch (reqTime) {
        case 1:
            u = "st";
            break;
        case 2:
            u = "nd";
            break;
        case 3:
            u = "rd";
            break;
    }
    return reqTime + u;
}

function resetPassword(username, adminaccount, requesttime, _callback, action) {
    let status = false,
        msg = "",
        updateData = { 'isresetpsw': false },
        _otpPsw = generatePassword.generate({
            length: authConst.AuthKeys.LENGTH_CHAR,
            numbers: true,
            // uppercase: true,
            symbols: false,
            excludeSimilarCharacters: true,
            strict: true
        }).toUpperCase();

    if (adminaccount) updateData['locked'] = false;
    adminaccount = (adminaccount != null) ? adminaccount.name : 'system';
    // Write log mail
    writeLogMail(username, adminaccount, requesttime, action);
    // Find
    User.findOne({
        loginname: checkCaseInsensitive(username)
    }).exec(function (err, userdoc) {
        updateData['otptoken'] = _otpPsw;
        // Set new OTP Token
        User.findOneAndUpdate({ loginname: checkCaseInsensitive(username) }, {
            '$set': updateData
        }, function (err, doc) {
            if (doc != null) {
                // Send email to user for setting up new password
                const mailConfig = eMailer.getConfig(doc.email, 'Request Reset Password', [
                    "<html><body style=\"font-family: Verdana, sans-serif;\">",
                    "<span>OVAuthentication Management System Notification</span><br>",
                    "<hr style=\"height: 1px; background: #ccc; border: 0;\"><br>",
                    "<div style=\"float:left; clear: both; width: 100%;\">Dear " + doc.name + ",<br/><br/>",
                    "You received this message because you have requested to reset your password.<br><br/>",
                    "This is the " + getStrTimeRequest(requesttime) + " time that you have requested today.<br><br/>",
                    'Your OTP token is: <b style="color:#0077d6;">' + _otpPsw + '</b><br><br/>',
                    "For security, the OTP token will be expired after 2 hours. Please keep safe and do not share it with anyone.<br><br/><hr style=\"height: 1px; background: #ccc; border: 0;\"></div>",
                    "<hr style=\"height: 1px; background: #ccc; border: 0;\"></div>",
                    "<i style=\"font-size: 12px;\">You have received this notification because you are involved in it.</i></body>"
                ].join("") + "</html>");

                // Send email to user
                eMailer.send(mailConfig, (error, info) => {
                    if (error) {
                        msg = "Mail error.";
                        _callback({ status: status, message: msg, requesttime: requesttime });
                    } else {
                        // Delete old OTP Token
                        if (userdoc.otptoken) redisAuth.delCodePsw(userdoc.otptoken);
                        redisAuth.setCodePsw(_otpPsw);
                        if (requesttime === authConst.AuthKeys.RESET_PWD_NO) {
                            User.find({ sysadmin: true }).exec(function (err, docs) {
                                asyncLoop(docs, function (item, next) {
                                    var accStr = (adminaccount == 'system') ? "System" : "Admininistrator " + adminaccount;
                                    mailConfig.attachment[0].data = [
                                        "<html><body style=\"font-family: Verdana, sans-serif;\">",
                                        "<span>OVAuthentication Management System Notification</span><br>",
                                        "<hr style=\"height: 1px; background: #ccc; border: 0;\"><br>",
                                        "<div style=\"float:left; clear: both; width: 100%;\">Dear " + item.name + ",<br/><br/>",
                                        accStr + " has reset password of account " + doc.name + ".<br><br/>",
                                        "<hr style=\"height: 1px; background: #ccc; border: 0;\"></div>",
                                        "<i style=\"font-size: 12px;\">You have received this notification because you are involved in it.</i>"
                                    ].join("") + "</html>";
                                    mailConfig.to = item.email;
                                    // Send email to admin
                                    eMailer.send(mailConfig, (error, info) => {
                                        if (error) {
                                            msg = "Mail error.";
                                        } else {
                                            status = true;
                                        }
                                        next();
                                    });
                                }, function (err) {
                                    if (err) {
                                        _callback({ status: status, message: err.message, requesttime: requesttime });
                                    } else {
                                        _callback({ status: status, message: msg, requesttime: requesttime });
                                    }
                                });
                            });
                        } else {
                            _callback({ status: true, message: msg, requesttime: requesttime });
                        }
                    }
                });
            } else {
                _callback({
                    status: status,
                    message: "Account not found. Can't reset password."
                });
            }
        });
    });
}

const writeLogMail = function (username, adminaccount, requesttime, action) {
    const dateByTimezone = momentTimezone(new Date()),
        currentTimezone = momentTimezone.tz.guess(),
        strDate = dateByTimezone.tz(currentTimezone).format();

    if (action == 'write') {
        const maillog = new MailLog(_.extend({}, {
            loginname: username,
            daterequest: strDate,
            adminreset: adminaccount,
            datereset: strDate,
            requesttime: requesttime,
            lastmodified: new Date()
        }));
        // Insert Mail log
        maillog.save(function (err, result) {
            if (err) {
                throw new Error(err);
            } else {
                console.log("Write success to Mail Log.")
            }
        });
    } else {
        MailLog.find({
            loginname: checkCaseInsensitive(username),
            requesttime: requesttime
        }).sort({ lastmodified: -1 }).limit(1).exec(function (err, doc) {
            if ((doc[0]
                && doc[0].requesttime > authConst.AuthKeys.RESET_PWD_NO - 1
                && doc[0].requesttime <= authConst.AuthKeys.RESET_PWD_NO + 1)) {
                if (adminaccount && adminaccount != 'system') {
                    // Update Mail Log
                    MailLog.update({
                        loginname: checkCaseInsensitive(username),
                        requesttime: requesttime,
                        lastmodified: doc[0].lastmodified
                    }, { '$set': { adminreset: adminaccount, datereset: strDate } })
                        .exec(function (err, doc) {
                            if (err) {
                                throw new Error(err);
                            } else {
                                console.log("Write success to Mail Log.")
                            }
                        });
                }
            } else {
                console.log("Request time " + doc[0].requesttime + " invalid")
            }
        });
    }
};
let sendSMS = function (username, userphone, requesttime, token, response) {
    if (requesttime < authConst.SendSMSInfo.REQUEST_TIME + 1) {
        SMSLog.update(
            { loginname: checkCaseInsensitive(username) },
            {
                '$set': {
                    requesttime: requesttime + 1,
                    daterequest: new Date(),
                    lastmodified: new Date()
                }
            },
            {},
            function (err, content) {
                if (err) {
                    response.send({
                        status: false,
                        message: "Can not send OTP code to your phone. Please contact Administrator."
                    });
                    return;
                }
                let str = generateOtpCode(utils.generateSecretKey(username.toUpperCase()));

                const client = require('twilio')(authConst.SendSMSInfo.APIKEY, authConst.SendSMSInfo.API_SECRET);

                client.messages
                    .create({
                        body: 'ETon Notification: Your OTP Code is ' + str + '. Valid for ' + authConst.AuthKeys.OTP_SMS_EXPIRED + ' seconds',
                        from: authConst.SendSMSInfo.VIRTUAL_NUMBER,
                        to: "+" + userphone
                    })
                    .then(message => {
                        redisAuth.setCode4SMS(token, str);
                        if (message.sid) {
                            response.send({
                                status: true,
                                message: "OTP code has been sent to your phone."
                            });
                        }
                    })
                    .catch(e => {
                        if (e && e.message) {
                            SMSLog.findOneAndUpdate({
                                loginname: checkCaseInsensitive(username),
                            }, {
                                    '$set': {
                                        "errormsg": e.message
                                    }
                                }, function (err, result) { })
                            response.send({
                                status: false,
                                message: "Can not send OTP code to your phone. Please contact Administrator."
                            })
                        }
                    })
                    .done();
            });
    } else {
        response.send({
            status: false,
            message: "You have sent request for " + authConst.SendSMSInfo.REQUEST_TIME + " time today. You can not send until tommorrow."
        });
    }
}

module.exports = {
    verify: function (code, token, _callback) {
        if (typeof (_callback) !== "function") {
            throw new Error('Must define a callback for this action.');
        }
        if (!code || !token) {
            _callback(false);
        } else {
            let result = {
                status: false,
                message: "Your code is not valid."
            };
            redisAuth.getSeedStr(token).then(function (seed) {
                let verifiedCode = generateOtpCode(seed);
                redisAuth.getUsedCode(verifiedCode).then(function (code) {
                    result.message = "Your code was used.";
                    redisAuth.setLimittedCount(token, result.status);
                    _callback(result);
                }).catch(function () {
                    if (code.toString().length > 0 && code.toString() === verifiedCode.toString()) {
                        result.status = true;
                        result.message = "";
                        redisAuth.setUsedCode(verifiedCode);
                        redisAuth.delTokenBasedKey(token);
                    }
                    redisAuth.setLimittedCount(token, result.status);
                    _callback(result);
                });
            }).catch(function () {
                redisAuth.setLimittedCount(token, result.status);
                _callback(result);
            });
        }
    },
    sendEmail: function (name, username, email, _callback, token) {
        const str = generateOtpCode(utils.generateSecretKey(username.toUpperCase())),
            mailConfig = eMailer.getConfig(email, 'OVAuthen: Confirm OTP Code', [
                "<html>Hello!<br/><br/>",
                "You have just logged [" + username + "] account on OVAuthen site.<br/><br/>",
                'Your verification code is <strong style="font-size:20px; color:green;">' + str + "</strong><br/><br/>",
                "Note: The security code is valid only for <strong>" + authConst.AuthKeys.OTP_MAIL_EXPIRED + "</strong> seconds<br/><br/>",
                "Thanks!"
            ].join("") + "</html>");

        let status = false, msg = "";
        eMailer.send(mailConfig, (error, info) => {
            if (error) {
                msg = "Mail error.";
            } else {
                msg = "Please, get your code from e-email.";
                status = true;
                redisAuth.setCode4Mail(token, str);
            }
            _callback({
                status: status,
                message: msg
            });
        });
    },
    inform2FA: function (username, email, content = "") {
        return new Promise(function (resolve, reject) {
            const mailConfig = eMailer.getConfig(email, 'OVAuthen: Two Factor Authentication - Notification', [
                `<html>Dear ${username},<br/><br/>`, content,
                "Please notify us if it’s not your request for this change.<br/><br/>",
                "Thanks!"
            ].join("") + "</html>");

            let status = false, msg = "";
            eMailer.send(mailConfig, (error, info) => {
                if (error) {
                    msg = `Mail error: ${error}`;
                } else {
                    msg = `Email has been sent to ${email} about the changing of Two-step Verification.`;
                    status = true;
                }
                resolve({
                    status: status,
                    message: msg
                });
            });
        });
    },
    sendSMS: function (username, countrycode, phone, response, token) {
        if (phone == "") {
            response.send({
                status: false,
                message: "Your account is not have phone number."
            });
            return;
        }
        // let dateByTimezone = momentTimezone(new Date()),
        //     currentTimezone = momentTimezone.tz.guess(),
        //     strDate = dateByTimezone.tz(currentTimezone).format();
        // Find user request sms if request time < 3 then send sms else prevent send sms and alert msg 
        SMSLog.findOne({
            loginname: checkCaseInsensitive(username)
        }, function (err, doc) {
            let userphone = (countrycode + phone).trim().replace(/\D/gi, '');
            if (!doc) {
                let smslog = new SMSLog(_.extend({}, {
                    loginname: username,
                    daterequest: new Date(),
                    requesttime: 1,
                    lastmodified: new Date()
                }));
                // Insert SMS log
                smslog.save(function (err, result) {
                    sendSMS(username, userphone, 1, token, response);
                });
            } else {
                // Check day request
                var lastReqDate = doc.daterequest,
                    currentDate = new Date();
                // If last request date diff to current date and equal to 3 time request
                if (Date.parse(lastReqDate) < Date.parse(currentDate)
                    && (new Date(lastReqDate)).toDateString() != (new Date(currentDate)).toDateString()) {
                    SMSLog.findOneAndUpdate({
                        loginname: checkCaseInsensitive(username)
                    }, {
                            '$set': {
                                "requesttime": 1
                            }
                        }, function (err, result) {
                            SMSLog.findOne({
                                loginname: checkCaseInsensitive(username)
                            }, function (err, doc) {
                                sendSMS(username, userphone, doc.requesttime, token, response);
                            })
                        })
                } else {
                    sendSMS(username, userphone, doc.requesttime, token, response);
                }
            }
        });
    },
    authValidateOTPCode: function (_otpcode, _callback) {
        let result = {
            status: false,
            message: "Your code is not valid"
        }
        redisAuth.getCodePsw(_otpcode).then(function (otpcode) {
            if (_otpcode === otpcode) {
                result.status = true;
                result.message = "Validation OTP Token successful.";
                redisAuth.delCodePsw(_otpcode);
            }
            _callback(result);
        }).catch(function () {
            _callback(result);
        });
    },
    authConfirmChangePsw: function (params, _callback) {
        let pswPattern = /^[\S]{8,}$/,
            result = {
                status: false,
                message: "Can not change password"
            }
        // newpsw, confirmnewpsw
        if (!params.newpsw || !params.confirmnewpsw) {
            result.message = "Please input " + (!params.newpsw ? "new password" : "confirm password");
            _callback(result);
            return;
        }
        if (params.newpsw === params.confirmnewpsw) {
            if (!pswPattern.test(params.newpsw)) {
                result.message = 'Password must be contain at least 8 character and none whitespace character';
                _callback(result);
                return;
            } else {
                let updateData = {
                    'password': passwordHash.generate(params.confirmnewpsw),
                    'isresetpsw': false
                };
                User.findOneAndUpdate({ loginname: checkCaseInsensitive(params.loginname) }, {
                    '$set': updateData
                }, function (err, doc) {
                    if (!err && doc) {
                        result.status = true;
                        result.message = "Update successful";
                        if (params.querytoken) {
                            HyperlinkSession.findOneAndUpdate({
                                token: params.querytoken,
                            }, { '$set': { "expired": utils.getUTCDate() } }, function (err, doc) { })
                        }
                    }
                    _callback(result);
                });
            }
        } else {
            result.message = "New password and confirm password are not match";
            _callback(result);
        }
    },
    forgotPasswordViaEmail: function (name, username, email, _callback) {
        async.waterfall([
            function (callback) {
                // Check is next day
                MailLog.findOne({
                    loginname: checkCaseInsensitive(username)
                })
                    .sort({ lastmodified: -1 }).limit(1)
                    .exec(function (err, doc) {
                        if (!doc) {
                            callback(null, { isvaliddate: false });
                        } else {
                            const lastReqDate = doc.daterequest,
                                currentDate = new Date();
                            // If last request date diff to current date and equal to 3 time request
                            if (Date.parse(lastReqDate) < Date.parse(currentDate)
                                && (new Date(lastReqDate)).toDateString() != (new Date(currentDate)).toDateString()) {
                                User.findOneAndUpdate({
                                    loginname: checkCaseInsensitive(username)
                                }, {
                                        '$set': { "requesttime": 0, "isresetpsw": false }
                                    }, function (err, doc) {
                                        let status = false;
                                        if (!err && doc) {
                                            status = true;
                                        }
                                        callback(null, { isvaliddate: status });
                                    })
                            } else {
                                callback(null, { isvaliddate: false });
                            }
                        }
                    });
            },
            function (data, callback) {
                User.findOne({
                    loginname: checkCaseInsensitive(username),
                    isdeleted: 0
                }, function (err, doc) {
                    if (doc && doc.locked) {
                        _callback({
                            status: false,
                            message: "Your account has been locked. You can contact the Administrator to unlock your account.",
                            requesttime: doc.requesttime
                        });
                    } else {
                        if (!err && doc) {
                            let requestTime = doc.requesttime + 1;
                            // Check is request on day and lower than 4th time
                            if (requestTime <= authConst.AuthKeys.RESET_PWD_NO) {
                                User.findOneAndUpdate({ loginname: checkCaseInsensitive(username), locked: false }, {
                                    '$set': {
                                        'isresetpsw': requestTime === authConst.AuthKeys.RESET_PWD_NO,
                                        'locked': (requestTime < authConst.AuthKeys.RESET_PWD_NO) ? doc.locked : true,
                                        "requesttime": requestTime,
                                        "lastmodified": new Date()
                                    }
                                }, function (err, doc) {
                                    if (err || !doc) {
                                        _callback({
                                            status: false,
                                            message: "Your account has problem. Please contact the Administrator."
                                        });
                                    } else {
                                        if (requestTime < authConst.AuthKeys.RESET_PWD_NO) {
                                            resetPassword(doc.loginname, null, requestTime, _callback, 'write');
                                        } else {
                                            _callback({ status: true, message: "", requesttime: requestTime });
                                        }
                                    }
                                });
                            } else {
                                _callback({
                                    status: false,
                                    message: `You cannot reset password over ${authConst.AuthKeys.RESET_PWD_NO} times per day.`
                                });
                            }
                        } else {
                            _callback({ status: false, message: "Username doesn't exist." });
                        }
                    }
                });
            }
        ], function (err, result) {

        });
    },
    unlockAccount: function (username, requestTime, _callback) {
        writeLogMail(username, '', requestTime, 'write');
        let status = false, msg = "Mail error. Please contact the administrator to handle this.";
        User.findOne({
            loginname: checkCaseInsensitive(username),
            isdeleted: 0
        }, function (err, doc) {
            const mailConfig = eMailer.getConfig(doc.email, 'Request Reset Password', [
                "<html><body style=\"font-family: Verdana, sans-serif;\">",
                "<span>OVAuthentication Management System Notification</span><br>",
                "<hr style=\"height: 1px; background: #ccc; border: 0;\"><br>",
                "<div style=\"float:left; clear: both; width: 100%;\">Dear " + doc.name + ",<br/><br/>",
                "You received this message because you have requested to reset your password.<br><br/>",
                "This is the " + getStrTimeRequest(requestTime) + " time that you have requested today. Your account has been locked.<br><br/>",
                "Please wait for administrator to reset your password or the link to reset password will be sent to you after 24 hours.<br><br/>",
                "Don't recognize this activity? Please contact the administrators immediately to keep your account safety.<br><br/>",
                "<hr style=\"height: 1px; background: #ccc; border: 0;\"></div>",
                "<i style=\"font-size: 12px;\">You have received this notification because you are involved in it.</i></body>"
            ].join("") + "</html>")
            eMailer.send(mailConfig, (error, info) => {
                if (error) {
                    _callback({ status: status, message: msg, requesttime: requestTime });
                } else {
                    // Send Email forgot password for role Admin
                    User.find({ sysadmin: true }).exec(function (err, docs) {
                        asyncLoop(docs, function (item, next) {
                            mailConfig.attachment[0].data = [
                                "<html><body style=\"font-family: Verdana, sans-serif;\">",
                                "<span>OVAuthentication Management System Notification</span><br>",
                                "<hr style=\"height: 1px; background: #ccc; border: 0;\"><br>",
                                "<div style=\"float:left; clear: both; width: 100%;\">Dear " + item.name + ",<br/><br/>",
                                "User " + doc.name + " has sent a request to reset password. This account has been locked.<br><br/>",
                                "This is the " + getStrTimeRequest(requestTime) + " time this user has requested today. And he/she sent a request to unlock account.<br><br/>",
                                "Please kindly review and do the request.<br><br/>",
                                "<hr style=\"height: 1px; background: #ccc; border: 0;\"></div>",
                                "<i style=\"font-size: 12px;\">You have received this notification because you are involved in it.</i>"
                            ].join("") + "</html>";
                            mailConfig.to = item.email;
                            eMailer.send(mailConfig, (error, info) => {
                                if (!error) {
                                    status = true;
                                    msg = "";
                                }
                                next();
                            });
                        }, function (err) {
                            if (err) {
                                msg = err.message;
                            }
                            _callback({ status: status, message: msg, requesttime: requestTime });
                        });
                    });
                }

            });
        });
    },
    checkExpireHyperlink: function (_token, _callback) {
        HyperlinkSession.findOne({
            token: _token
        }, function (err, doc) {
            let result = {
                status: false,
                message: "Your access link are invalid.",
                data: null
            }
            if (doc) {
                let currentTime = Date.parse(utils.getUTCDate()), expiredTime = Date.parse(doc.expired);
                // Check expire hyperlink
                if (currentTime > expiredTime) {
                    result.message = "Your current link is expired."
                } else {
                    result.status = true;
                    result.data = {
                        username: doc.account
                    }
                    result.message = "";
                }
            }
            _callback(result);
        });
    },
    resetPassword: function (username, adminaccount, requesttime, _callback) {
        // Send mail attach hyperlink && unlocked account
        let token = generatePassword.generate({
            length: 15,
            numbers: true,
            symbols: false,
            excludeSimilarCharacters: true,
            strict: true
        }), hyperlink = `${config.baseURL}/#/login?token=${token}`;
        // Write Log mail
        writeLogMail(username, adminaccount, requesttime, 'update');
        // Update Account
        User.findOneAndUpdate({ loginname: checkCaseInsensitive(username) }, {
            '$set': {
                'isresetpsw': false,
                'locked': false
                // 'requesttime': requesttime
            }
        }, function (err, doc) {
            if (doc != null) {
                // Send email to user for setting up new password
                const mailConfig = eMailer.getConfig(doc.email, 'Request Reset Password', [
                    "<html><body style=\"font-family: Verdana, sans-serif;\">",
                    "<span>OVAuthentication Management System Notification</span><br>",
                    "<hr style=\"height: 1px; background: #ccc; border: 0;\"><br>",
                    "<div style=\"float:left; clear: both; width: 100%;\">Dear " + doc.name + ",<br/><br/>",
                    "Your account has been Unlocked. Please click to the link below for creating new the password: <br><br/>",
                    `<a href="${hyperlink}">${hyperlink}</a><br><br/>`,
                    "For security, the hyperlink will be expired after 24 hours. Please keep safe and do not share it with anyone.<br><br/><hr style=\"height: 1px; background: #ccc; border: 0;\"></div>",
                    "<hr style=\"height: 1px; background: #ccc; border: 0;\"></div>",
                    "<i style=\"font-size: 12px;\">You have received this notification because you are involved in it.</i></body>"
                ].join("") + "</html>");
                // Send email to user
                eMailer.send(mailConfig, (error, info) => {
                    if (error) {
                        _callback({ status: false, message: "Mail error", requesttime: requesttime });
                    } else {
                        // Save to new collection (hyperlinksession)
                        const hyperlinksession = new HyperlinkSession({
                            account: username,
                            expired: authConst.AuthKeys.HYPERLINK_EXPIRED_TIME,
                            token: token
                        });
                        // Insert Mail log
                        hyperlinksession.save(function (err, result) {
                            if (err) _callback({ status: false, message: err });
                            else _callback({ status: true, message: "Unlocked account successful" });
                        });
                        // Send email to list specify admin
                        // User.find({ sysadmin: true }).exec(function (err, docs) {
                        //     asyncLoop(docs, function (item, next) {
                        //         mailConfig.attachment[0].data = [
                        //             "<html><body style=\"font-family: Verdana, sans-serif;\">",
                        //             "<span>OVAuthentication Management System Notification</span><br>",
                        //             "<hr style=\"height: 1px; background: #ccc; border: 0;\"><br>",
                        //             "<div style=\"float:left; clear: both; width: 100%;\">Dear " + item.name + ",<br/><br/>",
                        //             "Admininistrator " + adminaccount + " has reset password of account " + doc.name + ".<br><br/>",
                        //             "<hr style=\"height: 1px; background: #ccc; border: 0;\"></div>",
                        //             "<i style=\"font-size: 12px;\">You have received this notification because you are involved in it.</i>"
                        //         ].join("") + "</html>";
                        //         mailConfig.to = item.email;
                        //         // Send email to admin
                        //         eMailer.send(mailConfig, (error, info) => {
                        //             if (error) {
                        //                 msg = "Mail error.";
                        //             } else {
                        //                 status = true;
                        //             }
                        //             next();
                        //         });
                        //     }, function (err) {
                        //         if (err) {
                        //             _callback({ status: status, message: err.message, requesttime: requesttime });
                        //         } else {
                        //             _callback({ status: status, message: msg, requesttime: requesttime });
                        //         }
                        //     });
                        // });
                    }
                });
            } else {
                _callback({
                    status: status,
                    message: "Account not found. You can not perform this action."
                });
            }
        });
    },
    verifyViaEmail: function (code, token, _callback) {
        if (typeof (_callback) !== "function") {
            throw new Error('Must define a callback for this action.');
        }
        if (!code || !token) {
            _callback(false);
        } else {
            let result = {
                status: false,
                message: "Your code is not valid."
            }
            redisAuth.getCode4Mail(token).then(function (verifiedCode) {
                if (code.toString().length > 0 && code.toString() === verifiedCode.toString()) {
                    redisAuth.delTokenBasedKey(token);
                    result.status = true;
                    result.message = "";
                }
                _callback(result);
            }).catch(function () {
                _callback(result);
            });
        }
    },
    verifyViaSMS: function (code, token, _callback) {
        if (typeof (_callback) !== "function") {
            throw new Error('Must define a callback for this action.');
        }
        if (!code || !token) {
            _callback(false);
        } else {
            let result = {
                status: false,
                message: "Your code is not valid."
            }
            redisAuth.getCode4SMS(token).then(function (verifiedCode) {
                if (code.toString().length > 0 && code.toString() === verifiedCode.toString()) {
                    redisAuth.delTokenBasedKey(token);
                    result.status = true;
                    result.message = "";
                }
                _callback(result);
            }).catch(function () {
                _callback(result);
            });
        }
    },
    verifyViaApp: function (username, token, deviceno) {
        return new Promise(function (resolve, reject) {
            redisAuth.getAppToken(token).then(function (val) {
                if (val === token && username && deviceno) {
                    let Account = require("./../data/userModel");
                    const searchParams = {
                        loginname: username,
                        'device.serialno': deviceno,
                        isdeleted: 0,
                        locked: false
                    };
                    Account.findOne(searchParams, function (err, doc) {
                        if (doc) {
                            redisAuth.setAppToken(username + token + deviceno, username + token + deviceno, function (err, resp) {
                                resolve(true);
                            });
                        } else {
                            reject(null);
                        }
                    });
                } else {
                    reject(null);
                }
            }).catch(function () {
                reject(null);
            });
        });
    },
    verifyViaGA: function (username, code) {
        return new Promise(function (resolve, reject) {
            const searchParams = {
                loginname: username,
                isdeleted: 0,
                locked: false
            };
            let Account = require("./../data/userModel");

            // get GoogleAuthenticator object
            var GA = require('otp.js').googleAuthenticator;
            let result = {
                status: false,
                message: "Your code is not valid."
            }

            Account.findOne(searchParams, function (err, doc) {
                if (doc && doc.secrettoken) {
                    try {
                        var votp = GA.verify(code, doc.secrettoken);
                        result['status'] = votp != null;
                    }
                    catch (ex) {
                        result['status'] = false;
                    }
                    if (result['status']) {
                        result['message'] = "";
                    }
                    resolve(result);
                } else {
                    resolve(result);
                }
            });
        });
    },
    expireSession: function (params) {
        return new Promise(function (resolve, reject) {
            let accountSession = require("./../data/userSessionModel");
            const dataUpdated = {
                account: params.account,
                expired: moment().format('01/01/1970'),
                lastmodified: moment()
            };
            /*accountSession.update({account: params.account, token: params.token}, {'$set': dataUpdated}, {upsert: true},
             function (err, obj) {
             resolve(obj);
             });*/
            //            return;
            accountSession.remove({ account: checkCaseInsensitive(params.account), token: params.token },
                function (err, obj) {
                    resolve(obj);
                });
        });
    },
    createSession: function (account, token) {
        return new Promise(function (resolve, reject) {
            let accountSession = require("./../data/userSessionModel");
            const dataUpdated = {
                account: account,
                token: token,
                expired: moment().add(config.sessionTimeout, 'm'),
                lastmodified: moment()
            };
            accountSession.update({ account: checkCaseInsensitive(account), token: token }, { '$set': dataUpdated }, { upsert: true },
                function (err, obj) {
                    resolve(obj);
                });
        });
    },
    checkSession: function (account, token) {
        return new Promise(function (resolve, reject) {
            let accountSession = require("./../data/userSessionModel");
            let hasSession = false;
            accountSession.findOne({ account: checkCaseInsensitive(account), token: token }, function (err, doc) {
                if (!err && doc && token === doc.token && doc.expired.toISOString() > moment().toISOString()) {
                    hasSession = true;
                }
                resolve(hasSession);
            });
        });
    },
    userLog: function (data) {
        if (utils.objectSize(data) > 0) {
            var userlog = new UserLog(_.extend({}, data));

            userlog.save(function (err) {
                if (err)
                    throw new Error(err);
            });
        }
    },
    sendOTPCode: function (username, userphone) {
        let str = generateOtpCode(utils.generateSecretKey(username.toUpperCase()));
        const client = require('twilio')(authConst.SendSMSInfo.APIKEY, authConst.SendSMSInfo.API_SECRET);
        return client.messages
            .create({
                body: 'ETon Notification: Your OTP Code is ' + str + '. Valid for ' + authConst.AuthKeys.OTP_SMS_EXPIRED + ' seconds',
                from: authConst.SendSMSInfo.VIRTUAL_NUMBER,
                to: "+" + userphone
            });
    },
    sendOTPEmail: function (username, email, _callback) {
        const str = generateOtpCode(utils.generateSecretKey(username.toUpperCase())),
            mailConfig = eMailer.getConfig(email, 'OVAuthen: Confirm OTP Code', [
                "<html>Hello!<br/><br/>",
                "You have just logged [" + username + "] account on OVAuthen site.<br/><br/>",
                'Your verification code is <strong style="font-size:20px; color:green;">' + str + "</strong><br/><br/>",
                "Note: The security code is valid only for <strong>" + authConst.AuthKeys.OTP_MAIL_EXPIRED + "</strong> seconds<br/><br/>",
                "Thanks!"
            ].join("") + "</html>");

        let status = false, msg = "";
        eMailer.send(mailConfig, (error, info) => {
            if (error) {
                msg = "Mail error.";
            } else {
                msg = "Please, get your code from e-email.";
                status = true;
            }
            _callback({
                status: status,
                message: msg
            });
        });
    }
};