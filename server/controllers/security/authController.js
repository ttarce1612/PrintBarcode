var Account = require("../../data/userModel");
var Authenticator = require("../../data/authenticator");
var _ = require("lodash");
var TokenGenerator = require('uuid-token-generator');
var passwordHash = require('password-hash');
var async = require("async");
var ovutility = require("../../utils/ovutility");
const authHandle = require("../../handles/authHandle"),
    accountHandle = require("../../handles/accountHandle");
// syncHandle = require('./../../handles/syncHandle');
let authConst = require("./../../lib/constants");
let _authCookie = require("./../../lib/authCookie");
let baseCtrl = require("./../../lib/baseController");
var socket = require("./../../sockets/authSocket");
var utils = require("./../../lib/utils");
var sortObj = require('sort-object');
var { checkCaseInsensitive } = require("./../../utils/ovutility");
let redisAuth = require("./../../lib/authRedis");
const { baseURL, ovauthURL } = require('../../config')
const  tokenAPI  = require('../../env_config.json').tokenAPI

function controlAuthCookie(req, res, loginname, token, result) {
    accountHandle.retrieve({ loginname: loginname }).then(__resp => {
        if (__resp.Status) {
            let _account = __resp.Data;
            _account["token"] = token;
            _account["ip"] = req.ip;

            const dataObj = _authCookie.getObj(_account);
            _authCookie.store(res, dataObj);
            result["_refs_"] = JSON.stringify(dataObj);

            require("./../../handles/authHandle").createSession(_account.loginname, dataObj.APISID).then(function (data) {
                res.send(result);
            });
        } else {
            res.send(result);
        }
    });
}

