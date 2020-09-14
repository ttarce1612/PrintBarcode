import popupS from 'popups';

var $ = require("jquery");
var promise = require("es6-promise");
const authSocket = require("./socketClient");

var config = require('../config/config'),
    resourceUrl = config.statics.host + "/api/auth";

module.exports = {
    popupWarning(mode, content, lbOk) {
        popupS.window({
            mode: mode || 'alert',
            content: content || 'You are expired. Please sign-in again.',
            labelOk: lbOk || 'OK',
            flagBodyScroll: false, // should the body be scrollable 
            flagButtonReverse: false, // should the buttons be reversed 
            flagCloseByEsc: false, // ability to clse with the esc key 
            flagCloseByOverlay: false, // ability to close with click on the overlay 
            flagShowCloseBtn: false,
            onSubmit: function () {
                jQuery('.popupS-base.popupS-open').css('display', 'none');
                this.redirectToLogin({ url: config.statics.cauthenurl })
            }.bind(this)
        });
    },
    authState(callback, withDevice) {
        const _socketAuth = authSocket.connect("/default");
        if (_socketAuth) {
            
            _socketAuth.on("on_logout", function (result) {
                let token = this.getToken();
                if(!token) {
                    this.popupWarning();
                } else {
                    if(token == result.token) {
                        localStorage.clear();
                        this.popupWarning();
                    }
                }
            }.bind(this));
    
            _socketAuth.on("token_expired", function (result) {
                let curToken = this.getToken();
                if (!curToken || (result && curToken && curToken === result.token)) {
                    this.popupWarning(null, result.message);
                }
            }.bind(this));

            if(callback) {
                callback();
            }
        }
    },
    sso: function () {
        var Promise = new promise.Promise(function (resolve, reject) {
            let _cookie = document.cookie;
            let withDevice = false;
            if(_cookie) {
                if(/withdevice[=]true/.test(_cookie)) {
                    withDevice = true;
                }
            }

            if(withDevice) {
                resolve({isvalid: true, withdevice: true})
            } else {
                $.ajax({
                    url: resourceUrl + "/sso",
                    method: "POST",
                    data: JSON.stringify({
                        token: "123"
                    }),
                    contentType: "application/json",
                    success: function (res) {
                        if (res && res.authenticated) {
                            localStorage.setItem('acc', JSON.stringify(res));
                        } else {
                            // localStorage.clear();
                            //window.location.href = cauthenUrl; // cAuthen site
                        }
                        resolve({ isvalid: res.authenticated, message: res.message });
                    },
                    error: function (res, status) {
                        console.log("Error", res, status);
                    }
                });
            }
        });
        return Promise;
    },
    getToken: function () {
        var acc = JSON.parse(localStorage.getItem('acc'))
        return acc.token;
    },
    resetAcc: function () {
        var acc = JSON.parse(localStorage.getItem('acc'));
        if (acc == null) {
            acc = {
                name: "",
                rulecode: "",
                email: "",
                phone: "",
                loginname: "",
                token: ""
            };
            localStorage.setItem('acc', JSON.stringify(acc));
        }
        localStorage.removeItem("logged");
    },
    redirectToLogin(opt) {
        window.location.href = (opt && opt['url']) ? opt['url'] : "/";
    },
    loggedIn: function () {
        var acc = JSON.parse(localStorage.getItem('acc'));
        return !!acc.token
    },
    profile: function () {
        return JSON.parse(localStorage.getItem('acc'));
    },
    owner: function (obj) {
        var path = obj;
        if (typeof obj != "string")
            path = obj.props.location.pathname;

        var profile = this.profile();
        var code = profile.rulecode;

        var pathList = config.authManagement;
        var hasPath = true;

        if (code != "ADMIN") {
            hasPath = false;
            if (pathList[code]) {
                if (pathList[code].indexOf(path) != -1) {
                    hasPath = true;
                }
            }
        }

        if (path != "/mcim/extendview") {
            window.name = "";
        }

        /*if(window.name !== "extendview_window") {
         if(path == "/mcim/extendview")
         hasPath = false;
         }*/
        return hasPath;
    },
    authorize: function (path) {
        if (!this.loggedIn()) {
            if (path != "/login")
                window.location.href = "#/login";
            return;
        }
        var hasPath = this.owner(path);
        if (!hasPath && path != "/404") {
            window.location.href = "#/404";
        }
    }
    /*, checkDeviceApp: function () {
        appAvailability.available("com.cci.push").then(function (avail) {
            console.log("App available? " + txt)
            var txt = "App available? " + avail;
            $('#check-device').text(txt);
        });
    }*/
}