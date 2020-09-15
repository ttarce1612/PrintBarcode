/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
const Utils = require("./../libs/utils");
const Request = require("./../libs/request");
// const Request = require('request')
const toast = require('./../libs/toast');
const promise = require("es6-promise");

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
module.exports = {
    login: (uname, pwd) => {
        Request.post("/api/auth/signin", { loginname: uname, password: pwd })
            .then((res) => {
                if (res.status == 200) {
                    let data = res.data.body;
                    var json_data = JSON.parse(data)
                    if (json_data.error) {
                        let lang = window.localStorage.getItem("language") || "vi"
                        let login_error_message = require('../app/Language/'+lang).language.error_mess.login_err
                        toast.error(login_error_message);
                        document.getElementById("loginname").focus()
                    }
                    else {
                        let _token = parseJwt(json_data.access_token)
                        console.log("_token", _token)
                        let user_info = JSON.parse(_token.employeeinfo)
                        console.log("user_info", user_info)
                        window.localStorage.setItem("user_info", user_info.Code);
                        window.localStorage.setItem("user_id", user_info.Id);
                        window.localStorage.setItem("full_name", user_info.FullName);
                        window.localStorage.setItem("token", json_data.access_token);
                        window.location.href = "/printbarcode";
                    }
                } else {
                    toast.error("Invalid login name or password");
                }
            });
    },
    sso: function () {
        return new promise.Promise(function (resolve, reject) {
            let user_info = window.localStorage.user_info
            let token = window.localStorage.token
            if (user_info && token) {
                resolve({ isvalid: true });
            } else {
                resolve({ isvalid: false });
                localStorage.removeItem("user_info");
                localStorage.removeItem("token");

            }

        })
    },
    forgotPassword: (uname) => {
        if (!uname)
            return;

        Request.post("/api/auth/forgotpassword", { loginname: uname })
            .then((res) => {
                if (res.status === 200) {
                    let data = res.data;
                    if (data.status === false) {
                        toast.error(data.message);
                    }
                }
            });
    },
    logout: () => {
        let acc = localStorage.getItem("user_info");
        if (acc) {
            localStorage.removeItem("user_info");
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            localStorage.removeItem("full_name");
            window.location.href = "/login";
        }
    },
    getState: () => {
        return new Promise(resolve => {
            Request.post("/api/auth/state", {})
                .then(response => {
                    if (response.data.code === 403) {
                        localStorage.removeItem("_refs_");
                        localStorage.removeItem("_acc_");
                        localStorage.removeItem("_admin");
                        localStorage.removeItem("_site");
                        window.location.href = "/login";
                    } else {
                        resolve(response);
                    }
                })
        });
    },
    restrictSite: (sites) => {
        let _refs_ = localStorage.getItem('_refs_');
        if (_refs_) {
            _refs_ = JSON.parse(_refs_);
            let params = {
                APISID: _refs_.APISID,
                SID: _refs_.SID,
                NAME: ""
            };
            for (let i in sites) {
                params['NAME'] = Utils.hash(sites[i].name);
                Request.getWithCredentials(sites[i].url + "/api/authen/grantsession", { ref: params })
                    .then((response) => {
                    });
            }
        }
    }
}