module.exports = {
    setupSession: function (req, res) {
        if (req.query && req.query.ref) {
            let _ref = JSON.parse(req.query.ref);
            _authCookie.store(res, _ref);
            const path = require('path');
            res.sendFile(path.join(__dirname, '../../../src/assets', 'file.png'));
        }

    },
    authSSO: function (req, res) {
        let authenticator = { authenticated: false, message: '' };
        if (req.headers.cookie) {
            const _userCookie = _authCookie.getTopSecret(req);
            if (_userCookie) {
                async.waterfall([
                    function (callback) {
                        Account.find({ loginname: _userCookie, isdeleted: 0 }, function (err, record) {
                            if (err || !record.length) {
                                callback(null, err || null);
                            } else {
                                //Check site accessed
                                let _sites = record[0].sites, accessable = false;

                                for (let i in _sites) {
                                    if (_sites[i]['siteinfo']['url'] === baseURL)
                                        accessable = true;
                                }

                                if (accessable && !record[0].locked) {
                                    let _token = _authCookie.retrieve(req, "APISID"),
                                        _sid = _authCookie.retrieve(req, "SID");
                                    ovutility.invokeAPI(ovauthURL + "/api/auth/validatesession", { APISID: _token, SID: _sid }).then(function (result) {
                                        // console.log("CHOI OI!!!", result)
                                        if (result && result.Status) {
                                            // console.log(678787, _userCookie, _token)
                                            authHandle.createSession(_userCookie, _token).then(function (result) {
                                                callback(null, record[0].toObject());
                                            });
                                        } else {
                                            callback(null, null);
                                        }
                                    });
                                } else {
                                    callback(null, null);
                                }
                            }
                        });
                    },
                    function (account, callback) {
                        if (!account || !account._id || account.locked) {
                            authenticator.message = 'Account locked or not found.';
                        } else {
                            // authenticator["token"] = tokenstr;
                            // authenticator["ip"] = req.ip;
                            // let __refs_ = _authCookie.getObj(account);


                            //authCookie
                            authenticator = ovutility.parseAccountInfo(account);
                            authenticator.message = "Authenticated";
                            authenticator.authenticated = true;
                            authenticator['token'] = _authCookie.retrieve(req, "APISID");
                            authenticator["ip"] = req.ip;
                            let _data = _authCookie.getObj(authenticator);
                            authenticator["_refs_"] = JSON.stringify(_data);
                            _authCookie.store(res, authenticator);
                        }
                        callback(null, authenticator);
                    }
                ], function (err, authenticator) {
                    res.json(authenticator);
                })
            } else {
                // require("./../sockets/cAuthenConnection").getSocket().emit("auth_logout", {
                //     forcelogout: true
                // });
                res.json(authenticator);
            }
        } else {
            res.json(authenticator);
        }
    },
    authState: function (req, res) {
        baseCtrl.verifyState(req, function (result) {
            let _account = _authCookie.getTopSecret(req),
                _token = _authCookie.retrieve(req, "APISID");
            if (!result.status) {
                if (_account && _token) {
                    _authCookie.clear(res, "SID");
                    authHandle.expireSession({ account: _account, token: _token }).then(function (result3) {
                        socket.sendNotification("auth_logout_client", { account: _account, token: _token });
                        res.json(result);
                    });
                } else {
                    res.json(result);
                }
            } else {
                Account.findOne({ loginname: _account, isdeleted: 0, locked: false }, function (err, data) {
                    result.sites = data.sites || [];
                    result.isadmin = data.isadmin || false;
                    let resp = [];
                    for (let i in result.sites) {
                        if (result.sites[i] && result.sites[i].siteinfo) {
                            resp.push({
                                name: result.sites[i].siteinfo.name,
                                title: result.sites[i].siteinfo.title,
                                url: result.sites[i].siteinfo.url,
                                icon: result.sites[i].siteinfo.icon
                            });
                        }
                    }
                    result.sites = resp;
                    res.json(result);
                });
            }
        });
    },
    authVerify: function (req, res) {
        redisAuth.getLimittedCount(req.body.token).then(function (count) {
            let resultRes = {
                status: false,
                message: "You lost account settings."
            };
            if (authConst.AuthKeys.OTP_COUNTS > 0 && count > authConst.AuthKeys.OTP_COUNTS) {
                Account.findOne({ loginname: req.body.appid }, function (err, document) {
                    if (document && !document.locked) {
                        accountHandle.save({ _id: document._id }, { locked: true }).then(() => {
                            redisAuth.delTokenBasedKey(req.body.token);
                        });
                    }
                });
                resultRes.locked = true;
                resultRes.message = "You just exceeded " + authConst.AuthKeys.OTP_COUNTS + " times. Please contact administrator.";
                res.send(resultRes);
            } else {
                let mode = req.body.mode;
                if (mode) {
                    if (mode.app || mode.mail || mode.gauth || mode.sms) {
                        authHandle.verify(req.body.confirmCode, req.body.token, function (result) {
                            if (!result.status) {
                                authHandle.verifyViaEmail(req.body.confirmCode, req.body.token, function (result) {
                                    if (!result.status) {
                                        authHandle.verifyViaSMS(req.body.confirmCode, req.body.token, function (result) {
                                            if (!result.status) {
                                                authHandle.verifyViaGA(req.body.appid, req.body.confirmCode).then(function (data) {
                                                    if (data.status) {
                                                        controlAuthCookie(req, res, req.body.appid, req.body.token, data);
                                                    } else {
                                                        res.send(data);
                                                    }
                                                });
                                            } else {
                                                controlAuthCookie(req, res, req.body.appid, req.body.token, result);
                                            }
                                        });
                                    } else {
                                        controlAuthCookie(req, res, req.body.appid, req.body.token, result);
                                    }
                                });
                            } else {
                                controlAuthCookie(req, res, req.body.appid, req.body.token, result);
                            }
                        });
                    }
                } else {
                    res.send(resultRes);
                }
            }
        });
    },
    authVerifyViaApp: function (req, res) {
        let token = req.body.token, username = req.body.userid, device = req.body.device;
        let result = {
            status: false,
            message: "Access denied"
        };
        if (token && username && device && req.body.approved === true) {
            redisAuth.getAppToken(username + token + device).then(function (value) {
                result.status = true;
                controlAuthCookie(req, res, username, token, result);
            }).catch(function () {
                res.json(result);
            });
        } else {
            res.json(result);
        }
    },
    authSendcode: function (req, res) {
        baseCtrl.verifyState(req, function (result) {
            if (result.status) {
                res.send({
                    status: true,
                    code: result.code,
                    message: "Your account is verified. Click on OK button to redirect to OVAuthen dashboard."
                });
            } else {
                if (req.body.info) {
                    authHandle.sendEmail(req.body.info.name, req.body.info.loginname, req.body.info.email, function (result) {
                        res.send(result);
                    }, req.body.token);
                } else {
                    res.send({
                        status: false,
                        message: "Data is empty."
                    });
                }
            }
        });
    },
    authSendcodeViaSMS: function (req, res) {
        authHandle.sendSMS(req.body.info.loginname, req.body.info.countrycode, req.body.info.phone, res, req.body.token);
    },
    authForgotPassword: function (req, res) {
        authHandle.forgotPasswordViaEmail(null, req.body.loginname, null, function (result) {
            res.send(result);
        });
    },
    unlockAccount: function (req, res) {
        Account.findOne({ loginname: req.body.loginname }, function (err, doc) {
            if (!err) {
                authHandle.unlockAccount(req.body.loginname, doc.requesttime, function (result) {
                    if (result.status) {
                        require("../../lib/authLib").getScheduleMailUser();
                    }
                    res.send(result);
                });
            }
        });
    },
    authValidateOTPCode: function (req, res) {
        authHandle.authValidateOTPCode(req.body.otpcode, function (result) {
            res.send(result);
        });
    },
    authConfirmChangePsw: function (req, res) {
        authHandle.authConfirmChangePsw(req.body, function (result) {
            res.send(result);
        });
    },
    authResetPassword: function (req, res) {
        Account.findOne({ loginname: req.body.loginname }, function (err, doc) {
            if (!err) {
                authHandle.resetPassword(req.body.loginname, req.body.adminaccount.name, doc.requesttime, function (result) {
                    res.send(result);
                });
            }
        });
    },
    authUpdateAcc: function (req, res) {
        let _none = false;
        if (typeof (req.body.password) === "string" && req.body.password.trim() === "") {
            _none = true;
            req.body.password = "___NONE___";
            req.body.newpassword = "___NONE___";
            req.body.confirmpassword = "___NONE___";
        }
        Account.findById(req.body._id, function (err, accountData) {
            if (err || !accountData) {
                res.send({ Status: false, Data: err ? err.message : "Account data not found." });
            } else {
                const _beforeSetMode = JSON.parse(JSON.stringify(accountData.fa2mode)),
                    _afterSetMode = JSON.parse(JSON.stringify(req.body.fa2mode)),
                    _last2fa = accountData.is2fa,
                    _current2fa = req.body.is2fa;
                async.waterfall([
                    function (callback) {
                        // Notify user when 2 step verify is changed
                        let _msg = "";
                        if (_current2fa && _.isEqual(_beforeSetMode, _afterSetMode) == false) {
                            let _listMethod = {
                                "enabled": [],
                                "disabled": []
                            };
                            for (let method in _afterSetMode) {
                                if (_afterSetMode[method] != _beforeSetMode[method] && method != "gauth" && method != "app")
                                    _listMethod[_afterSetMode[method] ? 'enabled' : 'disabled'].push(method == "mail" ? "EMAIL" : method.toUpperCase());
                            }
                            _msg += _listMethod['enabled'].length > 0 ? (`enable <b>${_listMethod['enabled'].join(", ")}</b>` + (_listMethod['disabled'].length > 0 ? " & " : "")) : "";
                            _msg += _listMethod['disabled'].length > 0 ? `disable <b>${_listMethod['disabled'].join(", ")}</b>` : "";
                            _msg = `Your request to ${_msg} option for Two-step Verification has been done.<br/><br/>`;
                            authHandle.inform2FA(accountData.loginname, accountData.email, _msg).then(function (data) {
                                callback(null, data);
                            });
                        } else if (_current2fa == false && _current2fa != _last2fa) {
                            _msg = `You has required to turn off <b>“Two-step Verification”</b> on your account.<br/><br/>`;
                            authHandle.inform2FA(accountData.loginname, accountData.email, _msg).then(function (data) {
                                callback(null, data);
                            });
                        } else {
                            callback(null, null);
                        }
                    },
                    function (inform2fa, callback) {
                        var authenticator = new Authenticator(_.extend({}, req.body));
                        authenticator.validate(function (error) {
                            let listError = {};
                            if (error) {
                                for (var i in error.errors) {
                                    listError[i] = error.errors[i].message;
                                }
                                listError = sortObj(listError, ["name", "email", "phone", "password", "newpassword", "confirmpassword", "usersignature", "engineerid", "initial"]);
                            }
                            let oldpassword = accountData.password;
                            accountData = _.extend(accountData, req.body);
                            /* Start Custom check validation */
                            /* START Add Initial to List Error - Huy Nghiem - 12/11/2019 */
                            let _accesssite = accountData.accesssite;
                            for (let _site of _accesssite) {
                                if (_site.props && _site.props.Initial != undefined && _site.props.Initial == "") {
                                    listError["initial"] = 'Initial required';
                                }
                            }
                            /* END Add Initial to List Error  - Huy Nghiem - 12/11/2019 */
                            /* START Check phone number - Huy Nghiem - 12/11/2019 */
                            let _is2fa = accountData.is2fa,
                                _fa2mode = accountData.fa2mode,
                                _phone = accountData.phone;
                            if (_is2fa && _fa2mode && _fa2mode.sms && _phone == "") {
                                listError["phone"] = 'Phone number required.';
                            }
                            // else if (_phone) {
                            //     let regionCode = utils.getRegionCode(accountData.countrycode),
                            //         formatNumber = _phone.trim().replace(/[^0-9]/g, ''),
                            //         phoneNumPattern = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{0,11}$/,
                            //         isValidNumber = false;
                            //     // Check format number
                            //     if (phoneNumPattern.test(_phone))
                            //         isValidNumber = true;
                            //     // Check valid global number
                            //     if (isValidNumber) {
                            //         const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
                            //         const number = (formatNumber.length < 18) ? phoneUtil.parseAndKeepRawInput(_phone, regionCode) : "";
                            //         isValidNumber = (number) ? phoneUtil.isValidNumber(number) : false;
                            //     }
                            //     if (!isValidNumber)
                            //         listError["phone"] = 'Your phone number is not valid.';
                            // }
                            /* END Check phone number - Huy Nghiem - 12/11/2019 */
                            accountData.password = oldpassword;
                            if (_none === false) {
                                const newpassword = passwordHash.generate(req.body.confirmpassword);
                                if (!passwordHash.verify(req.body.password, accountData.password)) {
                                    listError["password"] = "Your password is invalid. Please check it again.";
                                } else {
                                    if (accountData.password != '') {
                                        accountData.password = newpassword;
                                    }
                                }
                            }
                            /* End Custom check validation */
                            if (utils.objectSize(listError) > 0) {
                                res.send({ Status: false, Data: listError });
                                return;
                            } else {
                                accountHandle.validate({ ...accountData.toObject() }, accountData).then(resp => {
                                    if (resp.Status) {
                                        const __data = accountData.toObject(),
                                            _exFlag = accountHandle.validateSite(__data);

                                        if (_exFlag.Site && !_exFlag.Status) {
                                            res.json({ Status: false, Data: _exFlag.Data });
                                        } else {
                                            accountHandle.save({ _id: accountData._id }, __data).then(resp3 => {
                                                if (resp3.Status) {
                                                    ovutility.syncAccount2Sites(__data, "/api/account/updatebyapi");

                                                    let _listMsg = [];

                                                    if (_exFlag.Site) {
                                                        const spAccount = { ...__data };
                                                        if (req.body.confirmpassword && _none === false) {
                                                            spAccount.password = req.body.confirmpassword;
                                                        } else {
                                                            if (spAccount.id) spAccount.password = '';
                                                        }
                                                        syncHandle.SITE.putUser(spAccount).then(re => {
                                                        });
                                                    }
                                                    // Check if inform 2 fa
                                                    if (inform2fa && inform2fa.message) _listMsg.push(inform2fa.message);
                                                    _listMsg.push("Updated succesfully");
                                                    res.json({ Status: true, Data: _listMsg, data: ovutility.parseAccountInfo(__data) });
                                                } else {
                                                    res.send(resp3);
                                                }
                                            });
                                        }
                                    } else {
                                        res.json(resp);
                                    }
                                });
                            }
                        });
                    }
                ], function (err, data) {

                })
            }
        });
    },
    authorize: function (req, res) {
        var request = require('request');
        var options = {
          'method': tokenAPI.method,
          'url': tokenAPI.url,
          'headers': {
            'Content-Type': tokenAPI.ContentType
          },
          form: {
            'grant_type': tokenAPI.grant_type,
            'username': `${req.body.loginname}`,
            'password': `${req.body.password}`,
            'client_id': tokenAPI.client_id,
            'client_secret': tokenAPI.client_secret,
            'scope': tokenAPI.scope
          }
        };
        request(options, function (error, response) { 
          if (error) throw new Error(error);
          res.json(response);
        });
    },
    logout: function (req, res) {
        if (req.body.account) {
            var account = req.body.account;
            async.waterfall([
                function (callback) {
                    let { expireSession } = require("./../../handles/authHandle");
                    // Get SID to c-Helps site for checking site match with SID
                    let sid = _authCookie.retrieve(req, "SID");
                    expireSession({ account: account, token: _authCookie.retrieve(req, "APISID") }).then(function (result) {
                        _authCookie.clear(res, "SID");
                        callback(null, { account: account, token: _authCookie.retrieve(req, "APISID"), sid: sid });
                    });
                }
            ], function (err, authenticator) {
                socket.sendNotification("auth_logout_client", authenticator);
                res.json({ status: true, message: "Logout successfully" });
            });
        } else {
            res.json({ status: false, message: "Logout failed" });
        }
    },
    authStateAccount: function (req, res) {
        baseCtrl.verifyAccountHelps(req).then(function (result) {
            res.json(result);
        });
    },
    authCheckToken: function (req, res) {
        var result = {
            status: false,
            msg: null
        }, cauthenToken = req.body.token,
            serverToken = _authCookie.retrieve(req, "SID");
        if (cauthenToken === serverToken) {
            result['status'] = true;
            result['msg'] = 'OK';
        }
        res.send(result);
    },
    validateAuthSession: function (req, res) {
        const _APISID = req.body.APISID,
            _SID = req.body.SID,
            currentsite = req.body.CurrentSite;
        let result = {
            Status: false,
            Msg: "valid"
        };
        let _account = _authCookie.getSecretKey(_APISID, _SID);
        if (_APISID && _account) {
            authHandle.checkSession(_account, _APISID).then(function (val) {
                result['Status'] = val;
                result['Msg'] = val ? "valid" : "invalid";
                if (val) {
                    Account.findOne({ loginname: _account }, function (err, doc) {
                        if (doc) {
                            let _sites = [];
                            if (doc.sites) {
                                for (let i in doc.sites) {
                                    _sites.push({
                                        name: doc.sites[i].siteinfo['name'],
                                        url: doc.sites[i].siteinfo['url'],
                                        role: doc.sites[i].rolename || ""
                                    })
                                }
                            }
                            result['Data'] = {
                                loginname: doc.loginname,
                                email: doc.email,
                                timezone: doc.timezone,
                                fullname: doc.name,
                                // facility: doc.sites || {},
                                sites: _sites,
                            }
                        } else {
                            result['Status'] = false;
                        }
                        res.send(result);
                    })
                } else {
                    res.send(result);
                }
            });
        } else {
            res.send(result)
        }
    },
    authSignout: function (req, res) {
        var _val = _authCookie.retrieve(req, "APISID"),
            _key = _authCookie.retrieve(req, "SID");
        if (typeof (_key) === 'string' && _key) {
            socket.sendNotification('cauthen_to_client', { token: _key });
        }
        if (typeof (_val) === 'string' && typeof (_key) === 'string') {
            var _token = _authCookie.getRawVal(_val, _key);
        }
        _authCookie.clear(res, "SID", { expires: new Date(1), domain: '.eton.vn' });
        res.send({ status: true, msg: "OK" });
    },
};