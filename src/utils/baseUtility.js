// MD5
var crypto = require('crypto');
// uniqid
var uniqid = require('uniqid');

var moment = require('moment');
var _ = require('underscore');


module.exports = {
    generateID: function () {
        var uuid = "",
            hyphen = "";//String.fromCharCode(45);
        var charid = (crypto.createHash('md5').update(uniqid()).digest("hex")).toUpperCase();
        uuid = charid.substr(0, 8) + hyphen + charid.substr(8, 4) + hyphen + charid.substr(12, 4) + hyphen + charid.substr(16, 4) + hyphen + charid.substr(20, 4);
        return uuid.toLowerCase();
    },
    generateKey: function () {
        var uuid = "",
            hyphen = String.fromCharCode(45);
        var charid = (crypto.createHash('md5').update(uniqid()).digest("hex")).toUpperCase();
        uuid = charid.substr(0, 8) + hyphen + charid.substr(8, 4) + hyphen + charid.substr(12, 4) + hyphen + charid.substr(16, 4) + hyphen + charid.substr(20, 4);
        return uuid.toLowerCase();
    },
    arrayObjectIndexOf: function (myArray, searchTerm, property) {
        for (var i = 0, len = myArray.length; i < len; i++) {
            if ((myArray[i]).toJSON()[property] === searchTerm)
                return i;
        }
        return -1;
    },
    cleanArray: function (actual) {
        var newArray = new Array();
        for (var i = 0; i < actual.length; i++) {
            if (!_.isEmpty(actual[i]) || (!_.isObject(actual[i]) && actual[i])) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
    },
    isUpperCase: function (str) {
        return str === str.toUpperCase();
    },
    formatDate: function (val, format) {
        if (val == 'now')
            return moment([]).format(format || "YYYY-MM-DD hh:mm:ss");

        if (!val) {
            return "";
        }
        return moment(val).format(format || "YYYY-MM-DD hh:mm:ss");
    },
    replaceSpecialChr: function (data) {
        var result = "",
            pattern = /^[^A-Z0-9]$/i, str = data.toString();
        var i = 0;
        // Remove all special seperating character
        do {
            if (str[i].match(pattern) != null)
                result += str[i].replace(pattern, '');
            else
                result += str[i];
            i++;
        } while (i < str.length)
        return result;
    },
    scrollTop: function (container) {
        var id_button = '#scrolltop';

        var offset = 220;

        var duration = 500;

        $(container).scroll(function () {
            if ($(this).scrollTop() > offset) {
                $(id_button).fadeIn(duration);
            } else {
                $(id_button).fadeOut(duration);
            }
        });

        jQuery(id_button).click(function (event) {
            event.preventDefault();
            $(container).animate({ scrollTop: 0 }, duration);
            return false;
        });
    },
    isEmpty: function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return JSON.stringify(obj) === JSON.stringify({});
    },
    getLoggedName: function () {
        let profile = require("./../utils/auth").profile();
        if (profile && profile.loginname) {
            return profile.loginname;
        }
        return "";
    },
    getInitialName: function () {
        let profile = require("./../utils/auth").profile();
        if (profile && profile.initial) {
            return profile.initial;
        }
        return "";
    },
    padStart: function (str, targetLength, padString) {
        str = String(str);
        if (!String.prototype.padStart) {
            targetLength = targetLength >> 0;
            padString = String(padString || ' ');
            if (str.length > targetLength) {
                return str;
            } else {
                targetLength = targetLength - str.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length);
                }
                return padString.slice(0, targetLength) + str;
            }
        } else {
            return str.padStart(targetLength, padString);
        }
    },
    padEnd: function (str, targetLength, padString) {
        str = String(str);
        if (!String.prototype.padEnd) {
            //floor if number or convert non-number to 0;
            targetLength = targetLength >> 0;
            padString = String(padString || ' ');
            if (str.length > targetLength) {
                return str;
            } else {
                targetLength = targetLength - str.length;
                if (targetLength > padString.length) {
                    //append to original to ensure we are longer than needed
                    padString += padString.repeat(targetLength / padString.length);
                }
                return str + padString.slice(0, targetLength);
            }
        } else {
            return str.padEnd(targetLength, padString);
        }
    },
    clearSession: function () {
        window.localStorage.clear();
        let emptyInfo = {
            name: "",
            rulecode: "",
            email: "",
            phone: "",
            loginname: "",
            token: ""
        };
        window.localStorage.setItem("acc", JSON.stringify(emptyInfo));
    }
};