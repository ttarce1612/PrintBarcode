
/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */

function allowConnection(code) {
    let SHA = require("crypto-js/sha224");
    let secret = require('../config').SOCKET_SECRETE_KEY;
    return SHA(code).toString() == secret;
}

// Initial Authenticator Socket register
exports.initAuth = function () {

    let nsp = require("../utils/ovsocketUtility").nsp("/socket/dashboard");
    const _ = require("lodash");

    nsp.on("connection", function (_socket) {
        _socket.on("disconnect", function () {
            //Leave all room
            this.leaveAll();
        });
        _socket.on("connect", function () {
            //Leave all room
        });
        _socket.on("dashboard-list", function (token) {
            let { dataAPI } = require('../config')
            let request = require('request');
            let options = {
                'method': dataAPI.method,
                'url': dataAPI.url,
                'headers': {
                    'Content-Type': dataAPI.ContentType,
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataAPI.body)
            };
            request(options, function (error, response) {
                let data = {
                    body: "",
                    status: false
                }
                if (response && response.body) {
                    let _date = new Date()
                    // _date = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate(), _date.getHours() + 7, _date.getMinutes(), _date.getSeconds() ) 
                    data.body = JSON.parse(response.body)
                    data.status = true
                    data.date = _date
                    _socket.emit("dashboard", data)
                } else {
                    _socket.emit("dashboard", data)
                }
            });
            let update_request
            if (update_request) {
                clearInterval(update_request)
            }
            update_request = setInterval(() => {
                request(options, function (error, response) {
                    let data = {
                        body: "",
                        status: false
                    }
                    if (response && response.body) {
                        let _date = new Date()
                       
                        data.body = JSON.parse(response.body)
                        data.status = true
                        data.date = _date
                        _socket.emit("dashboard", data)
                    } else {
                        _socket.emit("dashboard", data)
                    }
                });
            }, 1000 * 60);
        });
    });
};
//Send Notification
exports.sendNotification = function (ev, data) {
    let nsp = require("../utils/ovsocketUtility").nsp("/socket/auth");
    nsp.emit(ev, data);
}
